#!/usr/bin/env python3
"""Build accidental/unintentional injury breakdowns from local DuckDB mortality data."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

import duckdb


DEFAULT_DB = Path("research/public-health/local-data/public_health.duckdb")
OUTPUT = Path("src/data/wellbing/accidentalDeathCauses.js")
YEAR = 2024
SOURCE = {
    "label": "CDC/NCHS Multiple Cause-of-Death Public Use File, 2024",
    "url": "https://www.cdc.gov/nchs/nvss/mortality_public_use_data.htm",
    "accessed": "2026-04-25",
    "notes": "Derived locally from NCHS underlying ICD-10 external-cause codes using CDC ICD-10 external cause-of-injury mortality matrix groupings.",
}
COLORS = {
    "Poisoning": "#38bdf8",
    "Transport": "#fb7185",
    "Falls": "#f59e0b",
    "Suffocation": "#2dd4bf",
    "Drowning": "#8b5cf6",
    "Fire, smoke, and hot substances": "#f97316",
    "Firearm": "#94a3b8",
    "Natural and environmental exposure": "#84cc16",
    "Other specified mechanisms": "#f472b6",
    "Other and unspecified": "#64748b",
}
SEX_MAP = {
    "all": None,
    "male": "M",
    "female": "F",
}
RACE_MAP = {
    "all": None,
    "white": "08",
    "black": "09",
    "aian": "10",
    "asian": "11",
}
AGE_MAP = {
    "allAges": None,
    "25-29": {"31"},
    "30-34": {"32"},
    "35-39": {"33"},
    "40-44": {"34"},
    "45-49": {"35"},
    "50-54": {"36"},
    "55-59": {"37"},
    "60-64": {"38"},
    "65-69": {"39"},
    "70-74": {"40"},
    "75-79": {"41"},
    "80-84": {"42"},
    "85+": {"43", "44", "45", "46", "47", "48", "49", "50", "51"},
}
AGE_CODE_TO_KEY = {
    code: age_key
    for age_key, codes in AGE_MAP.items()
    if codes is not None
    for code in codes
}
SEX_CODE_TO_KEY = {value: key for key, value in SEX_MAP.items() if value is not None}
RACE_CODE_TO_KEY = {value: key for key, value in RACE_MAP.items() if value is not None}


def icd_letter_number(code: str) -> tuple[str, int] | None:
    code = code.strip().upper()
    if not code:
        return None
    letter = code[0]
    digits = "".join(ch for ch in code[1:] if ch.isdigit())
    if not digits:
        return None
    return letter, int(digits[:2])


def in_range(code: str, letter: str, start: int, end: int) -> bool:
    parsed = icd_letter_number(code)
    return parsed is not None and parsed[0] == letter and start <= parsed[1] <= end


def starts(code: str, *prefixes: str) -> bool:
    code = code.strip().upper()
    return any(code.startswith(prefix) for prefix in prefixes)


def is_unintentional_injury(code: str) -> bool:
    code = code.strip().upper()
    return in_range(code, "V", 1, 99) or in_range(code, "W", 0, 99) or in_range(code, "X", 0, 59) or starts(code, "Y85", "Y86")


def classify_mechanism(code: str) -> str:
    code = code.strip().upper()
    if in_range(code, "V", 1, 99) or starts(code, "Y85"):
        return "Transport"
    if in_range(code, "X", 40, 49):
        return "Poisoning"
    if in_range(code, "W", 0, 19):
        return "Falls"
    if in_range(code, "W", 75, 84):
        return "Suffocation"
    if in_range(code, "W", 65, 74):
        return "Drowning"
    if in_range(code, "X", 0, 19):
        return "Fire, smoke, and hot substances"
    if in_range(code, "W", 32, 34):
        return "Firearm"
    if in_range(code, "X", 30, 39):
        return "Natural and environmental exposure"
    if starts(code, "Y86") or in_range(code, "W", 20, 64) or in_range(code, "W", 85, 99) or in_range(code, "X", 20, 39) or in_range(code, "X", 50, 59):
        return "Other specified mechanisms"
    return "Other and unspecified"


def js_value(value):
    if isinstance(value, str):
        return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return str(value)


def build_mechanism_rows(counter: Counter[str]) -> list[dict]:
    total = sum(counter.values())
    rows = []
    for name, deaths in counter.most_common():
        rows.append(
            {
                "name": name,
                "deaths": deaths,
                "percentage": round((deaths / total) * 100, 1) if total else 0,
                "color": COLORS.get(name, "#64748b"),
            }
        )
    return rows


def build_slices(db_path: Path) -> list[dict]:
    con = duckdb.connect(str(db_path), read_only=True)
    try:
        code_counts = con.execute(
            """
            SELECT icd10, sex, hispanic_race, age52, count(*) AS deaths
            FROM nchs_mortality_2024
            GROUP BY icd10, sex, hispanic_race, age52
            """
        ).fetchall()
    finally:
        con.close()

    counters = {
        f"{sex}|{race}|{age}": Counter()
        for race in RACE_MAP
        for sex in SEX_MAP
        for age in AGE_MAP
    }
    for code, sex_code, race_code, age_code, deaths in code_counts:
        if not is_unintentional_injury(code):
            continue
        mechanism = classify_mechanism(code)
        sex_keys = ["all"]
        race_keys = ["all"]
        age_keys = ["allAges"]
        sex_keys.extend([SEX_CODE_TO_KEY[sex_code]] if sex_code in SEX_CODE_TO_KEY else [])
        race_keys.extend([RACE_CODE_TO_KEY[race_code]] if race_code in RACE_CODE_TO_KEY else [])
        age_keys.extend([AGE_CODE_TO_KEY[age_code]] if age_code in AGE_CODE_TO_KEY else [])
        for race in race_keys:
            for sex in sex_keys:
                for age in age_keys:
                    counters[f"{sex}|{race}|{age}"][mechanism] += deaths

    slices = []
    for key, counter in counters.items():
        sex, race, age = key.split("|")
        total_deaths = sum(counter.values())
        slices.append(
            {
                "key": key,
                "sex": sex,
                "race": race,
                "ageGroup": age,
                "year": YEAR,
                "totalDeaths": total_deaths,
                "mechanisms": build_mechanism_rows(counter),
            }
        )
    return slices


def write_js(slices: list[dict]) -> None:
    national = next(slice_data for slice_data in slices if slice_data["key"] == "all|all|allAges")
    lines = [
        "export const accidentalDeathCausesSource = {",
        f'  label: {js_value(SOURCE["label"])},',
        f'  url: {js_value(SOURCE["url"])},',
        f'  accessed: {js_value(SOURCE["accessed"])},',
        f'  notes: {js_value(SOURCE["notes"])},',
        "};",
        "",
        "export const accidentalDeathCauses = [",
    ]
    for row in national["mechanisms"]:
        parts = ", ".join(f"{field}: {js_value(row[field])}" for field in ["name", "deaths", "percentage", "color"])
        lines.append(f"  {{ {parts} }},")
    lines.append("];")
    lines.append("")
    lines.append("export const accidentalDeathCausesBySlice2024 = {")
    for slice_data in slices:
        lines.append(f'  "{slice_data["key"]}": {{')
        for field in ["sex", "race", "ageGroup", "year", "totalDeaths"]:
            lines.append(f"    {field}: {js_value(slice_data[field])},")
        lines.append("    mechanisms: [")
        for row in slice_data["mechanisms"]:
            parts = ", ".join(f"{field}: {js_value(row[field])}" for field in ["name", "deaths", "percentage", "color"])
            lines.append(f"      {{ {parts} }},")
        lines.append("    ],")
        lines.append("  },")
    lines.append("};")
    lines.append("")
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    slices = build_slices(args.db)
    write_js(slices)
    print(f"Wrote {OUTPUT} with {len(slices)} accidental injury population slices.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
