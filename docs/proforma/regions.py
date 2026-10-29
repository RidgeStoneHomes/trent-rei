"""Landova location hierarchy: National -> State -> County -> City.

The engine resolves every location value for a parcel by looking for the most specific row that has the
value filled in: City (ST|County|City), then County (ST|County), then State (ST), then National (US).
A blank cell means "inherit from the level above". Every resolved value carries its source level so the
user can see when a generic number is driving an offer.

Indices are relative to the REFERENCE BASIS (index 1.0) that the use library is written in: the North
Texas exurban market (Grayson County). Every value here is a PLACEHOLDER chosen to show the mechanics and
the kind of variation that matters; replace with sourced data (cost indices, comps, tax rolls, state
rules) before any live deal. In the app this table lives in the database, keyed by FIPS codes.
"""

RCOLS = [
    ("key", "Key (US / ST / ST|County / ST|County|City)"), ("level", "Level"), ("name", "Name"),
    ("cost_idx", "Construction cost index"), ("price_idx", "Sale price index (homes, lots, pads)"),
    ("rent_idx", "Rent index"), ("cap_adj", "Cap rate adjustment (+ = higher cap)"),
    ("opex_idx", "Opex index (insurance, utilities, labor)"), ("raw_ac", "Raw land value $ / acre"),
    ("taxrate", "Property tax rate (all jurisdictions)"), ("assess", "Assessed value as % of total cost"),
    ("closing", "Buyer closing costs % of land"), ("transfer", "Seller transfer tax % of sale"),
    ("carry", "Land carry % of land / yr (tax + insurance)"),
    ("rollback", "Ag/open-space conversion penalty % of land price"),
    ("impact", "Impact / capital recovery fees $ per dwelling"),
    ("city_zoning", "Cities zone (Y/N)"), ("etj_zoning", "ETJ / extraterritorial zoning (Y/N)"),
    ("cnty_zoning", "Counties zone unincorporated land (Y/N)"),
    ("lot_w", "Min septic lot, public water (ac)"), ("lot_well", "Min septic lot, private well (ac)"),
    ("gpd_ac", "On-site septic capacity, gal/day per usable acre (good soil)"),
    ("permit_gpd", "Wastewater flow needing a state permit (gal/day)"), ("permit_mo", "State wastewater permit months"),
    ("pws_conn", "Connections that make a public water system"),
    ("rezone_cost", "Rezoning cost $"), ("rezone_mo", "Rezoning months"),
    ("src", "Source"), ("asof", "As of"), ("notes", "Notes"),
]
RKEYS = [k for k, _ in RCOLS]
RNUM = [k for k in RKEYS if k not in ("key", "level", "name", "city_zoning", "etj_zoning", "cnty_zoning", "src", "asof", "notes")]
RYN = ["city_zoning", "etj_zoning", "cnty_zoning"]

PH = "Placeholder"
R = []


def row(key, name, **kw):
    level = "National" if key == "US" else ("State" if "|" not in key else ("County" if key.count("|") == 1 else "City"))
    R.append(dict(key=key, level=level, name=name, src=kw.pop("src", PH), asof=kw.pop("asof", "2026-10"), **kw))


# ---- National defaults: every field filled so resolution always ends with a value
row("US", "United States (defaults)", cost_idx=1.0, price_idx=1.0, rent_idx=1.0, cap_adj=0.0, opex_idx=1.0,
    raw_ac=8000, taxrate=0.011, assess=1.0, closing=0.02, transfer=0.005, carry=0.015, rollback=0.0, impact=5000,
    city_zoning="Y", etj_zoning="N", cnty_zoning="Y", lot_w=0.5, lot_well=1.0, gpd_ac=1000, permit_gpd=5000,
    permit_mo=9, pws_conn=15, rezone_cost=40000, rezone_mo=6,
    notes="Public water system = 15 connections or 25 people (federal Safe Drinking Water Act definition)")

# ---- States (only what differs from national)
row("TX", "Texas", taxrate=0.020, assess=0.85, transfer=0.0, carry=0.025, rollback=0.06, impact=3000,
    cnty_zoning="N", etj_zoning="N",
    notes="No state transfer tax. Counties generally lack zoning power. TCEQ OSSF rules: 0.5 ac with public water, "
          "1 ac with private well; 5,000+ gpd needs a TCEQ permit. Ag rollback on conversion")
row("OK", "Oklahoma", taxrate=0.009, transfer=0.0015, cnty_zoning="N", notes="Many counties unzoned - verify by county")
row("FL", "Florida", price_idx=1.20, rent_idx=1.15, opex_idx=1.50, taxrate=0.0095, transfer=0.007, impact=9000,
    notes="Doc stamps on deeds; hurricane insurance drives opex; CDD special districts common")
row("AZ", "Arizona", price_idx=1.25, rent_idx=1.15, taxrate=0.006, transfer=0.0, gpd_ac=900,
    notes="Groundwater: assured water supply rules in active management areas can block subdivisions")
row("TN", "Tennessee", price_idx=1.10, rent_idx=1.05, taxrate=0.007, transfer=0.0037)
row("GA", "Georgia", price_idx=1.05, rent_idx=1.05, taxrate=0.009, transfer=0.001)
row("NC", "North Carolina", price_idx=1.10, rent_idx=1.05, taxrate=0.008, transfer=0.002)
row("CO", "Colorado", cost_idx=1.12, price_idx=1.45, rent_idx=1.25, taxrate=0.005, transfer=0.0001,
    notes="Metro districts finance infrastructure; frost depth adds foundation cost")
row("OH", "Ohio", cost_idx=1.03, price_idx=0.85, rent_idx=0.90, taxrate=0.015, transfer=0.004, lot_w=1.0, lot_well=1.0)
row("PA", "Pennsylvania", cost_idx=1.10, price_idx=0.95, rent_idx=0.95, taxrate=0.015, transfer=0.02)
row("CA", "California", cost_idx=1.35, price_idx=2.20, rent_idx=1.70, cap_adj=-0.005, opex_idx=1.30, taxrate=0.011,
    transfer=0.0011, impact=30000, rezone_mo=18, permit_mo=18,
    notes="Prop 13 reassesses at sale; CEQA review lengthens entitlement; Mello-Roos districts")

# ---- Texas counties (indices relative to Grayson = 1.0)
tx = [
    ("Grayson", dict(cost_idx=1.00, price_idx=1.00, rent_idx=1.00, raw_ac=12000)),
    ("Collin", dict(cost_idx=1.12, price_idx=1.55, rent_idx=1.30, cap_adj=-0.0035, raw_ac=60000, impact=8000)),
    ("Denton", dict(cost_idx=1.10, price_idx=1.40, rent_idx=1.25, cap_adj=-0.0025, raw_ac=45000, impact=7000)),
    ("Cooke", dict(cost_idx=0.97, price_idx=0.85, rent_idx=0.90, cap_adj=0.0025, raw_ac=9000)),
    ("Fannin", dict(cost_idx=0.96, price_idx=0.85, rent_idx=0.88, cap_adj=0.003, raw_ac=9000)),
    ("Dallas", dict(cost_idx=1.08, price_idx=1.40, rent_idx=1.30, cap_adj=-0.003, raw_ac=150000)),
    ("Tarrant", dict(cost_idx=1.05, price_idx=1.35, rent_idx=1.20, cap_adj=-0.002, raw_ac=80000)),
    ("Harris", dict(cost_idx=1.03, price_idx=1.15, rent_idx=1.15, opex_idx=1.15, raw_ac=70000,
                    notes="Flood: Atlas 14 detention rules; MUDs finance most suburban infrastructure")),
    ("Fort Bend", dict(cost_idx=1.03, price_idx=1.25, rent_idx=1.15, opex_idx=1.15, raw_ac=50000)),
    ("Montgomery", dict(cost_idx=1.00, price_idx=1.15, rent_idx=1.05, opex_idx=1.10, raw_ac=35000)),
    ("Galveston", dict(cost_idx=1.05, price_idx=1.10, rent_idx=1.05, opex_idx=1.40, cap_adj=0.005, raw_ac=40000,
                       notes="Coastal windstorm insurance (TWIA) and flood drive opex")),
    ("Travis", dict(cost_idx=1.12, price_idx=1.70, rent_idx=1.35, cap_adj=-0.003, raw_ac=120000)),
    ("Williamson", dict(cost_idx=1.08, price_idx=1.35, rent_idx=1.20, cap_adj=-0.002, raw_ac=60000)),
    ("Hays", dict(cost_idx=1.05, price_idx=1.30, rent_idx=1.15, raw_ac=40000, gpd_ac=700,
                  notes="Hill Country: rock excavation and aerobic septic common; Edwards Aquifer rules")),
    ("Comal", dict(cost_idx=1.03, price_idx=1.30, rent_idx=1.10, raw_ac=45000, gpd_ac=700,
                   notes="Edwards Aquifer recharge zone; rock")),
    ("Bexar", dict(cost_idx=0.98, price_idx=1.05, rent_idx=1.00, raw_ac=50000)),
    ("Midland", dict(cost_idx=1.10, price_idx=1.00, rent_idx=1.25, cap_adj=0.01, raw_ac=15000,
                     notes="Oil-cycle demand: workforce housing and RV parks swing with rig count")),
    ("Ector", dict(cost_idx=1.08, price_idx=0.90, rent_idx=1.20, cap_adj=0.01, raw_ac=12000)),
    ("Lubbock", dict(cost_idx=0.95, price_idx=0.95, rent_idx=0.95, raw_ac=10000)),
    ("El Paso", dict(cost_idx=0.94, price_idx=0.90, rent_idx=0.95, raw_ac=15000)),
    ("Nueces", dict(cost_idx=1.00, price_idx=0.95, rent_idx=1.00, opex_idx=1.35, cap_adj=0.005, raw_ac=20000)),
]
for c, kw in tx:
    row(f"TX|{c}", f"{c} County, TX", **kw)

# ---- City overrides (examples)
row("TX|Harris|Houston", "City of Houston", city_zoning="N", notes="No zoning; deed restrictions enforced by the city")
row("TX|Grayson|Sherman", "City of Sherman", impact=4000)

assert len({r["key"] for r in R}) == len(R)
assert all(R[0].get(k) not in (None, "") for k in RNUM + RYN), "National row must fill every field"
