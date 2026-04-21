const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SLOTS_PER_YEAR = 54;

export function parseLocalDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addYears(date, years) {
  const targetYear = date.getFullYear() + years;
  const targetMonth = date.getMonth();
  const targetDay = date.getDate();
  const result = new Date(targetYear, targetMonth, targetDay);

  if (result.getMonth() !== targetMonth) {
    return new Date(targetYear, targetMonth + 1, 0);
  }

  return result;
}

export function calculateDeathDate(birth, expectancyYears) {
  return new Date(birth.getTime() + expectancyYears * 365.25 * MS_PER_DAY);
}

export function clampPct(value) {
  return Math.max(0, Math.min(100, value));
}

export function calculateMetrics(birthDate, expectancyYears, todayOverride = new Date()) {
  const birth = parseLocalDate(birthDate);
  const today = todayOverride;

  if (!birth) {
    return {
      birth: null,
      today,
      deathDate: null,
      remainingDays: 0,
      remainingWeeks: 0,
      lifePercentage: 0,
      yearsLeft: 0,
      ageYears: 0,
      livedDays: 0,
    };
  }

  const deathDate = calculateDeathDate(birth, expectancyYears);
  const totalDays = Math.max(1, Math.round(expectancyYears * 365.25));
  const livedDays = Math.max(0, Math.floor((today - birth) / MS_PER_DAY));
  const remainingDays = Math.max(0, Math.ceil((deathDate - today) / MS_PER_DAY));
  const remainingWeeks = Math.max(0, Math.ceil(remainingDays / 7));
  const yearsLeft = Math.max(0, (deathDate - today) / (365.25 * MS_PER_DAY));
  const ageYears = Math.max(0, Math.floor((today - birth) / (365.25 * MS_PER_DAY)));
  const lifePercentage = clampPct((remainingDays * 100) / totalDays).toFixed(1);

  return {
    birth,
    today,
    deathDate,
    remainingDays,
    remainingWeeks,
    lifePercentage,
    yearsLeft,
    ageYears,
    livedDays,
  };
}

export function getDaysInYear(year) {
  return Math.round((new Date(year + 1, 0, 1) - new Date(year, 0, 1)) / MS_PER_DAY);
}

export function getDayIndexInYear(date) {
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - yearStart) / MS_PER_DAY);
}

export function getSlotIndexForDate(date) {
  const daysInYear = getDaysInYear(date.getFullYear());
  const dayIndex = getDayIndexInYear(date);

  if (daysInYear <= 1) {
    return 0;
  }

  return clampPct(Math.round((dayIndex / (daysInYear - 1)) * (SLOTS_PER_YEAR - 1)));
}

function createEmptySlots() {
  return Array.from({ length: SLOTS_PER_YEAR }, (_, index) => ({
    index,
    dates: [],
    representativeDate: null,
    startDate: null,
    endDate: null,
  }));
}

function finalizeSlots(slots, year) {
  return slots.map((slot) => {
    if (slot.dates.length === 0) {
      return {
        ...slot,
        representativeDate: new Date(year, 0, 1 + Math.round((slot.index / (SLOTS_PER_YEAR - 1)) * (getDaysInYear(year) - 1))),
        startDate: null,
        endDate: null,
      };
    }

    return {
      ...slot,
      startDate: slot.dates[0],
      endDate: slot.dates[slot.dates.length - 1],
      representativeDate: slot.dates[Math.floor(slot.dates.length / 2)],
    };
  });
}

export function buildCalendarYearRows(birthDate, expectancyYears, todayOverride = new Date()) {
  const birth = parseLocalDate(birthDate);

  if (!birth) {
    return [];
  }

  const today = todayOverride;
  const deathDate = calculateDeathDate(birth, expectancyYears);
  const birthYear = birth.getFullYear();
  const deathYear = deathDate.getFullYear();
  const rows = [];

  for (let year = birthYear; year <= deathYear; year += 1) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);
    const activeStart = birth > yearStart ? birth : yearStart;
    const activeEnd = deathDate < yearEnd ? deathDate : yearEnd;
    const slots = createEmptySlots();

    if (activeStart < activeEnd) {
      for (let cursor = new Date(activeStart.getTime()); cursor < activeEnd; cursor = new Date(cursor.getTime() + MS_PER_DAY)) {
        const slotIndex = getSlotIndexForDate(cursor);
        slots[slotIndex].dates.push(new Date(cursor.getTime()));
      }
    }

    rows.push({
      year,
      age: Math.max(0, year - birthYear),
      totalSlots: SLOTS_PER_YEAR,
      slots: finalizeSlots(slots, year),
      markers: {
        birthSlot: year === birth.getFullYear() ? getSlotIndexForDate(birth) : null,
        deathSlot: year === deathDate.getFullYear() ? getSlotIndexForDate(deathDate) : null,
        currentSlot: year === today.getFullYear() ? getSlotIndexForDate(today) : null,
      },
      isLastFiveYears: year >= deathYear - 4,
    });
  }

  return rows;
}

export function getLifePctAtDate(date, birth, deathDate) {
  const total = deathDate - birth;

  if (total <= 0) {
    return 0;
  }

  return clampPct(((date - birth) * 100) / total);
}

export function isDateWithinSlot(date, slot) {
  if (!date || !slot.startDate || !slot.endDate) {
    return false;
  }

  const slotEndExclusive = new Date(slot.endDate.getTime() + MS_PER_DAY);
  return date >= slot.startDate && date < slotEndExclusive;
}

export { MS_PER_DAY, SLOTS_PER_YEAR };
