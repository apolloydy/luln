import { leadingCausesBySlice2024, leadingCausesBySlice2024Source } from "./leadingCausesBySlice2024";

describe("NCHS leading causes derived frontend dataset", () => {
  test("keeps the source tied to NCHS mortality public-use data", () => {
    expect(leadingCausesBySlice2024Source.label).toContain("CDC/NCHS");
    expect(leadingCausesBySlice2024Source.notes).toContain("underlying ICD-10");
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

    expect(Object.keys(leadingCausesBySlice2024)).toHaveLength(sexes.length * races.length * ageGroups.length);
    races.forEach((race) => {
      sexes.forEach((sex) => {
        ageGroups.forEach((ageGroup) => {
          expect(leadingCausesBySlice2024[`${sex}|${race}|${ageGroup}`]).toBeDefined();
        });
      });
    });
  });

  test("matches known national 2024 mortality totals from the raw public-use file", () => {
    const national = leadingCausesBySlice2024["all|all|allAges"];

    expect(national.totalDeaths).toBe(3082464);
    expect(national.causes[0]).toMatchObject({
      name: "Heart disease",
      deaths: 685651,
      percentage: 22.2,
    });
    expect(national.causes[1]).toMatchObject({
      name: "Cancer",
      deaths: 620915,
      percentage: 20.1,
    });
  });

  test("age slices reorder leading causes instead of reusing the national ranking", () => {
    expect(leadingCausesBySlice2024["all|all|25-29"].causes[0]).toMatchObject({
      name: "Unintentional injuries",
      deaths: 9824,
    });
    expect(leadingCausesBySlice2024["all|all|65-69"].causes[0]).toMatchObject({
      name: "Cancer",
      deaths: 85929,
    });
  });
});
