-- Landova proforma engine: reference data model (PostgreSQL + PostGIS).
-- Mirrors Landova_Proforma_v3.xlsx. Adapt names to the app's conventions; keep the concepts:
--   * every location value resolves City > County > State > National with its source level
--   * library and org values are stored at the REFERENCE BASIS (index 1.0) and re-localized at run time
--   * market data is stored LOCAL (already in the region's terms)
--   * every number the engine uses can be traced to a record, a default, or a user edit

CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------- Location hierarchy
CREATE TYPE region_level AS ENUM ('national', 'state', 'county', 'city');

CREATE TABLE regions (
  id          bigserial PRIMARY KEY,
  key         text UNIQUE NOT NULL,          -- 'US', 'TX', 'TX|Grayson', 'TX|Harris|Houston'
  fips        text,                          -- state (2), county (5) or place (7) FIPS
  level       region_level NOT NULL,
  parent_id   bigint REFERENCES regions(id),
  name        text NOT NULL,
  geom        geometry(MultiPolygon, 4326)
);

-- Field registry: one row per location field (cost_idx, taxrate, lot_w, cnty_zoning, ...). Adding a field needs no migration.
CREATE TABLE region_fields (
  field       text PRIMARY KEY,
  kind        text NOT NULL CHECK (kind IN ('number', 'yn', 'text')),
  unit        text,
  description text NOT NULL
);

CREATE TABLE region_values (
  region_id   bigint NOT NULL REFERENCES regions(id),
  field       text   NOT NULL REFERENCES region_fields(field),
  value_num   numeric,
  value_text  text,
  source      text NOT NULL,                 -- citation or 'placeholder'
  as_of       date NOT NULL,
  PRIMARY KEY (region_id, field)
);
-- The national row must carry every field, so resolution always ends with a value.

-- Zoning code -> Landova zoning class, per jurisdiction (filled from municipal GIS + AI-assisted ordinance reading, human-confirmed)
CREATE TABLE zoning_crosswalk (
  region_id     bigint NOT NULL REFERENCES regions(id),
  zoning_code   text   NOT NULL,             -- 'SF-7', 'A-1', 'I-1'
  zclass        text   NOT NULL,             -- AG, RES-SF, RES-ATT, RES-MF, MH, RV, LODG, COM, OFF, IND, INST, UTIL
  by_right      boolean NOT NULL,            -- false = conditional / SUP
  source        text, as_of date,
  PRIMARY KEY (region_id, zoning_code, zclass)
);

-- ---------------------------------------------------------------- Use library (reference basis)
CREATE TABLE use_library_versions (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), notes text);

CREATE TABLE uses (
  id          serial PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  category    text NOT NULL,
  engine      text NOT NULL CHECK (engine IN ('For-Sale', 'Income', 'Operator Pad', 'Land Play')),
  unit        text NOT NULL,
  zclass      text NOT NULL,
  active      boolean DEFAULT true
);

CREATE TABLE use_values (                    -- one row per use x field (the Use_Library columns)
  version_id  int  NOT NULL REFERENCES use_library_versions(id),
  use_id      int  NOT NULL REFERENCES uses(id),
  field       text NOT NULL,
  value_num   numeric,
  value_text  text,
  PRIMARY KEY (version_id, use_id, field)
);

-- ---------------------------------------------------------------- Orgs
CREATE TABLE orgs (id bigserial PRIMARY KEY, name text NOT NULL, pooled_opt_in boolean DEFAULT false);

CREATE TABLE org_use_selection (             -- "development types this org does" -> My uses ranking + prefilled proformas
  org_id  bigint REFERENCES orgs(id), use_id int REFERENCES uses(id), builds boolean NOT NULL,
  PRIMARY KEY (org_id, use_id)
);

CREATE TABLE org_settings (                  -- org-level assumptions (Assumptions tab) and margin by engine
  org_id bigint REFERENCES orgs(id), key text, value_num numeric, value_text text,
  PRIMARY KEY (org_id, key)
);

-- Learner output: an org's number for a use field, at reference basis
CREATE TABLE org_overrides (
  org_id      bigint NOT NULL REFERENCES orgs(id),
  use_id      int    NOT NULL REFERENCES uses(id),
  field       text   NOT NULL,
  value_ref   numeric NOT NULL,
  n_eff       numeric NOT NULL,              -- effective records after quality and recency weighting
  source      text NOT NULL,
  computed_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, use_id, field)
);

-- ---------------------------------------------------------------- Market data (local terms)
CREATE TABLE market_data (
  id          bigserial PRIMARY KEY,
  region_id   bigint NOT NULL REFERENCES regions(id),
  use_id      int    NOT NULL REFERENCES uses(id),
  field       text   NOT NULL,               -- saleprice, lotprice, rent, cap, landac, absorb, ...
  value_local numeric NOT NULL,
  n_records   int NOT NULL,
  n_orgs      int NOT NULL DEFAULT 1,
  layer       text NOT NULL CHECK (layer IN ('landova_comps', 'pooled')),
  as_of       date NOT NULL,
  source      text NOT NULL
);
-- Pooled rows are used only when n_records >= 5 AND n_orgs >= 3 (org_settings can't lower this).

-- ---------------------------------------------------------------- Costs
CREATE TABLE cost_codes (code text PRIMARY KEY, item text NOT NULL, unit text NOT NULL, low numeric, base numeric, high numeric);

CREATE TABLE cost_records (
  id              bigserial PRIMARY KEY,
  org_id          bigint NOT NULL REFERENCES orgs(id),
  code            text   NOT NULL REFERENCES cost_codes(code),
  raw_unit_cost   numeric NOT NULL,
  region_id       bigint NOT NULL REFERENCES regions(id),
  as_of           date   NOT NULL,
  quality         text   NOT NULL CHECK (quality IN ('Actual', 'Bid', 'Estimate', 'Projection')),
  location_index  numeric NOT NULL,          -- cost_idx resolved for region_id at ingest
  normalized_cost numeric NOT NULL,          -- raw / location_index x (1+esc)^(years to valuation date)
  deal_id         bigint,
  mapping_id      bigint,                    -- the upload line it came from
  pooled_opt_in   boolean DEFAULT false
);

-- ---------------------------------------------------------------- Parcels, runs, proformas
CREATE TABLE parcels (id bigserial PRIMARY KEY, apn text, county_fips text, place_fips text, geom geometry(MultiPolygon, 4326));

CREATE TABLE parcel_facts (                  -- every Parcel-tab input, with where it came from
  parcel_id   bigint REFERENCES parcels(id),
  field       text,
  value_num   numeric, value_text text,
  source      text NOT NULL,                 -- data layer name, or 'user'
  as_of       date,
  PRIMARY KEY (parcel_id, field, source)
);

CREATE TABLE engine_runs (
  id                 bigserial PRIMARY KEY,
  parcel_id          bigint REFERENCES parcels(id),
  org_id             bigint REFERENCES orgs(id),
  engine_version     text NOT NULL,
  use_library_version int  REFERENCES use_library_versions(id),
  inputs_hash        text NOT NULL,          -- resolved inputs; same hash = same answer
  asking             numeric,
  created_at         timestamptz DEFAULT now()
);

CREATE TABLE engine_results (                -- one row per run x use (the Engine tab row)
  run_id      bigint REFERENCES engine_runs(id),
  use_id      int    REFERENCES uses(id),
  capacity    numeric, binding text, best_exit text, months numeric,
  max1 numeric, max2 numeric, max3 numeric, best numeric, opening numeric,
  verdict     text, confidence text, flags text, verify text,
  row         jsonb NOT NULL,                -- every engine column, for audit and the proforma view
  PRIMARY KEY (run_id, use_id)
);

CREATE TABLE proformas (                     -- prefilled for parcel x use, then edited by the user
  id            bigserial PRIMARY KEY,
  run_id        bigint REFERENCES engine_runs(id),
  use_id        int REFERENCES uses(id),
  exit          smallint CHECK (exit IN (1, 2, 3)),
  land_price    numeric,
  edits         jsonb DEFAULT '{}',          -- canonical field -> user value (Deal layer, top priority)
  cps           jsonb NOT NULL,              -- the Canonical Proforma Schema document
  status        text DEFAULT 'draft'
);

-- ---------------------------------------------------------------- Uploads and learning
CREATE TABLE uploads (
  id          bigserial PRIMARY KEY,
  org_id      bigint REFERENCES orgs(id),
  filename    text NOT NULL,
  kind        text CHECK (kind IN ('proforma', 'budget', 'bid', 'rent_roll', 't12', 'deal_history', 'comps')),
  region_id   bigint REFERENCES regions(id), -- deal location (asked for if not found in the file)
  use_id      int REFERENCES uses(id),
  as_of       date,
  quality     text,
  status      text DEFAULT 'parsing',        -- parsing -> mapping -> review -> committed
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE upload_lines (                  -- every labeled value found in the file
  id          bigserial PRIMARY KEY,
  upload_id   bigint REFERENCES uploads(id),
  sheet       text, cell_ref text,
  raw_label   text, raw_value numeric, raw_text text,
  context     jsonb                          -- section header, neighbors, row/column labels
);

CREATE TABLE mappings (
  id               bigserial PRIMARY KEY,
  upload_line_id   bigint REFERENCES upload_lines(id),
  canonical_field  text,                     -- from canonical.py; null = unmapped
  confidence       numeric NOT NULL,
  status           text NOT NULL CHECK (status IN ('auto', 'needs_review', 'confirmed', 'rejected', 'unmapped')),
  normalization    jsonb,                    -- steps: x12, / quantity basis, / location index, escalation
  normalized_value numeric,
  decided_by       bigint, decided_at timestamptz
);

CREATE TABLE mapping_memory (                -- confirmed label -> field, per org; fed back to the mapper
  org_id          bigint REFERENCES orgs(id),
  label_norm      text,                      -- lowercased, numbers stripped
  canonical_field text,
  times_confirmed int DEFAULT 1,
  PRIMARY KEY (org_id, label_norm, canonical_field)
);

CREATE TABLE deal_history (
  id            bigserial PRIMARY KEY,
  org_id        bigint REFERENCES orgs(id),
  deal_ref      text, region_id bigint REFERENCES regions(id), use_id int REFERENCES uses(id),
  date_underwritten date, gross_acres numeric, capacity numeric, land_price numeric,
  decision      text CHECK (decision IN ('Bought', 'Passed', 'Lost to other buyer')),
  reason_passed text,
  h_projected numeric, h_actual numeric, v_projected numeric, v_actual numeric,
  rev_projected numeric, rev_actual numeric, noi_projected numeric, noi_actual numeric,
  months_projected numeric, months_actual numeric,
  quality       text, engine_run_id bigint REFERENCES engine_runs(id), upload_id bigint REFERENCES uploads(id)
);
