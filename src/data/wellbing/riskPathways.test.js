import {
  riskPathwayDeathOutcomes,
  riskPathwayDiseases,
  riskPathwayEdges,
  riskPathwayMediators,
  riskPathwayRiskFactors,
  riskPathways,
  riskPathwaysSources,
} from "./riskPathways";

describe("riskPathways data integrity", () => {
  test("riskPathways aggregate exposes the same arrays as the named exports", () => {
    expect(riskPathways.riskFactors).toBe(riskPathwayRiskFactors);
    expect(riskPathways.mediators).toBe(riskPathwayMediators);
    expect(riskPathways.diseases).toBe(riskPathwayDiseases);
    expect(riskPathways.deathOutcomes).toBe(riskPathwayDeathOutcomes);
    expect(riskPathways.edges).toBe(riskPathwayEdges);
  });

  test("node ids are unique within each column", () => {
    const cols = [
      riskPathwayRiskFactors,
      riskPathwayMediators,
      riskPathwayDiseases,
      riskPathwayDeathOutcomes,
    ];
    cols.forEach((col) => {
      const ids = col.map((node) => node.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  test("node ids are globally unique for SVG lookup", () => {
    const ids = [
      ...riskPathwayRiskFactors,
      ...riskPathwayMediators,
      ...riskPathwayDiseases,
      ...riskPathwayDeathOutcomes,
    ].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every edge resolves to known nodes", () => {
    const lifestyleIds = new Set(riskPathwayRiskFactors.map((n) => n.id));
    const mediatorIds = new Set(riskPathwayMediators.map((n) => n.id));
    const diseaseIds = new Set(riskPathwayDiseases.map((n) => n.id));
    const deathIds = new Set(riskPathwayDeathOutcomes.map((n) => n.id));

    riskPathwayEdges.forEach((edge) => {
      const isLifestyleToMediator = lifestyleIds.has(edge.from) && mediatorIds.has(edge.to);
      const isMediatorToDisease = mediatorIds.has(edge.from) && diseaseIds.has(edge.to);
      const isLifestyleToDisease = lifestyleIds.has(edge.from) && diseaseIds.has(edge.to);
      const isDiseaseToDeath = diseaseIds.has(edge.from) && deathIds.has(edge.to);
      expect(
        isLifestyleToMediator ||
          isMediatorToDisease ||
          isLifestyleToDisease ||
          isDiseaseToDeath
      ).toBe(true);
    });
  });

  test("every edge has a sourceId that resolves in riskPathwaysSources", () => {
    riskPathwayEdges.forEach((edge) => {
      expect(edge.sourceId).toBeTruthy();
      expect(riskPathwaysSources[edge.sourceId]).toBeDefined();
    });
  });

  test("every mediator has an incoming lifestyle edge and outgoing disease edge", () => {
    const lifestyleIds = new Set(riskPathwayRiskFactors.map((n) => n.id));
    const diseaseIds = new Set(riskPathwayDiseases.map((n) => n.id));
    riskPathwayMediators.forEach((mediator) => {
      const hasIncoming = riskPathwayEdges.some(
        (edge) => edge.to === mediator.id && lifestyleIds.has(edge.from)
      );
      const hasOutgoing = riskPathwayEdges.some(
        (edge) => edge.from === mediator.id && diseaseIds.has(edge.to)
      );
      expect(hasIncoming).toBe(true);
      expect(hasOutgoing).toBe(true);
    });
  });

  test("every disease has at least one incoming pathway edge", () => {
    const mediatorIds = new Set(riskPathwayMediators.map((n) => n.id));
    const lifestyleIds = new Set(riskPathwayRiskFactors.map((n) => n.id));
    riskPathwayDiseases.forEach((disease) => {
      const hasIncoming = riskPathwayEdges.some(
        (edge) => edge.to === disease.id && (lifestyleIds.has(edge.from) || mediatorIds.has(edge.from))
      );
      expect(hasIncoming).toBe(true);
    });
  });

  test("every disease has at least one outgoing death edge", () => {
    const deathIds = new Set(riskPathwayDeathOutcomes.map((n) => n.id));
    riskPathwayDiseases.forEach((disease) => {
      const hasOutgoing = riskPathwayEdges.some(
        (edge) => edge.from === disease.id && deathIds.has(edge.to)
      );
      expect(hasOutgoing).toBe(true);
    });
  });

  test("every edge effect declares a known metric", () => {
    const allowedMetrics = new Set([
      "rr",
      "hr",
      "or",
      "paf",
      "mortalityReduction",
      "shareOfDeaths",
      "pathway",
    ]);
    riskPathwayEdges.forEach((edge) => {
      expect(allowedMetrics.has(edge.effect.metric)).toBe(true);
      expect(typeof edge.effect.value).toBe("number");
    });
  });

  test("edge PAFs are sane proportions", () => {
    riskPathwayEdges.forEach((edge) => {
      expect(edge.paf).toBeGreaterThanOrEqual(0);
      expect(edge.paf).toBeLessThanOrEqual(1);
    });
  });

  test("every edge declares evidence strength", () => {
    const allowedStrengths = new Set(["strong", "moderate", "emerging"]);
    riskPathwayEdges.forEach((edge) => {
      expect(allowedStrengths.has(edge.evidenceStrength)).toBe(true);
    });
  });
});
