"""Landova Use Library: every use the Landova app scores, plus large multifamily.
All economic values are PLACEHOLDERS for North Texas and must be replaced with real
comps, bids and actuals before any live deal. Shared by the workbook builder and the
TypeScript engine's fixture generator so both use identical inputs."""

COLS = [
    ("use", "Use"), ("cat", "Category"), ("engine", "Engine"), ("unit", "Capacity unit"),
    ("discrete", "Discrete units (Y/N)"), ("density", "Max density (units / net ac; 0 = n/a)"),
    ("sitesf", "Site SF per unit (0 = n/a)"), ("lotrule", "Septic lot-size rule (Y/N)"),
    ("reqsewer", "Requires public sewer (Y/N)"), ("reqwater", "Requires public water (Y/N)"),
    ("horiz", "Horizontal work by us (Y/N)"), ("minac", "Min usable acres needed (0 = none)"), ("maxac", "Max usable acres market supports (0 = no cap)"),
    ("os", "Open space % of net"), ("road", "Road / drive LF per unit"), ("pave", "Paving SF per unit"),
    ("taps", "Utility taps per unit"), ("septic", "Septic systems per unit (if no sewer)"),
    ("entitle", "Entitlement & zoning $ (fixed)"), ("vert", "Vertical cost per unit"),
    ("lotprice", "Lot sale price per unit (For-Sale)"), ("saleprice", "Finished sale price per unit (For-Sale)"),
    ("rent", "Rent per unit per year (Income)"), ("othinc", "Other income % of rent"),
    ("vac", "Stabilized vacancy"), ("opex", "Opex per unit per year, excl. tax"),
    ("mgmt", "Management % of EGI"), ("recov", "Expense recovery % (NNN)"),
    ("tilc", "TI + leasing commissions per unit"), ("leaseup", "Lease-up months"),
    ("cap", "Exit / lease cap rate"), ("landac", "Land / pad sale price per usable acre"),
    ("groundrent", "Ground / land lease rent per acre per year"), ("devmo", "Development months"),
    ("margin", "Required margin"), ("ex1", "Exit allowed: Land / pad sale (1/0)"),
    ("ex2", "Exit allowed: Build & sell (1/0)"), ("ex3", "Exit allowed: Build & hold / lease (1/0)"),
    ("minfront", "Min road frontage LF"), ("minvpd", "Min traffic count on frontage (VPD; 0 = none)"),
    ("minhh", "Min households within 3 mi (0 = none)"), ("maxhwy", "Max miles to highway interchange (0 = none)"),
    ("corner", "Corner lot required (Y/N)"), ("maxsub", "Max miles to substation w/ capacity (0 = none)"), ("loc", "Location requirements (land-search filters)"),
    ("notes", "Notes"),
]
KEYS = [k for k, _ in COLS]

BASE = dict(discrete="Y", density=0, sitesf=0, lotrule="N", reqsewer="N", reqwater="N", horiz="Y",
            minac=0, maxac=0, os=0.05, road=0, pave=0, taps=0, septic=0, entitle=25000, vert=0, lotprice=0,
            saleprice=0, rent=0, othinc=0, vac=0, opex=0, mgmt=0, recov=0, tilc=0, leaseup=0, cap=0.07,
            landac=0, groundrent=0, devmo=12, margin=0.15, ex1=1, ex2=0, ex3=0, minfront=60, loc="",
            notes="Placeholder values")

# Commercial building-SF defaults (capacity unit = building SF)
SF = dict(discrete="N", taps=0.0001, septic=0.0001, road=0.006, os=0.08, entitle=40000,
          othinc=0, vac=0.07, mgmt=0.03, recov=0.95, leaseup=9, devmo=14, margin=0.15,
          ex1=1, ex2=1, ex3=1, minfront=150, reqwater="Y")
# Acre-based defaults (yards, operator pads, land plays): capacity unit = usable acre
AC = dict(discrete="N", sitesf=43560, taps=0, septic=0, road=0, os=0.05, minfront=100)


def sfuse(use, cat, coverage, vert, rent, opex, recov, tilc, leaseup, cap, landac, maxac, pave, loc, **kw):
    d = dict(SF, use=use, cat=cat, engine="Income", unit="bldg SF", sitesf=round(1 / coverage, 3),
             vert=vert, rent=rent, opex=opex, recov=recov, tilc=tilc, leaseup=leaseup, cap=cap,
             landac=landac, maxac=maxac, pave=pave, loc=loc)
    d.update(kw)
    return d


def operator(use, cat, landac, groundrent, cap, maxac, loc, **kw):
    d = dict(AC, use=use, cat=cat, engine="Operator Pad", unit="acre", landac=landac,
             groundrent=groundrent, cap=cap, maxac=maxac, loc=loc, entitle=40000, devmo=12,
             margin=0.20, ex1=1, ex2=0, ex3=1,
             notes="Landova delivers a pad-ready site; operator builds and runs the business")
    d.update(kw)
    return d


U = []
add = lambda d: U.append({**BASE, **d})

# ---------------- Housing: for-sale
fs = dict(engine="For-Sale", lotrule="Y", taps=1, septic=1, devmo=12, margin=0.15, ex1=1, ex2=1, ex3=0, minfront=60)
add(dict(fs, use="Homesites (stick-built, for sale)", cat="Housing", unit="lot / home", density=4, road=50,
         vert=245000, lotprice=80000, saleprice=375000, landac=0,
         loc="Within growth area; school district; < 30 min to job centers; no deed restriction on lot size"))
add(dict(fs, use="Finished / entitled lots", cat="Housing", unit="lot", density=4, road=50, lotprice=75000, ex2=0,
         loc="Builder demand in submarket; utilities within reach; platting allowed"))
add(dict(fs, use="Active-adult 55+ (for sale)", cat="Housing", unit="lot / home", density=5, road=45, vert=230000,
         lotprice=70000, saleprice=360000, loc="Near healthcare, retail and lakes/golf; 60+ population growth"))
add(dict(fs, use="Entry-level for-sale homes", cat="Housing", unit="lot / home", density=5, road=45, vert=210000,
         lotprice=65000, saleprice=310000, loc="Workforce demand (job growth); price-point gap vs. resale"))
add(dict(fs, use="Manufactured home subdivision", cat="Housing", unit="lot / home", density=4, road=50,
         vert=116500, lotprice=55000, saleprice=245000,
         loc="No deed restriction against MH; county (not city) jurisdiction or MH-friendly zoning",
         notes="Vertical = Ridge Stone dealer cost ~$94K + set-up/foundation/skirting + flatwork (user-stated home cost; rest placeholder)"))
add(dict(fs, use="Townhomes", cat="Housing", unit="unit", density=10, road=25, lotrule="N", reqsewer="Y", reqwater="Y",
         septic=0, vert=200000, lotprice=45000, saleprice=300000, loc="City water/sewer; zoning allows attached SF; near retail"))
add(dict(fs, use="Ranchette / acreage lots", cat="Housing", unit="lot", density=0.2, road=150, lotprice=90000, ex2=0,
         entitle=10000, loc="Rural; good road frontage for flag-free lots; low flood exposure"))
add(dict(fs, use="Garage / car condos", cat="Storage", unit="condo", density=0, sitesf=2900, lotrule="N", taps=0.1,
         septic=0.1, road=8, pave=900, vert=85000, saleprice=135000, ex1=0, ex2=1, minfront=100,
         loc="Affluent submarket; near lakes/airports; visible frontage", devmo=12))
add(dict(fs, use="Contractor shop condos", cat="Business & Trades", unit="condo (2,000 SF)", density=0, sitesf=5700,
         lotrule="N", taps=0.2, septic=0.2, road=10, pave=2500, vert=190000, saleprice=280000, ex1=0, ex2=1,
         minfront=150, maxac=6, loc="Arterial access; trades demand; light industrial / commercial zoning or county"))
add(dict(fs, use="Professional office condos", cat="Business & Trades", unit="condo (1,500 SF)", density=0, sitesf=6000,
         lotrule="N", taps=0.25, septic=0.25, road=8, pave=3000, vert=300000, saleprice=450000, ex1=0, ex2=1,
         minfront=150, maxac=4, reqwater="Y", loc="Near rooftops and medical/retail; commercial zoning"))

# ---------------- Housing: income (owner runs it)
inc = dict(engine="Income", ex1=1, ex2=1, ex3=1, margin=0.15)
add(dict(inc, use="Manufactured home community (MHC)", cat="Housing", unit="pad", density=7, lotrule="Y", road=40,
         taps=1, septic=1, vert=12000, rent=6600, othinc=0.05, vac=0.07, opex=1200, mgmt=0.05, recov=0.15,
         leaseup=24, cap=0.065, landac=40000, devmo=12, entitle=40000,
         loc="County jurisdiction or MHC zoning; sewer or package plant for density; workforce job growth",
         notes="Pad-only model. Park-owned homes = add home cost to vertical and home rent to rent (dealer-cost edge)"))
add(dict(inc, use="Workforce / extended-stay RV park", cat="Housing", unit="site", density=15, road=30, taps=0.25,
         septic=0.25, vert=18000, rent=7800, othinc=0.05, vac=0.15, opex=1800, mgmt=0.08, recov=0, leaseup=12,
         cap=0.085, landac=40000, devmo=10, entitle=40000,
         loc="Within 15 min of major construction/industrial employers (e.g. Sherman fabs); highway access"))
add(dict(inc, use="Workforce rental housing (garden)", cat="Housing", unit="unit", density=20, sitesf=1300,
         reqsewer="Y", reqwater="Y", road=8, pave=560, taps=0.05, vert=140000, rent=17400, othinc=0.05,
         vac=0.06, opex=4500, mgmt=0.035, recov=0.05, leaseup=15, cap=0.0575, landac=250000, devmo=18,
         entitle=75000, minfront=200, loc="MF zoning or rezonable; job growth; schools; sewer capacity"))
add(dict(inc, use="Multifamily - large garden (150+ units)", cat="Housing", unit="unit", density=24, sitesf=1200,
         reqsewer="Y", reqwater="Y", road=8, pave=560, taps=0.04, vert=150000, rent=21000, othinc=0.06,
         vac=0.06, opex=5000, mgmt=0.03, recov=0.05, leaseup=18, cap=0.055, landac=350000, devmo=20,
         entitle=100000, minfront=300,
         loc="MF zoning; arterial frontage; employment within 20 min; sewer capacity letter",
         notes="Simplified. Unit mix, draws and LP/GP waterfall belong in the separate MF module (see build guide)"))
add(dict(inc, use="Multifamily - mid-rise / wrap", cat="Housing", unit="unit", density=60, sitesf=500,
         reqsewer="Y", reqwater="Y", road=3, pave=0, taps=0.02, vert=240000, rent=25200, othinc=0.07,
         vac=0.06, opex=5500, mgmt=0.03, recov=0.05, leaseup=20, cap=0.0525, landac=900000, devmo=26,
         entitle=150000, maxac=6, minfront=250,
         loc="Urban/suburban core; high-density zoning; walkable retail", notes="Structured parking included in vertical"))
add(dict(inc, use="Duplex / fourplex rental", cat="Housing", unit="unit", density=8, reqsewer="Y", reqwater="Y",
         road=20, taps=0.5, vert=175000, rent=19800, othinc=0.02, vac=0.05, opex=3500, mgmt=0.08, recov=0.05,
         leaseup=6, cap=0.0625, landac=150000, devmo=12, loc="SF/2F zoning; schools; city utilities"))
add(dict(inc, use="Tiny-home long-term rental community", cat="Housing", unit="home", density=10, road=25,
         taps=1, septic=0.25, vert=85000, rent=13200, othinc=0.03, vac=0.07, opex=2500, mgmt=0.08, recov=0.05,
         leaseup=9, cap=0.0675, landac=40000, devmo=12, loc="County jurisdiction; workforce demand; lake/amenity proximity"))
add(dict(inc, use="Build-to-rent cottages", cat="Housing", unit="home", density=8, reqsewer="Y", reqwater="Y",
         road=20, taps=1, vert=185000, rent=22800, othinc=0.03, vac=0.05, opex=4000, mgmt=0.06, recov=0.05,
         leaseup=12, cap=0.0575, landac=150000, devmo=16, entitle=60000, loc="Good schools; job growth; city utilities"))
U.append({**BASE, **operator("Senior housing (assisted living / memory care)", "Housing", 250000, 17500, 0.065, 6,
                              "65+ population density within 5 mi; near hospital; affluent adult-children base")})

# ---------------- Medical & Care
U.append({**BASE, **sfuse("Medical office building", "Medical & Care", 0.22, 325, 30, 9, 0.90, 45, 12, 0.0675, 450000, 4, 3.5,
                          "Within 2 mi of hospital or growth node; 25k+ rooftops in 3 mi; arterial frontage")})
U.append({**BASE, **sfuse("Urgent care / freestanding ER", "Medical & Care", 0.20, 450, 45, 10, 1.0, 20, 6, 0.0625, 650000, 1.5, 4,
                          "Hard or signalized corner; 20k+ VPD; rooftop growth; no competitor within 2 mi")})
U.append({**BASE, **sfuse("Dental / specialty clinic pad", "Medical & Care", 0.20, 300, 32, 9, 0.95, 50, 9, 0.0675, 450000, 1, 3.5,
                          "Retail corridor near rooftops; visibility")})
U.append({**BASE, **sfuse("Dialysis / outpatient therapy", "Medical & Care", 0.25, 280, 28, 8, 1.0, 20, 6, 0.065, 350000, 1.5, 3,
                          "Within 10 min of population center; transit/road access")})
U.append({**BASE, **sfuse("Pharmacy / drugstore pad", "Medical & Care", 0.18, 300, 30, 8, 1.0, 0, 3, 0.06, 700000, 1.5, 4.5,
                          "Signalized hard corner; 25k+ VPD; drive-thru access")})
U.append({**BASE, **sfuse("Veterinary clinic", "Medical & Care", 0.22, 300, 30, 8, 1.0, 25, 6, 0.07, 350000, 1.5, 3,
                          "Growing household base; retail corridor")})

# ---------------- Daily-needs retail & services
U.append({**BASE, **sfuse("Grocery-anchored center", "Daily-Needs Retail", 0.22, 220, 22, 7, 0.85, 25, 18, 0.07, 500000, 15, 3.5,
                          "Anchor commitment; 15k+ households in 3 mi; signalized intersection", entitle=75000, minfront=500)})
U.append({**BASE, **sfuse("Gas station / c-store pad", "Daily-Needs Retail", 0.06, 600, 45, 10, 1.0, 0, 3, 0.0575, 900000, 2, 9,
                          "Hard corner, 20k+ VPD, highway/arterial; going-home side of traffic")})
U.append({**BASE, **sfuse("QSR / drive-thru pad", "Daily-Needs Retail", 0.055, 450, 55, 10, 1.0, 0, 3, 0.055, 900000, 1.2, 6,
                          "20k+ VPD; ingress both directions; stacking room for drive-thru")})
U.append({**BASE, **sfuse("Neighborhood strip center", "Daily-Needs Retail", 0.22, 200, 26, 8, 0.90, 35, 18, 0.0725, 550000, 4, 3.5,
                          "Rooftop growth; arterial frontage; near schools")})
U.append({**BASE, **sfuse("Salon suites", "Daily-Needs Retail", 0.25, 230, 40, 12, 0.0, 10, 12, 0.075, 400000, 1.5, 3,
                          "Affluent rooftops; retail corridor", mgmt=0.08, vac=0.10)})
U.append({**BASE, **sfuse("Auto service / tire / oil pad", "Daily-Needs Retail", 0.15, 280, 32, 8, 1.0, 0, 3, 0.065, 600000, 1.5, 5,
                          "15k+ VPD; commercial zoning; visibility")})
U.append({**BASE, **operator("Laundromat", "Daily-Needs Retail", 300000, 21000, 0.065, 1,
                              "Renter-heavy households within 2 mi; retail strip frontage")})
U.append({**BASE, **operator("Pet boarding / grooming / daycare", "Daily-Needs Retail", 200000, 14000, 0.065, 3,
                              "Affluent households; noise buffer from homes")})

# ---------------- Kids, education & recreation
U.append({**BASE, **operator("Childcare / early-learning center", "Kids & Recreation", 350000, 24500, 0.0625, 2,
                              "Young-family rooftops; commute-side of arterial; state licensing site rules")})
U.append({**BASE, **operator("Charter / private school", "Kids & Recreation", 150000, 10500, 0.07, 10,
                              "Population growth; school-age share; collector road access")})
U.append({**BASE, **operator("Youth sports complex", "Kids & Recreation", 60000, 4200, 0.07, 30,
                              "Flat land; 50k+ population in 15 min; highway access")})
U.append({**BASE, **sfuse("Gym / fitness center", "Kids & Recreation", 0.25, 180, 18, 7, 1.0, 30, 9, 0.0725, 400000, 3, 4,
                          "Rooftops; retail corridor; parking")})
U.append({**BASE, **operator("Event venue / wedding barn", "Kids & Recreation", 50000, 3500, 0.075, 15,
                              "Scenic land (trees, water, views); < 45 min from metro; county allows events")})

# ---------------- Business & trades
U.append({**BASE, **sfuse("Small-bay flex industrial", "Business & Trades", 0.30, 115, 15, 3.5, 0.95, 8, 12, 0.07, 175000, 10, 1.4,
                          "Arterial/highway access; trades & small-business demand; light industrial or county")})
U.append({**BASE, **sfuse("Office / showroom / warehouse", "Business & Trades", 0.32, 125, 14, 3.5, 0.95, 10, 12, 0.07, 175000, 10, 1.4,
                          "Highway visibility; light industrial zoning")})
U.append({**BASE, **sfuse("Supplier build-to-suit near major plants", "Business & Trades", 0.40, 140, 12, 3, 1.0, 0, 3, 0.065, 150000, 20, 1.2,
                          "Within 10 mi of anchor plant (e.g. TI Sherman, GlobalWafers); truck route; heavy power")})
U.append({**BASE, **sfuse("Last-mile delivery station", "Business & Trades", 0.25, 160, 16, 3, 1.0, 5, 6, 0.06, 250000, 25, 3,
                          "Within 15 min of dense rooftops; highway interchange")})
U.append({**BASE, **sfuse("Bulk distribution", "Business & Trades", 0.45, 75, 6.5, 2, 1.0, 4, 12, 0.0575, 120000, 0, 0.9,
                          "Interstate interchange within 2 mi; 50+ acres; flat; heavy power", entitle=100000, minfront=600)})
U.append({**BASE, **sfuse("Cold storage", "Business & Trades", 0.40, 260, 14, 3, 1.0, 5, 12, 0.06, 150000, 20, 1.0,
                          "Food distribution corridor; heavy power; interstate access")})
add(dict(AC, use="Industrial outdoor storage (IOS)", cat="Business & Trades", engine="Income", unit="acre", vert=120000,
         rent=18000, vac=0.05, opex=2000, mgmt=0.03, recov=0.80, leaseup=6, cap=0.0675, landac=150000, maxac=8,
         devmo=8, ex1=1, ex2=1, ex3=1, loc="Industrial/county zoning allowing outdoor storage; truck route; near highway",
         notes="Vertical = gravel/millings, fence, lighting, small office per acre"))
add(dict(AC, use="Equipment rental yard", cat="Business & Trades", engine="Income", unit="acre", vert=150000,
         rent=22000, vac=0.05, opex=2000, mgmt=0.03, recov=1.0, leaseup=6, cap=0.07, landac=175000, maxac=8,
         devmo=10, ex1=1, ex2=1, ex3=1, loc="Arterial frontage; construction activity; commercial/industrial zoning"))
add(dict(engine="Income", use="Truck parking / terminal", cat="Business & Trades", unit="stall", sitesf=1400, discrete="Y",
         vert=7500, rent=2700, vac=0.15, opex=300, mgmt=0.08, recov=0, leaseup=12, cap=0.08, landac=150000, maxac=5,
         devmo=8, ex1=1, ex2=1, ex3=1, minfront=150, loc="Within 2 mi of interstate; truck-friendly access; county allows"))

# ---------------- Storage
add(dict(engine="Income", use="Boat & RV storage", cat="Storage", unit="stall", sitesf=700, discrete="Y", vert=4500,
         rent=1500, vac=0.12, opex=150, mgmt=0.08, recov=0, leaseup=24, cap=0.0725, landac=120000, maxac=6, devmo=8,
         ex1=1, ex2=1, ex3=1, minfront=100, loc="Within 15 min of lakes / HOA neighborhoods banning RV parking"))
U.append({**BASE, **sfuse("Self-storage", "Storage", 0.35, 55, 14, 4.5, 0.0, 0, 30, 0.0625, 200000, 6, 1.2,
                          "Supply < 7 SF per capita within 3 mi; rooftop growth; visibility", mgmt=0.06, vac=0.10)})

# ---------------- Hospitality
U.append({**BASE, **operator("Extended-stay hotel", "Hospitality", 450000, 31500, 0.0625, 3,
                              "Near employers/hospitals; highway interchange; flag territory open")})

# ---------------- Infrastructure & land plays
lp = dict(AC, engine="Land Play", unit="acre", horiz="N", margin=0.25, devmo=18)
add(dict(lp, use="Private water / wastewater (package plant) site", cat="Infrastructure", landac=60000, ex1=1, ex3=0,
         maxac=5, entitle=150000, loc="Adjacent to growth with no city sewer; TCEQ permittable discharge route",
         notes="Value ties to connections served; treat $/ac as placeholder"))
add(dict(lp, use="Battery storage / solar land lease", cat="Infrastructure", groundrent=1000, cap=0.08, ex1=0, ex3=1,
         entitle=50000, loc="Within 2 mi of substation with interconnection capacity; flat; not in floodway"))
add(dict(lp, use="Powered land for data centers", cat="Infrastructure", landac=200000, ex1=1, ex3=0, entitle=500000,
         devmo=24, loc="Transmission line / substation with available MW; fiber; water; 50+ ac",
         notes="Entitlement = power/utility studies and agreements; the power commitment is the value"))

MINAC = {"Powered land for data centers": 50, "Bulk distribution": 30, "Grocery-anchored center": 10,
         "Youth sports complex": 20, "Charter / private school": 8, "Battery storage / solar land lease": 20,
         "Last-mile delivery station": 15, "Supplier build-to-suit near major plants": 10, "Cold storage": 10,
         "Event venue / wedding barn": 5, "Multifamily - large garden (150+ units)": 6, "Multifamily - mid-rise / wrap": 2,
         "Workforce / extended-stay RV park": 5, "Manufactured home community (MHC)": 5, "Workforce rental housing (garden)": 3}
LOC = {  # use: (min VPD, min households 3mi, max miles to highway, corner Y/N, max miles to substation) - placeholders
 "Gas station / c-store pad": (15000, 3000, 0, "Y", 0), "QSR / drive-thru pad": (15000, 5000, 0, "N", 0),
 "Pharmacy / drugstore pad": (20000, 8000, 0, "Y", 0), "Urgent care / freestanding ER": (15000, 8000, 0, "N", 0),
 "Medical office building": (0, 10000, 0, "N", 0), "Dental / specialty clinic pad": (0, 6000, 0, "N", 0),
 "Dialysis / outpatient therapy": (0, 8000, 0, "N", 0), "Veterinary clinic": (0, 5000, 0, "N", 0),
 "Grocery-anchored center": (15000, 10000, 0, "Y", 0), "Neighborhood strip center": (10000, 6000, 0, "N", 0),
 "Salon suites": (0, 8000, 0, "N", 0), "Auto service / tire / oil pad": (10000, 5000, 0, "N", 0),
 "Laundromat": (0, 4000, 0, "N", 0), "Pet boarding / grooming / daycare": (0, 4000, 0, "N", 0),
 "Childcare / early-learning center": (0, 5000, 0, "N", 0), "Charter / private school": (0, 8000, 0, "N", 0),
 "Youth sports complex": (0, 5000, 0, "N", 0), "Gym / fitness center": (0, 8000, 0, "N", 0),
 "Extended-stay hotel": (0, 5000, 2, "N", 0), "Senior housing (assisted living / memory care)": (0, 8000, 0, "N", 0),
 "Small-bay flex industrial": (0, 0, 5, "N", 0), "Office / showroom / warehouse": (0, 0, 3, "N", 0),
 "Supplier build-to-suit near major plants": (0, 0, 10, "N", 0), "Last-mile delivery station": (0, 15000, 3, "N", 0),
 "Bulk distribution": (0, 0, 2, "N", 0), "Cold storage": (0, 0, 3, "N", 0),
 "Industrial outdoor storage (IOS)": (0, 0, 5, "N", 0), "Equipment rental yard": (8000, 0, 0, "N", 0),
 "Truck parking / terminal": (0, 0, 2, "N", 0), "Boat & RV storage": (0, 2000, 0, "N", 0),
 "Self-storage": (0, 5000, 0, "N", 0), "Multifamily - large garden (150+ units)": (0, 8000, 10, "N", 0),
 "Multifamily - mid-rise / wrap": (0, 15000, 0, "N", 0), "Workforce rental housing (garden)": (0, 4000, 0, "N", 0),
 "Battery storage / solar land lease": (0, 0, 0, "N", 2), "Powered land for data centers": (0, 0, 0, "N", 1),
}
for u in U:
    u["minac"] = MINAC.get(u["use"], 0)
    u["minvpd"], u["minhh"], u["maxhwy"], u["corner"], u["maxsub"] = LOC.get(u["use"], (0, 0, 0, "N", 0))
for i, u in enumerate(U):
    for k in KEYS:
        u.setdefault(k, BASE.get(k, ""))
assert len({u["use"] for u in U}) == len(U)
