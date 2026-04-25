#!/usr/bin/env python3
"""Build frontend leading-cause slices from local DuckDB NCHS mortality data."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

import duckdb


DEFAULT_DB = Path("research/public-health/local-data/public_health.duckdb")
OUTPUT = Path("src/data/wellbing/leadingCausesBySlice2024.js")
YEAR = 2024
COLORS = {
    "Heart disease": "#fb7185",
    "Cancer": "#38bdf8",
    "Unintentional injuries": "#f59e0b",
    "Stroke": "#8b5cf6",
    "Chronic lower respiratory diseases": "#2dd4bf",
    "Alzheimer disease": "#94a3b8",
    "Diabetes mellitus": "#f97316",
    "Kidney disease": "#06b6d4",
    "Chronic liver disease and cirrhosis": "#84cc16",
    "Suicide": "#facc15",
    "All other causes": "#475569",
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
CAUSE_ORDER = [
    "Heart disease",
    "Cancer",
    "Unintentional injuries",
    "Stroke",
    "Chronic lower respiratory diseases",
    "Alzheimer disease",
    "Diabetes mellitus",
    "Kidney disease",
    "Chronic liver disease and cirrhosis",
    "Suicide",
]


def icd_letter_number(code: str) -> tuple[str, int] | None:
    code = code.strip().upper()
    if not code:
        return None
    letter = code[0]
    digits = "".join(ch for ch in code[1:] if ch.isdigit())
    if not digits:
        return None
    return letter, int(digits[:2])


def is_letter_range(code: str, letter: str, start: int, end: int) -> bool:
    parsed = icd_letter_number(code)
    return parsed is not None and parsed[0] == letter and start <= parsed[1] <= end


def is_icd(code: str, exact: str) -> bool:
    return code.strip().upper().startswith(exact)


def classify_underlying_cause(code: str) -> str:
    code = code.strip().upper()
    parsed = icd_letter_number(code)
    if parsed is None:
        return "All other causes"
    letter, number = parsed

    if letter == "C" and 0 <= number <= 97:
        return "Cancer"
    if (
        is_letter_range(code, "I", 0, 9)
        or is_icd(code, "I11")
        or is_icd(code, "I13")
        or is_letter_range(code, "I", 20, 51)
    ):
        return "Heart disease"
    if is_letter_range(code, "I", 60, 69):
        return "Stroke"
    if is_letter_range(code, "J", 40, 47):
        return "Chronic lower respiratory diseases"
    if is_icd(code, "G30"):
        return "Alzheimer disease"
    if is_letter_range(code, "E", 10, 14):
        return "Diabetes mellitus"
    if (
        is_letter_range(code, "N", 0, 7)
        or is_letter_range(code, "N", 17, 19)
        or is_letter_range(code, "N", 25, 27)
    ):
        return "Kidney disease"
    if is_icd(code, "K70") or is_letter_range(code, "K", 73, 74):
        return "Chronic liver disease and cirrhosis"
    if is_icd(code, "U03") or is_letter_range(code, "X", 60, 84) or is_icd(code, "Y870"):
        return "Suicide"
    if (
        is_letter_range(code, "V", 1, 99)
        or is_letter_range(code, "W", 0, 99)
        or is_letter_range(code, "X", 0, 59)
        or is_icd(code, "Y86")
        or is_icd(code, "Y85")
    ):
        return "Unintentional injuries"

    return "All other causes"


AGE_CODE_TO_KEY = {
    code: age_key
    for age_key, codes in AGE_MAP.items()
    if codes is not None
    for code in codes
}
SEX_CODE_TO_KEY = {value: key for key, value in SEX_MAP.items() if value is not None}
RACE_CODE_TO_KEY = {value: key for key, value in RACE_MAP.items() if value is not None}


def iter_grouped_mortality_rows(db_path: Path):
    con = duckdb.connect(str(db_path), read_only=True)
    try:
        yield from con.execute(
            """
            SELECT icd10, sex, hispanic_race, age52, count(*) AS deaths
            FROM nchs_mortality_2024
            GROUP BY icd10, sex, hispanic_race, age52
            """
        ).fetchall()
    finally:
        con.close()


def build_slices(db_path: Path) -> list[dict]:
    counters = {
        f"{sex}|{race}|{age}": Counter()
        for race in RACE_MAP
        for sex in SEX_MAP
        for age in AGE_MAP
    }

    for icd10, sex_code, race_code, age_code, deaths in iter_grouped_mortality_rows(db_path):
        cause = classify_underlying_cause(icd10)
        sex_keys = ["all"]
        race_keys = ["all"]
        age_keys = ["allAges"]
        sex_keys.extend([SEX_CODE_TO_KEY[sex_code]] if sex_code in SEX_CODE_TO_KEY else [])
        race_keys.extend([RACE_CODE_TO_KEY[race_code]] if race_code in RACE_CODE_TO_KEY else [])
        age_keys.extend([AGE_CODE_TO_KEY[age_code]] if age_code in AGE_CODE_TO_KEY else [])
        for race in race_keys:
            for sex in sex_keys:
                for age in age_keys:
                    counters[f"{sex}|{race}|{age}"][cause] += deaths

    slices = []
    for key, counter in counters.items():
        sex, race, age = key.split("|")
        total_deaths = sum(counter.values())
        ordered = []
        for cause in CAUSE_ORDER:
            deaths = counter[cause]
            ordered.append(
                {
                    "name": cause,
                    "deaths": deaths,
                    "percentage": round((deaths / total_deaths) * 100, 1) if total_deaths else 0,
                    "color": COLORS[cause],
                }
            )
        ordered.sort(key=lambda item: item["deaths"], reverse=True)
        all_other = counter["All other causes"]
        ordered.append(
            {
                "name": "All other causes",
                "deaths": all_other,
                "percentage": round((all_other / total_deaths) * 100, 1) if total_deaths else 0,
                "color": COLORS["All other causes"],
            }
        )
        slices.append(
            {
                "key": key,
                "sex": sex,
                "race": race,
                "ageGroup": age,
                "year": YEAR,
                "totalDeaths": total_deaths,
                "causes": ordered,
            }
        )
    return slices


def js_value(value):
    if isinstance(value, str):
        return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return str(value)


def write_js(slices: list[dict]) -> None:
    lines = [
        "export const leadingCausesBySlice2024Source = {",
        '  label: "CDC/NCHS Multiple Cause-of-Death Public Use File, 2024",',
        '  url: "https://www.cdc.gov/nchs/nvss/mortality_public_use_data.htm",',
        '  accessed: "2026-04-23",',
        '  notes: "Derived locally from DuckDB table nchs_mortality_2024, built from mort2024us.zip, using the underlying ICD-10 cause field and NCHS leading-cause group definitions.",',
        "};",
        "",
        "export const leadingCausesBySlice2024 = {",
    ]
    for slice_data in slices:
        lines.append(f'  "{slice_data["key"]}": {{')
        for field in ["sex", "race", "ageGroup", "year", "totalDeaths"]:
            lines.append(f"    {field}: {js_value(slice_data[field])},")
        lines.append("    causes: [")
        for cause in slice_data["causes"]:
            parts = ", ".join(f"{field}: {js_value(cause[field])}" for field in ["name", "deaths", "percentage", "color"])
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
    print(f"Wrote {OUTPUT} with {len(slices)} population slices.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
