#!/usr/bin/env python3
"""Build the local-only DuckDB warehouse for public-health source data."""

from __future__ import annotations

import argparse
import csv
from pathlib import Path
from zipfile import ZipFile

import duckdb

from nchs_mortality_query import FIELDS, read_field


DEFAULT_DB = Path("research/public-health/local-data/public_health.duckdb")
DEFAULT_MORTALITY_ZIP = Path("research/public-health/mortality/mort2024us.zip")
DEFAULT_USCS_ZIP = Path("research/public-health/cancer/USCS-1999-2022-ASCII.zip")
NCHS_TABLE = "nchs_mortality_2024"
USCS_FILES = {
    "BYSITE.TXT": "uscs_bysite",
    "BYAGE.TXT": "uscs_byage",
    "BYAREA.TXT": "uscs_byarea",
}


def connect(db_path: Path) -> duckdb.DuckDBPyConnection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return duckdb.connect(str(db_path))


def write_nchs_staging_tsv(zip_path: Path, staging_path: Path) -> int:
    columns = list(FIELDS)
    staging_path.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    with ZipFile(zip_path) as zf:
        filename = zf.namelist()[0]
        with zf.open(filename) as raw, staging_path.open("w", encoding="utf-8", newline="") as output:
            writer = csv.writer(output, delimiter="\t", lineterminator="\n")
            writer.writerow(columns)
            for line in raw:
                writer.writerow([read_field(line, column) for column in columns])
                written += 1
    return written


def ingest_nchs_mortality(con: duckdb.DuckDBPyConnection, zip_path: Path, staging_path: Path) -> int:
    rows = write_nchs_staging_tsv(zip_path, staging_path)
    con.execute(f"DROP TABLE IF EXISTS {NCHS_TABLE}")
    con.execute(
        f"""
        CREATE TABLE {NCHS_TABLE} AS
        SELECT * FROM read_csv(
            ?,
            delim = '\t',
            header = true,
            all_varchar = true
        )
        """,
        [str(staging_path)],
    )
    return rows


def normalize_column(name: str) -> str:
    return name.strip().lower()


def write_uscs_staging_tsv(zip_path: Path, filename: str, staging_path: Path) -> int:
    staging_path.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    with ZipFile(zip_path) as zf:
        with zf.open(filename) as raw, staging_path.open("w", encoding="utf-8", newline="") as output:
            reader = csv.DictReader((line.decode("latin1") for line in raw), delimiter="|")
            if reader.fieldnames is None:
                raise ValueError(f"No header found in {filename}")
            writer = csv.writer(output, delimiter="\t", lineterminator="\n")
            writer.writerow([normalize_column(column) for column in reader.fieldnames])
            for row in reader:
                writer.writerow([row.get(source_column, "") for source_column in reader.fieldnames])
                written += 1
    return written


def ingest_uscs_table(con: duckdb.DuckDBPyConnection, zip_path: Path, filename: str, table: str, staging_path: Path) -> int:
    rows = write_uscs_staging_tsv(zip_path, filename, staging_path)
    con.execute(f"DROP TABLE IF EXISTS {table}")
    con.execute(
        f"""
        CREATE TABLE {table} AS
        SELECT * FROM read_csv(
            ?,
            delim = '\t',
            header = true,
            all_varchar = true
        )
        """,
        [str(staging_path)],
    )
    return rows


def summarize(con: duckdb.DuckDBPyConnection) -> list[tuple[str, int]]:
    tables = [NCHS_TABLE, *USCS_FILES.values()]
    summary = []
    for table in tables:
        exists = con.execute(
            "SELECT count(*) FROM information_schema.tables WHERE table_name = ?",
            [table],
        ).fetchone()[0]
        if exists:
            count = con.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
            summary.append((table, count))
    return summary


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--staging-dir", type=Path, default=Path("research/public-health/local-data/staging"))
    parser.add_argument("--mortality-zip", type=Path, default=DEFAULT_MORTALITY_ZIP)
    parser.add_argument("--uscs-zip", type=Path, default=DEFAULT_USCS_ZIP)
    parser.add_argument(
        "--only",
        choices=["all", "nchs", "uscs"],
        default="all",
        help="Limit ingestion to one source family.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    with connect(args.db) as con:
        if args.only in ("all", "nchs"):
            rows = ingest_nchs_mortality(con, args.mortality_zip, args.staging_dir / "nchs_mortality_2024.tsv")
            print(f"Wrote {rows} rows to {NCHS_TABLE}.")
        if args.only in ("all", "uscs"):
            for filename, table in USCS_FILES.items():
                rows = ingest_uscs_table(con, args.uscs_zip, filename, table, args.staging_dir / f"{table}.tsv")
                print(f"Wrote {rows} rows to {table}.")
        for table, rows in summarize(con):
            print(f"{table}\t{rows}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
