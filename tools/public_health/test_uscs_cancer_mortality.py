import importlib.util
import unittest
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[2]
ZIP_PATH = ROOT / "research/public-health/cancer/USCS-1999-2022-ASCII.zip"
BUILDER_PATH = ROOT / "tools/public_health/build_uscs_cancer_mortality_data.py"
QUERY_PATH = ROOT / "tools/public_health/uscs_query.py"


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


builder = load_module("build_uscs_cancer_mortality_data", BUILDER_PATH)
query = load_module("uscs_query", QUERY_PATH)


class UscsCancerMortalityTest(unittest.TestCase):
    def test_raw_zip_contains_expected_cdc_files(self):
        with ZipFile(ZIP_PATH) as zf:
            names = set(zf.namelist())
            self.assertIsNone(zf.testzip())

        self.assertIn("BYSITE.TXT", names)
        self.assertIn("BYAGE.TXT", names)
        self.assertIn("BYAREA.TXT", names)
        self.assertIn("BYAREA_COUNTY.TXT", names)
        self.assertIn("USCS_ascii_input_program_2025.sas", names)

    def test_bysite_schema_is_stable(self):
        with ZipFile(ZIP_PATH) as zf:
            with zf.open("BYSITE.TXT") as raw:
                header = raw.readline().decode("latin1").strip()

        self.assertEqual(
            header,
            "YEAR|RACE|SEX|SITE|EVENT_TYPE|AGE_ADJUSTED_CI_LOWER|AGE_ADJUSTED_CI_UPPER|AGE_ADJUSTED_RATE|COUNT|POPULATION",
        )

    def test_query_reads_known_total_cancer_mortality_row(self):
        rows = [
            row
            for row in query.iter_rows(ZIP_PATH, "BYSITE")
            if row["YEAR"] == "2023"
            and row["EVENT_TYPE"] == "Mortality"
            and row["RACE"] == "All Races"
            and row["SEX"] == "Male and Female"
            and row["SITE"] == "All Cancer Sites Combined"
        ]

        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["COUNT"], "613349")
        self.assertEqual(rows[0]["AGE_ADJUSTED_RATE"], "141.5")
        self.assertEqual(rows[0]["POPULATION"], "334914895")

    def test_generator_builds_expected_population_slices(self):
        bysite_rows = builder.read_bysite_rows()
        byage_rows = builder.read_byage_rows()
        byarea_rows = builder.read_byarea_rows()
        slices = []
        for race in builder.RACE_MAP:
            for sex in builder.SEX_MAP:
                slices.append(builder.build_all_age_slice(bysite_rows, sex, race))
                for age in builder.AGE_MAP:
                    if age != "allAges":
                        slices.append(builder.build_age_slice(byage_rows, sex, race, age))
                for area in builder.AREA_MAP:
                    slices.append(builder.build_area_slice(byarea_rows, sex, race, area))

        self.assertEqual(len(slices), 990)
        self.assertEqual(
            {item["key"] for item in slices},
            {
                f"{sex}|{race}|{age}"
                for race in builder.RACE_MAP
                for sex in builder.SEX_MAP
                for age in builder.AGE_MAP
            }
            | {
                f"{sex}|{race}|allAges|{area}"
                for race in builder.RACE_MAP
                for sex in builder.SEX_MAP
                for area in builder.AREA_MAP
            },
        )

    def test_generator_excludes_rollups_and_duplicate_female_breast_from_combined_sex_view(self):
        rows = builder.read_bysite_rows()
        cancer_slice = builder.build_all_age_slice(rows, "all", "all")
        site_names = [site["site"] for site in cancer_slice["sites"]]

        self.assertEqual(cancer_slice["totalDeaths"], 613349)
        self.assertEqual(cancer_slice["totalRate"], 141.5)
        self.assertEqual(cancer_slice["rateType"], "ageAdjusted")
        self.assertEqual(site_names[0], "Lung and Bronchus")
        self.assertEqual(cancer_slice["sites"][0]["deaths"], 131584)
        self.assertEqual(cancer_slice["sites"][0]["percentage"], 21.5)
        self.assertEqual(len(cancer_slice["sites"]), 12)
        self.assertNotIn("Digestive System", site_names)
        self.assertNotIn("Respiratory System", site_names)
        self.assertNotIn("Female Breast", site_names)
        self.assertIn("Male and Female Breast", site_names)

    def test_generator_preserves_race_and_sex_specific_ordering(self):
        rows = builder.read_bysite_rows()
        female_black = builder.build_all_age_slice(rows, "female", "black")
        male_asian = builder.build_all_age_slice(rows, "male", "asian")

        self.assertEqual(female_black["totalDeaths"], 35747)
        self.assertEqual(female_black["sites"][0]["site"], "Female Breast")
        self.assertEqual(female_black["sites"][0]["deaths"], 6419)
        self.assertEqual(male_asian["totalDeaths"], 9960)
        self.assertEqual(male_asian["sites"][0]["site"], "Lung and Bronchus")
        self.assertEqual(male_asian["sites"][0]["rate"], 22.2)

    def test_generator_builds_age_group_slices_from_byage_counts(self):
        rows = builder.read_byage_rows()
        young_adults = builder.build_age_slice(rows, "all", "all", "25-29")
        older_adults = builder.build_age_slice(rows, "all", "all", "75-79")

        self.assertEqual(young_adults["totalDeaths"], 1180)
        self.assertEqual(young_adults["totalRate"], 5.4)
        self.assertEqual(young_adults["rateType"], "ageSpecificCrude")
        self.assertEqual(young_adults["sites"][0]["site"], "Brain and Other Nervous System")
        self.assertEqual(older_adults["totalDeaths"], 96211)
        self.assertEqual(older_adults["sites"][0]["site"], "Lung and Bronchus")

    def test_generator_builds_state_slices_from_byarea(self):
        rows = builder.read_byarea_rows()
        california = builder.build_area_slice(rows, "all", "all", "california")

        self.assertEqual(california["area"], "california")
        self.assertEqual(california["cdcArea"], "California")
        self.assertEqual(california["totalDeaths"], 60418)
        self.assertEqual(california["totalRate"], 128.4)
        self.assertEqual(california["rateType"], "ageAdjusted")
        self.assertEqual(california["sites"][0]["site"], "Lung and Bronchus")
        self.assertEqual(california["sites"][0]["deaths"], 10083)
        self.assertEqual(california["sites"][0]["percentage"], 16.7)


if __name__ == "__main__":
    unittest.main()
