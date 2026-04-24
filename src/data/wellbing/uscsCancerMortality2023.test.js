import { uscsCancerMortality2023, uscsCancerMortality2023Source } from "./uscsCancerMortality2023";

describe("USCS cancer mortality derived frontend dataset", () => {
  test("keeps the source tied to CDC USCS BYSITE mortality", () => {
    expect(uscsCancerMortality2023Source.label).toContain("CDC U.S. Cancer Statistics");
    expect(uscsCancerMortality2023Source.url).toBe(
      "https://www.cdc.gov/united-states-cancer-statistics/dataviz/data-tables.html"
    );
    expect(uscsCancerMortality2023Source.notes).toContain("BYSITE.TXT");
    expect(uscsCancerMortality2023Source.notes).toContain("YEAR=2023");
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

    const stateAreas = 52;
    expect(Object.keys(uscsCancerMortality2023)).toHaveLength(
      sexes.length * races.length * ageGroups.length + sexes.length * races.length * stateAreas
    );
    races.forEach((race) => {
      sexes.forEach((sex) => {
        ageGroups.forEach((ageGroup) => {
          expect(uscsCancerMortality2023[`${sex}|${race}|${ageGroup}`]).toBeDefined();
        });
      });
    });
  });

  test("matches known national all-sex all-race 2023 cancer mortality totals", () => {
    const national = uscsCancerMortality2023["all|all|allAges"];

    expect(national.totalDeaths).toBe(613349);
    expect(national.totalRate).toBe(141.5);
    expect(national.rateType).toBe("ageAdjusted");
    expect(national.population).toBe(334914895);
    expect(national.sites[0]).toMatchObject({
      site: "Lung and Bronchus",
      deaths: 131584,
      percentage: 21.5,
      rate: 29.3,
    });
    expect(national.sites).toHaveLength(12);
  });

  test("does not ship rollup cancer systems as ranked sites", () => {
    const nationalSites = uscsCancerMortality2023["all|all|allAges"].sites.map((site) => site.site);

    expect(nationalSites).not.toContain("All Cancer Sites Combined");
    expect(nationalSites).not.toContain("Digestive System");
    expect(nationalSites).not.toContain("Respiratory System");
    expect(nationalSites).toContain("Male and Female Breast");
    expect(nationalSites).not.toContain("Female Breast");
  });

  test("preserves sex-specific rankings where they differ from the national view", () => {
    expect(uscsCancerMortality2023["female|black|allAges"].sites[0]).toMatchObject({
      site: "Female Breast",
      deaths: 6419,
      rate: 26.2,
    });
    expect(uscsCancerMortality2023["male|asian|allAges"].sites[0]).toMatchObject({
      site: "Lung and Bronchus",
      deaths: 2202,
      rate: 22.2,
    });
  });

  test("includes age-group slices generated from BYAGE counts", () => {
    expect(uscsCancerMortality2023["all|all|25-29"]).toMatchObject({
      totalDeaths: 1180,
      totalRate: 5.4,
      rateType: "ageSpecificCrude",
    });
    expect(uscsCancerMortality2023["all|all|25-29"].sites[0]).toMatchObject({
      site: "Brain and Other Nervous System",
      deaths: 158,
    });
    expect(uscsCancerMortality2023["all|all|75-79"].sites[0]).toMatchObject({
      site: "Lung and Bronchus",
      deaths: 23361,
    });
  });

  test("includes state all-age slices generated from BYAREA", () => {
    const california = uscsCancerMortality2023["all|all|allAges|california"];

    expect(california).toMatchObject({
      area: "california",
      cdcArea: "California",
      totalDeaths: 60418,
      totalRate: 128.4,
      rateType: "ageAdjusted",
    });
    expect(california.sites[0]).toMatchObject({
      site: "Lung and Bronchus",
      deaths: 10083,
      percentage: 16.7,
    });
  });
});
