#!/usr/bin/env python3
"""Inspect and query the CDC U.S. Cancer Statistics ASCII download.

The source ZIP contains pipe-delimited TXT files. This script reads directly
from the ZIP so the raw CDC package can stay intact under research/.
"""

from __future__ import annotations

import argparse
import csv
import sys
from collections import Counter
from pathlib import Path
from zipfile import ZipFile


DEFAULT_ZIP = Path("research/public-health/cancer/USCS-1999-2022-ASCII.zip")
DEFAULT_FILE = "BYSITE.TXT"
MISSING_VALUES = {"", ".", "~"}
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


def normalize_name(name: str) -> str:
    if name.upper().endswith(".TXT"):
        return name.upper()
    return f"{name.upper()}.TXT"


def iter_rows(zip_path: Path, filename: str):
    with ZipFile(zip_path) as zf:
        with zf.open(normalize_name(filename)) as raw:
            text = (line.decode("latin1") for line in raw)
            yield from csv.DictReader(text, delimiter="|")


def parse_count(value: str) -> int | None:
    if value in MISSING_VALUES:
        return None
    return int(value)


def parse_float(value: str) -> float | None:
    if value in MISSING_VALUES:
        return None
    return float(value)


def format_value(value):
    if value is None:
        return ""
    return str(value)


def cmd_files(args: argparse.Namespace) -> int:
    with ZipFile(args.zip) as zf:
        for info in zf.infolist():
            print(f"{info.file_size}\t{info.filename}")
    return 0


def cmd_schema(args: argparse.Namespace) -> int:
    counters: dict[str, Counter[str]] = {}
    columns: list[str] | None = None
    row_count = 0
    samples: list[dict[str, str]] = []

    for row in iter_rows(args.zip, args.file):
        if columns is None:
            columns = list(row.keys())
            counters = {name: Counter() for name in columns}
        row_count += 1
        if len(samples) < args.samples:
            samples.append(row)
        for key, value in row.items():
            if len(counters[key]) <= args.max_values:
                counters[key][value] += 1

    if columns is None:
        print("No rows found", file=sys.stderr)
        return 1

    print(f"file\t{normalize_name(args.file)}")
    print(f"rows\t{row_count}")
    print(f"columns\t{'|'.join(columns)}")
    print()
    print("distinct_sample")
    for column in columns:
        values = sorted(counters[column].keys())
        suffix = "" if len(counters[column]) <= args.max_values else " ..."
        print(f"{column}\t{', '.join(values[:args.max_values])}{suffix}")

    print()
    print("sample_rows")
    print("\t".join(columns))
    for row in samples:
        print("\t".join(row.get(column, "") for column in columns))
    return 0


def row_matches(row: dict[str, str], args: argparse.Namespace) -> bool:
    filters = {
        "YEAR": args.year,
        "EVENT_TYPE": args.event,
        "RACE": args.race,
        "SEX": args.sex,
        "SITE": args.site,
        "AGE": args.age,
        "AREA": args.area,
    }
    return all(expected is None or row.get(column) == expected for column, expected in filters.items())


def cmd_query(args: argparse.Namespace) -> int:
    rows = []
    for row in iter_rows(args.zip, args.file):
        if row_matches(row, args):
            rows.append(row)
            if len(rows) >= args.limit:
                break

    if not rows:
        print("No rows matched.", file=sys.stderr)
        return 1

    columns = args.columns or list(rows[0].keys())
    print("\t".join(columns))
    for row in rows:
        print("\t".join(row.get(column, "") for column in columns))
    return 0


def cmd_top_sites(args: argparse.Namespace) -> int:
    rows = []
    for row in iter_rows(args.zip, "BYSITE.TXT"):
        if not row_matches(row, args):
            continue
        if args.exclude_groups and row["SITE"] in GROUP_SITES:
            continue
        count = parse_count(row["COUNT"])
        if count is None:
            continue
        rows.append(
            {
                "year": row["YEAR"],
                "race": row["RACE"],
                "sex": row["SEX"],
                "site": row["SITE"],
                "event_type": row["EVENT_TYPE"],
                "count": count,
                "age_adjusted_rate": parse_float(row["AGE_ADJUSTED_RATE"]),
                "ci_lower": parse_float(row["AGE_ADJUSTED_CI_LOWER"]),
                "ci_upper": parse_float(row["AGE_ADJUSTED_CI_UPPER"]),
                "population": parse_count(row["POPULATION"]),
            }
        )

    rows.sort(key=lambda item: item["count"], reverse=True)
    columns = [
        "year",
        "sex",
        "race",
        "site",
        "event_type",
        "count",
        "age_adjusted_rate",
        "ci_lower",
        "ci_upper",
        "population",
    ]
    print("\t".join(columns))
    for row in rows[: args.limit]:
        print("\t".join(format_value(row[column]) for column in columns))
    return 0


def add_common_filters(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--year")
    parser.add_argument("--event")
    parser.add_argument("--race")
    parser.add_argument("--sex")
    parser.add_argument("--site")
    parser.add_argument("--age")
    parser.add_argument("--area")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zip", type=Path, default=DEFAULT_ZIP)
    subparsers = parser.add_subparsers(dest="command", required=True)

    files = subparsers.add_parser("files", help="List files inside the CDC ZIP.")
    files.set_defaults(func=cmd_files)

    schema = subparsers.add_parser("schema", help="Show columns, sampled values, and first rows.")
    schema.add_argument("file", nargs="?", default=DEFAULT_FILE)
    schema.add_argument("--samples", type=int, default=5)
    schema.add_argument("--max-values", type=int, default=24)
    schema.set_defaults(func=cmd_schema)

    query = subparsers.add_parser("query", help="Print matching rows from a TXT file.")
    query.add_argument("file", nargs="?", default=DEFAULT_FILE)
    query.add_argument("--limit", type=int, default=25)
    query.add_argument("--columns", nargs="+")
    add_common_filters(query)
    query.set_defaults(func=cmd_query)

    top_sites = subparsers.add_parser("top-sites", help="Rank BYSITE rows by COUNT.")
    top_sites.add_argument("--limit", type=int, default=15)
    top_sites.add_argument("--exclude-groups", action="store_true")
    add_common_filters(top_sites)
    top_sites.set_defaults(func=cmd_top_sites)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
