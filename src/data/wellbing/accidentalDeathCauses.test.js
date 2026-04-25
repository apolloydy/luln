import {
  accidentalDeathCauses,
  accidentalDeathCausesBySlice2024,
  accidentalDeathCausesSource,
} from "./accidentalDeathCauses";

describe("accidental injury derived frontend dataset", () => {
  test("keeps the source tied to NCHS mortality public-use data", () => {
    expect(accidentalDeathCausesSource.label).toContain("CDC/NCHS");
    expect(accidentalDeathCausesSource.notes).toContain("ICD-10");
  });

  test("ships death counts and percentages by mechanism", () => {
    expect(accidentalDeathCauses.length).toBeGreaterThanOrEqual(6);
    accidentalDeathCauses.forEach((cause) => {
      expect(cause.deaths).toBeGreaterThan(0);
      expect(cause.percentage).toBeGreaterThan(0);
      expect(cause.color).toMatch(/^#/);
    });
  });

  test("includes major unintentional injury mechanisms", () => {
    const names = accidentalDeathCauses.map((cause) => cause.name);

    expect(names).toContain("Poisoning");
    expect(names).toContain("Transport");
    expect(names).toContain("Falls");
    expect(names).toContain("Suffocation");
    expect(names).toContain("Drowning");
  });

  test("contains every precomputed sex, race, and age combination used by the explorer", () => {
    const sexes = ["all", "male", "female"];
    const races = ["all", "white", "black", "asian", "aian"];
    const ageGroups = [
      "allAges",
      "25-29",
      "30-34",
      "35-39",
      "40-44",
      "45-49",
      "50-54",
      "55-59",
      "60-64",
      "65-69",
      "70-74",
      "75-79",
      "80-84",
      "85+",
    ];

    expect(Object.keys(accidentalDeathCausesBySlice2024)).toHaveLength(sexes.length * races.length * ageGroups.length);
    races.forEach((race) => {
      sexes.forEach((sex) => {
        ageGroups.forEach((ageGroup) => {
          expect(accidentalDeathCausesBySlice2024[`${sex}|${race}|${ageGroup}`]).toBeDefined();
        });
      });
    });
  });

  test("keeps the legacy national export aligned with the all-population slice", () => {
    expect(accidentalDeathCauses).toEqual(accidentalDeathCausesBySlice2024["all|all|allAges"].mechanisms);
  });
});
