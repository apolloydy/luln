import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = ROOT / "tools/public_health/build_nchs_leading_causes_data.py"


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


builder = load_module("build_nchs_leading_causes_data", BUILDER_PATH)


class NchsLeadingCausesTest(unittest.TestCase):
    def test_classifies_nchs_top_cause_icd_ranges(self):
        examples = {
            "I251": "Heart disease",
            "C349": "Cancer",
            "V892": "Unintentional injuries",
            "X599": "Unintentional injuries",
            "I64": "Stroke",
            "J449": "Chronic lower respiratory diseases",
            "G309": "Alzheimer disease",
            "E119": "Diabetes mellitus",
            "N189": "Kidney disease",
            "K746": "Chronic liver disease and cirrhosis",
            "X700": "Suicide",
        }

        for icd, cause in examples.items():
            self.assertEqual(builder.classify_underlying_cause(icd), cause)

    def test_does_not_put_adverse_effect_codes_into_unintentional_injuries(self):
        self.assertEqual(builder.classify_underlying_cause("Y409"), "All other causes")
        self.assertEqual(builder.classify_underlying_cause("Y850"), "Unintentional injuries")
        self.assertEqual(builder.classify_underlying_cause("Y860"), "Unintentional injuries")


if __name__ == "__main__":
    unittest.main()
