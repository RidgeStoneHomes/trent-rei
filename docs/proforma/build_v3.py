"""Builds Landova_Proforma_v3.xlsx, the reference implementation of the Landova proforma engine.

Run:  python build_v3.py            (writes Landova_Proforma_v3.xlsx and engine_meta.json next to this file)

The ENG list below is the engine spec: ordered (key, header, formula template, format, group) tuples.
Template tokens:
  {u:x} Use_Library field    {v:x} Use_Effective (localized + learned) field
  {p:x} Parcel input/derived {r:x} resolved location value (Location tab)
  {a:x} Assumption           {c:code} cost library value used
  {o:x} Org_Profile item     {op:mine} this use's "I build this" flag
  {e:x} another Engine column in the same row
"""
import datetime as dt
import json
import os
import re

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter as L
from openpyxl.worksheet.datavalidation import DataValidation

from canonical import CANON, COST_LIB, QUALITY_WEIGHT
from regions import R as REGIONS, RCOLS, RKEYS, RNUM, RYN
from uses import COLS, KEYS, LEARNABLE, U, ZCLASSES

HERE = os.path.dirname(os.path.abspath(__file__))
NAVY = "1F3864"; YEL = "FFF2CC"; F = "Arial"
fn = Font(name=F, size=10); fin = Font(name=F, size=10, color="0000FF"); flink = Font(name=F, size=10, color="008000")
fb = Font(name=F, size=10, bold=True); fh = Font(name=F, size=10, bold=True, color="FFFFFF")
ft = Font(name=F, size=14, bold=True, color=NAVY); fs = Font(name=F, size=10, italic=True, color="595959")
fsec = Font(name=F, size=11, bold=True, color=NAVY)
fill_h = PatternFill("solid", fgColor=NAVY); fill_in = PatternFill("solid", fgColor=YEL)
fill_g = PatternFill("solid", fgColor="FBF3D5")
USD = '$#,##0;($#,##0);"-"'; USD2 = '$#,##0.00;($#,##0.00);"-"'; NUM = '#,##0;(#,##0);"-"'
NUM1 = '#,##0.0;(#,##0.0);"-"'; NUM3 = '#,##0.000'; PCT = '0.0%;(0.0%);"-"'; PCT2 = '0.00%;(0.00%);"-"'; MULT = '0.00"x"'
DATE = 'yyyy-mm-dd'

wb = Workbook()


def title(ws, t, s):
    ws["A1"] = t; ws["A1"].font = ft; ws["A2"] = s; ws["A2"].font = fs


def hdr(ws, row, labels, start=1, height=None):
    for i, l in enumerate(labels):
        c = ws.cell(row=row, column=start + i, value=l); c.font = fh; c.fill = fill_h
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    if height: ws.row_dimensions[row].height = height


def put(ws, ref, v, font=fn, fmt=None, fill=None):
    c = ws[ref]; c.value = v; c.font = font
    if fmt: c.number_format = fmt
    if fill: c.fill = fill
    return c


def dv(ws, ref, formula):
    d = DataValidation(type="list", formula1=formula, allow_blank=True); ws.add_data_validation(d); d.add(ref)


def widths(ws, d):
    for k, w in d.items(): ws.column_dimensions[k].width = w


# ============================================================ Lookups
lk = wb.active; lk.title = "Lookups"
title(lk, "Lookups", "Dropdown lists and adjustment factors. Factors are placeholders - calibrate from the cost library.")
LK = {}


def lklist(col, header, items, fmts=None):
    """Write a list (or table) starting row 5 at column letter col; return absolute range of first column."""
    c0 = ord(col) - 64
    hdr(lk, 4, header if isinstance(header, list) else [header], c0)
    for i, it in enumerate(items):
        it = it if isinstance(it, tuple) else (it,)
        for j, v in enumerate(it):
            put(lk, f"{L(c0 + j)}{5 + i}", v, fin if j else fn, (fmts or {}).get(j))
    return 5 + len(items) - 1


end = lklist("A", "Scenario", ["Low", "Base", "High"]); LK["scen"] = f"Lookups!$A$5:$A${end}"
end = lklist("C", "Y/N", ["Y", "N"]); LK["yn"] = f"Lookups!$C$5:$C${end}"
end = lklist("E", "Engine", ["For-Sale", "Income", "Operator Pad", "Land Play"]); LK["engine"] = f"Lookups!$E$5:$E${end}"
end = lklist("G", ["Septic soil", "Septic cost multiplier", "Septic capacity factor"],
             [("Good", 1.0, 1.0), ("Fair", 1.2, 0.75), ("Poor", 1.5, 0.5)], {1: "0.00", 2: "0.00"})
LK["soil"] = f"Lookups!$G$5:$G${end}"; LK["soilm"] = f"Lookups!$H$5:$H${end}"; LK["soilg"] = f"Lookups!$I$5:$I${end}"
end = lklist("K", ["Max slope", "Grading multiplier"], [(0.05, 1.0), (0.10, 1.25), (1.0, 1.6)], {0: PCT, 1: "0.00"})
LK["slope"] = f"Lookups!$K$5:$K${end}"; LK["slopem"] = f"Lookups!$L$5:$L${end}"
end = lklist("N", "Jurisdiction", ["City", "ETJ", "County"]); LK["jtype"] = f"Lookups!$N$5:$N${end}"
end = lklist("P", "Access", ["Paved public", "Unpaved public", "Private easement", "None"]); LK["access"] = f"Lookups!$P$5:$P${end}"
end = lklist("R", ["Zoning class", "Meaning"], ZCLASSES); LK["zclass"] = f"Lookups!$R$5:$R${end}"
end = lklist("U", "Exit", ["Best", "Land / pad sale", "Build & sell", "Build & hold / lease"]); LK["exit"] = f"Lookups!$U$5:$U${end}"
end = lklist("W", "Ranking", ["All uses", "My uses"]); LK["filter"] = f"Lookups!$W$5:$W${end}"
end = lklist("Y", ["Data quality", "Learning weight"], list(QUALITY_WEIGHT.items()), {1: "0.00"})
LK["qual"] = f"Lookups!$Y$5:$Y${end}"; LK["qualw"] = f"Lookups!$Z$5:$Z${end}"
for c, h, items in [("AB", "Market layer", ["Landova comps", "Pooled"]), ("AD", "Decision", ["Bought", "Passed", "Lost to other buyer"])]:
    hdr(lk, 4, [h], ord(c[1]) - 64 + 26)
    for i, v in enumerate(items): put(lk, f"{c}{5 + i}", v)
LK["layer"] = "Lookups!$AB$5:$AB$6"; LK["decision"] = "Lookups!$AD$5:$AD$7"
widths(lk, {"A": 10, "C": 6, "E": 14, "G": 12, "H": 14, "I": 14, "K": 10, "L": 14, "N": 12, "P": 16, "R": 12, "S": 34,
            "U": 20, "W": 12, "Y": 13, "Z": 10, "AB": 16, "AD": 20})

# ============================================================ Regions
rg = wb.create_sheet("Regions")
title(rg, "Regions - location hierarchy (National > State > County > City)",
      "Blank = inherit from the level above. Indices are relative to the use library's reference basis (Grayson County, TX = 1.0). ALL VALUES ARE PLACEHOLDERS.")
hdr(rg, 4, [lab for _, lab in RCOLS], 1, height=60)
RC = {k: L(i + 1) for i, k in enumerate(RKEYS)}
RG_LAST = 400
for i, r in enumerate(REGIONS):
    rr = 5 + i
    for k in RKEYS:
        v = r.get(k, None)
        if v is None: continue
        c = rg[f"{RC[k]}{rr}"]; c.value = v
        c.font = fb if k == "key" else (fs if k in ("notes", "src", "asof", "name", "level") else fin)
        if k in RNUM and k not in ("key",):
            c.fill = fill_in
            c.number_format = {"taxrate": PCT2, "closing": PCT, "transfer": PCT2, "carry": PCT, "rollback": PCT,
                               "cap_adj": PCT2, "raw_ac": USD, "impact": USD, "rezone_cost": USD,
                               "gpd_ac": NUM, "permit_gpd": NUM, "assess": PCT}.get(k, "0.00")
        if k in RYN: c.fill = fill_in
for k in RYN: dv(rg, f"{RC[k]}5:{RC[k]}{RG_LAST}", f"={LK['yn']}")
widths(rg, {RC[k]: (16 if k == "key" else 22 if k == "name" else 40 if k == "notes" else 11) for k in RKEYS})
rg.freeze_panes = "B5"
RKEYRNG = f"Regions!$A$5:$A${RG_LAST}"
def RCOL(k): return f"Regions!${RC[k]}$5:${RC[k]}${RG_LAST}"

# ============================================================ Parcel
pc = wb.create_sheet("Parcel", 0)
title(pc, "Parcel Inputs", "One parcel. In the software these fill from Landova's site analysis and data layers. Blue on yellow = input.")
hdr(pc, 4, ["Input", "Value", "Unit", "Source in Landova"], 2)
P = {}
prow = [
    ("name", "Parcel name", "Sample Parcel - Grayson County", "", "User", None, None),
    ("state", "State (2-letter)", "TX", "ST", "Parcel record", None, None),
    ("county", "County", "Grayson", "", "Parcel record", None, None),
    ("city", "City (blank if unincorporated)", "", "", "Jurisdiction layer", None, None),
    ("jtype", "Jurisdiction type", "County", "City/ETJ/County", "Jurisdiction layer", None, "jtype"),
    ("zallowed", "Zoning classes allowed by right (comma list)", "AG", "classes", "Zoning layer + crosswalk", None, None),
    ("zdeed", "Classes barred by deed restrictions (comma list)", "", "classes", "Title / deed-restriction scan", None, None),
    ("rezone_ok", "Classes realistic by rezoning (comma list, * = any)", "*", "classes", "Comp plan / future land use map", None, None),
    ("scenario", "Cost scenario", "Base", "Low/Base/High", "User", None, "scen"),
    ("gross", "Gross acres", 20, "ac", "Parcel boundary", NUM1, None),
    ("buildpct", "Buildable % (excl. floodway, wetlands, easements, steep slope)", 0.78, "% of gross", "Buildable-land analysis", PCT, None),
    ("flood", "Share in 100-yr floodplain", 0.10, "% of gross", "FEMA flood layer", PCT, None),
    ("slope", "Average slope", 0.04, "%", "Topography", PCT, None),
    ("tree", "Tree cover", 0.35, "%", "3D tree coverage", PCT, None),
    ("frontage", "Road frontage", 660, "LF", "Frontage analysis", NUM, None),
    ("access", "Access", "Paved public", "type", "Road network / title", None, "access"),
    ("water_site", "Public water at site", "Y", "Y/N", "Utilities layer", None, "yn"),
    ("water_dist", "Distance to water main", 0, "LF", "Utilities layer", NUM, None),
    ("sewer_site", "Public sewer at site", "N", "Y/N", "Utilities layer", None, "yn"),
    ("sewer_dist", "Distance to sewer main", 6000, "LF", "Utilities layer", NUM, None),
    ("soil", "Septic soil rating", "Fair", "Good/Fair/Poor", "Soil composition", None, "soil"),
    ("agex", "Ag / open-space valuation in place", "Y", "Y/N", "Appraisal district record", None, "yn"),
    ("land", "Asking / offer price (whole parcel)", 300000, "$", "Listing or user", USD, None),
    ("vpd", "Traffic count on frontage road", 4000, "vehicles/day", "State DOT / FHWA counts", NUM, None),
    ("hh", "Households within 3 miles", 2500, "households", "Census", NUM, None),
    ("hh10", "Households within 10 miles", 25000, "households", "Census", NUM, None),
    ("hwy", "Miles to nearest highway interchange", 6, "miles", "Road network", NUM1, None),
    ("corner", "Corner lot (hard corner on two roads)", "N", "Y/N", "Frontage analysis", None, "yn"),
    ("sub", "Miles to substation with capacity", 3, "miles", "Utility / transmission layer", NUM1, None),
    ("anchor", "Miles to nearest major employer (1,000+ jobs)", 12, "miles", "Employer layer", NUM1, None),
]
for i, (k, lab, v, unit, src, fmt, lst) in enumerate(prow):
    r = 5 + i; P[k] = f"Parcel!$C${r}"
    put(pc, f"B{r}", lab); put(pc, f"C{r}", v, fin, fmt, fill_in); put(pc, f"D{r}", unit); put(pc, f"E{r}", src, fs)
    if lst: dv(pc, f"C{r}", f"={LK[lst]}")
r = 5 + len(prow) + 1
put(pc, f"B{r}", "Derived (formulas)", fsec); r += 1
PDER_ROW = r
derived = [("net", "Net buildable acres", NUM1), ("pubW", "Public water used (1 = yes)", NUM),
           ("pubS", "Public sewer used (1 = yes)", NUM), ("extW", "Off-site water extension LF", NUM),
           ("extS", "Off-site sewer extension LF", NUM), ("sidx", "Scenario column", NUM),
           ("slopem", "Grading multiplier (slope)", "0.00"), ("soilm", "Septic cost multiplier (soil)", "0.00"),
           ("soilg", "Septic capacity factor (soil)", "0.00"), ("zapplies", "Zoning applies here (1 = yes)", NUM)]
for k, lab, fmt in derived:
    P[k] = f"Parcel!$C${r}"; put(pc, f"B{r}", lab); put(pc, f"C{r}", None, fn, fmt); r += 1
widths(pc, {"A": 2, "B": 52, "C": 30, "D": 16, "E": 32})

# ============================================================ Assumptions
asn = wb.create_sheet("Assumptions", 1)
title(asn, "Global Assumptions", "Org-level settings that do not vary by location. Location-specific values (tax, closing, transfer tax, septic rules, raw land) live on Regions.")
hdr(asn, 4, ["Assumption", "Value", "Notes"], 2)
A = {}
alist = [
    ("wmax", "Max water main extension before wells", 2640, NUM, "LF"),
    ("smax", "Max sewer main extension before septic", 1320, NUM, "LF"),
    ("det", "Detention % of net", 0.04, PCT, "Confirm with drainage study"),
    ("rowpct", "ROW share of lot area (septic lot rule)", 0.15, PCT, ""),
    ("hcont", "Horizontal contingency", 0.10, PCT, "% of horizontal costs"),
    ("vsoft", "Vertical soft costs (A&E, permits, dev fee)", 0.08, PCT, "% of vertical"),
    ("vcont", "Vertical contingency", 0.05, PCT, "% of vertical"),
    ("sell_fs", "Selling costs - homes / condos", 0.06, PCT, "Plus the location's transfer tax"),
    ("sell_land", "Selling costs - lots / land / pads", 0.04, PCT, "Plus the location's transfer tax"),
    ("sell_inc", "Sale costs - stabilized income property", 0.02, PCT, "Plus the location's transfer tax"),
    ("ltc", "Development loan-to-cost", 0.65, PCT, ""),
    ("rate", "Development loan rate", 0.09, PCT, ""),
    ("pts", "Development loan points", 0.01, PCT, ""),
    ("bal", "Average balance drawn during construction", 0.55, PCT, ""),
    ("leaseint", "Share of lease-up interest not covered by ramping NOI", 0.50, PCT, "Income uses only"),
    ("pltv", "Permanent loan max LTV", 0.70, PCT, ""),
    ("pdscr", "Permanent loan min DSCR", 1.25, MULT, ""),
    ("pdy", "Permanent loan min debt yield", 0.09, PCT, ""),
    ("prate", "Permanent loan rate", 0.068, PCT, ""),
    ("pamort", "Permanent loan amortization", 30, NUM, "years"),
    ("yrprem", "Extra required margin per year beyond 12 months", 0.05, PCT, "Puts a 3-year build-out on equal footing with a 1-year flip"),
    ("disc", "Opening offer discount below max", 0.15, PCT, ""),
    ("strong", "Verdict 'Strong' when max offer >= asking x", 1.15, MULT, ""),
    ("negot", "Verdict 'Negotiate' when max offer >= asking x", 0.80, MULT, "Below this = Pass"),
    ("floodflag", "Flag when floodplain share exceeds", 0.30, PCT, ""),
    ("shrink_k", "Learning: weight of the default (pseudo-records)", 3, NUM1, "Org numbers need ~3 good records to outweigh the default"),
    ("halflife", "Learning: record half-life", 3, NUM1, "years; older records count less"),
    ("esc", "Cost escalation per year (to bring old records to today)", 0.04, PCT, ""),
    ("valdate", "Valuation date", dt.date(2026, 10, 29), DATE, "Fixed date (not TODAY) so tests are repeatable"),
    ("pool_n", "Pooled benchmark minimum records", 5, NUM, ""),
    ("pool_orgs", "Pooled benchmark minimum orgs", 3, NUM, ""),
]
for i, (k, lab, v, fmt, note) in enumerate(alist):
    r = 5 + i; A[k] = f"Assumptions!$C${r}"
    put(asn, f"B{r}", lab); put(asn, f"C{r}", v, fin, fmt, fill_in); put(asn, f"D{r}", note, fs)
widths(asn, {"A": 2, "B": 52, "C": 14, "D": 60})

# ============================================================ Location (resolution)
lo = wb.create_sheet("Location", 2)
title(lo, "Location - resolved values for this parcel", "Each value comes from the most specific level that has it: City > County > State > National. Source shows which level was used.")
put(lo, "B4", "City key", fb); put(lo, "C4", f'=IF({P["city"]}="","#none",{P["state"]}&"|"&{P["county"]}&"|"&{P["city"]})', fn)
put(lo, "B5", "County key", fb); put(lo, "C5", f'={P["state"]}&"|"&{P["county"]}', fn)
put(lo, "B6", "State key", fb); put(lo, "C6", f'={P["state"]}', fn)
KEYCELL = {"city": "Location!$C$4", "cnty": "Location!$C$5", "state": "Location!$C$6"}
hdr(lo, 8, ["Field", "Resolved value", "Source level"], 2)
Rz = {}


def resolve(col_rng, src=False):
    out = '"National"' if src else f'INDEX({col_rng},MATCH("US",{RKEYRNG},0))'
    for key, label in [("state", "State"), ("cnty", "County"), ("city", "City")]:
        k = KEYCELL[key]
        cond = f'IFERROR(INDEX({col_rng},MATCH({k},{RKEYRNG},0))<>"",FALSE)'
        val = f'"{label}"' if src else f'INDEX({col_rng},MATCH({k},{RKEYRNG},0))'
        out = f'IF({cond},{val},{out})'
    return "=" + out


r = 9
for k, lab in RCOLS:
    if k not in RNUM + RYN: continue
    Rz[k] = f"Location!$C${r}"
    put(lo, f"B{r}", lab); c = put(lo, f"C{r}", resolve(RCOL(k)), fb if k.endswith("idx") else fn)
    c.number_format = rg[f"{RC[k]}5"].number_format if k in RNUM else "General"
    put(lo, f"D{r}", resolve(RCOL(k), src=True), fs); r += 1
put(lo, f"B{r + 1}", "Location name", fb)
put(lo, f"C{r + 1}", f'=IF({P["city"]}<>"",{P["city"]}&", ","")&{P["county"]}&" County, "&{P["state"]}&"  (cost index from "&LOWER(D9)&" data)"', fn)
LOCNAME = f"Location!$C${r + 1}"
widths(lo, {"A": 2, "B": 52, "C": 22, "D": 14})

# Parcel derived formulas (need A, Rz, LK)
pf = {
    "net": f"={P['gross']}*{P['buildpct']}",
    "pubW": f'=IF(OR({P["water_site"]}="Y",{P["water_dist"]}<={A["wmax"]}),1,0)',
    "pubS": f'=IF(OR({P["sewer_site"]}="Y",{P["sewer_dist"]}<={A["smax"]}),1,0)',
    "extW": f'=IF({P["water_site"]}="Y",0,{P["water_dist"]})*{P["pubW"]}',
    "extS": f'=IF({P["sewer_site"]}="Y",0,{P["sewer_dist"]})*{P["pubS"]}',
    "sidx": f"=MATCH({P['scenario']},{LK['scen']},0)",
    "slopem": f"=INDEX({LK['slopem']},MATCH(TRUE,INDEX({P['slope']}<={LK['slope']},0),0))",
    "soilm": f"=IFERROR(INDEX({LK['soilm']},MATCH({P['soil']},{LK['soil']},0)),1)",
    "soilg": f"=IFERROR(INDEX({LK['soilg']},MATCH({P['soil']},{LK['soil']},0)),1)",
    "zapplies": f'=IF(OR(AND({P["jtype"]}="City",{Rz["city_zoning"]}="Y"),AND({P["jtype"]}="ETJ",{Rz["etj_zoning"]}="Y"),AND({P["jtype"]}="County",{Rz["cnty_zoning"]}="Y")),1,0)',
}
for k, f in pf.items():
    pc[P[k].replace("Parcel!", "").replace("$", "")] = f
    pc[P[k].replace("Parcel!", "").replace("$", "")].font = fn

# ============================================================ Use library
ul = wb.create_sheet("Use_Library", 3)
title(ul, "Use Library", "One row per use, at the REFERENCE BASIS (index 1.0 = Grayson County, TX). The engine localizes and learns through Use_Effective. Every economic value is a PLACEHOLDER.")
hdr(ul, 4, [lab for _, lab in COLS], 1, height=75)
FIRST = 5; N = len(U); LAST = FIRST + N - 1
UC = {k: L(i + 1) for i, k in enumerate(KEYS)}
pct_keys = {"os", "othinc", "vac", "mgmt", "recov", "cap", "margin", "capture", "disturb"}
usd_keys = {"entitle", "vert", "lotprice", "saleprice", "rent", "opex", "tilc", "landac", "groundrent"}
for i, u in enumerate(U):
    r = FIRST + i
    for k in KEYS:
        v = u[k]; c = ul[f"{UC[k]}{r}"]; c.value = v
        if k in ("use", "cat"): c.font = fb if k == "use" else fn
        elif k in ("loc", "notes"): c.font = fs
        else: c.font = fin; c.fill = fill_in
        if k in pct_keys: c.number_format = PCT
        elif k in usd_keys: c.number_format = USD2 if isinstance(v, float) and v < 100 else USD
        elif k in ("density", "maxac", "minac", "minlot", "absorb", "lotabs"): c.number_format = '0.0#'
        elif k in ("sitesf", "road", "pave", "taps", "septic", "wells", "gpd", "demhh"): c.number_format = '#,##0.0###'
for k in KEYS: ul.column_dimensions[UC[k]].width = {"use": 40, "cat": 18, "engine": 13, "unit": 15, "loc": 60, "notes": 50}.get(k, 12)
ul.freeze_panes = "B5"
dv(ul, f"{UC['engine']}{FIRST}:{UC['engine']}{LAST + 40}", f"={LK['engine']}")
dv(ul, f"{UC['zclass']}{FIRST}:{UC['zclass']}{LAST + 40}", f"={LK['zclass']}")
for k in ("discrete", "lotrule", "reqsewer", "reqwater", "horiz", "detreq", "frontgate", "needroad", "corner", "tested"):
    dv(ul, f"{UC[k]}{FIRST}:{UC[k]}{LAST + 40}", f"={LK['yn']}")
USE_RNG = f"Use_Library!$A${FIRST}:$A${LAST}"

# ============================================================ Org profile
op = wb.create_sheet("Org_Profile", 4)
title(op, "Org Profile - who is looking", "The org's development types drive the 'My uses' ranking and the prefilled proformas. Learned values come from the org's uploads and actuals.")
O = {}
put(op, "B4", "Active org", fb); put(op, "C4", "Ridge Stone Homes", fin, None, fill_in); O["org"] = "Org_Profile!$C$4"
put(op, "B5", "Ranking shows", fb); put(op, "C5", "All uses", fin, None, fill_in); O["filter"] = "Org_Profile!$C$5"
dv(op, "C5", f"={LK['filter']}")
put(op, "B7", "Required margin by engine (blank = use library)", fsec)
hdr(op, 8, ["Engine", "Org margin"], 2)
for i, e in enumerate(["For-Sale", "Income", "Operator Pad", "Land Play"]):
    put(op, f"B{9 + i}", e); c = put(op, f"C{9 + i}", None, fin, PCT, fill_in)
O["meng"] = "Org_Profile!$B$9:$B$12"; O["mval"] = "Org_Profile!$C$9:$C$12"
put(op, "B14", "Learned estimating bias (from Deal_History)", fsec)
put(op, "B15", "Deals with actuals"); put(op, "B16", "Average cost overrun"); put(op, "B17", "Bias applied (shrunk toward 0)", fb)
put(op, "B18", "Apply bias to new runs"); put(op, "C18", "Y", fin, None, fill_in); dv(op, "C18", f"={LK['yn']}")
O["bias_n"] = "Org_Profile!$C$15"; O["bias"] = "Org_Profile!$C$17"
put(op, "B20", "Development types this org does", fsec)
hdr(op, 21, ["Use", "I build this (Y/N)"], 2)
OPFIRST = 22
MY = {"Homesites (stick-built, for sale)", "Manufactured home subdivision", "Manufactured home community (MHC)",
      "MHC with park-owned homes", "Workforce / extended-stay RV park", "Leisure RV park / campground",
      "STR tiny-home resort / glamping", "Tiny-home long-term rental community", "Frontage split lots (no new road)",
      "Ranchette subdivision (new internal road)", "Boat & RV storage", "Small-bay flex industrial",
      "Finished / entitled lots"}
for i, u in enumerate(U):
    put(op, f"B{OPFIRST + i}", f"=Use_Library!$A${FIRST + i}", flink)
    put(op, f"C{OPFIRST + i}", "Y" if u["use"] in MY else "N", fin, None, fill_in)
dv(op, f"C{OPFIRST}:C{OPFIRST + N - 1}", f"={LK['yn']}")
widths(op, {"A": 2, "B": 44, "C": 20})

# ============================================================ Market data + org overrides
md = wb.create_sheet("Market_Data")
title(md, "Market Data - local comps and pooled benchmarks by location x use x field",
      "Values here are LOCAL (not indexed). Pooled rows count only with enough records and orgs (Assumptions). Example rows - placeholders.")
MDL = 304
hdr(md, 4, ["Region key", "Use", "Field", "Value", "Records", "Orgs", "Layer", "As of", "Source", "Valid", "Lookup key"], 1, height=32)
mrows = [
    ("TX|Collin", "Homesites (stick-built, for sale)", "saleprice", 520000, 42, 1, "Landova comps", "2026-09", "MLS closed sales, 12 mo"),
    ("TX|Collin", "Finished / entitled lots", "lotprice", 110000, 11, 1, "Landova comps", "2026-09", "Lot takedown comps"),
    ("TX|Grayson", "Boat & RV storage", "rent", 1380, 12, 4, "Pooled", "2026-08", "Pooled rent rolls"),
    ("TX|Grayson", "Workforce / extended-stay RV park", "rent", 8400, 3, 2, "Pooled", "2026-08", "Suppressed: too few records"),
    ("TX|Midland", "Workforce / extended-stay RV park", "rent", 10800, 9, 3, "Pooled", "2026-07", "Pooled rent rolls"),
    ("TX|Grayson", "Frontage split lots (no new road)", "landac", 16500, 18, 1, "Landova comps", "2026-09", "Rural 2-10 ac sales"),
    ("TX", "Manufactured home community (MHC)", "cap", 0.07, 25, 1, "Landova comps", "2026-06", "Statewide MHC trades"),
]
for i, row_ in enumerate(mrows):
    r = 5 + i
    for j, v in enumerate(row_):
        c = md.cell(row=r, column=j + 1, value=v); c.font = fin
        if j == 3: c.number_format = PCT if isinstance(v, float) and v < 1 else USD
for r in range(5, MDL + 1):
    put(md, f"J{r}", f'=IF(A{r}="","",IF(G{r}="Pooled",AND(E{r}>={A["pool_n"]},F{r}>={A["pool_orgs"]}),TRUE))', fn)
    put(md, f"K{r}", f'=IF(J{r}=TRUE,A{r}&"|"&B{r}&"|"&C{r},"")', fs)
dv(md, f"B5:B{MDL}", f"={USE_RNG}"); dv(md, f"G5:G{MDL}", f"={LK['layer']}")
widths(md, {"A": 14, "B": 40, "C": 12, "D": 12, "E": 9, "F": 7, "G": 15, "H": 10, "I": 30, "J": 8, "K": 60})
md.freeze_panes = "A5"

oo = wb.create_sheet("Org_Overrides")
title(oo, "Org Overrides - an org's learned numbers by use x field",
      "Written by the learner from the org's uploads and actuals, stored at the REFERENCE BASIS (divided by the deal location's index), so they travel to any market. Example rows.")
OOL = 304
hdr(oo, 4, ["Org", "Use", "Field", "Value (reference basis)", "Effective records", "Source", "As of", "Lookup key"], 1, height=32)
orows = [
    ("Ridge Stone Homes", "Manufactured home subdivision", "vert", 112000, 6, "Deal_History actuals (Short Road, Sears Rd)", "2026-09"),
    ("Ridge Stone Homes", "Manufactured home community (MHC)", "opex", 1100, 4, "Uploaded T-12s", "2026-08"),
    ("Ridge Stone Homes", "Workforce / extended-stay RV park", "devmo", 9, 3, "Deal_History actuals", "2026-06"),
    ("Other Org LLC", "Homesites (stick-built, for sale)", "vert", 260000, 5, "Uploaded proformas", "2026-05"),
]
for i, row_ in enumerate(orows):
    for j, v in enumerate(row_):
        c = oo.cell(row=5 + i, column=j + 1, value=v); c.font = fin
        if j == 3: c.number_format = NUM if v < 100 else USD
for r in range(5, OOL + 1):
    put(oo, f"H{r}", f'=IF(A{r}="","",A{r}&"|"&B{r}&"|"&C{r})', fs)
dv(oo, f"B5:B{OOL}", f"={USE_RNG}")
widths(oo, {"A": 20, "B": 40, "C": 10, "D": 14, "E": 10, "F": 40, "G": 10, "H": 60})

# ============================================================ Use_Effective (localized + learned)
ue = wb.create_sheet("Use_Effective", 5)
title(ue, "Use Effective - the inputs the engine actually uses for this parcel and org",
      "Cost-type fields: Org > Market > Default x index. Revenue-type fields: Market (City > County > State) > Org > Default x index. Do not edit.")
LF = list(LEARNABLE)
hdr(ue, 4, ["Use"] + [f"{dict(COLS)[k]}" for k in LF] + [f"Source: {k}" for k in LF] + ["Fields from data (not default)"], 1, height=75)
V = {k: L(2 + i) for i, k in enumerate(LF)}
VS = {k: L(2 + len(LF) + i) for i, k in enumerate(LF)}
V["ndata"] = L(2 + 2 * len(LF))
IDX = {"cost": Rz["cost_idx"], "opex": Rz["opex_idx"], "price": Rz["price_idx"], "rent": Rz["rent_idx"]}
OOK = f"Org_Overrides!$H$5:$H${OOL}"; OOV = f"Org_Overrides!$D$5:$D${OOL}"
MDK = f"Market_Data!$K$5:$K${MDL}"; MDV = f"Market_Data!$D$5:$D${MDL}"
for i in range(N):
    r = FIRST + i
    put(ue, f"A{r}", f"=Use_Library!$A${r}", fb)
    for k in LF:
        kind, ix = LEARNABLE[k]
        lib = f"Use_Library!${UC[k]}${r}"

        def loc(x):
            if ix == "capadj": return f"({x}+{Rz['cap_adj']})"
            if ix: return f"({x}*{IDX[ix]})"
            return x
        orgk = f'{O["org"]}&"|"&$A{r}&"|{k}"'
        mk = {lv: f'{KEYCELL[lv]}&"|"&$A{r}&"|{k}"' for lv in ("city", "cnty", "state")}
        org_v = f"INDEX({OOV},MATCH({orgk},{OOK},0))"
        mk_v = {lv: f"INDEX({MDV},MATCH({mk[lv]},{MDK},0))" for lv in mk}
        if k == "margin":
            eng_m = f'INDEX({O["mval"]},MATCH(Use_Library!${UC["engine"]}${r},{O["meng"]},0))'
            f = f'=IFERROR({org_v},IF({eng_m}<>"",{eng_m},{lib}))'
            s = f'=IF(ISNUMBER(MATCH({orgk},{OOK},0)),"Org",IF({eng_m}<>"","Org engine margin","Default"))'
        else:
            has = lambda key, rng: f"ISNUMBER(MATCH({key},{rng},0))"
            mchain = [("city", "Market-City"), ("cnty", "Market-County"), ("state", "Market-State")]
            dflt = loc(lib); dlab = '"Default x index"' if ix else '"Default"'
            if kind == "cost":
                f = dflt; s = dlab
                for lv, lab in reversed(mchain):
                    f = f"IFERROR({mk_v[lv]},{f})"; s = f'IF({has(mk[lv], MDK)},"{lab}",{s})'
                f = f"=IFERROR({loc(org_v)},{f})"; s = f'=IF({has(orgk, OOK)},"Org",{s})'
            else:
                f = f"IFERROR({loc(org_v)},{dflt})"; s = f'IF({has(orgk, OOK)},"Org",{dlab})'
                for lv, lab in reversed(mchain):
                    f = f"IFERROR({mk_v[lv]},{f})"; s = f'IF({has(mk[lv], MDK)},"{lab}",{s})'
                f = "=" + f; s = "=" + s
        fmt = ul[f"{UC[k]}{r}"].number_format
        put(ue, f"{V[k]}{r}", f, fn, fmt); put(ue, f"{VS[k]}{r}", s, fs)
    put(ue, f"{V['ndata']}{r}", f'={len(LF)}-COUNTIF({VS[LF[0]]}{r}:{VS[LF[-1]]}{r},"Default*")', fn, NUM)
ue.column_dimensions["A"].width = 40
for k in LF: ue.column_dimensions[V[k]].width = 12; ue.column_dimensions[VS[k]].width = 14
ue.freeze_panes = "B5"

# ============================================================ Cost library + cost records (learning)
cr = wb.create_sheet("Cost_Records")
title(cr, "Cost Records - every observed unit cost, normalized",
      "One row per unit cost from uploads, bids and actuals. Normalized = raw / location cost index x escalation to the valuation date. Example rows.")
CRL = 504
hdr(cr, 4, ["Org", "Cost code", "Raw unit cost", "Deal region key", "As of", "Data quality", "Location cost index",
            "Escalation to today", "Normalized unit cost", "Weight", "Source file / deal"], 1, height=32)
crows = [
    ("Ridge Stone Homes", "03-200", 5600, "TX|Grayson", dt.date(2025, 6, 1), "Actual", "Short Road actuals"),
    ("Ridge Stone Homes", "04-300", 10500, "TX|Grayson", dt.date(2025, 6, 1), "Actual", "Short Road actuals"),
    ("Ridge Stone Homes", "04-300", 11800, "TX|Fannin", dt.date(2026, 3, 1), "Bid", "Wright Road septic bid"),
    ("Ridge Stone Homes", "03-300", 140, "TX|Grayson", dt.date(2026, 2, 1), "Bid", "Sears Rd paving bid"),
    ("Other Org LLC", "03-200", 7400, "TX|Collin", dt.date(2026, 1, 15), "Bid", "Not this org - ignored"),
]
for i, row_ in enumerate(crows):
    r = 5 + i
    for col, v in zip("ABCDEFK", row_):
        c = put(cr, f"{col}{r}", v, fin)
        if col == "E": c.number_format = DATE
        if col == "C": c.number_format = USD
ci_col = RCOL("cost_idx")
for r in range(5, CRL + 1):
    d = f"D{r}"
    loc_idx = (f'IF(IFERROR(INDEX({ci_col},MATCH({d},{RKEYRNG},0))<>"",FALSE),INDEX({ci_col},MATCH({d},{RKEYRNG},0)),'
               f'IF(IFERROR(INDEX({ci_col},MATCH(LEFT({d},2),{RKEYRNG},0))<>"",FALSE),INDEX({ci_col},MATCH(LEFT({d},2),{RKEYRNG},0)),'
               f'INDEX({ci_col},MATCH("US",{RKEYRNG},0))))')
    put(cr, f"G{r}", f'=IF(C{r}="","",{loc_idx})', fn, "0.00")
    put(cr, f"H{r}", f'=IF(C{r}="","",(1+{A["esc"]})^(({A["valdate"]}-E{r})/365.25))', fn, NUM3)
    put(cr, f"I{r}", f'=IF(C{r}="",0,C{r}/G{r}*H{r})', fn, USD2)
    put(cr, f"J{r}", f'=IF(C{r}="",0,IFERROR(INDEX({LK["qualw"]},MATCH(F{r},{LK["qual"]},0)),0.3)*0.5^(({A["valdate"]}-E{r})/365.25/{A["halflife"]}))', fn, NUM3)
dv(cr, f"F5:F{CRL}", f"={LK['qual']}")
widths(cr, {"A": 20, "B": 10, "C": 12, "D": 14, "E": 11, "F": 12, "G": 12, "H": 12, "I": 14, "J": 9, "K": 30})
cr.freeze_panes = "A5"

cl = wb.create_sheet("Cost_Library", 6)
title(cl, "Cost Library - horizontal unit costs (reference basis)",
      "Low/Base/High are Landova defaults. The org's own records (Cost_Records) pull the value toward their experience as they accumulate. The engine multiplies by the location cost index.")
hdr(cl, 4, ["Code", "Line item", "Unit", "Low", "Base", "High", "Scenario value", "Org effective records", "Learned value", "Used", "Source"], 1, height=32)
C = {}
m_org = f'(Cost_Records!$A$5:$A${CRL}={O["org"]})'
for i, (code, item, unit, lo_, ba, hi) in enumerate(COST_LIB):
    r = 5 + i; C[code] = f"Cost_Library!$J${r}"
    put(cl, f"A{r}", code); put(cl, f"B{r}", item); put(cl, f"C{r}", unit)
    fmt = USD2 if ba < 10 else USD
    for col, v in zip("DEF", (lo_, ba, hi)): put(cl, f"{col}{r}", v, fin, fmt, fill_in)
    m = f'{m_org}*(Cost_Records!$B$5:$B${CRL}=A{r})'
    put(cl, f"G{r}", f"=INDEX(D{r}:F{r},{P['sidx']})", fn, fmt)
    put(cl, f"H{r}", f"=SUMPRODUCT({m}*Cost_Records!$J$5:$J${CRL})", fn, NUM1)
    put(cl, f"I{r}", f"=(SUMPRODUCT({m}*Cost_Records!$J$5:$J${CRL}*Cost_Records!$I$5:$I${CRL})+{A['shrink_k']}*G{r})/(H{r}+{A['shrink_k']})", fn, fmt)
    put(cl, f"J{r}", f"=I{r}", fb, fmt)
    put(cl, f"K{r}", f'=IF(H{r}>0,"Org-learned ("&TEXT(H{r},"0.0")&" eff. records)","Library - "&{P["scenario"]})', fs)
widths(cl, {"A": 9, "B": 40, "C": 18, "D": 10, "E": 10, "F": 10, "G": 12, "H": 12, "I": 12, "J": 12, "K": 30})
cl.freeze_panes = "C5"

# ============================================================ Engine
en = wb.create_sheet("Engine", 5)
title(en, "Engine - every use run against this parcel",
      "One row per use, one column per calculation step, left to right. This tab IS the spec. Do not edit - change inputs on Parcel, Org_Profile, Assumptions, Regions, Use_Library.")
ENG = []
def col(key, header, f, fmt=USD, grp=""): ENG.append((key, header, f, fmt, grp))


inc = '{u:engine}="Income"'
fsale = '{u:engine}="For-Sale"'
CI = "{r:cost_idx}"

G = "Identity"
col("use", "Use", "={u:use}", None, G); col("engine", "Engine", "={u:engine}", None, G)
col("unit", "Capacity unit", "={u:unit}", None, G); col("zclass", "Zoning class", "={u:zclass}", None, G)
col("mine", "Org builds this (1/0)", '=IF({op:mine}="Y",1,0)', NUM, G)
G = "Yield (before demand)"
col("usable_all", "Usable acres (net - open space - detention)", '=MAX(0,{p:net}*(1-{u:os}-IF({u:detreq}="Y",{a:det},0)))', NUM1, G)
col("used0", "Usable acres used (market acre cap)", "=IF({u:maxac}>0,MIN({e:usable_all},{u:maxac}),{e:usable_all})", NUM1, G)
col("f0", "Share of parcel used (before demand)", "=IF({e:usable_all}=0,0,{e:used0}/{e:usable_all})", PCT, G)
col("net0", "Net acres in use (before demand)", "={p:net}*{e:f0}", NUM1, G)
G = "Gates"
col("zstat", "Zoning status",
    '=IF(ISNUMBER(SEARCH(","&{u:zclass}&",",","&SUBSTITUTE({p:zdeed}," ","")&",")),"Deed restricted",'
    'IF({p:zapplies}=0,"No zoning",IF(ISNUMBER(SEARCH(","&{u:zclass}&",",","&SUBSTITUTE({p:zallowed}," ","")&",")),"By right",'
    'IF(OR(TRIM({p:rezone_ok})="*",ISNUMBER(SEARCH(","&{u:zclass}&",",","&SUBSTITUTE({p:rezone_ok}," ","")&","))),"Rezone required","Prohibited by zoning"))))', None, G)
col("zone_ok", "Zoning / deed passes (1/0)", '=IF(OR({e:zstat}="Deed restricted",{e:zstat}="Prohibited by zoning"),0,1)', NUM, G)
col("rez", "Rezone needed (1/0)", '=IF({e:zstat}="Rezone required",1,0)', NUM, G)
col("acc_ok", "Access passes (1/0)", '=IF({p:access}="None",0,IF(AND({p:access}="Private easement",{u:needroad}="Y"),0,1))', NUM, G)
col("front_ok", "Frontage passes (1/0)", '=IF(AND({u:frontgate}="Y",{p:frontage}<{u:minfront}),0,1)', NUM, G)
col("sewer_ok", "Sewer requirement met (1/0)", '=IF(AND({u:reqsewer}="Y",{p:pubS}=0),0,1)', NUM, G)
col("water_ok", "Water requirement met (1/0)", '=IF(AND({u:reqwater}="Y",{p:pubW}=0),0,1)', NUM, G)
col("loc_fail", "Location test failures",
    '=TRIM(IF(AND({u:minvpd}>0,{p:vpd}<{u:minvpd}),"Traffic under "&TEXT({u:minvpd},"#,##0")&" VPD. ","")'
    '&IF(AND({u:minhh}>0,{p:hh}<{u:minhh}),"Under "&TEXT({u:minhh},"#,##0")&" households in 3 mi. ","")'
    '&IF(AND({u:maxhwy}>0,{p:hwy}>{u:maxhwy}),"Over "&{u:maxhwy}&" mi to highway. ","")'
    '&IF(AND({u:corner}="Y",{p:corner}<>"Y"),"Needs a corner. ","")'
    '&IF(AND({u:maxsub}>0,{p:sub}>{u:maxsub}),"Over "&{u:maxsub}&" mi to substation. ","")'
    '&IF(AND({u:maxanchor}>0,{p:anchor}>{u:maxanchor}),"Over "&{u:maxanchor}&" mi to a major employer. ",""))', None, G)
col("loc_ok", "Location passes (1/0)", '=IF({e:loc_fail}="",1,0)', NUM, G)
col("size_ok", "Parcel big enough (1/0)", "=IF({e:usable_all}>={u:minac},1,0)", NUM, G)
col("gate", "All gates pass (1/0)", "={e:zone_ok}*{e:acc_ok}*{e:front_ok}*{e:sewer_ok}*{e:water_ok}*{e:loc_ok}*{e:size_ok}", NUM, G)
G = "Capacity"
BIG = "1E+9"
col("cap_den", "Capacity by density", f"=IF({{u:density}}>0,{{e:net0}}*{{u:density}},{BIG})", NUM1, G)
col("cap_site", "Capacity by site area", f"=IF({{u:sitesf}}>0,{{e:used0}}*43560/{{u:sitesf}},{BIG})", NUM1, G)
col("cap_lot", "Capacity by septic min lot (subdivided lots)", f'=IF(AND({{u:lotrule}}="Y",{{p:pubS}}=0),{{e:used0}}*(1-{{a:rowpct}})/IF({{p:pubW}}=1,{{r:lot_w}},{{r:lot_well}}),{BIG})', NUM1, G)
col("cap_minlot", "Capacity by min lot size (gross)", f"=IF({{u:minlot}}>0,{{p:gross}}*{{e:f0}}/{{u:minlot}},{BIG})", NUM1, G)
col("cap_front", "Capacity by road frontage", f"=IF({{u:frontlf}}>0,{{p:frontage}}/{{u:frontlf}},{BIG})", NUM1, G)
col("cap_ww", "Capacity by on-site septic (gal/day)", f'=IF(AND({{p:pubS}}=0,{{u:lotrule}}="N",{{u:gpd}}>0,{{u:horiz}}="Y"),{{e:used0}}*{{r:gpd_ac}}*{{p:soilg}}/{{u:gpd}},{BIG})', NUM1, G)
col("cap_phys", "Physical capacity", "=MIN({e:cap_den},{e:cap_site},{e:cap_lot},{e:cap_minlot},{e:cap_front},{e:cap_ww})", NUM1, G)
col("cap_dem", "Capacity by market demand", f"=IF({{u:demhh}}>0,IF({{u:radius}}>=10,{{p:hh10}},{{p:hh}})*{{u:demhh}}*{{u:capture}},{BIG})", NUM1, G)
col("dratio", "Demand ratio (share of physical capacity the market takes)", f"=IF(OR({{e:cap_phys}}>={BIG},{{e:cap_phys}}<=0),1,MIN(1,{{e:cap_dem}}/{{e:cap_phys}}))", PCT, G)
col("used_ac", "Usable acres used by this use", "={e:used0}*{e:dratio}", NUM1, G)
col("ufrac", "Share of parcel used", "=IF({e:usable_all}=0,0,{e:used_ac}/{e:usable_all})", PCT, G)
col("net_u", "Net acres in use", "={p:net}*{e:ufrac}", NUM1, G)
col("det_ac", "Detention acres", '={e:net_u}*IF({u:detreq}="Y",{a:det},0)', NUM1, G)
col("dev_ac", "Developed acres", "={e:net_u}*(1-{u:os})", NUM1, G)
col("excess_ac", "Excess gross acres (resold as raw land)", "={p:gross}*(1-{e:ufrac})", NUM1, G)
col("capmin", "Binding capacity (physical or demand)", "=MIN({e:cap_phys},{e:cap_dem})", NUM1, G)
col("capacity", "CAPACITY (units / SF / acres)", f'=IF({{e:gate}}=0,0,IF({{e:capmin}}>={BIG},{{e:used_ac}},IF({{u:discrete}}="Y",INT({{e:capmin}}+1E-9),{{e:capmin}})))', NUM, G)
col("binding", "Binding constraint",
    '=IF({e:acc_ok}=0,"No public road access",IF({e:zone_ok}=0,{e:zstat},IF({e:loc_ok}=0,"Location fails",'
    'IF({e:front_ok}=0,"Frontage under "&{u:minfront}&" LF",IF({e:size_ok}=0,"Too small - needs "&{u:minac}&" usable ac",'
    'IF({e:sewer_ok}=0,"Needs public sewer",IF({e:water_ok}=0,"Needs public water",IF({e:capmin}>=1E+9,"Usable acres",'
    'IF({e:cap_dem}<={e:cap_phys},"Market demand",IF({e:cap_lot}={e:cap_phys},"Septic lot size",'
    'IF({e:cap_ww}={e:cap_phys},"Septic capacity (gal/day)",IF({e:cap_minlot}={e:cap_phys},"Min lot size",'
    'IF({e:cap_front}={e:cap_phys},"Road frontage",IF({e:cap_site}={e:cap_phys},"Site area / parking","Density"))))))))))))))', None, G)
col("on", "Anything fits (1/0)", "=IF({e:capacity}>0,1,0)", NUM, G)
col("hz", "Horizontal by us (1/0)", '=IF({u:horiz}="Y",1,0)*{e:on}', NUM, G)
col("sewer_pot", "Capacity if sewer were available", f'=IF({{p:pubS}}=0,MIN({{e:cap_den}},{{e:cap_site}},{{e:cap_minlot}},{{e:cap_front}},{{e:cap_dem}}),0)', NUM1, G)
col("unlock", "Unlock",
    f'=IF(AND({{p:pubS}}=0,{{e:acc_ok}}*{{e:zone_ok}}*{{e:loc_ok}}*{{e:front_ok}}*{{e:size_ok}}*{{e:water_ok}}=1,{{e:sewer_pot}}<{BIG},'
    '{e:sewer_pot}>=MAX(1,{e:capacity})*1.25),"Unlock: sewer or package plant allows ~"&TEXT(INT({e:sewer_pot}),"#,##0")&" "&{u:unit}&". ","")', None, G)
G = "Quantities"
col("road_lf", "Internal road LF", "={e:capacity}*{u:road}*{e:hz}", NUM, G)
col("pave_sf", "Paving / hardscape SF", "={e:capacity}*{u:pave}*{e:hz}", NUM, G)
col("conns", "Utility connections", "={e:capacity}*{u:taps}*{e:hz}", NUM1, G)
col("water_lf", "Water line LF", "=IF({p:pubW}=1,{e:road_lf}+{p:extW},0)*{e:hz}", NUM, G)
col("wtaps", "Water taps", "={e:conns}*{p:pubW}", NUM1, G)
col("pws", "Public water system needed (1/0)", '=IF(AND({p:pubW}=0,{u:lotrule}="N",{e:conns}>={r:pws_conn}),1,0)*{e:hz}', NUM, G)
col("sewer_lf", "Sewer line LF", "=IF({p:pubS}=1,{e:road_lf}+{p:extS},0)*{e:hz}", NUM, G)
col("staps", "Sewer taps", "={e:conns}*{p:pubS}", NUM1, G)
col("septics", "Septic systems", "=IF({p:pubS}=0,{e:capacity}*{u:septic},0)*{e:hz}", NUM1, G)
col("ww_gpd", "On-site wastewater gal/day", "=IF({p:pubS}=0,{e:capacity}*{u:gpd},0)*{e:hz}", NUM, G)
col("wwpermit", "State wastewater permit needed (1/0)", '=IF(AND({u:lotrule}="N",{e:ww_gpd}>{r:permit_gpd}),1,0)', NUM, G)
col("wells", "Private wells", "=IF(AND({p:pubW}=0,{e:pws}=0),{e:capacity}*{u:wells},0)*{e:hz}", NUM1, G)
col("clear_ac", "Acres to clear", "={e:dev_ac}*{p:tree}*{u:disturb}*{e:hz}", NUM1, G)
col("grade_ac", "Acres to grade (disturbed)", "={e:dev_ac}*{u:disturb}*{e:hz}", NUM1, G)
col("plats", "Lots to plat", f'=IF({fsale},IF({{u:discrete}}="Y",{{e:capacity}},1),1)*{{e:on}}', NUM, G)
col("isres", "Dwelling (pays impact fees) (1/0)", '=IF(OR({u:zclass}="RES-SF",{u:zclass}="RES-ATT",{u:zclass}="RES-MF",{u:zclass}="MH"),1,0)', NUM, G)
G = "Horizontal budget"
col("c_survey", "02-100 Survey", f"={{c:02-100}}*{CI}*{{e:on}}", USD, G)
col("c_plat", "02-110 Platting", f"={{e:plats}}*{{c:02-110}}*{CI}", USD, G)
col("c_civil", "02-200 Civil engineering", f"={{e:grade_ac}}*{{c:02-200}}*{CI}", USD, G)
col("c_geo", "02-300 Geotech (only when most of the site is disturbed)", f'={{c:02-300}}*{CI}*{{e:hz}}*IF({{u:disturb}}>=0.5,1,0)', USD, G)
col("c_septev", "02-310 Septic evaluations", f"={{e:septics}}*{{c:02-310}}*{CI}", USD, G)
col("c_wwperm", "02-320 State wastewater permit", f"={{e:wwpermit}}*{{c:02-320}}*{CI}", USD, G)
col("c_p1", "02-400 Phase I", f"={{c:02-400}}*{CI}*{{e:on}}", USD, G)
col("c_drain", "02-500 Drainage study (when detention applies)", f'={{c:02-500}}*{CI}*{{e:hz}}*IF({{u:detreq}}="Y",1,0)', USD, G)
col("c_ent", "Entitlement (use-specific, localized)", "={v:entitle}*{e:on}", USD, G)
col("c_rezone", "Rezoning (location)", "={e:rez}*{r:rezone_cost}*{e:on}", USD, G)
col("c_legal", "02-700 Legal & title", f"={{c:02-700}}*{CI}*{{e:on}}", USD, G)
col("c_clear", "03-100 Clearing", f"={{e:clear_ac}}*{{c:03-100}}*{CI}", USD, G)
col("c_grade", "03-200 Grading", f"={{e:grade_ac}}*{{c:03-200}}*{CI}*{{p:slopem}}", USD, G)
col("c_road", "03-300 Roads / drives", f"={{e:road_lf}}*{{c:03-300}}*{CI}", USD, G)
col("c_pave", "03-350 Paving / parking", f"={{e:pave_sf}}*{{c:03-350}}*{CI}", USD, G)
col("c_det", "03-400 Detention", f"={{e:det_ac}}*{{c:03-400}}*{CI}*{{e:hz}}", USD, G)
col("c_swppp", "03-500 SWPPP", f"={{e:grade_ac}}*{{c:03-500}}*{CI}", USD, G)
col("c_drive", "03-600 Driveway / turn lane", f'=IF({{u:frontgate}}="Y",1,0)*{{c:03-600}}*{CI}*{{e:hz}}', USD, G)
col("c_wline", "04-100 Water line", f"={{e:water_lf}}*{{c:04-100}}*{CI}", USD, G)
col("c_wtap", "04-110 Water taps", f"={{e:wtaps}}*{{c:04-110}}*{CI}", USD, G)
col("c_sline", "04-200 Sewer line", f"={{e:sewer_lf}}*{{c:04-200}}*{CI}", USD, G)
col("c_stap", "04-210 Sewer taps", f"={{e:staps}}*{{c:04-210}}*{CI}", USD, G)
col("c_septic", "04-300 Septic systems", f"={{e:septics}}*{{c:04-300}}*{CI}*{{p:soilm}}", USD, G)
col("c_well", "04-310 Wells", f"={{e:wells}}*{{c:04-310}}*{CI}", USD, G)
col("c_pws", "04-320/330 Public water system", f"={{e:pws}}*({{c:04-320}}+{{e:conns}}*{{c:04-330}})*{CI}", USD, G)
col("c_elec", "04-400 Electric", f"={{e:road_lf}}*{{c:04-400}}*{CI}", USD, G)
col("h_sub", "Horizontal subtotal", "=SUM({e:c_survey}:{e:c_elec})", USD, G)
col("h_cont", "Horizontal contingency", "={e:h_sub}*{a:hcont}", USD, G)
col("h_bias", "Org estimating bias (learned)", "=({e:h_sub}+{e:h_cont})*{o:bias}", USD, G)
col("H", "HORIZONTAL TOTAL (ex land)", "={e:h_sub}+{e:h_cont}+{e:h_bias}", USD, G)
G = "Vertical"
col("vert", "Vertical hard cost", "={e:capacity}*{v:vert}*(1+{o:bias})", USD, G)
col("vsc", "Vertical soft + contingency", "={e:vert}*({a:vsoft}+{a:vcont})", USD, G)
col("tilc", "TI + leasing commissions", "={e:capacity}*{v:tilc}", USD, G)
col("impact", "Impact fees (location)", "={e:capacity}*{r:impact}*{e:isres}*{e:on}", USD, G)
G = "Timing & hurdle"
col("devmo_e", "Development months (incl. rezoning / permits)", "={v:devmo}+{e:rez}*{r:rezone_mo}+{e:wwpermit}*{r:permit_mo}", NUM1, G)
col("sell1", "Exit 1 sell-out months", f'=IF({{v:lotabs}}>0,IF({fsale},{{e:capacity}},{{e:used_ac}})/{{v:lotabs}},0)*{{e:on}}', NUM1, G)
col("sell2", "Exit 2 sell-out months (For-Sale)", f'=IF(AND({fsale},{{v:absorb}}>0),{{e:capacity}}/{{v:absorb}},0)*{{e:on}}', NUM1, G)
col("lu", "Lease-up months (Income)", f'=IF({inc},MAX({{u:leaseup}},IF({{v:absorb}}>0,{{e:capacity}}/{{v:absorb}},0)),0)', NUM1, G)
col("T1", "Exit 1 total months", "={e:devmo_e}+{e:sell1}", NUM1, G)
col("T2", "Exit 2 total months", "={e:devmo_e}+{e:sell2}+{e:lu}", NUM1, G)
col("T3", "Exit 3 total months", f"={{e:devmo_e}}+IF({inc},{{e:lu}},0)", NUM1, G)
col("mg1", "Exit 1 required margin", "={v:margin}+{a:yrprem}*MAX(0,({e:T1}-12)/12)", PCT, G)
col("mg2", "Exit 2 required margin", "={v:margin}+{a:yrprem}*MAX(0,({e:T2}-12)/12)", PCT, G)
col("mg3", "Exit 3 required margin", "={v:margin}+{a:yrprem}*MAX(0,({e:T3}-12)/12)", PCT, G)
G = "Land & financing factors"
col("lf_base", "Land factor before carry (closing + conversion penalty)", '=1+{r:closing}+IF({p:agex}="Y",{r:rollback},0)', NUM3, G)
col("landfac1", "Land cost factor - exit 1", "={e:lf_base}+{r:carry}*({e:devmo_e}+{e:sell1}/2)/12", NUM3, G)
col("landfac2", "Land cost factor - exit 2", "={e:lf_base}+{r:carry}*({e:devmo_e}+{e:sell2}/2)/12", NUM3, G)
col("landfac3", "Land cost factor - exit 3", f"=IF({inc},{{e:landfac2}},{{e:lf_base}}+{{r:carry}}*{{e:devmo_e}}/12)", NUM3, G)
col("ff1", "Financing factor - exit 1", "=1+{a:ltc}*({a:rate}*({e:devmo_e}+{e:sell1}/2)/12*{a:bal}+{a:pts})", NUM3, G)
col("ff2", "Financing factor - exit 2", "=1+{a:ltc}*({a:rate}*(({e:devmo_e}+{e:sell2}/2)/12*{a:bal}+{e:lu}/12*{a:leaseint})+{a:pts})", NUM3, G)
col("ff3", "Financing factor - exit 3", f"=IF({inc},{{e:ff2}},1+{{a:ltc}}*({{a:rate}}*{{e:devmo_e}}/12*{{a:bal}}+{{a:pts}}))", NUM3, G)
col("sc_land", "Selling cost - land (incl. transfer tax)", "={a:sell_land}+{r:transfer}", PCT, G)
col("sc_fs", "Selling cost - homes (incl. transfer tax)", "={a:sell_fs}+{r:transfer}", PCT, G)
col("sc_inc", "Sale cost - income (incl. transfer tax)", "={a:sell_inc}+{r:transfer}", PCT, G)
col("excess_rev", "Excess land resale (net)", "={e:excess_ac}*{r:raw_ac}*(1-{e:sc_land})*{e:on}", USD, G)
G = "Exit 1 - Land / pad sale"
col("rev1", "Exit 1 net revenue", f'=IF({{u:ex1}}=1,IF({fsale},{{e:capacity}}*{{v:lotprice}}+{{p:gross}}*{{e:ufrac}}*{{v:landac}},{{e:used_ac}}*{{v:landac}})*(1-{{e:sc_land}})+{{e:excess_rev}},0)*{{e:on}}', USD, G)
col("nl1", "Exit 1 non-land cost (buyer builds paving, septic systems and wells)", "=({e:h_sub}-{e:c_pave}-{e:c_septic}-{e:c_well})*(1+{a:hcont})*(1+{o:bias})", USD, G)
col("k1", "Exit 1 cost per $1 of land", "={e:landfac1}*{e:ff1}", NUM3, G)
col("cost1", "Exit 1 total cost at asking", "=({p:land}*{e:landfac1}+{e:nl1})*{e:ff1}", USD, G)
col("profit1", "Exit 1 profit at asking", "={e:rev1}-{e:cost1}", USD, G)
col("max1", "EXIT 1 MAX OFFER", "=IF(AND({u:ex1}=1,{e:on}=1),MAX(0,((1-{e:mg1})*{e:rev1}-{e:nl1}*{e:ff1})/{e:k1}),0)", USD, G)
G = "Build cost (exits 2 & 3)"
col("nl2", "Build non-land cost (pre-financing)", "={e:H}+{e:vert}+{e:vsc}+{e:tilc}+{e:impact}", USD, G)
col("k2", "Build cost per $1 of land", "={e:landfac2}*{e:ff2}", NUM3, G)
col("cost2", "Build total cost at asking", "=({p:land}*{e:landfac2}+{e:nl2})*{e:ff2}", USD, G)
G = "Income (Income engine)"
col("gpr", "Gross potential rent", f"=IF({inc},{{e:capacity}}*{{v:rent}},0)", USD, G)
col("egi", "Effective gross income", "={e:gpr}*(1+{u:othinc})*(1-{v:vac})", USD, G)
col("opex", "Operating expenses (ex tax, ex mgmt)", f"=IF({inc},{{e:capacity}}*{{v:opex}},0)", USD, G)
col("ptax", "Property tax", f"=IF({inc},{{r:taxrate}}*{{r:assess}}*{{e:cost2}},0)", USD, G)
col("mgmtx", "Management", "={e:egi}*{u:mgmt}", USD, G)
col("recov", "Expense recoveries", "=({e:opex}+{e:ptax})*{u:recov}", USD, G)
col("noi", "NET OPERATING INCOME", "={e:egi}-{e:opex}-{e:ptax}-{e:mgmtx}+{e:recov}", USD, G)
col("capr", "Cap rate used (localized)", "={v:cap}", PCT2, G)
col("value", "Stabilized value (NOI / cap)", f"=IF(AND({inc},{{e:capr}}>0),{{e:noi}}/{{e:capr}},0)", USD, G)
col("dnoi", "Change in NOI per $1 of land", f"=IF({inc},-{{r:taxrate}}*{{r:assess}}*(1-{{u:recov}})*{{e:k2}},0)", '0.0000', G)
col("yoc", "Yield on cost", "=IF({e:cost2}=0,0,{e:noi}/{e:cost2})", PCT, G)
G = "Exit 2 - Build & sell"
col("rev2", "Exit 2 net revenue", f'=IF({{u:ex2}}=1,IF({inc},{{e:value}}*(1-{{e:sc_inc}}),{{e:capacity}}*{{v:saleprice}}*(1-{{e:sc_fs}}))+{{e:excess_rev}},0)*{{e:on}}', USD, G)
col("drev2", "Change in exit 2 revenue per $1 of land", f'=IF(AND({{u:ex2}}=1,{inc},{{e:capr}}>0),{{e:dnoi}}/{{e:capr}}*(1-{{e:sc_inc}}),0)', '0.0000', G)
col("profit2", "Exit 2 profit at asking", "={e:rev2}-{e:cost2}", USD, G)
col("max2", "EXIT 2 MAX OFFER", "=IF(AND({u:ex2}=1,{e:on}=1),MAX(0,{p:land}-((1-{e:mg2})*{e:rev2}-{e:cost2})/((1-{e:mg2})*{e:drev2}-{e:k2})),0)", USD, G)
G = "Exit 3 - Build & hold / lease"
col("rev3", "Exit 3 value", f'=IF({{u:ex3}}=1,IF({inc},{{e:value}},IF({{e:capr}}>0,{{e:used_ac}}*{{v:groundrent}}/{{e:capr}},0))+{{e:excess_rev}},0)*{{e:on}}', USD, G)
col("nl3", "Exit 3 non-land cost", f"=IF({inc},{{e:nl2}},{{e:H}})", USD, G)
col("k3", "Exit 3 cost per $1 of land", f"=IF({inc},{{e:k2}},{{e:landfac3}}*{{e:ff3}})", NUM3, G)
col("cost3", "Exit 3 total cost at asking", f"=IF({inc},{{e:cost2}},({{p:land}}*{{e:landfac3}}+{{e:H}})*{{e:ff3}})", USD, G)
col("drev3", "Change in exit 3 value per $1 of land", f'=IF(AND({{u:ex3}}=1,{inc},{{e:capr}}>0),{{e:dnoi}}/{{e:capr}},0)', '0.0000', G)
col("profit3", "Exit 3 value created at asking", "={e:rev3}-{e:cost3}", USD, G)
col("max3", "EXIT 3 MAX OFFER", "=IF(AND({u:ex3}=1,{e:on}=1),MAX(0,{p:land}-((1-{e:mg3})*{e:rev3}-{e:cost3})/((1-{e:mg3})*{e:drev3}-{e:k3})),0)", USD, G)
G = "Hold financing (Income)"
col("devloan", "Development loan", f"=IF({inc},{{a:ltc}}*({{p:land}}*{{e:landfac2}}+{{e:nl2}}),0)", USD, G)
col("ploan", "Permanent loan (lesser of LTV, DSCR, debt yield)", f"=IF(AND({inc},{{e:noi}}>0),MIN({{a:pltv}}*{{e:value}},PV({{a:prate}}/12,{{a:pamort}}*12,-{{e:noi}}/{{a:pdscr}}/12),{{e:noi}}/{{a:pdy}}),0)", USD, G)
col("dscr", "DSCR on permanent loan", "=IF({e:ploan}=0,0,{e:noi}/(-PMT({a:prate}/12,{a:pamort}*12,{e:ploan})*12))", MULT, G)
col("cashout", "Cash out at refi (perm - dev loan)", "={e:ploan}-{e:devloan}", USD, G)
G = "Answer"
col("best", "BEST MAX OFFER", "=MAX({e:max1},{e:max2},{e:max3})", USD, G)
col("bestx", "Best exit number", "=IF({e:best}<=0,0,IF({e:max1}={e:best},1,IF({e:max2}={e:best},2,3)))", NUM, G)
col("bestexit", "Best exit", '=CHOOSE({e:bestx}+1,"None works","Land / pad sale","Build & sell","Build & hold / lease")', None, G)
col("months", "Months to exit (best)", "=CHOOSE({e:bestx}+1,0,{e:T1},{e:T2},{e:T3})", NUM, G)
col("open", "Opening offer", "={e:best}*(1-{a:disc})", USD, G)
col("spread", "Max offer minus asking", "={e:best}-{p:land}", USD, G)
col("peracre", "Max offer per gross acre", "=IF({p:gross}=0,0,{e:best}/{p:gross})", USD, G)
col("perunit", "Max offer per unit of capacity", "=IF({e:capacity}=0,0,{e:best}/{e:capacity})", USD2, G)
col("verdict", "Verdict",
    '=IF({e:best}<=0,"Pass",IF({e:best}>={p:land}*{a:strong},"Strong",IF({e:best}>={p:land},"Works at asking",IF({e:best}>={p:land}*{a:negot},"Negotiate","Pass"))))', None, G)
col("conf", "Confidence", '=IF({e:on}=0,"",IF({u:tested}="Y",IF({v:ndata}>=3,"High","Medium"),"Low - verify location"))', None, G)
col("verify", "Verify before relying (untested location rules)", '=IF(AND({u:tested}="N",{e:on}=1),{u:loc},"")', None, G)
col("flags", "Flags",
    '=TRIM({e:loc_fail}&" "&IF(AND({e:on}=0,{e:gate}=1),"Nothing fits. ","")'
    '&IF(AND({u:frontgate}<>"Y",{p:frontage}<{u:minfront}),"Frontage under "&{u:minfront}&" LF. ","")'
    '&IF({p:slope}>0.15,"Slope over 15%. ","")'
    '&IF(AND({e:on}=1,{e:excess_ac}>0.5),TEXT({e:excess_ac},"0")&" ac not used - resold as raw land. ","")'
    '&IF(AND({e:on}=1,{e:dratio}<1),"Demand caps it at "&TEXT({e:capacity},"#,##0")&" "&{u:unit}&". ","")'
    '&IF(AND({e:on}=1,{e:rez}=1),"Rezone required (+"&{r:rezone_mo}&" mo). ","")'
    '&IF(AND({e:on}=1,{e:wwpermit}=1),"State wastewater permit needed. ","")'
    '&IF(AND({e:on}=1,{e:pws}=1),"Public water system needed. ","")&{e:unlock}'
    '&IF({p:flood}>{a:floodflag},"Floodplain over "&TEXT({a:floodflag},"0%")&". ","")'
    '&IF(AND({e:on}=1,{e:months}>60),"Over 5 years to exit. ",""))', None, G)
col("rankkey", "Rank key", '=IF(AND({o:filter}="My uses",{e:mine}=0),-1E+9,{e:best})+ROW()/1000000', USD, G)

EC = {k: L(i + 1) for i, (k, *_) in enumerate(ENG)}
EFIRST = 6


def expand(f, ur, r):
    f = re.sub(r"\{u:(\w+)\}", lambda m: f"Use_Library!${UC[m.group(1)]}${ur}", f)
    f = re.sub(r"\{v:(\w+)\}", lambda m: f"Use_Effective!${V[m.group(1)]}${ur}", f)
    f = f.replace("{op:mine}", f"Org_Profile!$C${OPFIRST + ur - FIRST}")
    f = re.sub(r"\{e:(\w+)\}", lambda m: f"{EC[m.group(1)]}{r}", f)
    f = re.sub(r"\{p:(\w+)\}", lambda m: P[m.group(1)], f)
    f = re.sub(r"\{r:(\w+)\}", lambda m: Rz[m.group(1)], f)
    f = re.sub(r"\{a:(\w+)\}", lambda m: A[m.group(1)], f)
    f = re.sub(r"\{o:(\w+)\}", lambda m: O[m.group(1)], f)
    f = re.sub(r"\{c:([\d-]+)\}", lambda m: C[m.group(1)], f)
    assert "{" not in f, f
    return f


prev = None
for i, (k, h, f, fmt, grp) in enumerate(ENG):
    if grp != prev:
        x = en.cell(row=4, column=i + 1, value=grp); x.font = Font(name=F, size=10, bold=True, color=NAVY); prev = grp
hdr(en, 5, [h for _, h, *_ in ENG], 1, height=80)
for j in range(N):
    r = EFIRST + j; ur = FIRST + j
    for i, (k, h, f, fmt, grp) in enumerate(ENG):
        cell = en.cell(row=r, column=i + 1, value=expand(f, ur, r))
        cell.font = fb if k in ("capacity", "best", "use") else fn
        if fmt: cell.number_format = fmt
        if k in ("max1", "max2", "max3", "best"): cell.fill = fill_g
ELAST = EFIRST + N - 1
for i, (k, *_) in enumerate(ENG):
    en.column_dimensions[L(i + 1)].width = 38 if k == "use" else (40 if k in ("flags", "verify", "unlock") else 14)
en.freeze_panes = "B6"
ER = {k: f"Engine!${EC[k]}${EFIRST}:${EC[k]}${ELAST}" for k in EC}

# Org bias from Deal_History (built below) - formulas need Deal_History column letters; filled after DH is built.

# ============================================================ Best use ranking
bu = wb.create_sheet("Best_Use", 0)
title(bu, "Best Use - is this land good, for what, and what can we pay",
      "Every use in the library run against the parcel on the Parcel tab, localized to its county and the active org's numbers, ranked by max offer.")
put(bu, "B4", "Parcel", fb); put(bu, "C4", f"={P['name']}", flink)
put(bu, "B5", "Location", fb); put(bu, "C5", f"={LOCNAME}", flink)
put(bu, "B6", "Asking price", fb); put(bu, "C6", f"={P['land']}", flink, USD)
put(bu, "B7", "As-is value (raw land, location)", fb); put(bu, "C7", f"={P['gross']}*{Rz['raw_ac']}", fn, USD)
put(bu, "B8", "Ranking shows", fb); put(bu, "C8", f"={O['filter']}&\" for \"&{O['org']}", flink)
put(bu, "E4", "Best use", fb); put(bu, "F4", "=B13", fb, None, fill_g)
put(bu, "E5", "Verdict", fb); put(bu, "F5", "=E13", fb, None, fill_g)
put(bu, "E6", "Max offer (walk-away)", fb); put(bu, "F6", "=J13", fb, USD, fill_g)
put(bu, "E7", "Opening offer", fb); put(bu, "F7", "=K13", fb, USD, fill_g)
put(bu, "E8", "Uses that work at asking", fb)
put(bu, "F8", f'=COUNTIF({ER["verdict"]},"Strong")+COUNTIF({ER["verdict"]},"Works at asking")', fb, NUM, fill_g)
put(bu, "E9", "Uses that work for this org", fb)
put(bu, "F9", f'=SUMPRODUCT(({ER["verdict"]}="Strong")+({ER["verdict"]}="Works at asking"),{ER["mine"]})', fb, NUM, fill_g)
bcols = [("B", "use", None, "Use"), ("C", "engine", None, "Engine"), ("D", "mine", NUM, "Org builds"), ("E", "verdict", None, "Verdict"),
         ("F", "capacity", NUM, "Capacity"), ("G", "unit", None, "Unit"), ("H", "bestexit", None, "Best exit"),
         ("I", "months", NUM, "Months"), ("J", "best", USD, "Max offer"), ("K", "open", USD, "Opening offer"),
         ("L", "spread", USD, "Max - asking"), ("M", "peracre", USD, "Max / gross ac"), ("N", "perunit", USD, "Max / unit"),
         ("O", "conf", None, "Confidence"), ("P", "binding", None, "Binding constraint"), ("Q", "flags", None, "Flags"),
         ("R", "verify", None, "Verify before relying")]
hdr(bu, 12, ["Rank"] + [h for *_, h in bcols], 1, height=32)
for j in range(N):
    r = 13 + j
    put(bu, f"A{r}", j + 1, fn, NUM)
    put(bu, f"S{r}", f"=MATCH(LARGE({ER['rankkey']},A{r}),{ER['rankkey']},0)", fn, NUM)
    for colL, k, fmt, _ in bcols:
        c = put(bu, f"{colL}{r}", f"=INDEX({ER[k]},$S{r})", fb if k in ("use", "best") else fn, fmt)
        if k == "best": c.fill = fill_g
put(bu, "S12", "row", fs)
widths(bu, {"A": 6, "B": 42, "C": 13, "D": 8, "E": 15, "F": 11, "G": 12, "H": 20, "I": 8, "J": 14, "K": 14, "L": 14,
            "M": 13, "N": 12, "O": 16, "P": 24, "Q": 60, "R": 50, "S": 5})
bu.freeze_panes = "C13"
put(bu, f"B{14 + N}", "Read with care: every number is a placeholder until replaced by market data or the org's own records. "
                      "Low confidence = the use has written location rules Landova does not test yet.", fs)

# ============================================================ Prefilled proforma (one use, one exit)
pf_ = wb.create_sheet("Proforma", 1)
title(pf_, "Prefilled Proforma - one use on this parcel",
      "Pick a use (defaults to the top-ranked one). Every line is prefilled from the engine and shows where its number came from. Emits the Canonical Proforma Schema.")
put(pf_, "B4", "Use", fb); put(pf_, "C4", "=Best_Use!B13", fin, None, fill_in); dv(pf_, "C4", f"={USE_RNG}")
put(pf_, "B5", "Exit", fb); put(pf_, "C5", "Best", fin, None, fill_in); dv(pf_, "C5", f"={LK['exit']}")
put(pf_, "B6", "Land price for cash flow (blank = opening offer)", fb); put(pf_, "C6", None, fin, USD, fill_in)
put(pf_, "B7", "Engine row", fs); put(pf_, "C7", f"=MATCH(C4,{ER['use']},0)", fn, NUM)
ROWI = "$C$7"
def EV(k): return f"INDEX({ER[k]},{ROWI})"
put(pf_, "B8", "Exit used", fs)
put(pf_, "C8", f'=IF(C5="Best",MAX(1,{EV("bestx")}),MATCH(C5,{{"Land / pad sale","Build & sell","Build & hold / lease"}},0))', fn, NUM)
XI = "$C$8"
put(pf_, "B9", "Land price used", fs); put(pf_, "C9", f'=IF(C6="",{EV("open")},C6)', fb, USD)
LPc = "$C$9"
put(pf_, "E4", "Verdict", fb); put(pf_, "F4", f"={EV('verdict')}", fb, None, fill_g)
put(pf_, "E5", "Max offer (walk-away)", fb); put(pf_, "F5", f"={EV('best')}", fb, USD, fill_g)
put(pf_, "E6", "Opening offer", fb); put(pf_, "F6", f"={EV('open')}", fb, USD, fill_g)
put(pf_, "E7", "Best exit", fb); put(pf_, "F7", f"={EV('bestexit')}", fb, None, fill_g)
put(pf_, "E8", "Confidence", fb); put(pf_, "F8", f"={EV('conf')}", fb, None, fill_g)
put(pf_, "E9", "Flags", fb); put(pf_, "F9", f"={EV('flags')}", fs)

r = 11
put(pf_, f"B{r}", "Inputs used and where they came from", fsec); r += 1
hdr(pf_, r, ["Input", "Value", "Source", "Canonical field"], 2); r += 1
for k in LF:
    put(pf_, f"B{r}", dict(COLS)[k])
    put(pf_, f"C{r}", f"=INDEX(Use_Effective!${V[k]}${FIRST}:${V[k]}${LAST},{ROWI})", fn, ul[f"{UC[k]}{FIRST}"].number_format)
    put(pf_, f"D{r}", f"=INDEX(Use_Effective!${VS[k]}${FIRST}:${VS[k]}${LAST},{ROWI})", fs)
    put(pf_, f"E{r}", k, fs); r += 1
put(pf_, f"B{r}", "Location data level (cost index)"); put(pf_, f"C{r}", f"={Rz['cost_idx']}", fn, "0.00"); put(pf_, f"D{r}", "=Location!D9", fs); r += 2

put(pf_, f"B{r}", "Site & yield", fsec); r += 1
for k in ("zstat", "binding", "usable_all", "used_ac", "dev_ac", "excess_ac", "capacity", "unit", "devmo_e", "sell1", "sell2", "lu"):
    h = dict((a, b) for a, b, *_ in ENG)[k]
    fmt = dict((a, d) for a, b, c_, d, *_ in ENG)[k]
    put(pf_, f"B{r}", h); put(pf_, f"C{r}", f"={EV(k)}", fb if k == "capacity" else fn, fmt); r += 1
r += 1
put(pf_, f"B{r}", "Development budget", fsec); put(pf_, f"C{r}", "Full build budget. A lot / pad sale (exit 1) excludes paving, septic systems and wells - the buyer builds them.", fs); r += 1
hdr(pf_, r, ["Line", "Quantity", "Unit cost", "Total", "Canonical field"], 2); r += 1
BUD = [("02-100 Survey", None, "c_survey"), ("02-110 Platting", "plats", "c_plat"), ("02-200 Civil engineering", "grade_ac", "c_civil"),
       ("02-300 Geotech", None, "c_geo"), ("02-310 Septic evaluations", "septics", "c_septev"), ("02-320 State wastewater permit", None, "c_wwperm"),
       ("02-400 Phase I", None, "c_p1"), ("02-500 Drainage study", None, "c_drain"), ("Entitlement", None, "c_ent"),
       ("Rezoning", None, "c_rezone"), ("02-700 Legal & title", None, "c_legal"), ("03-100 Clearing (ac)", "clear_ac", "c_clear"),
       ("03-200 Grading (ac)", "grade_ac", "c_grade"), ("03-300 Roads (LF)", "road_lf", "c_road"), ("03-350 Paving (SF)", "pave_sf", "c_pave"),
       ("03-400 Detention (ac)", "det_ac", "c_det"), ("03-500 SWPPP (ac)", "grade_ac", "c_swppp"), ("03-600 Driveway / turn lane", None, "c_drive"),
       ("04-100 Water line (LF)", "water_lf", "c_wline"), ("04-110 Water taps", "wtaps", "c_wtap"), ("04-200 Sewer line (LF)", "sewer_lf", "c_sline"),
       ("04-210 Sewer taps", "staps", "c_stap"), ("04-300 Septic systems", "septics", "c_septic"), ("04-310 Wells", "wells", "c_well"),
       ("04-320/330 Public water system", None, "c_pws"), ("04-400 Electric (LF)", "road_lf", "c_elec"),
       ("Horizontal contingency", None, "h_cont"), ("Org estimating bias (learned)", None, "h_bias"), ("HORIZONTAL TOTAL", None, "H"),
       ("Vertical hard cost", "capacity", "vert"), ("Vertical soft + contingency", None, "vsc"), ("TI + leasing commissions", "capacity", "tilc"),
       ("Impact fees", "capacity", "impact")]
for lab, qk, ck in BUD:
    put(pf_, f"B{r}", lab, fb if ck == "H" else fn)
    q = f"{EV(qk)}" if qk else f"IF({EV(ck)}<>0,1,0)"
    put(pf_, f"C{r}", f"={q}", fn, NUM1)
    put(pf_, f"D{r}", f"=IF(C{r}=0,0,E{r}/C{r})", fn, USD)
    put(pf_, f"E{r}", f"={EV(ck)}", fb if ck == "H" else fn, USD)
    code = lab.split(" ")[0]
    put(pf_, f"F{r}", f"cost_{code}" if re.match(r"\d\d-\d\d\d", code) else ck, fs); r += 1
r += 1
put(pf_, f"B{r}", "Operating statement (Income uses, stabilized)", fsec); r += 1
for k in ("gpr", "egi", "opex", "ptax", "mgmtx", "recov", "noi", "capr", "value", "yoc", "ploan", "dscr", "cashout"):
    h = dict((a, b) for a, b, *_ in ENG)[k]; fmt = dict((a, d) for a, b, c_, d, *_ in ENG)[k]
    put(pf_, f"B{r}", h); put(pf_, f"C{r}", f"={EV(k)}", fb if k == "noi" else fn, fmt); r += 1
r += 1
put(pf_, f"B{r}", "Exits", fsec); r += 1
hdr(pf_, r, ["Line", "Land / pad sale", "Build & sell", "Build & hold / lease"], 2); r += 1
for lab, ks, fmt in [("Allowed for this use", ("ex1", "ex2", "ex3"), None), ("Net revenue / value", ("rev1", "rev2", "rev3"), USD),
                     ("Total cost at asking price", ("cost1", "cost2", "cost3"), USD), ("Profit / value created at asking", ("profit1", "profit2", "profit3"), USD),
                     ("Months to exit", ("T1", "T2", "T3"), NUM1), ("Required margin", ("mg1", "mg2", "mg3"), PCT),
                     ("Cost per $1 of land", ("k1", "k2", "k3"), NUM3), ("MAX OFFER", ("max1", "max2", "max3"), USD)]:
    put(pf_, f"B{r}", lab, fb if lab == "MAX OFFER" else fn)
    for colL, k in zip("CDE", ks):
        if k.startswith("ex"):
            put(pf_, f"{colL}{r}", f'=IF(INDEX(Use_Library!${UC[k]}${FIRST}:${UC[k]}${LAST},{ROWI})=1,"Yes","No")')
        else:
            c = put(pf_, f"{colL}{r}", f"={EV(k)}", fb if lab == "MAX OFFER" else fn, fmt)
            if lab == "MAX OFFER": c.fill = fill_g
    r += 1
r += 1

# ---- Monthly cash flow for the chosen exit
put(pf_, f"B{r}", "Monthly cash flow (chosen exit, land at the price above)", fsec); r += 1
CF = {}
cfin = [
    ("D", "Development months", f"=MAX(1,ROUND({EV('devmo_e')},0))", NUM),
    ("S", "Sell-out / lease-up months", f"=ROUND(CHOOSE({XI},{EV('sell1')},IF({EV('engine')}=\"Income\",{EV('lu')},{EV('sell2')}),IF({EV('engine')}=\"Income\",{EV('lu')},0)),0)", NUM),
    ("carrymo", "Months of land carry", f"=ROUND(CHOOSE({XI},{EV('devmo_e')}+{EV('sell1')}/2,{EV('devmo_e')}+{EV('sell2')}/2,{EV('devmo_e')}),0)", NUM),
    ("nonland", "Development cost (non-land)", f"=CHOOSE({XI},{EV('nl1')},{EV('nl2')},{EV('nl3')})", USD),
    ("rev", "Exit revenue / value (net)", f"=CHOOSE({XI},{EV('rev1')},{EV('rev2')},{EV('rev3')})", USD),
    ("noi", "Stabilized NOI (ramps during lease-up)", f'=IF(AND({EV("engine")}="Income",{XI}>=2),{EV("noi")},0)', USD),
    ("spread", "Revenue spread over sell-out (1) or lump at end (0)", f'=IF(OR({XI}=1,AND({XI}=2,{EV("engine")}="For-Sale")),1,0)', NUM),
]
for k, lab, f, fmt in cfin:
    put(pf_, f"B{r}", lab); put(pf_, f"C{r}", f, fn, fmt); CF[k] = f"$C${r}"; r += 1
put(pf_, f"B{r}", "Land closing + conversion factor"); put(pf_, f"C{r}", f'=1+{Rz["closing"]}+IF({P["agex"]}="Y",{Rz["rollback"]},0)', fn, NUM3); CF["lf"] = f"$C${r}"; r += 2
MET = r; r += 9
CFH = r; NM = 120
put(pf_, f"B{CFH}", "Month", fb)
for m in range(NM + 1):
    put(pf_, f"{L(3 + m)}{CFH}", m, fb, NUM)
lines = ["Land", "Land carry", "Development cost", "Revenue / NOI", "Unlevered cash flow", "Loan draw", "Loan repayment",
         "Loan points", "Loan balance (end of month)", "Levered cash flow", "Cumulative levered cash flow"]
LR = {lab: CFH + 1 + i for i, lab in enumerate(lines)}
for lab, rr in LR.items(): put(pf_, f"B{rr}", lab, fb if "cash flow" in lab else fn)
for m in range(NM + 1):
    c = L(3 + m); mm = f"{c}${CFH}"; pcol = L(2 + m)
    f_land = f"=IF({mm}=0,-{LPc}*{CF['lf']},0)"
    f_carry = f"=IF(AND({mm}>=1,{mm}<={CF['carrymo']}),-{LPc}*{Rz['carry']}/12,0)"
    f_dev = f"=IF(AND({mm}>=1,{mm}<={CF['D']}),-{CF['nonland']}/{CF['D']},0)"
    f_rev = (f"=IF({CF['spread']}=1,IF({CF['S']}=0,IF({mm}={CF['D']},{CF['rev']},0),IF(AND({mm}>{CF['D']},{mm}<={CF['D']}+{CF['S']}),{CF['rev']}/{CF['S']},0)),"
             f"IF({mm}={CF['D']}+{CF['S']},{CF['rev']},0)+IF(AND({CF['S']}>0,{mm}>{CF['D']},{mm}<={CF['D']}+{CF['S']}),{CF['noi']}/12*({mm}-{CF['D']})/{CF['S']},0))")
    put(pf_, f"{c}{LR['Land']}", f_land, fn, NUM)
    put(pf_, f"{c}{LR['Land carry']}", f_carry, fn, NUM)
    put(pf_, f"{c}{LR['Development cost']}", f_dev, fn, NUM)
    put(pf_, f"{c}{LR['Revenue / NOI']}", f_rev, fn, NUM)
    put(pf_, f"{c}{LR['Unlevered cash flow']}", f"=SUM({c}{LR['Land']}:{c}{LR['Revenue / NOI']})", fb, NUM)
    put(pf_, f"{c}{LR['Loan draw']}", f"=-({c}{LR['Land']}+{c}{LR['Land carry']}+{c}{LR['Development cost']})*{A['ltc']}", fn, NUM)
    prevbal = "0" if m == 0 else f"{pcol}{LR['Loan balance (end of month)']}"
    owed = f"({prevbal}*(1+{A['rate']}/12)+{c}{LR['Loan draw']})"
    put(pf_, f"{c}{LR['Loan repayment']}", f"=-MIN({owed},MAX(0,{c}{LR['Revenue / NOI']}))", fn, NUM)
    put(pf_, f"{c}{LR['Loan points']}", f"=IF({mm}=0,-{A['pts']}*{A['ltc']}*({LPc}*{CF['lf']}+{CF['nonland']}),0)", fn, NUM)
    put(pf_, f"{c}{LR['Loan balance (end of month)']}", f"={owed}+{c}{LR['Loan repayment']}", fn, NUM)
    put(pf_, f"{c}{LR['Levered cash flow']}", f"={c}{LR['Unlevered cash flow']}+{c}{LR['Loan draw']}+{c}{LR['Loan repayment']}+{c}{LR['Loan points']}", fb, NUM)
    put(pf_, f"{c}{LR['Cumulative levered cash flow']}", f"={c}{LR['Levered cash flow']}" + ("" if m == 0 else f"+{pcol}{LR['Cumulative levered cash flow']}"), fn, NUM)
c0, c1 = L(3), L(3 + NM)
U_ = f"{c0}{LR['Unlevered cash flow']}:{c1}{LR['Unlevered cash flow']}"
Lv = f"{c0}{LR['Levered cash flow']}:{c1}{LR['Levered cash flow']}"
mets = [("Unlevered profit", f"=SUM({U_})", USD), ("Unlevered IRR (annual)", f"=IFERROR((1+IRR({U_},0.01))^12-1,\"n/a\")", PCT),
        ("Unlevered equity multiple", f'=IFERROR(SUMIF({U_},">0")/-SUMIF({U_},"<0"),0)', MULT),
        ("Levered profit", f"=SUM({Lv})", USD), ("Levered IRR (annual)", f"=IFERROR((1+IRR({Lv},0.01))^12-1,\"n/a\")", PCT),
        ("Peak equity", f"=-MIN(0,MIN({c0}{LR['Cumulative levered cash flow']}:{c1}{LR['Cumulative levered cash flow']}))", USD),
        ("Loan balance left at month 120 (should be 0)", f"={c1}{LR['Loan balance (end of month)']}", USD),
        ("Timeline beyond 120 months?", f'=IF({CF["D"]}+{CF["S"]}>{NM},"Yes - extend the schedule","No")', None)]
put(pf_, f"B{MET}", "Returns", fsec)
for i, (lab, f, fmt) in enumerate(mets):
    put(pf_, f"B{MET + 1 + i}", lab, fb); c = put(pf_, f"C{MET + 1 + i}", f, fb, fmt); c.fill = fill_g
pf_.column_dimensions["A"].width = 2; pf_.column_dimensions["B"].width = 50
for k in "CDE": pf_.column_dimensions[k].width = 18
pf_.column_dimensions["F"].width = 22
for m in range(3, NM + 1): pf_.column_dimensions[L(3 + m)].width = 11
pf_.freeze_panes = "C1"

# ============================================================ Deal history (learning)
dh = wb.create_sheet("Deal_History")
title(dh, "Deal History - upload template", "Past deals with projected AND actual numbers, including deals passed on. Drives estimating-bias correction and use-level learning. Example row.")
hcols = [("Org", "Text"), ("Deal_ID", "Text"), ("Date_Underwritten", "YYYY-MM-DD"), ("Region_Key", "ST|County"), ("Use", "From Use_Library"),
         ("Gross_Acres", "ac"), ("Capacity", "#"), ("Land_Price", "$"), ("Decision", "Bought / Passed / Lost"),
         ("Reason_if_Passed", "Text"), ("Horizontal_Projected", "$"), ("Horizontal_Actual", "$"), ("Vertical_Projected", "$"),
         ("Vertical_Actual", "$"), ("Revenue_or_Value_Projected", "$"), ("Revenue_or_Value_Actual", "$"),
         ("NOI_Projected", "$"), ("NOI_Actual", "$"), ("Months_Projected", "#"), ("Months_Actual", "#"),
         ("Data_Quality", "Actual / Bid / Estimate"), ("Notes", "Text"), ("Cost_Variance_%", "calc"), ("Revenue_Variance_%", "calc")]
hdr(dh, 4, [c for c, _ in hcols], 1, height=32)
for i, (_, t) in enumerate(hcols): put(dh, f"{L(i + 1)}5", t, fs)
examples = [
    ["Ridge Stone Homes", "EX-001", "2025-03-14", "TX|Grayson", "Manufactured home subdivision", 12, 7, 140000, "Bought", "", 177000, 188500,
     815500, 830000, 1715000, 1690000, None, None, 14, 19, "Actual", "Example row"],
    ["Ridge Stone Homes", "EX-002", "2025-08-02", "TX|Fannin", "Frontage split lots (no new road)", 22, 4, 210000, "Bought", "", 30000, 34500,
     None, None, 340000, 355000, None, None, 9, 11, "Actual", "Example row"],
    ["Ridge Stone Homes", "EX-003", "2026-01-20", "TX|Cooke", "Workforce / extended-stay RV park", 15, 0, 450000, "Passed",
     "Septic limited sites; no employer within 15 mi", None, None, None, None, None, None, None, None, None, None, "Estimate", "Passes teach the model too"],
]
for j, ex in enumerate(examples):
    for i, v in enumerate(ex):
        c = dh.cell(row=6 + j, column=i + 1, value=v); c.font = fin
        if isinstance(v, int) and v > 1000: c.number_format = USD
HI = {c: L(i + 1) for i, (c, _) in enumerate(hcols)}
DHL = 305
for r in range(6, DHL + 1):
    put(dh, f"{HI['Cost_Variance_%']}{r}", f'=IF(OR({HI["Horizontal_Actual"]}{r}="",{HI["Horizontal_Projected"]}{r}=""),"",({HI["Horizontal_Actual"]}{r}+N({HI["Vertical_Actual"]}{r}))/({HI["Horizontal_Projected"]}{r}+N({HI["Vertical_Projected"]}{r}))-1)', fn, PCT)
    put(dh, f"{HI['Revenue_Variance_%']}{r}", f'=IF(OR({HI["Revenue_or_Value_Actual"]}{r}="",N({HI["Revenue_or_Value_Projected"]}{r})=0),"",{HI["Revenue_or_Value_Actual"]}{r}/{HI["Revenue_or_Value_Projected"]}{r}-1)', fn, PCT)
for i in range(len(hcols)): dh.column_dimensions[L(i + 1)].width = 16
dh.column_dimensions["E"].width = 34
dv(dh, f"E6:E{DHL}", f"={USE_RNG}"); dv(dh, f"{HI['Decision']}6:{HI['Decision']}{DHL}", f"={LK['decision']}")
dv(dh, f"{HI['Data_Quality']}6:{HI['Data_Quality']}{DHL}", f"={LK['qual']}")
dh.freeze_panes = "C6"
# Org bias formulas
orgc = f"Deal_History!$A$6:$A${DHL}"; varc = f"Deal_History!${HI['Cost_Variance_%']}$6:${HI['Cost_Variance_%']}${DHL}"
put(op, "C15", f'=COUNTIFS({orgc},{O["org"]},{varc},">-10")', fn, NUM)
put(op, "C16", f'=IF(C15=0,0,SUMIFS({varc},{orgc},{O["org"]})/C15)', fn, PCT)
put(op, "C17", f'=IF(C18="Y",SUMIFS({varc},{orgc},{O["org"]})/(C15+{A["shrink_k"]}),0)', fb, PCT)

# ============================================================ Canonical schema + import mapping
cs = wb.create_sheet("Canonical_Schema")
title(cs, "Canonical Proforma Schema", "Every upload maps INTO these fields; every prefilled proforma is emitted in them. Synonyms seed the AI mapper.")
hdr(cs, 4, ["Field ID", "Group", "Label", "Unit", "Lands in", "Seed synonyms"], 1)
for i, (fid, grp, lab, unit, tgt, syn) in enumerate(CANON):
    for j, v in enumerate((fid, grp, lab, unit, tgt, ", ".join(syn))):
        cs.cell(row=5 + i, column=j + 1, value=v).font = fb if j == 0 else (fs if j == 5 else fn)
widths(cs, {"A": 16, "B": 18, "C": 44, "D": 18, "E": 18, "F": 80})
cs.freeze_panes = "B5"

im = wb.create_sheet("Import_Mapping")
title(im, "Import Mapping - how an uploaded spreadsheet lands in the schema",
      "Illustrative. The AI proposes each mapping with a confidence score; >= 0.90 auto-accepts, 0.50-0.90 asks the user, < 0.50 the user maps it. Confirmed mappings are remembered per org.")
hdr(im, 4, ["Uploaded file / tab", "Raw label", "Raw value", "Maps to (canonical)", "Normalization", "Normalized value", "Confidence", "Status", "Reason"], 1)
for i, row_ in enumerate([
    ("Sadler.xlsx / Budget", "Dirt work", 62000, "cost_03-200", "Lump sum / 12.4 disturbed ac; / Grayson index 1.00", 5000, 0.86, "Confirmed", "Common synonym"),
    ("Sadler.xlsx / Budget", "Septics x7", 77000, "cost_04-300", "/ 7 systems", 11000, 0.95, "Auto-accepted", "Quantity in label"),
    ("Sadler.xlsx / Budget", "Misc / other", 15000, "(unmapped)", "", None, 0.22, "Needs review", "Too vague"),
    ("Flex_deal.xlsx / Proforma", "Base rent PSF", 14.5, "rent", "Already per SF per year; / rent index 1.00", 14.5, 0.93, "Auto-accepted", "Unit matches"),
    ("Flex_deal.xlsx / Proforma", "CAM reimbursements", 98000, "recov", "/ (opex + tax)", 0.95, 0.71, "Needs review", "Derived ratio"),
    ("MHC_buy.xlsx / Rent roll", "Lot rent", 525, "rent", "x 12 (monthly -> annual)", 6300, 0.90, "Auto-accepted", "Monthly -> annual"),
    ("Collin_lots.xlsx / Sales", "Avg closed price", 515000, "saleprice", "Collin is LOCAL market data -> Market_Data, not indexed", 515000, 0.92, "Auto-accepted", "Sales comp"),
]):
    for j, v in enumerate(row_):
        c = im.cell(row=5 + i, column=j + 1, value=v); c.font = fn
        if j == 6: c.number_format = PCT
widths(im, {"A": 28, "B": 22, "C": 12, "D": 20, "E": 50, "F": 14, "G": 11, "H": 15, "I": 20})

# ============================================================ ReadMe
rm = wb.create_sheet("ReadMe", 0)
title(rm, "Landova Proforma v3", "Any U.S. parcel x every use x the active org. Parcel facts + location + use defaults + learned data -> what fits -> cost -> three exits -> max offer -> prefilled proforma.")
lines = [
    ("Start here", None),
    ("1. Parcel", "Enter the parcel's facts: state, county, city, zoning, access, utilities, asking price, location data."),
    ("2. Best_Use", "Is this land good, for what, and what can we pay? Every use ranked by max offer with a verdict. Switch to 'My uses' on Org_Profile."),
    ("3. Proforma", "The prefilled proforma for any use: inputs with their source, budget, operating statement, exits, monthly cash flow and IRR."),
    ("", None),
    ("What changed in v3", None),
    ("Any location", "Regions holds National > State > County > City values. Location shows which level each value came from. Costs AND revenues are localized."),
    ("Learning", "Org_Overrides and Cost_Records hold the org's own numbers from uploads and actuals. They pull values toward the org's experience as records accumulate (shrinkage)."),
    ("Market data", "Market_Data holds local comps and pooled benchmarks (pooled only counts with enough records and orgs)."),
    ("Gates", "Zoning (by right / rezone / prohibited / deed-restricted), legal access, frontage, sewer, water, location tests, size."),
    ("Realism", "Demand caps, absorption-driven timelines, margin that rises with time, per-use site disturbance, gal/day septic limits, public-water-system threshold, permits."),
    ("New uses", "Frontage split lots, ranchette subdivision, MHC with park-owned homes, leisure RV/campground, STR tiny-home resort, dollar store, car wash, sit-down restaurant, church, cell tower."),
    ("", None),
    ("How it is built", None),
    ("Four engines", "For-Sale · Income (NOI / cap) · Operator Pad (sell or ground-lease a pad) · Land Play (leases, entitle-and-sell)."),
    ("Three exits", "1) Land / pad sale  2) Build & sell  3) Build & hold / lease. Use_Library says which are allowed."),
    ("Max offer", "Solves for the land price that leaves exactly the required margin, including costs that rise with land price (closing, conversion penalty, carry, financing, property tax)."),
    ("Engine", "One row per use, one column per step. This tab is the spec Ryan codes from."),
    ("", None),
    ("Color code", None),
    ("Blue on yellow", "Input - edit"),
    ("Black", "Formula - don't edit"),
    ("Green", "Link to another tab"),
    ("", None),
    ("Before using on a live deal", None),
    ("Placeholders", "Every cost, price, rent, cap rate, index, tax rate and rule is a placeholder. Replace with sourced data, comps, bids and actuals."),
    ("Low confidence", "Uses whose written location rules are not machine-tested are marked 'Low - verify location' and show the rule to check."),
]
r = 4
for a, b in lines:
    if b is None and a: put(rm, f"A{r}", a, fsec)
    elif a or b:
        put(rm, f"A{r}", a, fb); c = put(rm, f"B{r}", b); c.alignment = Alignment(wrap_text=True, vertical="top")
        if a == "Blue on yellow": rm[f"A{r}"].font = fin; rm[f"A{r}"].fill = fill_in
        if a == "Green": rm[f"A{r}"].font = flink
    r += 1
widths(rm, {"A": 26, "B": 130})

for ws in wb.worksheets: ws.sheet_view.showGridLines = False
order = ["ReadMe", "Parcel", "Best_Use", "Proforma", "Org_Profile", "Location", "Use_Library", "Use_Effective", "Engine",
         "Assumptions", "Cost_Library", "Cost_Records", "Regions", "Market_Data", "Org_Overrides", "Deal_History",
         "Canonical_Schema", "Import_Mapping", "Lookups"]
wb._sheets = [wb[n] for n in order]
out = os.path.join(HERE, "Landova_Proforma_v3.xlsx")
wb.save(out)
meta = {"EC": EC, "EFIRST": EFIRST, "N": N, "ENG": [(k, h, grp) for k, h, f, fmt, grp in ENG],
        "P": P, "OPFIRST": OPFIRST, "FIRST": FIRST}
json.dump(meta, open(os.path.join(HERE, "engine_meta.json"), "w"), indent=1)
print("uses", N, "engine cols", len(ENG), "rows", EFIRST, ELAST, "->", out)
