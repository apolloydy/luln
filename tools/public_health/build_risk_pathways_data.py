#!/usr/bin/env python3
"""Build the behavior -> mediator -> disease -> mortality risk-pathway JS module.

Reads the curated source-of-truth JSON at
``research/public-health/curated/risk_pathways.json`` and emits
``src/data/wellbing/riskPathways.js`` in the shape consumed by the frontend.

The GBD 2021 raw bundle (IHME GHDx) is not yet wired into the local DuckDB
warehouse; until it is, edges sourced from GBD are read directly from the
curated JSON. See ``research/public-health/DATA_INVENTORY.md`` for the long-form
description.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INPUT = ROOT / "research/public-health/curated/risk_pathways.json"
DEFAULT_OUTPUT = ROOT / "src/data/wellbing/riskPathways.js"

ALLOWED_METRICS = {"rr", "hr", "or", "paf", "mortalityReduction", "shareOfDeaths", "pathway"}
ALLOWED_EVIDENCE = {"strong", "moderate", "emerging"}
SOURCE_FIELDS = ("label", "url", "accessed", "journal", "year", "pmid", "notes")
EFFECT_FIELDS = ("metric", "value", "ciLow", "ciHigh", "comparator")


def js_value(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        if isinstance(value, float) and value.is_integer():
            return f"{value:.2f}"
        return repr(value)
    if isinstance(value, str):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    raise TypeError(f"Unsupported value type for JS emission: {type(value)!r}")


def render_object_inline(fields: list[tuple[str, Any]]) -> str:
    parts = [f"{key}: {js_value(value)}" for key, value in fields if value is not None]
    return "{ " + ", ".join(parts) + " }"


def validate(data: dict) -> None:
    sources = data["sources"]
    risk_factors = data["riskFactors"]
    mediators = data.get("mediators", [])
    diseases = data["diseases"]
    death_outcomes = data["deathOutcomes"]
    edges = data["edges"]

    risk_ids = {node["id"] for node in risk_factors}
    mediator_ids = {node["id"] for node in mediators}
    disease_ids = {node["id"] for node in diseases}
    death_ids = {node["id"] for node in death_outcomes}

    for column_name, items in (
        ("riskFactors", risk_factors),
        ("mediators", mediators),
        ("diseases", diseases),
        ("deathOutcomes", death_outcomes),
    ):
        ids = [node["id"] for node in items]
        if len(ids) != len(set(ids)):
            raise ValueError(f"Duplicate ids in {column_name}: {ids}")

    all_ids = [
        node["id"]
        for node in [*risk_factors, *mediators, *diseases, *death_outcomes]
    ]
    if len(all_ids) != len(set(all_ids)):
        raise ValueError("Node ids must be globally unique for frontend graph lookup")

    for index, edge in enumerate(edges):
        if edge["sourceId"] not in sources:
            raise ValueError(f"edges[{index}] sourceId {edge['sourceId']!r} not in sources map")
        is_lifestyle_to_mediator = edge["from"] in risk_ids and edge["to"] in mediator_ids
        is_mediator_to_disease = edge["from"] in mediator_ids and edge["to"] in disease_ids
        is_lifestyle_to_disease = edge["from"] in risk_ids and edge["to"] in disease_ids
        is_disease_to_death = edge["from"] in disease_ids and edge["to"] in death_ids
        if not (is_lifestyle_to_mediator or is_mediator_to_disease or is_lifestyle_to_disease or is_disease_to_death):
            raise ValueError(
                f"edges[{index}] {edge['from']}->{edge['to']} does not match "
                f"lifestyle->mediator, mediator->disease, lifestyle->disease, or disease->death"
            )
        metric = edge["effect"]["metric"]
        if metric not in ALLOWED_METRICS:
            raise ValueError(f"edges[{index}] effect.metric {metric!r} not allowed")
        evidence = edge.get("evidenceStrength")
        if evidence not in ALLOWED_EVIDENCE:
            raise ValueError(f"edges[{index}] evidenceStrength {evidence!r} not allowed")
        paf = edge["paf"]
        if not 0 <= paf <= 1:
            raise ValueError(f"edges[{index}] paf {paf} out of [0, 1]")

    for mediator in mediators:
        has_incoming = any(
            edge["to"] == mediator["id"] and edge["from"] in risk_ids for edge in edges
        )
        if not has_incoming:
            raise ValueError(f"mediator {mediator['id']!r} has no incoming lifestyle edge")
        has_outgoing = any(
            edge["from"] == mediator["id"] and edge["to"] in disease_ids for edge in edges
        )
        if not has_outgoing:
            raise ValueError(f"mediator {mediator['id']!r} has no outgoing disease edge")

    for disease in diseases:
        has_incoming = any(
            edge["to"] == disease["id"] and edge["from"] in (risk_ids | mediator_ids) for edge in edges
        )
        if not has_incoming:
            raise ValueError(f"disease {disease['id']!r} has no incoming pathway edge")
        has_outgoing = any(
            edge["from"] == disease["id"] and edge["to"] in death_ids for edge in edges
        )
        if not has_outgoing:
            raise ValueError(f"disease {disease['id']!r} has no outgoing death edge")


def render_sources(sources: dict) -> list[str]:
    lines = ["export const riskPathwaysSources = {"]
    for source_id, source in sources.items():
        lines.append(f'  "{source_id}": {{')
        for field in SOURCE_FIELDS:
            if field in source and source[field] is not None:
                lines.append(f"    {field}: {js_value(source[field])},")
        lines.append("  },")
    lines.append("};")
    return lines


def render_node_array(name: str, nodes: list[dict], extra_fields: tuple[str, ...] = ()) -> list[str]:
    lines = [f"export const {name} = ["]
    for node in nodes:
        fields: list[tuple[str, Any]] = [("id", node["id"])]
        for field in extra_fields:
            if field in node:
                fields.append((field, node[field]))
        if "color" in node:
            fields.append(("color", node["color"]))
        if "origin" in node:
            fields.append(("origin", node["origin"]))
        if "direction" in node:
            fields.append(("direction", node["direction"]))
        lines.append(f"  {render_object_inline(fields)},")
    lines.append("];")
    return lines


def render_effect(effect: dict) -> str:
    fields = [(field, effect.get(field)) for field in EFFECT_FIELDS]
    return render_object_inline(fields)


def render_edges(edges: list[dict]) -> list[str]:
    lines = ["export const riskPathwayEdges = ["]
    for edge in edges:
        lines.append("  {")
        lines.append(f'    from: {js_value(edge["from"])},')
        lines.append(f'    to: {js_value(edge["to"])},')
        lines.append(f'    paf: {js_value(edge["paf"])},')
        lines.append(f"    effect: {render_effect(edge['effect'])},")
        if edge.get("direction"):
            lines.append(f'    direction: {js_value(edge["direction"])},')
        lines.append(f'    evidenceStrength: {js_value(edge["evidenceStrength"])},')
        lines.append(f'    sourceId: {js_value(edge["sourceId"])},')
        if edge.get("note"):
            lines.append(f'    note: {js_value(edge["note"])},')
        lines.append("  },")
    lines.append("];")
    return lines


def render_aggregate() -> list[str]:
    return [
        "export const riskPathways = {",
        "  riskFactors: riskPathwayRiskFactors,",
        "  mediators: riskPathwayMediators,",
        "  diseases: riskPathwayDiseases,",
        "  deathOutcomes: riskPathwayDeathOutcomes,",
        "  edges: riskPathwayEdges,",
        "};",
    ]


def render_module(data: dict) -> str:
    header = [
        "// AUTO-GENERATED by tools/public_health/build_risk_pathways_data.py.",
        "// Source-of-truth: research/public-health/curated/risk_pathways.json.",
        "// Do not edit by hand; run the build script to regenerate.",
        "",
    ]
    lines: list[str] = list(header)
    lines.extend(render_sources(data["sources"]))
    lines.append("")
    lines.extend(render_node_array("riskPathwayRiskFactors", data["riskFactors"]))
    lines.append("")
    lines.extend(render_node_array("riskPathwayMediators", data.get("mediators", [])))
    lines.append("")
    lines.extend(render_node_array("riskPathwayDiseases", data["diseases"]))
    lines.append("")
    lines.extend(
        render_node_array(
            "riskPathwayDeathOutcomes",
            data["deathOutcomes"],
            extra_fields=("deaths", "percentage"),
        )
    )
    lines.append("")
    lines.extend(render_edges(data["edges"]))
    lines.append("")
    lines.extend(render_aggregate())
    lines.append("")
    return "\n".join(lines)


def build(input_path: Path, output_path: Path) -> tuple[int, int, int, int]:
    data = json.loads(input_path.read_text(encoding="utf-8"))
    validate(data)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(render_module(data), encoding="utf-8")
    return (
        len(data["sources"]),
        len(data["riskFactors"])
        + len(data.get("mediators", []))
        + len(data["diseases"])
        + len(data["deathOutcomes"]),
        len(data["edges"]),
        output_path.stat().st_size,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    n_sources, n_nodes, n_edges, n_bytes = build(args.input, args.output)
    print(
        f"Wrote {args.output} — {n_sources} sources, {n_nodes} nodes, {n_edges} edges, {n_bytes} bytes."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
