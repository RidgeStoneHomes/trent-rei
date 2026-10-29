"""Verifies Landova_Proforma_v3.xlsx and writes golden fixtures for the code port.

Needs LibreOffice (soffice) on PATH to recalculate. Run after build_v3.py:
    python verify.py                 # all checks + fixtures/*.json
    python verify.py --skip-plugback # faster

Checks
  1. No error values on any calculated tab, for every variant parcel.
  2. Plug-back: for every variant x use x allowed exit with a positive max offer, setting the land price to
     that max offer returns exactly that exit's required margin.
  3. Gate and location-resolution expectations (zoning, deed restrictions, access, fallbacks).
  4. Fixtures: every Engine row for every variant, keyed by engine column key, for golden tests in code.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "Landova_Proforma_v3.xlsx")
META = json.load(open(os.path.join(HERE, "engine_meta.json")))
EC, EFIRST, N, P = META["EC"], META["EFIRST"], META["N"], META["P"]
KEYS = [k for k, *_ in META["ENG"]]

VARIANTS = {
    "base": {},
    "sewer": {"sewer_site": "Y"},
    "collin": {"county": "Collin"},
    "city_zoned": {"county": "Collin", "city": "McKinney", "jtype": "City", "zallowed": "AG", "rezone_ok": "RES-SF,RES-ATT,COM"},
    "houston": {"county": "Harris", "city": "Houston", "jtype": "City", "zallowed": ""},
    "deed": {"zdeed": "MH,RV"},
    "easement": {"access": "Private easement"},
    "florida": {"state": "FL", "county": "Polk", "jtype": "County", "zallowed": "AG,RES-SF"},
    "big": {"county": "Collin", "gross": 200, "sewer_site": "Y", "vpd": 25000, "hh": 20000, "hh10": 150000,
            "hwy": 1, "corner": "Y", "sub": 0.5, "anchor": 3},
    "high": {"scenario": "High"},
}
PLUGBACK_VARIANTS = ["base", "sewer", "big", "florida"]


def cell(ref):  # "Parcel!$C$5" -> ("Parcel", "C5")
    sh, a = ref.split("!"); return sh, a.replace("$", "")


def write(path, changes):
    wb = openpyxl.load_workbook(SRC)
    for k, v in changes.items():
        sh, a = cell(P[k]) if k in P else cell(k)
        wb[sh][a] = v
    wb.save(path)


def recalc(paths, outdir):
    for i in range(0, len(paths), 40):
        subprocess.run(["soffice", "--headless", "--convert-to", "xlsx:Calc MS Excel 2007 XML", "--outdir", outdir,
                        *paths[i:i + 40]], check=True, capture_output=True, timeout=1800)


def engine_rows(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb["Engine"]
    rows = []
    for r in range(EFIRST, EFIRST + N):
        rows.append({k: ws[f"{EC[k]}{r}"].value for k in KEYS})
    return wb, rows


def errors(wb):
    bad = []
    for name in ("Engine", "Best_Use", "Proforma", "Use_Effective", "Location", "Cost_Library", "Org_Profile"):
        for row in wb[name].iter_rows():
            for c in row:
                if isinstance(c.value, str) and (c.value.startswith(("#DIV", "#N/A", "#VALUE", "#REF", "#NAME", "#NUM", "Err:"))):
                    bad.append(f"{name}!{c.coordinate}={c.value}")
    return bad


def main():
    skip_plug = "--skip-plugback" in sys.argv
    tmp = tempfile.mkdtemp(prefix="landova_verify_")
    out = os.path.join(tmp, "out"); os.makedirs(out)
    paths = []
    for name, ch in VARIANTS.items():
        p = os.path.join(tmp, f"{name}.xlsx"); write(p, ch); paths.append(p)
    recalc(paths, out)
    fails = []
    results = {}
    os.makedirs(os.path.join(HERE, "fixtures"), exist_ok=True)
    for name, ch in VARIANTS.items():
        wb, rows = engine_rows(os.path.join(out, f"{name}.xlsx"))
        results[name] = rows
        for e in errors(wb): fails.append(f"[{name}] error value {e}")
        json.dump({"variant": name, "parcel_changes": ch, "rows": rows},
                  open(os.path.join(HERE, "fixtures", f"{name}.json"), "w"), indent=1, default=str)
        loc = wb["Location"]
        if name == "florida":
            src = {loc[f"B{r}"].value: loc[f"D{r}"].value for r in range(9, 40) if loc[f"B{r}"].value}
            if src.get("Construction cost index") != "National": fails.append("[florida] cost index should fall back to National")
            if src.get("Property tax rate (all jurisdictions)") != "State": fails.append("[florida] tax rate should come from State")
    by = {n: {r["use"]: r for r in rows} for n, rows in results.items()}
    # Gate expectations
    exp = [
        ("deed", "Manufactured home community (MHC)", "binding", "Deed restricted"),
        ("deed", "Workforce / extended-stay RV park", "binding", "Deed restricted"),
        ("easement", "Homesites (stick-built, for sale)", "binding", "No public road access"),
        ("city_zoned", "Homesites (stick-built, for sale)", "zstat", "Rezone required"),
        ("city_zoned", "Event venue / wedding barn", "zstat", "By right"),
        ("city_zoned", "Leisure RV park / campground", "zstat", "Prohibited by zoning"),
        ("houston", "Homesites (stick-built, for sale)", "zstat", "No zoning"),
        ("base", "Supplier build-to-suit near major plants", "binding", "Location fails"),
        ("base", "Boat & RV storage", "binding", "Market demand"),
        ("base", "Manufactured home community (MHC)", "binding", "Septic capacity (gal/day)"),
        ("sewer", "Townhomes", "binding", "Density"),
    ]
    for v, u, k, want in exp:
        got = by[v][u][k]
        if got != want: fails.append(f"[{v}] {u}: {k} = {got!r}, expected {want!r}")
    if by["easement"]["Battery storage / solar land lease"]["acc_ok"] != 1:
        fails.append("[easement] land plays should not need public road access")
    if not by["collin"]["Homesites (stick-built, for sale)"]["rev2"] > by["base"]["Homesites (stick-built, for sale)"]["rev2"]:
        fails.append("[collin] localized revenue should exceed Grayson's")
    # Plug-back
    checked = 0
    if not skip_plug:
        jobs, pp = [], []
        for v in PLUGBACK_VARIANTS:
            for row in results[v]:
                for x in (1, 2, 3):
                    mx = row[f"max{x}"] or 0
                    if mx > 1:
                        p = os.path.join(tmp, f"pb_{len(jobs)}.xlsx")
                        write(p, {**VARIANTS[v], "land": mx}); jobs.append((v, row["use"], x, p)); pp.append(p)
        recalc(pp, out)
        for v, u, x, p in jobs:
            _, rows = engine_rows(os.path.join(out, os.path.basename(p)))
            row = {r["use"]: r for r in rows}[u]
            rev, prof, mg = row[f"rev{x}"], row[f"profit{x}"], row[f"mg{x}"]
            margin = prof / rev if rev else 0
            checked += 1
            if abs(margin - mg) > 1e-6: fails.append(f"[plug-back {v}] {u} exit {x}: margin {margin:.6f} vs required {mg:.6f}")
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"variants: {len(VARIANTS)}  plug-back cases: {checked}  failures: {len(fails)}")
    for f in fails: print("  FAIL", f)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
