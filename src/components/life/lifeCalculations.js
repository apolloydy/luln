export const DEFAULT_EXPECTED_AGE = 85;
export const DEFAULT_BIRTH_DATE = "1989-04-25";
export const DAYS_PER_YEAR = 365.25;
export const WEEKS_PER_YEAR = 52.1775;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toFiniteNumber(value, fallback) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function clampLifeInput(currentAge, expectedAge) {
  const sanitizedCurrentAge = clamp(toFiniteNumber(currentAge, 0), 0, 119);
  const sanitizedExpectedAge = clamp(
    toFiniteNumber(expectedAge, DEFAULT_EXPECTED_AGE),
    sanitizedCurrentAge + 1,
    120
  );

  return {
    currentAge: sanitizedCurrentAge,
    expectedAge: sanitizedExpectedAge,
  };
}

export function parseBirthDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    !Number.isFinite(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function calculateAgeFromBirthDate(birthDate, today = new Date()) {
  const birth = parseBirthDate(birthDate);

  if (!birth) {
    return 0;
  }

  return Math.max(0, (today - birth) / (DAYS_PER_YEAR * MS_PER_DAY));
}

export function calculateLifeStats(currentAge, expectedAge) {
  const input = clampLifeInput(currentAge, expectedAge);
  const totalYears = input.expectedAge;
  const usedYears = input.currentAge;
  const remainingYears = Math.max(0, totalYears - usedYears);
  const totalDays = Math.max(1, Math.round(totalYears * DAYS_PER_YEAR));
  const usedDays = clamp(Math.round(usedYears * DAYS_PER_YEAR), 0, totalDays);
  const remainingDays = Math.max(0, totalDays - usedDays);
  const totalWeeks = Math.max(1, Math.round(totalYears * WEEKS_PER_YEAR));
  const usedWeeks = clamp(Math.floor(usedYears * WEEKS_PER_YEAR), 0, totalWeeks - 1);
  const remainingWeeks = Math.max(0, totalWeeks - usedWeeks - 1);
  const percentUsed = clamp((usedDays / totalDays) * 100, 0, 100);

  return {
    totalYears,
    usedYears,
    remainingYears,
    totalWeeks,
    usedWeeks,
    remainingWeeks,
    totalDays,
    usedDays,
    remainingDays,
    percentUsed,
  };
}

export function calculateTimeBreakdown(remainingDays) {
  const days = Math.max(0, toFiniteNumber(remainingDays, 0));
  const sleepDays = Math.round(days * 0.33);
  const workDays = Math.round(days * 0.2);
  const screenDays = Math.round(days * 0.08);
  const obligationDays = Math.round(days * 0.12);
  const meaningfulDays = Math.max(0, Math.round(days - sleepDays - workDays - screenDays - obligationDays));

  return {
    sleepDays,
    workDays,
    screenDays,
    obligationDays,
    meaningfulDays,
  };
}
