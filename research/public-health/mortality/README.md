# CDC/NCHS General Mortality Raw Data

## Source

- Dataset family: NCHS/NVSS Mortality Multiple Cause-of-Death public-use files
- Source directory: `https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Datasets/DVS/mortality/`
- Documentation page: `https://www.cdc.gov/nchs/nvss/mortality_public_use_data.htm`
- Current local raw target: `mort2024us.zip`
- Documentation file: `2024-Mortality-Public-Use-File-Documentation.pdf`

The 2024 ZIP is approximately 143 MiB compressed and contains a fixed-width public-use record file of about 2.5 GiB. It is intentionally not committed to Git because it exceeds GitHub's normal 100 MiB file limit.

Use the fetch script to restore it locally:

```bash
python3 tools/public_health/fetch_public_health_data.py mortality-2024
```

## Key 2024 Fixed-Width Fields

From the CDC/NCHS 2024 file documentation:

- Sex: location `69`
- Age Recode 52: locations `75-76`
- Age Recode 27: locations `77-78`
- Age Recode 12: locations `79-80`
- Data year: locations `102-105`
- ICD-10 underlying cause: locations `146-149`
- 358 cause recode: locations `150-152`
- 113 cause recode: locations `154-156`
- 39 cause recode: locations `160-161`
- Race Recode 6: location `450`
- Hispanic origin: locations `484-486`
- Hispanic origin/race recode: locations `487-488`

Python slices are zero-based, so field `154-156` is `line[153:156]`.

## Explorer Use

For the website, do not ship this ZIP or its expanded fixed-width file to the browser. The intended flow is:

```text
CDC raw ZIP -> local parser/generator -> small precomputed JS dataset -> React explorer
```

This data source should back the general `Leading causes` explorer filters for `sex`, `race`, and `ageGroup`.

The current generated frontend slice uses `Age Recode 52` for 5-year age bands from `25-29` through `85+`, plus `allAges`. The raw public-use ZIP stays local; the browser imports only the compact generated JS dataset.

State or county filters are not wired yet. Before adding a location control for this source, confirm the relevant geography field in the NCHS public-use documentation and add a parser test for it.
