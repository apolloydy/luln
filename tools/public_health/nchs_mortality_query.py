#!/usr/bin/env python3
"""Query CDC/NCHS mortality public-use fixed-width ZIP files."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
from zipfile import ZipFile


DEFAULT_ZIP = Path("research/public-health/mortality/mort2024us.zip")
FIELDS = {
    "sex": (68, 69),
    "age52": (74, 76),
    "age27": (76, 78),
    "age12": (78, 80),
    "year": (101, 105),
    "icd10": (145, 149),
    "cause358": (149, 152),
    "cause113": (153, 156),
    "cause39": (159, 161),
    "race6": (449, 450),
    "hispanic": (483, 486),
    "hispanic_race": (486, 488),
}


def read_field(line: bytes, field: str) -> str:
    start, end = FIELDS[field]
    return line[start:end].decode("ascii").strip()


def iter_records(zip_path: Path):
    with ZipFile(zip_path) as zf:
        filename = zf.namelist()[0]
        with zf.open(filename) as raw:
            yield from raw


def matches(line: bytes, args: argparse.Namespace) -> bool:
    filters = {
        "sex": args.sex,
        "age52": args.age52,
        "age27": args.age27,
        "age12": args.age12,
        "race6": args.race6,
        "hispanic_race": args.hispanic_race,
    }
    return all(expected is None or read_field(line, field) == expected for field, expected in filters.items())


def cmd_sample(args: argparse.Namespace) -> int:
    printed = 0
    fields = args.fields
    print("\t".join(fields))
    for line in iter_records(args.zip):
        if not matches(line, args):
            continue
        print("\t".join(read_field(line, field) for field in fields))
        printed += 1
        if printed >= args.limit:
            break
    return 0


def cmd_count(args: argparse.Namespace) -> int:
    counts = Counter()
    total = 0
    for line in iter_records(args.zip):
        if not matches(line, args):
            continue
        counts[read_field(line, args.group_by)] += 1
        total += 1

    print(f"total\t{total}")
    print(f"{args.group_by}\tdeaths")
    for value, count in counts.most_common(args.limit):
        print(f"{value}\t{count}")
    return 0


def add_filters(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--sex", choices=["M", "F"])
    parser.add_argument("--age52")
    parser.add_argument("--age27")
    parser.add_argument("--age12")
    parser.add_argument("--race6")
    parser.add_argument("--hispanic-race")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zip", type=Path, default=DEFAULT_ZIP)
    subparsers = parser.add_subparsers(dest="command", required=True)

    sample = subparsers.add_parser("sample", help="Print fixed-width field samples.")
    sample.add_argument("--limit", type=int, default=10)
    sample.add_argument("--fields", nargs="+", default=["year", "sex", "age52", "race6", "cause113", "cause39", "icd10"])
    add_filters(sample)
    sample.set_defaults(func=cmd_sample)

    count = subparsers.add_parser("count", help="Count deaths grouped by one field.")
    count.add_argument("--group-by", choices=sorted(FIELDS), default="cause39")
    count.add_argument("--limit", type=int, default=20)
    add_filters(count)
    count.set_defaults(func=cmd_count)

    return parser


def main() -> int:
    args = build_parser().parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
