import {
  MS_PER_DAY,
  SLOTS_PER_YEAR,
  addYears,
  buildCalendarYearRows,
  calculateMetrics,
  getDayIndexInYear,
  getDaysInYear,
  getSlotIndexForDate,
  parseLocalDate,
} from "./lifeGrid";

describe("lifeGrid yearly slot mapping", () => {
  test("every row always has exactly 54 slots", () => {
    const rows = buildCalendarYearRows("2000-06-18", 2.5, new Date(2001, 6, 1));

    rows.forEach((row) => {
      expect(row.slots).toHaveLength(SLOTS_PER_YEAR);
      expect(row.totalSlots).toBe(SLOTS_PER_YEAR);
    });
  });

  test("maps Jan 1 and Dec 31 to the left and right edges", () => {
    expect(getSlotIndexForDate(new Date(2025, 0, 1))).toBe(0);
    expect(getSlotIndexForDate(new Date(2025, 11, 31))).toBe(53);
  });

  test("rounds mid-year dates to the nearest slot", () => {
    const date = new Date(2025, 6, 2);
    const expected = Math.round((getDayIndexInYear(date) / (getDaysInYear(2025) - 1)) * 53);

    expect(getSlotIndexForDate(date)).toBe(expected);
  });

  test("keeps leap-year dates stable, including Feb 29", () => {
    expect(getDaysInYear(2024)).toBe(366);
    expect(getDaysInYear(2025)).toBe(365);
    expect(getSlotIndexForDate(new Date(2024, 1, 29))).toBe(
      Math.round((59 / 365) * 53)
    );
  });

  test("birth and death years leave unused slots transparent rather than stretching", () => {
    const birthDate = "2000-06-18";
    const expectancy = 1.2;
    const rows = buildCalendarYearRows(birthDate, expectancy, new Date(2000, 7, 1));
    const birthRow = rows[0];
    const deathRow = rows[rows.length - 1];

    expect(birthRow.slots.some((slot) => slot.startDate === null)).toBe(true);
    expect(deathRow.slots.some((slot) => slot.startDate === null)).toBe(true);
  });

  test("the current year contains exactly one current slot marker candidate", () => {
    const today = new Date(2001, 6, 9);
    const rows = buildCalendarYearRows("2000-06-18", 3, today);
    const currentRow = rows.find((row) => row.year === 2001);

    expect(currentRow.markers.currentSlot).toBe(getSlotIndexForDate(today));
    expect(currentRow.markers.currentSlot).toBeGreaterThanOrEqual(0);
    expect(currentRow.markers.currentSlot).toBeLessThan(SLOTS_PER_YEAR);
  });

  test("non-leap anniversaries for Feb 29 birthdays still clamp to Feb 28", () => {
    const birth = parseLocalDate("2024-02-29");

    expect(addYears(birth, 1).toISOString()).toBe(new Date(2025, 1, 28).toISOString());
    expect(addYears(birth, 4).toISOString()).toBe(new Date(2028, 1, 29).toISOString());
  });

  test("metrics stay bounded when today is before birth", () => {
    const metrics = calculateMetrics("2030-01-01", 80, new Date(2026, 0, 1));

    expect(metrics.livedDays).toBe(0);
    expect(metrics.ageYears).toBe(0);
    expect(Number(metrics.lifePercentage)).toBeGreaterThanOrEqual(0);
    expect(Number(metrics.lifePercentage)).toBeLessThanOrEqual(100);
  });

  test("death date stays aligned to expectancy duration", () => {
    const birth = parseLocalDate("2000-06-18");
    const rows = buildCalendarYearRows("2000-06-18", 1.2, new Date(2000, 6, 1));
    const lastRow = rows[rows.length - 1];
    const finalActiveSlot = [...lastRow.slots].reverse().find((slot) => slot.startDate !== null);
    const expectedDeath = new Date(birth.getTime() + 1.2 * 365.25 * MS_PER_DAY);

    expect(finalActiveSlot.endDate <= expectedDeath).toBe(true);
  });
});
