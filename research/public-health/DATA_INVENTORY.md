# Public Health Data Inventory

This file lists the public-health datasets that the current site either uses now or should use next, along with the primary official source to fetch from.

## Current Data-Backed Sections

### Leading Causes of Death

- Site area: `/wellbing/cause-of-death`
- Local data file: `src/data/wellbing/leadingCausesOfDeath2024.js`
- Primary source: CDC NCHS Data Brief 548
- URL: `https://www.cdc.gov/nchs/data/databriefs/db548.pdf`
- Coverage: United States final mortality data, 2024; top 10 causes of death plus all other causes

### Accidental / Unintentional Injury Causes

- Site area: `/wellbing/cause-of-death`
- Local data file: `src/data/wellbing/accidentalDeathCauses.js`
- Primary source: CDC WISQARS Fatal Injury Data
- URL: `https://wisqars.cdc.gov/reports/`
- Coverage: fatal injury mechanism breakdowns by age, sex, race, ethnicity, geography, and year
- Notes: best source for injury mechanism detail; should be used instead of trying to force all injury detail out of a leading-causes table

### Cancer Death Causes

- Site area: `/wellbing/cause-of-death`
- Local data file: `src/data/wellbing/cancerDeathCauses.js`
- Local raw package: `research/public-health/cancer/USCS-1999-2022-ASCII.zip`
- Local schema notes: `research/public-health/cancer/README.md`
- Local query tool: `tools/public_health/uscs_query.py`
- Frontend slice: `src/data/wellbing/uscsCancerMortality2023.js`, generated with 990 slices: national `sex × race × age` slices with 5-year age bands plus state-level `sex × race × all-ages` slices
- Primary source: CDC U.S. Cancer Statistics Download Data Tables
- URL: `https://www.cdc.gov/united-states-cancer-statistics/dataviz/data-tables.html`
- Coverage: pre-analyzed U.S. cancer incidence data for 1999-2022 and mortality data for 1999-2023, including cancer site, race, sex, age, state, and county tables
- Presentation support: American Cancer Society Cancer Facts & Figures 2025
- URL: `https://www.cancer.org/research/cancer-facts-statistics/all-cancer-facts-figures/2025-cancer-facts-figures.html`

### Maternal Mortality

- Site area: not yet wired to a route
- Local data file: `src/data/wellbing/maternalMortality2024.js`
- Primary source: CDC NCHS Maternal Mortality Rates in the United States, 2024
- URL: `https://www.cdc.gov/nchs/data/hestat/hestat113.htm`
- Coverage: final 2024 maternal mortality rate, trend from 2018-2024, and major disparities by race/ethnicity and age

## Data Backbone For Future Filters

### All-Cause Mortality Backbone

- Best source for query semantics: CDC WONDER Multiple Cause of Death
- URL: `https://wonder.cdc.gov/wonder/help/mcd-expanded.html`
- Best source for local reproducible raw processing: NCHS/NVSS Multiple Cause-of-Death public-use files
- URL: `https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Datasets/DVS/mortality/`
- Local raw target: `research/public-health/mortality/mort2024us.zip`
- Local documentation: `research/public-health/mortality/2024-Mortality-Public-Use-File-Documentation.pdf`
- Local fetch script: `tools/public_health/fetch_public_health_data.py`
- Local query tool: `tools/public_health/nchs_mortality_query.py`
- Frontend slice: `src/data/wellbing/leadingCausesBySlice2024.js`, generated with 210 `sex × race × age` slices including 5-year age bands
- Use for:
  - cause
  - sex
  - race
  - ethnicity
  - age group
  - year
- Notes: the 2024 raw ZIP is approximately 143 MiB compressed and is not committed to Git; restore it locally with `python3 tools/public_health/fetch_public_health_data.py mortality-2024 mortality-2024-doc`. Do not query this in the browser; generate compact JS slices locally and ship only the derived frontend dataset.

### Specialty Injury Backbone

- Best source: CDC WISQARS
- URL: `https://wisqars.cdc.gov/reports/`
- Use for:
  - injury mechanism
  - intent
  - age
  - sex
  - race
  - ethnicity
  - geography

### Specialty Cancer Backbone

- Best source: CDC U.S. Cancer Statistics ASCII tables, with SEER + ACS companion materials
- URLs:
  - `https://www.cdc.gov/united-states-cancer-statistics/dataviz/data-tables.html`
  - `https://seer.cancer.gov/statfacts/html/common.html`
  - `https://www.cancer.org/research/cancer-facts-statistics/all-cancer-facts-figures/2025-cancer-facts-figures.html`
- Use for:
  - cancer site
  - sex
  - age
  - state/county
  - race/ethnicity
  - mortality context and presentation-ready tables
