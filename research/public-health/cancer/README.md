# CDC U.S. Cancer Statistics ASCII Data

## Source

- Source page: `https://www.cdc.gov/united-states-cancer-statistics/dataviz/data-tables.html`
- Local raw package: `USCS-1999-2022-ASCII.zip`
- CDC package label: `1999-2022`
- Downloaded on: `2026-04-23`
- CDC page date observed: `2025-06-09`

CDC describes these as pre-analyzed U.S. Cancer Statistics data tables in delimited ASCII format. The source page says the data are for statistical reporting and analysis, and requests citation because the reports are public-domain materials.

## Important Coverage Detail

The ZIP filename says `1999-2022`, but the included SAS import program states:

- Incidence data: `1999-2022`
- Mortality data: `1999-2023`

Do not infer coverage from the ZIP filename alone. Query the `YEAR` and `EVENT_TYPE` columns directly.

## ZIP Contents

The raw ZIP currently contains these files:

```text
BYSITE.TXT
CHILDBYAGE_ADJ.TXT
CHILDBYSITE.TXT
Data Dictionary USCS ASCII Nov_2024 submission.xlsx
ICCCBYAGE_ADJ.TXT
ICCCBYSITE.TXT
USCS_ascii_input_program_2025.sas
BRAINBYSITE.TXT
BYAGE.TXT
BYAREA.TXT
BYAREA_COUNTY.TXT
```

The SAS import program mentions `CHILDBYAGE_CR` and `ICCCBYAGE_CR`, but those TXT files are not present in this ZIP.

## Core Schemas

`BYSITE.TXT` is the best first source for national cancer-site charts.

```text
YEAR|RACE|SEX|SITE|EVENT_TYPE|AGE_ADJUSTED_CI_LOWER|AGE_ADJUSTED_CI_UPPER|AGE_ADJUSTED_RATE|COUNT|POPULATION
```

`BYAGE.TXT` supports age filters.

```text
AGE|CI_LOWER|CI_UPPER|COUNT|EVENT_TYPE|POPULATION|RACE|RATE|SEX|SITE|YEAR
```

`BYAREA.TXT` supports state or national-area filters.

```text
AREA|AGE_ADJUSTED_CI_LOWER|AGE_ADJUSTED_CI_UPPER|AGE_ADJUSTED_RATE|COUNT|EVENT_TYPE|POPULATION|RACE|SEX|SITE|YEAR
```

`BYAREA_COUNTY.TXT` is the county-level extension and is the largest file in the ZIP.

## Local Query Tool

Use the repo-local parser:

```bash
python3 tools/public_health/uscs_query.py files
python3 tools/public_health/uscs_query.py schema BYSITE --samples 3
python3 tools/public_health/uscs_query.py schema BYAGE --samples 3
python3 tools/public_health/uscs_query.py schema BYAREA --samples 3
```

Example: top U.S. cancer mortality sites, all races, all sexes, 2023:

```bash
python3 tools/public_health/uscs_query.py top-sites --year 2023 --event Mortality --race "All Races" --sex "Male and Female" --exclude-groups --limit 12
```

Example total cancer deaths, all races, all sexes, 2023:

```bash
python3 tools/public_health/uscs_query.py query BYSITE --year 2023 --event Mortality --race "All Races" --sex "Male and Female" --site "All Cancer Sites Combined"
```

Observed output for the total row:

```text
2023 | All Races | Male and Female | All Cancer Sites Combined | Mortality | age-adjusted rate 141.5 | count 613349 | population 334914895
```

## Modeling Notes For Mortality Explorer

- `EVENT_TYPE` must be filtered explicitly because the same files mix `Incidence` and `Mortality`.
- `SEX` includes `Female`, `Male`, and `Male and Female`.
- `RACE` categories changed for mortality after 2018 according to the SAS notes; compare race trends carefully across the boundary.
- `BYAGE.TXT` supports 5-year age bands such as `25-29`, `30-34`, through `85+`; the current frontend cancer slice uses these bins.
- `BYAREA.TXT` supports state/national area slices, and `BYAREA_COUNTY.TXT` supports county slices. The current frontend location filter uses `BYAREA.TXT` for state-level all-ages age-adjusted slices; county slices are still not wired.
- Some `SITE` rows are rollups, such as `Digestive System`, `Respiratory System`, and `All Cancer Sites Combined`. Exclude these when ranking specific cancer sites.
- Some sex-specific sites also appear in the combined-sex view, for example `Female Breast`, `Male and Female Breast`, and `Prostate`. The explorer should make that distinction visible rather than silently merge them.
- Missing or suppressed values appear as `.` or `~`.
