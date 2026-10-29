# Landova Proforma Engine v3: Build Guide

From Trent Reynolds to Ryan Schubert · October 29, 2026 · Companion to `Landova_Proforma_v3.xlsx`

## What this is

For any U.S. parcel, the engine runs every use Landova scores. It returns, for each use, the most we can pay for the land, the opening offer, the best exit and a verdict (Strong / Works at asking / Negotiate / Pass). The uses are ranked. For any use, it also produces a **prefilled proforma**: budget, operating statement, exits and monthly cash flow with IRR. Every number shows where it came from.

Users upload their own proformas, budgets, bids, rent rolls and deal history. The system maps them into one schema and learns the org's costs, revenues and estimating bias. From then on, every parcel that org looks at is underwritten with **their** numbers for **their** development types.

The workbook is the reference implementation. Its Engine tab is the spec: one row per use, one column per step. Code must match the golden fixtures in `fixtures/` to $1.

Rules for the build (unchanged from v2, plus one):

1. AI maps, extracts and suggests. The math is deterministic, and every number traces to an input, a library value, a record or a formula.
2. Uses are data, not code. All 62 uses share one engine; adding a use means adding a row.
3. Every number shows its source: deal edit, org-learned, market data (and at which level), or Landova default × location index.
4. **Nothing is North Texas-specific in code.** Location is data. The engine works for any parcel with a state and county. Where data is missing it falls back to the next level up and says so.

## Files (`docs/proforma/`)

| File | What it is |
|---|---|
| `Landova_Proforma_v3.xlsx` | Reference implementation (generated; don't hand-edit) |
| `build_v3.py` | Builds the workbook. `ENG` is the engine as ordered (key, header, formula) tuples, the cleanest thing to port |
| `uses.py` | Use library, 62 uses, at the reference basis |
| `regions.py` | Location hierarchy seed: national defaults, sample states, Texas counties, city overrides |
| `canonical.py` | Canonical Proforma Schema (import and export), cost codes, synonyms, unit rules, learning weights |
| `schema.sql` | Reference PostgreSQL data model |
| `verify.py` | Recalculates variants in LibreOffice: error scan, plug-back test, gate tests, writes `fixtures/*.json` |
| `fixtures/*.json` | Golden outputs: every Engine column for every use, for 10 variant parcels |
| `engine_meta.json` | Engine column keys and order (for fixture parsing) |
| `v2/` | The v2 files this replaces, for comparison |

Rebuild and verify:

```bash
python3 build_v3.py && python3 verify.py
```

## What changed from v2 and why

| v2 problem (from the review) | v3 fix |
|---|---|
| Costs changed by county; revenue didn't. Collin looked worse than Grayson | `Regions` table with cost, price, rent and opex indices, a cap-rate adjustment, and raw land $/ac. Plus `Market_Data` for local comps by use |
| Only 5 counties; Texas-only rules (TCEQ septic, 2.2% tax, no transfer tax, unzoned counties) hard-coded | National > State > County > City fallback. Tax, assessment, closing, transfer tax, carry, ag/open-space conversion penalty, impact fees, zoning powers, septic rules, permit thresholds and rezoning cost/time are all location data |
| Everything sold or leased within the build period, so big tracts always won | Absorption per use drives sell-out and lease-up months. Carry and interest scale with time, and required margin rises 5% per year beyond 12 months |
| Market cap was a fixed acreage | Demand cap: households in the trade area (3 or 10 mi) × demand per household × capture share. Unused land is resold at the location's raw land value |
| Full-subdivision site work for every use | Per-use disturbed share and detention flag. Geotech only when the site is mostly disturbed; drainage study only with detention. Lot and pad sales exclude septic, wells and paving the buyer builds |
| Ranchettes could never work; no frontage split | Min-lot-size and frontage-per-lot capacity constraints. Revenue = lot premium + $/gross acre. New use: Frontage split lots (no new road) |
| Half-acre septic rule applied to rental communities; wells tied to septic count | Septic min-lot rule only for subdivided lots. Rental communities are limited by gallons/day per acre (soil-adjusted), with a state permit above the threshold. A public water system is required at 15 connections. An unlock message shows what sewer or a package plant would allow |
| Location notes not tested; supplier build-to-suit passed 6 mi from a highway with no plant | Major-employer distance test. Every use is marked tested or untested; untested uses get "Low - verify location" and show the rule to check |
| No zoning, deed, access or frontage gates | Zoning status: No zoning / By right / Rezone required / Prohibited / Deed restricted (cost and months added for rezoning). Legal access gate. Frontage minimum is a hard gate for pad uses |
| No as-is floor or quick verdict | As-is value (gross × raw $/ac), verdict, confidence and "uses that work" counts on Best_Use |
| No org-specific numbers | `Org_Profile` (development types, margins by engine), `Org_Overrides`, `Cost_Records` with shrinkage learning, estimating-bias correction from `Deal_History` |
| Missing uses | Added: frontage split lots, ranchette subdivision, MHC with park-owned homes, leisure RV park / campground, STR tiny-home resort / glamping, dollar store, express car wash, sit-down restaurant, church, cell tower ground lease |

## Architecture

The pipeline runs once per parcel × use × org:

1. **Resolve location.** Build keys (city, county, state, US) and resolve every location field to the most specific filled value, with its source level (`Location` tab).
2. **Resolve use inputs** (`Use_Effective` tab). For each learnable field, pick the value by priority (below) and localize it.
3. **Gates.** Zoning/deed, access, frontage, sewer, water, location tests, minimum size. A failed gate gives zero capacity and the binding text says why.
4. **Capacity.** Physical capacity = MIN(density, site area, septic min lot, min lot size, frontage, septic gal/day). Then the demand cap. Used acres shrink to match demand and the rest is resold.
5. **Quantities and horizontal budget.** Each line = quantity × cost-library value used × location cost index (× slope or soil factor where relevant), plus contingency and the org's learned bias.
6. **Vertical**, TI/LC, impact fees.
7. **Timing and hurdle.** Development months (+ rezoning and permit months), sell-out and lease-up months per exit, required margin per exit.
8. **Three exits** and the max offer for each (closed form or one exact Newton step).
9. **Answer.** Best offer, exit, months, opening offer, verdict, confidence, flags, verify text, rank key (All uses / My uses).
10. **Prefilled proforma** for the chosen use and exit, in the Canonical Proforma Schema, with monthly cash flow.

## Location hierarchy

Keys: `US`, `ST`, `ST|County`, `ST|County|City` (in the app, use FIPS codes and keep the text key for display). For each field, the engine uses the most specific level that has the field filled. Blank means inherit. The national row fills every field, so resolution always ends with a value. Store the source level next to every resolved value and show it in the UI.

Location fields (`regions.py` → `RCOLS`):

- **Indices**: `cost_idx`, `price_idx`, `rent_idx`, `opex_idx` and `cap_adj` (added to cap rates), relative to the reference basis.
- **Money**: `raw_ac` (as-is land value $/ac), `taxrate`, `assess`, `closing`, `transfer` (seller transfer tax), `carry`, `rollback` (ag/open-space conversion penalty as % of land price), `impact` ($/dwelling), `rezone_cost`.
- **Rules**: `city_zoning`, `etj_zoning`, `cnty_zoning` (does that kind of jurisdiction zone?), `lot_w` and `lot_well` (septic minimum lot), `gpd_ac` (on-site septic gal/day per acre, good soil), `permit_gpd` (flow needing a state permit), `permit_mo`, `pws_conn` (connections that make a public water system), `rezone_mo`.

**The basis rule.** The use library, cost library and org overrides are stored at the reference basis (index 1.0). Ingest divides a record by its deal location's index; the engine multiplies by the parcel's index. Market data is stored local and is never indexed. This lets one org's Texas actuals inform a Tennessee parcel without carrying Texas prices with them.

Seed data is placeholder. Suggested national sources by field:

| Field | Source |
|---|---|
| Traffic counts | FHWA HPMS AADT, plus state DOT count layers |
| Households | Census ACS (block group), with growth from annual estimates |
| Flood | FEMA National Flood Hazard Layer |
| Septic suitability | USDA SSURGO soil interpretations for septic absorption fields; map their ratings to Good/Fair/Poor |
| Substations and transmission | HIFLD electric infrastructure layers, then utility interconnection queues |
| Water/sewer service areas | Texas PUC CCN maps; EPA SDWIS for water systems elsewhere; utility GIS where available |
| Zoning | Municipal and county GIS → `zoning_crosswalk` to Landova classes (AI reads the ordinance; a human confirms) |
| Tax rates, assessment ratios, transfer taxes | County assessor and appraisal district data; state statutes for transfer taxes |
| Cost indices | A licensed construction cost index by metro/county, calibrated by org records |
| Price, rent and cap comps | MLS, listing and comp providers, plus the pooled benchmark |

## Data layers and priority

Each learnable use field (`uses.py` → `LEARNABLE`) resolves through these layers. **Deal edits** (the user typing over a number in a proforma) always win and live on the proforma, not in the library.

- **Cost-type fields** (vertical cost, entitlement, TI/LC, opex, development months, margin): **Org** (localized) → **Market** City → County → State → **Default × index**. The org's own build costs describe their product and their subs.
- **Revenue-type fields** (lot price, sale price, land $/ac, rent, ground rent, cap rate, vacancy, absorption, sell-out pace): **Market** City → County → State → **Org** (localized) → **Default × index**. What the parcel's market pays beats what the org got somewhere else.
- **Margin**: org use-specific → org margin by engine (`Org_Profile`) → library.
- **Pooled benchmark** rows count only with ≥ 5 records from ≥ 3 orgs. Below that they're suppressed (see the Grayson RV-park example row on `Market_Data`).

The `Use_Effective` tab shows the chosen value and its source for every use and field. `Fields from data` counts how many aren't defaults; it feeds Confidence.

## Engine spec changes (key → Engine tab column)

Formulas are in `build_v3.py`; column keys below match `fixtures/*.json`.

**Gates**
- `zstat`:
  - "Deed restricted" if the use's zoning class is in the parcel's deed-restricted list.
  - "No zoning" if this jurisdiction type doesn't zone here.
  - "By right" if the class is in the parcel's allowed list.
  - "Rezone required" if the class is in the parcel's realistic-rezoning list (or `*`).
  - Otherwise "Prohibited by zoning".
- `rez` adds `rezone_cost` and `rezone_mo`.
- `acc_ok`: no access fails every use. A private easement fails uses that need a public road (land plays don't).
- `front_ok`: hard gate only where `frontgate = Y` (pads); otherwise a flag.
- Location tests now include `maxanchor` (miles to a major employer).

**Capacity**
- `cap_lot` (subdivided lots on septic) uses the location's `lot_w` / `lot_well`.
- `cap_minlot` = gross acres used ÷ min lot.
- `cap_front` = frontage ÷ LF per lot.
- `cap_ww` = used acres × `gpd_ac` × soil factor ÷ gal/day per unit. Applies to rental communities and commercial on septic.
- `cap_dem` = households (3 or 10 mi) × demand per household × capture share.
- `dratio` scales used acres down when demand binds, and the excess is resold at `raw_ac`.

**Quantities.** `conns` = capacity × taps. Then:
- `pws` = 1 when there's no public water, the use isn't subdivided lots, and connections ≥ `pws_conn`. It costs 04-320 plus 04-330 per connection, and replaces individual wells.
- `wwpermit` = 1 when on-site gal/day exceeds `permit_gpd`. It adds 02-320 and `permit_mo`.
- `clear_ac` and `grade_ac` use the use's `disturb` share.
- `isres` triggers impact fees.

**Timing and hurdle**
- `devmo_e` = development months + rezoning and permit months.
- `sell1` = (lots, or acres for non-For-Sale) ÷ `lotabs`.
- `sell2` = homes ÷ `absorb`.
- `lu` = MAX(minimum lease-up, capacity ÷ `absorb`).
- `T1`–`T3` are total months per exit.
- `mg_x` = margin + `yrprem` × MAX(0, (T_x − 12) / 12).

**Land and financing factors**
- `lf_base` = 1 + closing + conversion penalty (if ag/open-space valuation is in place).
- Carry and the financing factor use each exit's own months; for sell-out exits that's development months + half of sell-out.

**Exits.** Selling costs add the location's transfer tax.
- For-Sale exit 1 revenue = lots × lot price + gross acres used × $/ac (for ranchettes and splits).
- Exit 1 non-land cost excludes paving, septic systems and wells.
- Max-offer formulas are unchanged in form but use per-exit `k`, `ff` and `mg`. Everything is still linear in land price, so the solve is exact. `verify.py` proves it for 170 cases.

**Answer**
- `verdict`: Strong ≥ 1.15 × asking; Works ≥ asking; Negotiate ≥ 0.80 × asking; else Pass (thresholds on Assumptions).
- `conf`: High = location rules tested and ≥ 3 fields from data; Medium = tested; Low = untested rules.
- `verify` shows the untested rule text.
- `flags` adds: demand cap, rezoning, state wastewater permit, public water system, sewer unlock, floodplain share, over 5 years to exit.
- `rankkey` drops non-org uses to the bottom when Ranking = "My uses".

## Prefilled proformas per parcel and org

When a parcel is opened (or arrives through land search), run the engine for the org and store `engine_runs` / `engine_results`. Show Best_Use, defaulting to **My uses** for orgs that set their development types. For each of the org's uses that passes the gates, generate a proforma (`proformas.cps`) for its best exit. Others are generated on click.

A prefilled proforma (`Proforma` tab) contains:
- **Header**: verdict, max and opening offer, best exit, confidence, flags.
- **Inputs used** with source.
- **Site and yield.**
- **Development budget** by cost code: quantity, unit cost, total, canonical field.
- **Operating statement** and permanent loan.
- **Exit table**: revenue, cost, profit, months, required margin, max offer.
- **Monthly cash flow** (120 months): land, carry, development spend, sell-out revenue or lease-up NOI ramp and sale, construction loan draws, interest, payoff. Reports unlevered and levered IRR, equity multiple, peak equity and remaining loan balance (0 = fully repaid).

Edits:
- The user can change any input or budget line. The edit is stored in `proformas.edits` (Deal layer) and the proforma recalculates.
- On save, edits become `Projection`-quality records for the org (lowest learning weight). When the deal closes or is built, actuals uploaded to Deal_History replace them at full weight.

Offers come from the engine's factor-based solve, so ranking thousands of parcels is cheap. The cash flow is for review and returns. If Phase 4's full cash-flow engine replaces the factors, solve the max offer on it by bisection, and keep the plug-back test.

## Upload and learning

**Pipeline**

1. **Upload**: xlsx, csv or pdf. Ask for kind, deal location (county), use, as-of date and data quality if not found in the file.
2. **Parse**: every labeled number → `upload_lines` (sheet, cell, label, value, surrounding headers).
3. **Map**: the AI proposes a canonical field for each line with a confidence score. Prompt it with `canonical.py` (fields, units, synonyms) plus the org's `mapping_memory`, and require structured output: `{line_id, canonical_field | null, confidence, unit_detected, quantity_basis, reasoning}`.
   - ≥ 0.90 auto-accepts.
   - 0.50–0.90 asks the user.
   - < 0.50 the user maps it or leaves it unmapped.
   - Confirmed mappings go into `mapping_memory`.
4. **Normalize** (deterministic):
   - Monthly → annual.
   - Lump sum → per unit by the cost code's quantity basis (acres from the deal, lots, LF, systems).
   - Divide by the deal location's index (cost, price or rent, by field type).
   - Escalate to the valuation date at `esc` per year.
   - Record every step in `mappings.normalization`.
5. **Commit**: cost codes → `cost_records`; use fields → use-level records; comps → `market_data` (local, not indexed); outcomes → `deal_history`.
6. **Learn** (a job after each commit; formulas match the workbook):
   - Weight per record: w = quality weight (Actual 1.0, Bid 0.8, Estimate 0.5, Projection 0.3) × 0.5^(age in years ÷ half-life of 3).
   - Learned value = (Σ w·x + K·default) ÷ (Σ w + K), with K = 3. One good record moves the value about a quarter of the way; about three move it halfway; it converges to the org's own number. See `Cost_Library` columns H–J with `Cost_Records`.
   - Use fields: same formula into `org_overrides`.
   - Estimating bias: mean cost overrun on Deal_History deals with actuals, shrunk toward 0 by K. It's applied to horizontal and vertical (`Org_Profile`). Show it to the user, and let them turn it off.
   - Pooled benchmark (opt-in orgs only): median by region × use × field, published only at ≥ 5 records from ≥ 3 orgs.
7. **Re-run** affected parcels the org has saved and show what changed ("max offer on Smith tract +$42K after your Sears Rd actuals").

**What the data supports, in order**: cost calibration (day 1), org revenue and absorption from their own deals (tens), estimating-bias correction (tens of deals with actuals), comparable-deal lookup (tens), predictive deal scoring (hundreds of labeled outcomes; don't promise it until then). Deals passed on, with the reason, are labeled outcomes too.

## API sketch

```
POST /parcels/{id}/screen?org={org}           -> engine_run: ranked uses (Best_Use)
GET  /runs/{run}/proformas/{use}?exit=best    -> Canonical Proforma Schema JSON (+ monthly cash flow)
PATCH /proformas/{id}  {edits}                -> recalculated proforma
POST /uploads  (file, kind, region, use, as_of, quality)
GET  /uploads/{id}/mappings                   -> proposed mappings with confidence
POST /uploads/{id}/mappings/confirm           -> commit -> learning job -> re-run saved parcels
GET  /orgs/{org}/learned                      -> org overrides, cost learning, bias, with record counts
```

## Tests

`verify.py` must stay green, and the code port must reproduce `fixtures/*.json` to $1 for every column. Variants:

| Variant | Exercises |
|---|---|
| `base` | The sample parcel |
| `sewer` | Sewer at site |
| `collin` | Localized revenue and market data |
| `city_zoned` | City zoning with rezoning limited to certain classes |
| `houston` | City-level "no zoning" override |
| `deed` | Deed restrictions on MH and RV |
| `easement` | Private easement access |
| `florida` | Unknown county; state and national fallback |
| `big` | 200 ac, corner, high traffic, sewer |
| `high` | High cost scenario |

Required tests in code:
- **Golden**: every variant, every column.
- **Plug-back**: every variant × use × exit with a positive max offer returns exactly the required margin.
- **Gates**: each gate produces the right binding text.
- **Resolution**: fallback and source level per field.
- **Learning**: shrinkage numbers match `Cost_Library` H–J for the example records.
- **Edge cases**: zero buildable, cap 0, no allowed exits, demand below one unit, timeline over 120 months.

## What the sample parcel shows now

20 ac in unincorporated Grayson County, septic, public water, $300K asking, ag valuation in place:
- **What works:** homesites / finished lots by lot sale (~$575–656K max), 55+ and entry-level lots, the leisure campground (~$485K, with a state wastewater permit), and boat & RV storage (~$454K, limited by demand to 187 stalls).
- **Rental communities on septic** (MHC, tiny homes, workforce RV) are limited by gal/day and show "Unlock: sewer or package plant allows ~N". With sewer at the site, homesites roughly double and townhomes lead (~$1.6M).
- **Localization works:** the same parcel in Collin ranks very differently, now that revenue moves with location.
- **The supplier build-to-suit false positive is gone** (no major employer within 10 mi).

All numbers remain placeholders.

## Still to build (Ryan)

- **Per-product market data.** One price index per county moves MH homes and stick-built homes together. Fill `Market_Data` by use first for the active markets.
- **Phasing and mixed use.** Large tracts: frontage pads + back-land residential, built in phases. Run the engine per sub-area and add up the results.
- **Stackable uses.** The cell tower (and billboards, solar on unused acres) should add to the best use, not compete with it.
- **Multifamily module.** Unit mix, structured parking, draws with interest reserve, concessions, Texas reassessment at stabilization, LP/GP waterfall, refi vs. sale.
- **Machine-test the remaining location rules** as data layers arrive. Each one moves a use from Low to Medium confidence.
- **Sensitivity.** Low/Base/High plus a tornado on rent, cost, cap, absorption.
- **Existing-property acquisition** (rent roll, T-12, value-add): recommendation is still out of scope; stay with land.

## Build order

| Phase | Scope | Done when |
|---|---|---|
| 1. Engine port | Regions, use and cost libraries, Use_Effective resolution, Engine, Best_Use, Proforma (incl. cash flow) | Golden + plug-back + gate tests pass for all variants |
| 2. Location data | Census, FHWA, FEMA, SSURGO, HIFLD, utility service areas, zoning crosswalk for active counties, tax and transfer data by state | Any U.S. parcel screens with every location value sourced or explicitly defaulted |
| 3. Real numbers | Trent's deals (Short Road, Sears Rd, Wright Road, Ridge Stone costs) as the first org; market data for Texas metros | No active-market line on a placeholder |
| 4. Upload + learning | Parse → map → review → normalize → commit → learn → re-run; Deal_History import | A third-party proforma imports with ≤ 5 lines to review; learned values match the workbook formulas |
| 5. Cash flow + MF module | Full schedule as the offer engine (bisection solve), MF detail | MF output within 5% of a prospect's own model |
| 6. Offers | Opening and max offer into the automated-offer step | Offer letters generate from the ranking |

## Open decisions

- Required margin by engine and the 5%-per-year time premium (placeholders).
- Verdict thresholds (1.15× / 0.80×).
- Which licensed cost index and comp providers to buy for national coverage.
- Zoning crosswalk: build per county as users arrive, or buy a national zoning dataset.
- Pooled-benchmark minimums and opt-in contract language.
- Whether the org's estimating bias applies by default or only after the user turns it on.

## Working on this in Claude Code

A good first prompt:

> Read docs/proforma/BUILD_GUIDE.md, build_v3.py, uses.py, regions.py and canonical.py. Port the ENG steps, the location resolution (Location tab) and the Use_Effective priority rules into a typed proforma engine module in our stack, with uses, regions and cost codes as seed data and schema.sql as the starting data model. Make the tests reproduce fixtures/*.json to $1 and add the plug-back test for every variant, use and exit. Don't change any formula without flagging it.
