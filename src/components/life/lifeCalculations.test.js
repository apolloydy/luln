import {
  DEFAULT_BIRTH_DATE,
  DEFAULT_EXPECTED_AGE,
  calculateAgeFromBirthDate,
  calculateLifeStats,
  calculateTimeBreakdown,
  clampLifeInput,
} from "./lifeCalculations";

describe("life redesign calculations", () => {
  test("calculates remaining days, weeks, and percent used", () => {
    const stats = calculateLifeStats(37, DEFAULT_EXPECTED_AGE);

    expect(stats.totalYears).toBe(85);
    expect(stats.usedYears).toBe(37);
    expect(stats.remainingYears).toBe(48);
    expect(stats.totalDays).toBe(Math.round(85 * 365.25));
    expect(stats.remainingDays).toBe(stats.totalDays - stats.usedDays);
    expect(stats.percentUsed).toBeCloseTo((stats.usedDays / stats.totalDays) * 100);
  });

  test("derives age from the default birthday", () => {
    const age = calculateAgeFromBirthDate(DEFAULT_BIRTH_DATE, new Date(2026, 3, 25));

    expect(age).toBeCloseTo(37, 1);
  });

  test("clamps invalid ages into a usable range", () => {
    expect(clampLifeInput(-4, 85)).toEqual({ currentAge: 0, expectedAge: 85 });
    expect(clampLifeInput(85, 80)).toEqual({ currentAge: 85, expectedAge: 86 });
    expect(clampLifeInput(140, 140)).toEqual({ currentAge: 119, expectedAge: 120 });
  });

  test("never returns negative remaining values", () => {
    const stats = calculateLifeStats(120, 85);

    expect(stats.remainingYears).toBeGreaterThanOrEqual(0);
    expect(stats.remainingWeeks).toBeGreaterThanOrEqual(0);
    expect(stats.remainingDays).toBeGreaterThanOrEqual(0);
  });

  test("compresses remaining time without going below zero", () => {
    const breakdown = calculateTimeBreakdown(1000);
    const spent =
      breakdown.sleepDays +
      breakdown.workDays +
      breakdown.screenDays +
      breakdown.obligationDays +
      breakdown.meaningfulDays;

    expect(spent).toBe(1000);
    expect(calculateTimeBreakdown(-10).meaningfulDays).toBe(0);
  });
});
