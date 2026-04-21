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
- Primary source: American Cancer Society Cancer Facts & Figures 2025
- URL: `https://www.cancer.org/research/cancer-facts-statistics/all-cancer-facts-figures/2025-cancer-facts-figures.html`
- Supporting source: SEER Cancer Stat Facts
- URL: `https://seer.cancer.gov/statfacts/html/common.html`
- Coverage: national cancer burden and site-specific context for male/female cancer death breakdowns

### Maternal Mortality

- Site area: not yet wired to a route
- Local data file: `src/data/wellbing/maternalMortality2024.js`
- Primary source: CDC NCHS Maternal Mortality Rates in the United States, 2024
- URL: `https://www.cdc.gov/nchs/data/hestat/hestat113.htm`
- Coverage: final 2024 maternal mortality rate, trend from 2018-2024, and major disparities by race/ethnicity and age

## Data Backbone For Future Filters

### All-Cause Mortality Backbone

- Best source: CDC WONDER Multiple Cause of Death
- URL: `https://wonder.cdc.gov/wonder/help/mcd-expanded.html`
- Use for:
  - cause
  - sex
  - race
  - ethnicity
  - age group
  - year
- Notes: best general mortality backbone for future site-wide filters

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

- Best source: SEER + ACS companion materials
- URLs:
  - `https://seer.cancer.gov/statfacts/html/common.html`
  - `https://www.cancer.org/research/cancer-facts-statistics/all-cancer-facts-figures/2025-cancer-facts-figures.html`
- Use for:
  - cancer site
  - sex
  - age
  - race/ethnicity
  - mortality context and presentation-ready tables
