import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = ROOT / "tools/public_health/build_risk_pathways_data.py"
CURATED_PATH = ROOT / "research/public-health/curated/risk_pathways.json"


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


builder = load_module("build_risk_pathways_data", BUILDER_PATH)


def make_minimal_dataset():
    return {
        "sources": {
            "src-a": {"label": "Source A", "url": "https://example.test/a"},
        },
        "riskFactors": [
            {"id": "exercise", "color": "#22c55e", "origin": "lifestyle"},
        ],
        "mediators": [
            {"id": "vo2max", "color": "#22c55e"},
        ],
        "diseases": [
            {"id": "atherosclerotic", "color": "#fb7185"},
        ],
        "deathOutcomes": [
            {"id": "deathHeartDisease", "deaths": 100, "percentage": 10.0, "color": "#fb7185"},
        ],
        "edges": [
            {
                "from": "exercise",
                "to": "vo2max",
                "paf": 0.05,
                "effect": {"metric": "pathway", "value": 1.0, "comparator": "activity improves fitness"},
                "evidenceStrength": "strong",
                "sourceId": "src-a",
            },
            {
                "from": "vo2max",
                "to": "atherosclerotic",
                "paf": 0.05,
                "effect": {"metric": "rr", "value": 1.3, "ciLow": 1.1, "ciHigh": 1.5},
                "evidenceStrength": "strong",
                "sourceId": "src-a",
            },
            {
                "from": "atherosclerotic",
                "to": "deathHeartDisease",
                "paf": 0.95,
                "effect": {"metric": "shareOfDeaths", "value": 0.95},
                "evidenceStrength": "strong",
                "sourceId": "src-a",
            },
        ],
    }


class BuildRiskPathwaysTest(unittest.TestCase):
    def test_emits_named_exports_and_aggregate(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            input_path = tmp / "in.json"
            output_path = tmp / "out.js"
            input_path.write_text(json.dumps(make_minimal_dataset()), encoding="utf-8")

            builder.build(input_path, output_path)
            text = output_path.read_text(encoding="utf-8")

            for export_name in (
                "riskPathwaysSources",
                "riskPathwayRiskFactors",
                "riskPathwayMediators",
                "riskPathwayDiseases",
                "riskPathwayDeathOutcomes",
                "riskPathwayEdges",
                "riskPathways",
            ):
                self.assertIn(f"export const {export_name}", text)

            self.assertIn("AUTO-GENERATED", text)
            self.assertIn('sourceId: "src-a"', text)
            self.assertIn("metric: \"rr\"", text)

    def test_rejects_orphan_disease(self):
        data = make_minimal_dataset()
        data["diseases"].append({"id": "orphan", "color": "#000000"})
        with self.assertRaisesRegex(ValueError, "orphan"):
            builder.validate(data)

    def test_rejects_unknown_source(self):
        data = make_minimal_dataset()
        data["edges"][0]["sourceId"] = "missing-source"
        with self.assertRaisesRegex(ValueError, "missing-source"):
            builder.validate(data)

    def test_rejects_unknown_metric(self):
        data = make_minimal_dataset()
        data["edges"][0]["effect"]["metric"] = "nonsense"
        with self.assertRaisesRegex(ValueError, "metric"):
            builder.validate(data)

    def test_rejects_paf_out_of_range(self):
        data = make_minimal_dataset()
        data["edges"][0]["paf"] = 1.5
        with self.assertRaisesRegex(ValueError, "paf"):
            builder.validate(data)

    def test_rejects_unknown_node_combo(self):
        data = make_minimal_dataset()
        data["edges"][0]["to"] = "deathHeartDisease"
        with self.assertRaisesRegex(ValueError, "exercise->deathHeartDisease"):
            builder.validate(data)

    def test_curated_dataset_validates(self):
        data = json.loads(CURATED_PATH.read_text(encoding="utf-8"))
        builder.validate(data)


if __name__ == "__main__":
    unittest.main()
