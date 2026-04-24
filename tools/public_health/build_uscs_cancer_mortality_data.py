#!/usr/bin/env python3
"""Build the small frontend cancer mortality slice from the CDC USCS ZIP."""

from __future__ import annotations

import csv
from pathlib import Path
from zipfile import ZipFile


SOURCE_ZIP = Path("research/public-health/cancer/USCS-1999-2022-ASCII.zip")
OUTPUT = Path("src/data/wellbing/uscsCancerMortality2023.js")
YEAR = "2023"
EVENT_TYPE = "Mortality"
LIMIT = 12
MISSING_VALUES = {"", ".", "~"}
COLORS = [
    "#38bdf8",
    "#fb7185",
    "#f59e0b",
    "#2dd4bf",
    "#8b5cf6",
    "#f97316",
    "#94a3b8",
    "#84cc16",
    "#f472b6",
    "#22c55e",
    "#eab308",
    "#a78bfa",
]
AREA_MAP = {
    "alabama": "Alabama",
    "alaska": "Alaska",
    "arizona": "Arizona",
    "arkansas": "Arkansas",
    "california": "California",
    "colorado": "Colorado",
    "connecticut": "Connecticut",
    "delaware": "Delaware",
    "districtOfColumbia": "District of Columbia",
    "florida": "Florida",
    "georgia": "Georgia",
    "hawaii": "Hawaii",
    "idaho": "Idaho",
    "illinois": "Illinois",
    "indiana": "Indiana",
    "iowa": "Iowa",
    "kansas": "Kansas",
    "kentucky": "Kentucky",
    "louisiana": "Louisiana",
    "maine": "Maine",
    "maryland": "Maryland",
    "massachusetts": "Massachusetts",
    "michigan": "Michigan",
    "minnesota": "Minnesota",
    "mississippi": "Mississippi",
    "missouri": "Missouri",
    "montana": "Montana",
    "nebraska": "Nebraska",
    "nevada": "Nevada",
    "newHampshire": "New Hampshire",
    "newJersey": "New Jersey",
    "newMexico": "New Mexico",
    "newYork": "New York",
    "northCarolina": "North Carolina",
    "northDakota": "North Dakota",
    "ohio": "Ohio",
    "oklahoma": "Oklahoma",
    "oregon": "Oregon",
    "pennsylvania": "Pennsylvania",
    "rhodeIsland": "Rhode Island",
    "southCarolina": "South Carolina",
    "southDakota": "South Dakota",
    "tennessee": "Tennessee",
    "texas": "Texas",
    "utah": "Utah",
    "vermont": "Vermont",
    "virginia": "Virginia",
    "washington": "Washington",
    "washingtonDc": "Washington DC",
    "westVirginia": "West Virginia",
    "wisconsin": "Wisconsin",
    "wyoming": "Wyoming",
}
RACE_MAP = {
    "all": "All Races",
    "white": "White, Non-Hispanic",
    "black": "Black, Non-Hispanic",
    "asian": "Asian, Non Hispanic",
    "aian": "American Indian/Alaska Native, Non-Hispanic",
}
SEX_MAP = {
    "all": "Male and Female",
    "male": "Male",
    "female": "Female",
}
AGE_MAP = {
    "allAges": None,
    "25-29": ["25-29"],
    "30-34": ["30-34"],
    "35-39": ["35-39"],
    "40-44": ["40-44"],
    "45-49": ["45-49"],
    "50-54": ["50-54"],
    "55-59": ["55-59"],
    "60-64": ["60-64"],
    "65-69": ["65-69"],
    "70-74": ["70-74"],
    "75-79": ["75-79"],
    "80-84": ["80-84"],
    "85+": ["85+"],
}
GROUP_SITES = {
    "All Cancer Sites Combined",
    "Digestive System",
    "Respiratory System",
    "Male Genital System",
    "Female Genital System",
    "Urinary System",
    "Miscellaneous",
    "Lymphomas",
    "Leukemias",
}


def parse_int(value: str) -> int | None:
    if value in MISSING_VALUES:
        return None
    return int(value)


def parse_float(value: str) -> float | None:
    if value in MISSING_VALUES:
        return None
    return float(value)


def js_value(value):
    if value is None:
        return "null"
    if isinstance(value, str):
        return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return str(value)


def read_bysite_rows() -> list[dict[str, str]]:
    with ZipFile(SOURCE_ZIP) as zf:
        with zf.open("BYSITE.TXT") as raw:
            reader = csv.DictReader((line.decode("latin1") for line in raw), delimiter="|")
            return [row for row in reader if row["YEAR"] == YEAR and row["EVENT_TYPE"] == EVENT_TYPE]


def read_byage_rows() -> list[dict[str, str]]:
    with ZipFile(SOURCE_ZIP) as zf:
        with zf.open("BYAGE.TXT") as raw:
            reader = csv.DictReader((line.decode("latin1") for line in raw), delimiter="|")
            return [row for row in reader if row["YEAR"] == YEAR and row["EVENT_TYPE"] == EVENT_TYPE]


def read_byarea_rows() -> list[dict[str, str]]:
    with ZipFile(SOURCE_ZIP) as zf:
        with zf.open("BYAREA.TXT") as raw:
            reader = csv.DictReader((line.decode("latin1") for line in raw), delimiter="|")
            return [row for row in reader if row["YEAR"] == YEAR and row["EVENT_TYPE"] == EVENT_TYPE]


def calculate_rate(deaths: int | None, population: int | None) -> float | None:
    if deaths is None or population in (None, 0):
        return None
    return round((deaths / population) * 100000, 1)


def add_metrics(site_rows: list[dict], total_deaths: int | None) -> list[dict]:
    site_rows.sort(key=lambda item: item["deaths"], reverse=True)
    for index, row in enumerate(site_rows[:LIMIT]):
        row["color"] = COLORS[index]
        row["percentage"] = round((row["deaths"] / total_deaths) * 100, 1) if total_deaths else 0
    return site_rows[:LIMIT]


def should_skip_site(site: str, sex_key: str) -> bool:
    if site in GROUP_SITES:
        return True
    # In the combined-sex view, this duplicates the broader breast total.
    return sex_key == "all" and site == "Female Breast"


def build_all_age_slice(rows: list[dict[str, str]], sex_key: str, race_key: str) -> dict:
    sex_label = SEX_MAP[sex_key]
    race_label = RACE_MAP[race_key]
    total_row = next(
        row
        for row in rows
        if row["SEX"] == sex_label and row["RACE"] == race_label and row["SITE"] == "All Cancer Sites Combined"
    )
    site_rows = []

    for row in rows:
        if row["SEX"] != sex_label or row["RACE"] != race_label:
            continue
        site = row["SITE"]
        if should_skip_site(site, sex_key):
            continue
        deaths = parse_int(row["COUNT"])
        if deaths is None:
            continue
        site_rows.append(
            {
                "site": site,
                "deaths": deaths,
                "rate": parse_float(row["AGE_ADJUSTED_RATE"]),
                "ciLower": parse_float(row["AGE_ADJUSTED_CI_LOWER"]),
                "ciUpper": parse_float(row["AGE_ADJUSTED_CI_UPPER"]),
                "population": parse_int(row["POPULATION"]),
            }
        )

    total_deaths = parse_int(total_row["COUNT"])
    return {
        "key": f"{sex_key}|{race_key}|allAges",
        "sex": sex_key,
        "race": race_key,
        "ageGroup": "allAges",
        "area": "national",
        "cdcArea": "United States",
        "cdcSex": sex_label,
        "cdcRace": race_label,
        "cdcAge": "All ages",
        "year": int(YEAR),
        "eventType": EVENT_TYPE,
        "rateType": "ageAdjusted",
        "totalDeaths": total_deaths,
        "totalRate": parse_float(total_row["AGE_ADJUSTED_RATE"]),
        "totalCiLower": parse_float(total_row["AGE_ADJUSTED_CI_LOWER"]),
        "totalCiUpper": parse_float(total_row["AGE_ADJUSTED_CI_UPPER"]),
        "population": parse_int(total_row["POPULATION"]),
        "sites": add_metrics(site_rows, total_deaths),
    }


def build_area_slice(rows: list[dict[str, str]], sex_key: str, race_key: str, area_key: str) -> dict:
    sex_label = SEX_MAP[sex_key]
    race_label = RACE_MAP[race_key]
    area_label = AREA_MAP[area_key]
    total_row = next(
        row
        for row in rows
        if row["SEX"] == sex_label
        and row["RACE"] == race_label
        and row["AREA"] == area_label
        and row["SITE"] == "All Cancer Sites Combined"
    )
    site_rows = []

    for row in rows:
        if row["SEX"] != sex_label or row["RACE"] != race_label or row["AREA"] != area_label:
            continue
        site = row["SITE"]
        if should_skip_site(site, sex_key):
            continue
        deaths = parse_int(row["COUNT"])
        if deaths is None:
            continue
        site_rows.append(
            {
                "site": site,
                "deaths": deaths,
                "rate": parse_float(row["AGE_ADJUSTED_RATE"]),
                "ciLower": parse_float(row["AGE_ADJUSTED_CI_LOWER"]),
                "ciUpper": parse_float(row["AGE_ADJUSTED_CI_UPPER"]),
                "population": parse_int(row["POPULATION"]),
            }
        )

    total_deaths = parse_int(total_row["COUNT"])
    return {
        "key": f"{sex_key}|{race_key}|allAges|{area_key}",
        "sex": sex_key,
        "race": race_key,
        "ageGroup": "allAges",
        "area": area_key,
        "cdcArea": area_label,
        "cdcSex": sex_label,
        "cdcRace": race_label,
        "cdcAge": "All ages",
        "year": int(YEAR),
        "eventType": EVENT_TYPE,
        "rateType": "ageAdjusted",
        "totalDeaths": total_deaths,
        "totalRate": parse_float(total_row["AGE_ADJUSTED_RATE"]),
        "totalCiLower": parse_float(total_row["AGE_ADJUSTED_CI_LOWER"]),
        "totalCiUpper": parse_float(total_row["AGE_ADJUSTED_CI_UPPER"]),
        "population": parse_int(total_row["POPULATION"]),
        "sites": add_metrics(site_rows, total_deaths),
    }


def build_age_slice(rows: list[dict[str, str]], sex_key: str, race_key: str, age_key: str) -> dict:
    sex_label = SEX_MAP[sex_key]
    race_label = RACE_MAP[race_key]
    ages = set(AGE_MAP[age_key])
    total_deaths = 0
    total_population = 0
    by_site: dict[str, dict[str, int]] = {}

    for row in rows:
        if row["SEX"] != sex_label or row["RACE"] != race_label or row["AGE"] not in ages:
            continue
        deaths = parse_int(row["COUNT"])
        population = parse_int(row["POPULATION"])
        if deaths is None or population is None:
            continue
        site = row["SITE"]
        if site == "All Cancer Sites Combined":
            total_deaths += deaths
            total_population += population
            continue
        if should_skip_site(site, sex_key):
            continue
        current = by_site.setdefault(site, {"deaths": 0, "population": 0})
        current["deaths"] += deaths
        current["population"] += population

    site_rows = [
        {
            "site": site,
            "deaths": values["deaths"],
            "rate": calculate_rate(values["deaths"], values["population"]),
            "ciLower": None,
            "ciUpper": None,
            "population": values["population"],
        }
        for site, values in by_site.items()
        if values["deaths"] > 0
    ]

    return {
        "key": f"{sex_key}|{race_key}|{age_key}",
        "sex": sex_key,
        "race": race_key,
        "ageGroup": age_key,
        "area": "national",
        "cdcArea": "United States",
        "cdcSex": sex_label,
        "cdcRace": race_label,
        "cdcAge": ", ".join(AGE_MAP[age_key]),
        "year": int(YEAR),
        "eventType": EVENT_TYPE,
        "rateType": "ageSpecificCrude",
        "totalDeaths": total_deaths,
        "totalRate": calculate_rate(total_deaths, total_population),
        "totalCiLower": None,
        "totalCiUpper": None,
        "population": total_population,
        "sites": add_metrics(site_rows, total_deaths),
    }


def write_js(slices: list[dict]) -> None:
    lines = [
        "export const uscsCancerMortality2023Source = {",
        '  label: "CDC U.S. Cancer Statistics ASCII Data Tables, 1999-2022 release",',
        '  url: "https://www.cdc.gov/united-states-cancer-statistics/dataviz/data-tables.html",',
        '  accessed: "2026-04-23",',
        f'  notes: "Derived from BYSITE.TXT, BYAGE.TXT, and BYAREA.TXT where YEAR={YEAR}, EVENT_TYPE=Mortality. Incidence coverage is 1999-2022; mortality coverage is 1999-2023 in the CDC SAS import notes.",',
        "};",
        "",
        "export const uscsCancerMortality2023 = {",
    ]

    for slice_data in slices:
        lines.append(f'  "{slice_data["key"]}": {{')
        for field in [
            "sex",
            "race",
            "ageGroup",
            "area",
            "cdcArea",
            "cdcSex",
            "cdcRace",
            "cdcAge",
            "year",
            "eventType",
            "rateType",
            "totalDeaths",
            "totalRate",
            "totalCiLower",
            "totalCiUpper",
            "population",
        ]:
            lines.append(f"    {field}: {js_value(slice_data[field])},")
        lines.append("    sites: [")
        for site in slice_data["sites"]:
            parts = ", ".join(
                f"{field}: {js_value(site[field])}"
                for field in ["site", "deaths", "percentage", "rate", "ciLower", "ciUpper", "population", "color"]
            )
            lines.append(f"      {{ {parts} }},")
        lines.append("    ],")
        lines.append("  },")
    lines.append("};")
    lines.append("")
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    bysite_rows = read_bysite_rows()
    byage_rows = read_byage_rows()
    byarea_rows = read_byarea_rows()
    slices = []
    for race in RACE_MAP:
        for sex in SEX_MAP:
            slices.append(build_all_age_slice(bysite_rows, sex, race))
            for age in AGE_MAP:
                if age == "allAges":
                    continue
                slices.append(build_age_slice(byage_rows, sex, race, age))
            for area in AREA_MAP:
                slices.append(build_area_slice(byarea_rows, sex, race, area))
    write_js(slices)
    print(f"Wrote {OUTPUT} with {len(slices)} population slices.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
