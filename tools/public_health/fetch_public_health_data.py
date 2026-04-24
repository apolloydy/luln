#!/usr/bin/env python3
"""Fetch official public-health raw data archives used by local generators."""

from __future__ import annotations

import argparse
import sys
import urllib.request
from pathlib import Path
from zipfile import ZipFile, BadZipFile


DATASETS = {
    "cancer-uscs": {
        "url": "https://www.cdc.gov/cancer/uscs/USCS-1999-2022-ASCII.zip",
        "path": Path("research/public-health/cancer/USCS-1999-2022-ASCII.zip"),
        "expected_size": 34830234,
        "zip": True,
    },
    "mortality-2024": {
        "url": "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Datasets/DVS/mortality/mort2024us.zip",
        "path": Path("research/public-health/mortality/mort2024us.zip"),
        "expected_size": 149555529,
        "zip": True,
    },
    "mortality-2024-doc": {
        "url": "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Dataset_Documentation/DVS/mortality/2024-Mortality-Public-Use-File-Documentation.pdf",
        "path": Path("research/public-health/mortality/2024-Mortality-Public-Use-File-Documentation.pdf"),
        "expected_size": 543695,
        "zip": False,
    },
}


def check_file(dataset: dict) -> tuple[bool, str]:
    path = dataset["path"]
    if not path.exists():
        return False, "missing"

    size = path.stat().st_size
    expected_size = dataset.get("expected_size")
    if expected_size is not None and size != expected_size:
        return False, f"size mismatch: {size} != {expected_size}"

    if dataset.get("zip"):
        try:
            with ZipFile(path) as zf:
                bad_file = zf.testzip()
        except BadZipFile as exc:
            return False, f"bad zip: {exc}"
        if bad_file:
            return False, f"bad zip member: {bad_file}"

    return True, "ok"


def download(dataset: dict) -> None:
    url = dataset["url"]
    path = dataset["path"]
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_suffix(path.suffix + ".tmp")

    print(f"Downloading {url}")
    with urllib.request.urlopen(url) as response, temp_path.open("wb") as output:
        output.write(response.read())
    temp_path.replace(path)


def fetch_one(name: str, force: bool = False) -> int:
    dataset = DATASETS[name]
    ok, reason = check_file(dataset)
    if ok and not force:
        print(f"{name}: ok ({dataset['path']})")
        return 0

    if force:
        print(f"{name}: force download requested")
    else:
        print(f"{name}: {reason}; fetching")
    download(dataset)

    ok, reason = check_file(dataset)
    if not ok:
        print(f"{name}: failed after download: {reason}", file=sys.stderr)
        return 1

    print(f"{name}: ok ({dataset['path']})")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "datasets",
        nargs="*",
        choices=sorted(DATASETS),
        default=sorted(DATASETS),
        help="Dataset keys to fetch. Defaults to all datasets.",
    )
    parser.add_argument("--force", action="store_true", help="Redownload even if local checks pass.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    status = 0
    for name in args.datasets:
        status |= fetch_one(name, args.force)
    return status


if __name__ == "__main__":
    raise SystemExit(main())
