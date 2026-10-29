"""Landova Canonical Proforma Schema (CPS).

One schema for both directions:
  * IMPORT - every uploaded proforma, budget, rent roll or deal history is mapped onto these fields
    (the AI proposes the mapping with a confidence score; the user confirms; confirmed mappings are
    remembered per org).
  * EXPORT - every prefilled proforma Landova generates for a parcel x use is emitted in these fields,
    so a generated proforma can be edited, saved, re-imported and compared to actuals line for line.

Each field: (id, group, label, unit, target, synonyms)
  target = where the value lands: "cost:<code>" (cost record), "use:<field>" (use-level record),
           "deal:<field>" (deal header), "assume:<key>" (org assumption), "result:<field>" (outcome,
           used for variance learning only).
Synonyms seed the mapper; the org's confirmed mappings are added to them over time.
"""

# Cost library: code, item, unit (quantity basis), low, base, high (reference basis, index 1.0)
COST_LIB = [
    ("02-100", "Boundary & topo survey", "LS", 4000, 6500, 10000),
    ("02-110", "Platting / lot surveys", "per lot", 600, 900, 1400),
    ("02-200", "Civil engineering", "per disturbed ac", 3000, 5000, 8000),
    ("02-300", "Geotechnical report", "LS", 3000, 5000, 9000),
    ("02-310", "Septic site evaluations", "per system", 350, 500, 800),
    ("02-320", "Large wastewater permit (state)", "LS", 15000, 30000, 60000),
    ("02-400", "Phase I environmental", "LS", 2000, 2800, 4000),
    ("02-500", "Drainage study", "LS", 4000, 7500, 15000),
    ("02-700", "Legal, title & entity", "LS", 5000, 10000, 20000),
    ("03-100", "Clearing & grubbing", "per ac", 2500, 4000, 6500),
    ("03-200", "Mass grading", "per ac", 3000, 5000, 8000),
    ("03-300", "Internal roads / drives", "per LF", 110, 150, 210),
    ("03-350", "Parking / paving / hardscape", "per SF", 4.5, 6, 8),
    ("03-400", "Detention pond", "per ac", 35000, 55000, 85000),
    ("03-500", "Erosion control / SWPPP", "per disturbed ac", 400, 700, 1100),
    ("03-600", "Driveway permit / turn lane", "LS", 15000, 40000, 120000),
    ("04-100", "Water line", "per LF", 35, 50, 75),
    ("04-110", "Water taps & meters", "per tap", 1500, 2500, 4000),
    ("04-200", "Sewer line", "per LF", 60, 85, 120),
    ("04-210", "Sewer taps / impact fees", "per tap", 1500, 3000, 5000),
    ("04-300", "On-site septic systems", "per system", 8000, 11000, 16000),
    ("04-310", "Private water wells", "per well", 9000, 13000, 20000),
    ("04-320", "Public water system (well, storage, treatment)", "LS", 150000, 250000, 400000),
    ("04-330", "Public water system distribution", "per connection", 1500, 2500, 4000),
    ("04-400", "Electric extension", "per LF", 15, 25, 40),
]

COST_SYNONYMS = {
    "02-100": ["survey", "boundary survey", "topo", "topographic survey", "alta"],
    "02-110": ["plat", "platting", "lot survey", "pins", "staking"],
    "02-200": ["engineering", "civil", "site engineering", "design fees", "civil plans"],
    "02-300": ["geotech", "soils report", "soil borings"],
    "02-310": ["perc test", "site evaluation", "soil evaluation", "septic design"],
    "02-320": ["tceq permit", "tlap", "discharge permit", "wastewater permit", "npdes"],
    "02-400": ["phase 1", "phase i", "esa", "environmental"],
    "02-500": ["drainage", "hydrology", "flood study", "drainage report"],
    "02-700": ["legal", "title", "attorney", "closing attorney", "entity"],
    "03-100": ["clearing", "tree removal", "grubbing", "brush clearing", "mulching"],
    "03-200": ["dirt work", "earthwork", "grading", "site grading", "excavation", "cut and fill", "pad prep"],
    "03-300": ["roads", "road construction", "streets", "drives", "asphalt road", "chip seal", "gravel road"],
    "03-350": ["paving", "parking lot", "concrete paving", "flatwork", "hardscape", "asphalt parking"],
    "03-400": ["detention", "retention pond", "pond", "stormwater pond"],
    "03-500": ["swppp", "erosion control", "silt fence", "stormwater permit"],
    "03-600": ["turn lane", "decel lane", "txdot", "driveway permit", "curb cut"],
    "04-100": ["water line", "water main", "waterline", "water extension"],
    "04-110": ["water tap", "meter", "water meter", "tap fee"],
    "04-200": ["sewer line", "sewer main", "sanitary sewer", "force main", "lift station"],
    "04-210": ["sewer tap", "impact fee", "capital recovery", "connection fee"],
    "04-300": ["septic", "septics", "ossf", "aerobic system", "septic system"],
    "04-310": ["well", "water well", "drilling"],
    "04-320": ["water system", "public water system", "storage tank", "pressure tank", "water plant"],
    "04-330": ["water distribution", "service lines", "water lines internal"],
    "04-400": ["electric", "power", "electrical", "three phase", "transformer", "utility extension"],
}

CANON = [
    # Deal header
    ("deal_id", "Deal", "Deal ID", "text", "deal:deal_id", []),
    ("org", "Deal", "Organization", "text", "deal:org", ["company", "developer"]),
    ("state", "Deal", "State", "ST", "deal:state", []),
    ("county", "Deal", "County", "text", "deal:county", []),
    ("city", "Deal", "City", "text", "deal:city", ["municipality"]),
    ("use", "Deal", "Use (from use library)", "text", "deal:use", ["product", "product type", "asset type", "project type"]),
    ("gross_acres", "Deal", "Gross acres", "ac", "deal:gross_acres", ["acres", "acreage", "site size", "total acres"]),
    ("net_acres", "Deal", "Net buildable acres", "ac", "deal:net_acres", ["net acres", "developable acres", "usable acres"]),
    ("capacity", "Deal", "Capacity (units / SF / acres)", "#", "deal:capacity",
     ["units", "lots", "pads", "sites", "doors", "stalls", "building sf", "gross sf", "rentable sf", "nrsf"]),
    ("land_price", "Deal", "Land price", "$", "deal:land_price", ["land", "land cost", "purchase price", "acquisition", "land acquisition"]),
    ("date", "Deal", "Date underwritten / as-of", "date", "deal:date", ["date", "as of"]),
    ("decision", "Deal", "Decision", "Bought/Passed/Lost", "deal:decision", []),
    ("reason_passed", "Deal", "Reason if passed", "text", "deal:reason_passed", []),
    ("data_quality", "Deal", "Data quality", "Actual/Bid/Estimate/Projection", "deal:data_quality", []),
    # Timeline
    ("devmo", "Timeline", "Development months", "months", "use:devmo", ["construction period", "build time", "development period"]),
    ("absorb", "Timeline", "Absorption per month", "units/mo", "use:absorb", ["absorption", "sales pace", "lease-up pace", "units per month"]),
    ("leaseup", "Timeline", "Lease-up months", "months", "use:leaseup", ["lease up", "stabilization period"]),
    # Build
    ("vert", "Build", "Vertical cost per unit", "$/unit", "use:vert",
     ["hard cost", "building cost", "construction cost", "home cost", "house cost", "vertical", "cost per sf", "cost per unit"]),
    ("tilc", "Build", "TI + leasing commissions per unit", "$/unit", "use:tilc", ["ti", "tenant improvements", "leasing commissions", "lc"]),
    ("entitle", "Build", "Entitlement & zoning", "$", "use:entitle", ["zoning", "entitlements", "rezoning", "permits", "permit fees"]),
    ("vsoft", "Build", "Vertical soft costs %", "%", "assume:vsoft", ["soft costs", "a&e", "architecture", "developer fee"]),
    ("hcont", "Build", "Horizontal contingency %", "%", "assume:hcont", ["contingency"]),
    # For-sale revenue
    ("lotprice", "Revenue - For-Sale", "Lot sale price per lot", "$/lot", "use:lotprice", ["lot price", "finished lot price", "lot sales"]),
    ("saleprice", "Revenue - For-Sale", "Home / unit sale price", "$/unit", "use:saleprice",
     ["sale price", "sales price", "home price", "avg sale price", "asp", "condo price"]),
    ("landac", "Revenue - Land", "Land / pad sale price per acre", "$/ac", "use:landac", ["pad price", "price per acre", "land sale"]),
    # Income revenue
    ("rent", "Revenue - Income", "Rent per unit per year", "$/unit/yr", "use:rent",
     ["rent", "lot rent", "pad rent", "site rent", "base rent", "rent psf", "market rent", "gpr", "adr"]),
    ("othinc", "Revenue - Income", "Other income % of rent", "%", "use:othinc", ["other income", "utility reimbursement", "fees", "rubs"]),
    ("vac", "Revenue - Income", "Stabilized vacancy", "%", "use:vac", ["vacancy", "economic vacancy", "credit loss", "1 - occupancy"]),
    ("opex", "Revenue - Income", "Opex per unit per year (excl. tax)", "$/unit/yr", "use:opex",
     ["operating expenses", "opex", "expenses", "r&m", "repairs", "insurance", "utilities", "payroll"]),
    ("mgmt", "Revenue - Income", "Management % of EGI", "%", "use:mgmt", ["management fee", "property management"]),
    ("recov", "Revenue - Income", "Expense recovery %", "%", "use:recov", ["cam", "cam reimbursements", "nnn", "recoveries"]),
    ("cap", "Revenue - Income", "Exit cap rate", "%", "use:cap", ["cap rate", "exit cap", "terminal cap", "going-in cap"]),
    ("groundrent", "Revenue - Land", "Ground lease rent per acre per year", "$/ac/yr", "use:groundrent", ["ground lease", "land lease", "lease rate per acre"]),
    # Financing
    ("ltc", "Financing", "Loan-to-cost", "%", "assume:ltc", ["ltc", "loan to cost", "leverage"]),
    ("rate", "Financing", "Construction loan rate", "%", "assume:rate", ["interest rate", "construction rate", "loan rate"]),
    ("pts", "Financing", "Loan points", "%", "assume:pts", ["points", "origination fee"]),
    # Outcomes (variance learning)
    ("h_total", "Results", "Horizontal total", "$", "result:h_total", ["site work total", "horizontal", "land development cost", "infrastructure"]),
    ("v_total", "Results", "Vertical total", "$", "result:v_total", ["vertical total", "building total", "hard cost total"]),
    ("revenue", "Results", "Revenue / value", "$", "result:revenue", ["total revenue", "gross sales", "stabilized value", "exit value"]),
    ("noi", "Results", "NOI", "$/yr", "result:noi", ["net operating income", "noi"]),
    ("months_actual", "Results", "Months to complete", "months", "result:months", ["duration"]),
]

for code, item, unit, *_ in COST_LIB:
    CANON.append((f"cost_{code}", "Horizontal budget", f"{code} {item}", unit, f"cost:{code}", COST_SYNONYMS.get(code, [])))

# Unit conversions the normalizer applies before storing a record (value x factor)
UNIT_RULES = [
    ("per month -> per year", "monthly rent, lot rent, ADR x nights", 12),
    ("per SF per month -> per SF per year", "", 12),
    ("lump sum -> per unit", "divide by the quantity basis of the cost code (lots, acres, LF, systems)", None),
    ("total opex -> per unit", "divide by capacity", None),
    ("% of revenue -> per unit", "multiply by revenue per unit", None),
]

# Mapping review thresholds
AUTO_ACCEPT = 0.90
NEEDS_CONFIRM = 0.50

# Source-quality weights for learning (actual beats bid beats estimate beats projection)
QUALITY_WEIGHT = {"Actual": 1.0, "Bid": 0.8, "Estimate": 0.5, "Projection": 0.3}
