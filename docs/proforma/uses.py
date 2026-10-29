"""Landova Use Library v3: every use the Landova app scores.

All values are stated at the REFERENCE BASIS (index 1.0), which is the North Texas exurban market the
placeholders were built from. The engine re-localizes them for any parcel in the U.S. through the
location indices in regions.py (cost, price, rent, opex, cap-rate adjustment), and replaces them with
market data or an org's own learned numbers where those exist (see Use_Effective in the workbook).

Every economic value is a PLACEHOLDER. Shared by the workbook builder and the engine's fixture
generator so both use identical inputs.
"""

COLS = [
    # Identity
    ("use", "Use"), ("cat", "Category"), ("engine", "Engine"), ("unit", "Capacity unit"),
    ("discrete", "Discrete units (Y/N)"), ("zclass", "Zoning class (see Lookups)"),
    # Sizing
    ("density", "Max density (units / net ac; 0 = n/a)"), ("sitesf", "Site SF per unit (0 = n/a)"),
    ("minlot", "Min lot size, gross ac per unit (0 = n/a)"), ("frontlf", "Road frontage LF per unit (0 = n/a)"),
    ("lotrule", "Subdivided lots: septic min-lot rule applies (Y/N)"),
    ("minac", "Min usable acres needed (0 = none)"), ("maxac", "Max usable acres market supports (0 = no cap)"),
    ("os", "Open space % of net"),
    # Demand and pace
    ("demhh", "Demand per household in trade area (capacity units / HH; 0 = no cap)"),
    ("radius", "Trade area (3 or 10 mi)"), ("capture", "Share of trade-area demand we capture"),
    ("absorb", "Absorption: units sold (For-Sale) or leased (Income) per month; 0 = use lease-up months"),
    ("lotabs", "Exit 1 sell-out pace: lots (For-Sale) or acres (other) per month; 0 = single sale"),
    # Utilities
    ("reqsewer", "Requires public sewer (Y/N)"), ("reqwater", "Requires public water (Y/N)"),
    ("taps", "Utility taps / connections per unit"), ("septic", "Septic systems per unit (if no sewer)"),
    ("wells", "Private wells per unit (if no public water and below public-water-system threshold)"),
    ("gpd", "Wastewater gallons per day per unit"),
    # Site work
    ("horiz", "Horizontal work by us (Y/N)"), ("disturb", "Share of developed acres cleared / graded"),
    ("detreq", "Detention required (Y/N)"), ("road", "Road / drive LF per unit"), ("pave", "Paving SF per unit"),
    ("entitle", "Entitlement & zoning $ (fixed, reference basis)"),
    # Build
    ("vert", "Vertical cost per unit"), ("tilc", "TI + leasing commissions per unit"), ("devmo", "Development months"),
    # For-sale revenue
    ("lotprice", "Lot sale price per unit (For-Sale)"), ("saleprice", "Finished sale price per unit (For-Sale)"),
    # Income revenue
    ("rent", "Rent per unit per year (Income)"), ("othinc", "Other income % of rent"),
    ("vac", "Stabilized vacancy (or 1 - occupancy for nightly uses)"), ("opex", "Opex per unit per year, excl. tax"),
    ("mgmt", "Management % of EGI"), ("recov", "Expense recovery % (NNN)"), ("leaseup", "Minimum lease-up months"),
    ("cap", "Exit / lease cap rate (reference basis)"),
    # Land revenue
    ("landac", "Land / pad sale price per acre (For-Sale: per gross lot acre, added to lot price)"),
    ("groundrent", "Ground / land lease rent per acre per year"),
    # Exits and hurdle
    ("margin", "Required margin (first 12 months)"), ("ex1", "Exit allowed: Land / pad sale (1/0)"),
    ("ex2", "Exit allowed: Build & sell (1/0)"), ("ex3", "Exit allowed: Build & hold / lease (1/0)"),
    # Location tests
    ("minfront", "Min road frontage LF"), ("frontgate", "Frontage minimum is a hard gate (Y/N)"),
    ("needroad", "Needs public road access (Y/N)"),
    ("minvpd", "Min traffic count on frontage (VPD; 0 = none)"), ("minhh", "Min households within 3 mi (0 = none)"),
    ("maxhwy", "Max miles to highway interchange (0 = none)"), ("corner", "Corner lot required (Y/N)"),
    ("maxsub", "Max miles to substation w/ capacity (0 = none)"),
    ("maxanchor", "Max miles to major employer / anchor (0 = none)"),
    # Text
    ("tested", "Location notes fully machine-tested (Y/N)"), ("loc", "Location requirements (land-search filters)"),
    ("notes", "Notes"),
]
KEYS = [k for k, _ in COLS]

# Fields the engine reads through Use_Effective (localized and learnable). "cost" fields resolve
# Org > Market > Default x index; "rev" fields resolve Market > Org > Default x index.
LEARNABLE = {
    "vert": ("cost", "cost"), "entitle": ("cost", "cost"), "tilc": ("cost", "cost"), "opex": ("cost", "opex"),
    "devmo": ("cost", None), "margin": ("cost", None),
    "lotprice": ("rev", "price"), "saleprice": ("rev", "price"), "landac": ("rev", "price"),
    "rent": ("rev", "rent"), "groundrent": ("rev", "rent"), "cap": ("rev", "capadj"),
    "vac": ("rev", None), "absorb": ("rev", None), "lotabs": ("rev", None),
}

ZCLASSES = [
    ("AG", "Agricultural / open"), ("RES-SF", "Single-family detached"), ("RES-ATT", "Attached / 2-4 units"),
    ("RES-MF", "Multifamily"), ("MH", "Manufactured / tiny homes"), ("RV", "RV park / campground"),
    ("LODG", "Lodging / short-term rental"), ("COM", "Commercial / retail"), ("OFF", "Office / medical"),
    ("IND", "Industrial / outdoor storage"), ("INST", "Institutional / care / school / church"),
    ("UTIL", "Utility / energy / telecom"),
]

BASE = dict(discrete="Y", zclass="", density=0, sitesf=0, minlot=0, frontlf=0, lotrule="N", minac=0, maxac=0,
            os=0.05, demhh=0, radius=3, capture=0, absorb=0, lotabs=0, reqsewer="N", reqwater="N", taps=0,
            septic=0, wells=0, gpd=0, horiz="Y", disturb=1.0, detreq="Y", road=0, pave=0, entitle=25000, vert=0,
            tilc=0, devmo=12, lotprice=0, saleprice=0, rent=0, othinc=0, vac=0, opex=0, mgmt=0, recov=0,
            leaseup=0, cap=0.07, landac=0, groundrent=0, margin=0.15, ex1=1, ex2=0, ex3=0, minfront=60,
            frontgate="N", needroad="Y", maxanchor=0, tested="N", loc="", notes="Placeholder values")

# Commercial building-SF defaults (capacity unit = building SF)
SF = dict(discrete="N", zclass="COM", taps=0.0001, septic=0.0001, wells=0.0001, gpd=0.1, road=0.006, os=0.08,
          entitle=40000, othinc=0, vac=0.07, mgmt=0.03, recov=0.95, leaseup=9, devmo=14, margin=0.15,
          ex1=1, ex2=1, ex3=1, minfront=150, reqwater="Y", lotabs=0.5)
# Acre-based defaults (yards, operator pads, land plays): capacity unit = usable acre
AC = dict(discrete="N", sitesf=43560, taps=0, septic=0, road=0, os=0.05, minfront=100)


def sfuse(use, cat, coverage, vert, rent, opex, recov, tilc, leaseup, cap, landac, maxac, pave, loc, **kw):
    d = dict(SF, use=use, cat=cat, engine="Income", unit="bldg SF", sitesf=round(1 / coverage, 3),
             vert=vert, rent=rent, opex=opex, recov=recov, tilc=tilc, leaseup=leaseup, cap=cap,
             landac=landac, maxac=maxac, pave=pave, loc=loc)
    d.update(kw)
    return d


def operator(use, cat, landac, groundrent, cap, maxac, loc, **kw):
    d = dict(AC, use=use, cat=cat, engine="Operator Pad", unit="acre", zclass="INST", landac=landac,
             groundrent=groundrent, cap=cap, maxac=maxac, loc=loc, entitle=40000, devmo=12,
             margin=0.20, ex1=1, ex2=0, ex3=1, lotabs=0,
             notes="Landova delivers a pad-ready site; operator builds and runs the business")
    d.update(kw)
    return d


U = []
add = lambda d: U.append({**BASE, **d})

# ---------------- Housing: for-sale
fs = dict(engine="For-Sale", zclass="RES-SF", lotrule="Y", taps=1, septic=1, wells=1, gpd=300, devmo=12,
          margin=0.15, ex1=1, ex2=1, ex3=0, minfront=60, absorb=3, lotabs=4)
add(dict(fs, use="Homesites (stick-built, for sale)", cat="Housing", unit="lot / home", density=4, road=50,
         vert=245000, lotprice=80000, saleprice=375000,
         loc="Within growth area; school district; < 30 min to job centers; no deed restriction on lot size"))
add(dict(fs, use="Finished / entitled lots", cat="Housing", unit="lot", density=4, road=50, lotprice=75000, ex2=0,
         loc="Builder demand in submarket; utilities within reach; platting allowed"))
add(dict(fs, use="Active-adult 55+ (for sale)", cat="Housing", unit="lot / home", density=5, road=45, vert=230000,
         lotprice=70000, saleprice=360000, absorb=2, lotabs=3,
         loc="Near healthcare, retail and lakes/golf; 60+ population growth"))
add(dict(fs, use="Entry-level for-sale homes", cat="Housing", unit="lot / home", density=5, road=45, vert=210000,
         lotprice=65000, saleprice=310000, absorb=4, lotabs=5,
         loc="Workforce demand (job growth); price-point gap vs. resale"))
add(dict(fs, use="Manufactured home subdivision", cat="Housing", unit="lot / home", zclass="MH", density=4, road=50,
         vert=116500, lotprice=55000, saleprice=245000, lotabs=3,
         loc="No deed restriction against MH; MH-friendly zoning or unzoned county",
         notes="Vertical = Ridge Stone dealer cost ~$94K + set-up/foundation/skirting + flatwork (user-stated home cost; rest placeholder)"))
add(dict(fs, use="Townhomes", cat="Housing", unit="unit", zclass="RES-ATT", density=10, road=25, lotrule="N",
         reqsewer="Y", reqwater="Y", septic=0, wells=0, vert=200000, lotprice=45000, saleprice=300000, absorb=4,
         lotabs=6, loc="City water/sewer; zoning allows attached SF; near retail"))
add(dict(fs, use="Ranchette subdivision (new internal road)", cat="Housing", unit="lot", minlot=5, road=150,
         lotprice=15000, landac=15000, ex2=0, entitle=15000, disturb=0.15, detreq="N", lotabs=1,
         loc="Rural; low flood exposure; county allows 5+ ac lots without full subdivision improvements",
         notes="Revenue = lot premium + $/gross acre. Disturbance limited to road and pads"))
add(dict(fs, use="Frontage split lots (no new road)", cat="Housing", unit="lot", minlot=2, frontlf=150, road=0,
         lotprice=10000, landac=15000, ex2=0, entitle=5000, disturb=0.02, detreq="N", lotabs=1, tested="Y",
         loc="Existing public road frontage; county minimum lot size and frontage per lot",
         notes="Classic split-and-sell. Lots limited by frontage and min lot size; no internal road or detention"))
add(dict(fs, use="Garage / car condos", cat="Storage", unit="condo", zclass="COM", density=0, sitesf=2900,
         lotrule="N", taps=0.1, septic=0.1, wells=0.1, gpd=10, road=8, pave=900, vert=85000, saleprice=135000,
         ex1=0, ex2=1, minfront=100, demhh=0.004, radius=10, capture=0.3, absorb=4,
         loc="Affluent submarket; near lakes/airports; visible frontage"))
add(dict(fs, use="Contractor shop condos", cat="Business & Trades", unit="condo (2,000 SF)", zclass="IND", density=0,
         sitesf=5700, lotrule="N", taps=0.2, septic=0.2, wells=0.2, gpd=20, road=10, pave=2500, vert=190000,
         saleprice=280000, ex1=0, ex2=1, minfront=150, maxac=6, demhh=0.002, radius=10, capture=0.3, absorb=2,
         loc="Arterial access; trades demand; light industrial / commercial zoning or unzoned county"))
add(dict(fs, use="Professional office condos", cat="Business & Trades", unit="condo (1,500 SF)", zclass="OFF",
         density=0, sitesf=6000, lotrule="N", taps=0.25, septic=0.25, wells=0.25, gpd=30, road=8, pave=3000,
         vert=300000, saleprice=450000, ex1=0, ex2=1, minfront=150, maxac=4, reqwater="Y", demhh=0.002, radius=10,
         capture=0.25, absorb=1.5, loc="Near rooftops and medical/retail; commercial zoning"))

# ---------------- Housing: income (owner runs it)
inc = dict(engine="Income", ex1=1, ex2=1, ex3=1, margin=0.15)
add(dict(inc, use="Manufactured home community (MHC)", cat="Housing", unit="pad", zclass="MH", density=7, road=40,
         taps=1, septic=0.25, gpd=250, vert=12000, rent=6600, othinc=0.05, vac=0.07, opex=1200, mgmt=0.05,
         recov=0.15, leaseup=24, absorb=3, cap=0.065, landac=40000, devmo=12, entitle=40000,
         loc="MHC zoning or unzoned county; sewer or package plant for density; workforce job growth",
         notes="Pad-only model. Rental community: septic limited by gallons/day per acre, not the subdivided-lot rule"))
add(dict(inc, use="MHC with park-owned homes", cat="Housing", unit="home + pad", zclass="MH", density=7, road=40,
         taps=1, septic=0.25, gpd=250, vert=87000, rent=15600, othinc=0.03, vac=0.06, opex=2600, mgmt=0.06,
         recov=0.05, leaseup=24, absorb=2, cap=0.07, landac=40000, devmo=14, entitle=40000,
         loc="Same as MHC; dealer-cost advantage on homes",
         notes="Vertical = pad work + home at dealer cost (Ridge Stone edge). Rent = lot + home rent"))
add(dict(inc, use="Workforce / extended-stay RV park", cat="Housing", unit="site", zclass="RV", density=15, road=30,
         taps=1, septic=0.25, gpd=75, vert=18000, rent=7800, othinc=0.05, vac=0.15, opex=1800, mgmt=0.08,
         recov=0, leaseup=12, absorb=15, cap=0.085, landac=40000, devmo=10, entitle=40000, maxanchor=15, maxac=20,
         tested="Y", loc="Within 15 mi of major construction/industrial employers; highway access"))
add(dict(inc, use="Leisure RV park / campground", cat="Hospitality", unit="site", zclass="RV", density=12, road=35,
         taps=1, septic=0.25, gpd=60, vert=22000, rent=20075, othinc=0.08, vac=0.45, opex=3000, mgmt=0.12,
         recov=0, leaseup=24, cap=0.09, landac=40000, devmo=12, entitle=40000, maxac=20,
         loc="Within 30 min of lake, state park or attraction; scenic; highway access",
         notes="Nightly use: rent = ADR $55 x 365; vacancy = 1 - occupancy (55%)"))
add(dict(inc, use="STR tiny-home resort / glamping", cat="Hospitality", unit="cabin", zclass="LODG", density=6,
         road=40, taps=1, septic=0.25, gpd=150, vert=110000, rent=63875, othinc=0.05, vac=0.45, opex=9000,
         mgmt=0.20, recov=0, leaseup=18, cap=0.085, landac=40000, devmo=14, entitle=40000, maxac=15,
         loc="Scenic land (trees, water, views); < 2 hrs from metro; short-term rentals allowed",
         notes="Nightly use: rent = ADR $175 x 365; vacancy = 1 - occupancy (55%); mgmt includes platform fees"))
add(dict(inc, use="Workforce rental housing (garden)", cat="Housing", unit="unit", zclass="RES-MF", density=20,
         sitesf=1300, reqsewer="Y", reqwater="Y", road=8, pave=560, taps=0.05, vert=140000, rent=17400,
         othinc=0.05, vac=0.06, opex=4500, mgmt=0.035, recov=0.05, leaseup=15, absorb=15, cap=0.0575,
         landac=250000, devmo=18, entitle=75000, minfront=200, maxac=15, loc="MF zoning or rezonable; job growth; schools; sewer capacity"))
add(dict(inc, use="Multifamily - large garden (150+ units)", cat="Housing", unit="unit", zclass="RES-MF", density=24,
         sitesf=1200, reqsewer="Y", reqwater="Y", road=8, pave=560, taps=0.04, vert=150000, rent=21000, othinc=0.06,
         vac=0.06, opex=5000, mgmt=0.03, recov=0.05, leaseup=18, absorb=18, cap=0.055, landac=350000, devmo=20,
         entitle=100000, minfront=300, maxac=20, loc="MF zoning; arterial frontage; employment within 20 min; sewer capacity letter",
         notes="Simplified. Unit mix, draws and LP/GP waterfall belong in the separate MF module (see build guide)"))
add(dict(inc, use="Multifamily - mid-rise / wrap", cat="Housing", unit="unit", zclass="RES-MF", density=60,
         sitesf=500, reqsewer="Y", reqwater="Y", road=3, pave=0, taps=0.02, vert=240000, rent=25200, othinc=0.07,
         vac=0.06, opex=5500, mgmt=0.03, recov=0.05, leaseup=20, absorb=20, cap=0.0525, landac=900000, devmo=26,
         entitle=150000, maxac=6, minfront=250, loc="Urban/suburban core; high-density zoning; walkable retail",
         notes="Structured parking included in vertical"))
add(dict(inc, use="Duplex / fourplex rental", cat="Housing", unit="unit", zclass="RES-ATT", density=8, reqsewer="Y",
         reqwater="Y", road=20, taps=0.5, vert=175000, rent=19800, othinc=0.02, vac=0.05, opex=3500, mgmt=0.08,
         recov=0.05, leaseup=6, absorb=4, cap=0.0625, landac=150000, devmo=12, loc="SF/2F zoning; schools; city utilities"))
add(dict(inc, use="Tiny-home long-term rental community", cat="Housing", unit="home", zclass="MH", density=10,
         road=25, taps=1, septic=0.25, gpd=150, vert=85000, rent=13200, othinc=0.03, vac=0.07, opex=2500,
         mgmt=0.08, recov=0.05, leaseup=9, absorb=4, cap=0.0675, landac=40000, devmo=12,
         loc="Unzoned county or tiny-home zoning; workforce demand; lake/amenity proximity"))
add(dict(inc, use="Build-to-rent cottages", cat="Housing", unit="home", zclass="RES-SF", density=8, reqsewer="Y",
         reqwater="Y", road=20, taps=1, vert=185000, rent=22800, othinc=0.03, vac=0.05, opex=4000, mgmt=0.06,
         recov=0.05, leaseup=12, absorb=6, cap=0.0575, landac=150000, devmo=16, entitle=60000,
         loc="Good schools; job growth; city utilities"))
U.append({**BASE, **operator("Senior housing (assisted living / memory care)", "Housing", 250000, 17500, 0.065, 6,
                              "65+ population density within 5 mi; near hospital; affluent adult-children base",
                              reqsewer="Y")})

# ---------------- Medical & Care
pad = dict(frontgate="Y")
U.append({**BASE, **sfuse("Medical office building", "Medical & Care", 0.22, 325, 30, 9, 0.90, 45, 12, 0.0675, 450000, 4, 3.5,
                          "Within 2 mi of hospital or growth node; 25k+ rooftops in 3 mi; arterial frontage",
                          zclass="OFF", gpd=0.2, absorb=1500)})
U.append({**BASE, **sfuse("Urgent care / freestanding ER", "Medical & Care", 0.20, 450, 45, 10, 1.0, 20, 6, 0.0625, 650000, 1.5, 4,
                          "Hard or signalized corner; 20k+ VPD; rooftop growth; no competitor within 2 mi", zclass="OFF",
                          gpd=0.2, **pad)})
U.append({**BASE, **sfuse("Dental / specialty clinic pad", "Medical & Care", 0.20, 300, 32, 9, 0.95, 50, 9, 0.0675, 450000, 1, 3.5,
                          "Retail corridor near rooftops; visibility", zclass="OFF", gpd=0.2)})
U.append({**BASE, **sfuse("Dialysis / outpatient therapy", "Medical & Care", 0.25, 280, 28, 8, 1.0, 20, 6, 0.065, 350000, 1.5, 3,
                          "Within 10 min of population center; transit/road access", zclass="OFF", gpd=0.2)})
U.append({**BASE, **sfuse("Pharmacy / drugstore pad", "Medical & Care", 0.18, 300, 30, 8, 1.0, 0, 3, 0.06, 700000, 1.5, 4.5,
                          "Signalized hard corner; 25k+ VPD; drive-thru access", **pad)})
U.append({**BASE, **sfuse("Veterinary clinic", "Medical & Care", 0.22, 300, 30, 8, 1.0, 25, 6, 0.07, 350000, 1.5, 3,
                          "Growing household base; retail corridor")})

# ---------------- Daily-needs retail & services
U.append({**BASE, **sfuse("Grocery-anchored center", "Daily-Needs Retail", 0.22, 220, 22, 7, 0.85, 25, 18, 0.07, 500000, 15, 3.5,
                          "Anchor commitment; 15k+ households in 3 mi; signalized intersection", entitle=75000, minfront=500,
                          lotabs=0)})
U.append({**BASE, **sfuse("Gas station / c-store pad", "Daily-Needs Retail", 0.06, 600, 45, 10, 1.0, 0, 3, 0.0575, 900000, 2, 9,
                          "Hard corner, 20k+ VPD, highway/arterial; going-home side of traffic", **pad)})
U.append({**BASE, **sfuse("QSR / drive-thru pad", "Daily-Needs Retail", 0.055, 450, 55, 10, 1.0, 0, 3, 0.055, 900000, 1.2, 6,
                          "20k+ VPD; ingress both directions; stacking room for drive-thru", **pad)})
U.append({**BASE, **sfuse("Sit-down restaurant pad", "Daily-Needs Retail", 0.12, 400, 40, 10, 1.0, 0, 4, 0.065, 600000, 1.5, 7,
                          "15k+ VPD; retail node; visibility both directions", **pad)})
U.append({**BASE, **sfuse("Express car wash", "Daily-Needs Retail", 0.10, 700, 60, 10, 1.0, 0, 3, 0.065, 700000, 1.5, 6,
                          "20k+ VPD; rooftops; stacking room; no express wash within 2 mi", gpd=0.5, **pad)})
U.append({**BASE, **sfuse("Dollar store pad", "Daily-Needs Retail", 0.16, 140, 12.5, 3, 1.0, 0, 3, 0.07, 150000, 1.5, 3,
                          "Rural trade area with 1,500+ households; 5+ mi from competing dollar store", **pad)})
U.append({**BASE, **sfuse("Neighborhood strip center", "Daily-Needs Retail", 0.22, 200, 26, 8, 0.90, 35, 18, 0.0725, 550000, 4, 3.5,
                          "Rooftop growth; arterial frontage; near schools", demhh=8, radius=3, capture=0.25, absorb=2000)})
U.append({**BASE, **sfuse("Salon suites", "Daily-Needs Retail", 0.25, 230, 40, 12, 0.0, 10, 12, 0.075, 400000, 1.5, 3,
                          "Affluent rooftops; retail corridor", mgmt=0.08, vac=0.10)})
U.append({**BASE, **sfuse("Auto service / tire / oil pad", "Daily-Needs Retail", 0.15, 280, 32, 8, 1.0, 0, 3, 0.065, 600000, 1.5, 5,
                          "15k+ VPD; commercial zoning; visibility", **pad)})
U.append({**BASE, **operator("Laundromat", "Daily-Needs Retail", 300000, 21000, 0.065, 1,
                              "Renter-heavy households within 2 mi; retail strip frontage", zclass="COM")})
U.append({**BASE, **operator("Pet boarding / grooming / daycare", "Daily-Needs Retail", 200000, 14000, 0.065, 3,
                              "Affluent households; noise buffer from homes", zclass="COM")})

# ---------------- Kids, education, faith & recreation
U.append({**BASE, **operator("Childcare / early-learning center", "Kids & Recreation", 350000, 24500, 0.0625, 2,
                              "Young-family rooftops; commute-side of arterial; state licensing site rules")})
U.append({**BASE, **operator("Charter / private school", "Kids & Recreation", 150000, 10500, 0.07, 10,
                              "Population growth; school-age share; collector road access")})
U.append({**BASE, **operator("Church / house of worship", "Kids & Recreation", 60000, 0, 0.07, 10,
                              "Growing household base; collector road; parking", ex3=0, disturb=0.6)})
U.append({**BASE, **operator("Youth sports complex", "Kids & Recreation", 60000, 4200, 0.07, 30,
                              "Flat land; 50k+ population in 15 min; highway access", zclass="AG")})
U.append({**BASE, **sfuse("Gym / fitness center", "Kids & Recreation", 0.25, 180, 18, 7, 1.0, 30, 9, 0.0725, 400000, 3, 4,
                          "Rooftops; retail corridor; parking")})
U.append({**BASE, **operator("Event venue / wedding barn", "Kids & Recreation", 50000, 3500, 0.075, 15,
                              "Scenic land (trees, water, views); < 45 min from metro; jurisdiction allows events",
                              zclass="AG", disturb=0.3)})

# ---------------- Business & trades
ind = dict(zclass="IND", gpd=0.05)
U.append({**BASE, **sfuse("Small-bay flex industrial", "Business & Trades", 0.30, 115, 15, 3.5, 0.95, 8, 12, 0.07, 175000, 10, 1.4,
                          "Arterial/highway access; trades & small-business demand; light industrial or unzoned county",
                          absorb=3000, **ind)})
U.append({**BASE, **sfuse("Office / showroom / warehouse", "Business & Trades", 0.32, 125, 14, 3.5, 0.95, 10, 12, 0.07, 175000, 10, 1.4,
                          "Highway visibility; light industrial zoning", absorb=3000, **ind)})
U.append({**BASE, **sfuse("Supplier build-to-suit near major plants", "Business & Trades", 0.40, 140, 12, 3, 1.0, 0, 3, 0.065, 150000, 20, 1.2,
                          "Within 10 mi of anchor plant; truck route; heavy power", maxanchor=10, **ind)})
U.append({**BASE, **sfuse("Last-mile delivery station", "Business & Trades", 0.25, 160, 16, 3, 1.0, 5, 6, 0.06, 250000, 25, 3,
                          "Within 15 min of dense rooftops; highway interchange", **ind)})
U.append({**BASE, **sfuse("Bulk distribution", "Business & Trades", 0.45, 75, 6.5, 2, 1.0, 4, 12, 0.0575, 120000, 0, 0.9,
                          "Interstate interchange within 2 mi; 50+ acres; flat; heavy power", entitle=100000, minfront=600,
                          lotabs=0, **ind)})
U.append({**BASE, **sfuse("Cold storage", "Business & Trades", 0.40, 260, 14, 3, 1.0, 5, 12, 0.06, 150000, 20, 1.0,
                          "Food distribution corridor; heavy power; interstate access", **ind)})
yard = dict(AC, zclass="IND", engine="Income", unit="acre", vac=0.05, opex=2000, mgmt=0.03, leaseup=6, ex1=1, ex2=1,
            ex3=1, lotabs=0.5, disturb=1.0)
add(dict(yard, use="Industrial outdoor storage (IOS)", cat="Business & Trades", vert=120000, rent=18000, recov=0.80,
         cap=0.0675, landac=150000, maxac=8, devmo=8,
         loc="Zoning allowing outdoor storage; truck route; near highway",
         notes="Vertical = gravel/millings, fence, lighting, small office per acre"))
add(dict(yard, use="Equipment rental yard", cat="Business & Trades", vert=150000, rent=22000, recov=1.0, cap=0.07,
         landac=175000, maxac=8, devmo=10, loc="Arterial frontage; construction activity; commercial/industrial zoning"))
add(dict(engine="Income", use="Truck parking / terminal", cat="Business & Trades", unit="stall", zclass="IND",
         sitesf=1400, discrete="Y", vert=7500, rent=2700, vac=0.15, opex=300, mgmt=0.08, recov=0, leaseup=12,
         absorb=10, cap=0.08, landac=150000, maxac=5, devmo=8, ex1=1, ex2=1, ex3=1, minfront=150,
         loc="Within 2 mi of interstate; truck-friendly access; jurisdiction allows"))

# ---------------- Storage
add(dict(engine="Income", use="Boat & RV storage", cat="Storage", unit="stall", zclass="IND", sitesf=700, discrete="Y",
         vert=4500, rent=1500, vac=0.12, opex=150, mgmt=0.08, recov=0, leaseup=24, absorb=10, cap=0.0725,
         landac=120000, maxac=6, devmo=8, ex1=1, ex2=1, ex3=1, minfront=100, demhh=0.03, radius=10, capture=0.25,
         loc="Within 15 min of lakes / HOA neighborhoods banning RV parking"))
U.append({**BASE, **sfuse("Self-storage", "Storage", 0.35, 55, 14, 4.5, 0.0, 0, 30, 0.0625, 200000, 6, 1.2,
                          "Supply < 7 SF per capita within 3 mi; rooftop growth; visibility", mgmt=0.06, vac=0.10,
                          demhh=18, radius=3, capture=0.35, absorb=2500, zclass="IND", gpd=0.01)})

# ---------------- Hospitality
U.append({**BASE, **operator("Extended-stay hotel", "Hospitality", 450000, 31500, 0.0625, 3,
                              "Near employers/hospitals; highway interchange; flag territory open", zclass="LODG",
                              reqsewer="Y")})

# ---------------- Infrastructure & land plays
lp = dict(AC, engine="Land Play", zclass="UTIL", unit="acre", horiz="N", margin=0.25, devmo=18, needroad="N")
add(dict(lp, use="Private water / wastewater (package plant) site", cat="Infrastructure", landac=60000, ex1=1, ex3=0,
         maxac=5, entitle=150000, needroad="Y",
         loc="Adjacent to growth with no city sewer; permittable discharge route",
         notes="Value ties to connections served; treat $/ac as placeholder"))
add(dict(lp, use="Battery storage / solar land lease", cat="Infrastructure", groundrent=1000, cap=0.08, ex1=0, ex3=1,
         entitle=50000, loc="Within 2 mi of substation with interconnection capacity; flat; not in floodway"))
add(dict(lp, use="Powered land for data centers", cat="Infrastructure", landac=200000, ex1=1, ex3=0, entitle=500000,
         devmo=24, needroad="Y", loc="Transmission line / substation with available MW; fiber; water; 50+ ac",
         notes="Entitlement = power/utility studies and agreements; the power commitment is the value"))
add(dict(lp, use="Cell tower ground lease", cat="Infrastructure", groundrent=6000, cap=0.065, ex1=0, ex3=1, maxac=0.25,
         entitle=0, devmo=12, loc="Carrier coverage gap; jurisdiction allows towers; height/FAA clearance",
         notes="Stackable with other uses on the same parcel; carrier pays entitlement. Rent per acre = $1,500/yr on 0.25 ac"))

MINAC = {"Powered land for data centers": 50, "Bulk distribution": 30, "Grocery-anchored center": 10,
         "Youth sports complex": 20, "Charter / private school": 8, "Battery storage / solar land lease": 20,
         "Last-mile delivery station": 15, "Supplier build-to-suit near major plants": 10, "Cold storage": 10,
         "Event venue / wedding barn": 5, "Multifamily - large garden (150+ units)": 6, "Multifamily - mid-rise / wrap": 2,
         "Workforce / extended-stay RV park": 5, "Manufactured home community (MHC)": 5, "Workforce rental housing (garden)": 3,
         "MHC with park-owned homes": 5, "Leisure RV park / campground": 5, "STR tiny-home resort / glamping": 3,
         "Church / house of worship": 3}
LOC = {  # use: (min VPD, min households 3mi, max miles to highway, corner Y/N, max miles to substation) - placeholders
 "Gas station / c-store pad": (15000, 3000, 0, "Y", 0), "QSR / drive-thru pad": (15000, 5000, 0, "N", 0),
 "Pharmacy / drugstore pad": (20000, 8000, 0, "Y", 0), "Urgent care / freestanding ER": (15000, 8000, 0, "N", 0),
 "Medical office building": (0, 10000, 0, "N", 0), "Dental / specialty clinic pad": (0, 6000, 0, "N", 0),
 "Dialysis / outpatient therapy": (0, 8000, 0, "N", 0), "Veterinary clinic": (0, 5000, 0, "N", 0),
 "Grocery-anchored center": (15000, 10000, 0, "Y", 0), "Neighborhood strip center": (10000, 6000, 0, "N", 0),
 "Sit-down restaurant pad": (15000, 6000, 0, "N", 0), "Express car wash": (20000, 8000, 0, "N", 0),
 "Dollar store pad": (4000, 1500, 0, "N", 0),
 "Salon suites": (0, 8000, 0, "N", 0), "Auto service / tire / oil pad": (10000, 5000, 0, "N", 0),
 "Laundromat": (0, 4000, 0, "N", 0), "Pet boarding / grooming / daycare": (0, 4000, 0, "N", 0),
 "Childcare / early-learning center": (0, 5000, 0, "N", 0), "Charter / private school": (0, 8000, 0, "N", 0),
 "Church / house of worship": (0, 4000, 0, "N", 0),
 "Youth sports complex": (0, 5000, 0, "N", 0), "Gym / fitness center": (0, 8000, 0, "N", 0),
 "Extended-stay hotel": (0, 5000, 2, "N", 0), "Senior housing (assisted living / memory care)": (0, 8000, 0, "N", 0),
 "Small-bay flex industrial": (0, 0, 5, "N", 0), "Office / showroom / warehouse": (0, 0, 3, "N", 0),
 "Supplier build-to-suit near major plants": (0, 0, 10, "N", 0), "Last-mile delivery station": (0, 15000, 3, "N", 0),
 "Bulk distribution": (0, 0, 2, "N", 0), "Cold storage": (0, 0, 3, "N", 0),
 "Industrial outdoor storage (IOS)": (0, 0, 5, "N", 0), "Equipment rental yard": (8000, 0, 0, "N", 0),
 "Truck parking / terminal": (0, 0, 2, "N", 0), "Boat & RV storage": (0, 2000, 0, "N", 0),
 "Self-storage": (0, 5000, 0, "N", 0), "Multifamily - large garden (150+ units)": (0, 8000, 10, "N", 0),
 "Multifamily - mid-rise / wrap": (0, 15000, 0, "N", 0), "Workforce rental housing (garden)": (0, 4000, 0, "N", 0),
 "Workforce / extended-stay RV park": (0, 0, 10, "N", 0), "Leisure RV park / campground": (0, 0, 15, "N", 0),
 "Battery storage / solar land lease": (0, 0, 0, "N", 2), "Powered land for data centers": (0, 0, 0, "N", 1),
}
for u in U:
    u["minac"] = MINAC.get(u["use"], 0)
    u["minvpd"], u["minhh"], u["maxhwy"], u["corner"], u["maxsub"] = LOC.get(u["use"], (0, 0, 0, "N", 0))
for i, u in enumerate(U):
    for k in KEYS:
        u.setdefault(k, BASE.get(k, ""))
assert len({u["use"] for u in U}) == len(U)
assert all(u["zclass"] for u in U), [u["use"] for u in U if not u["zclass"]]
