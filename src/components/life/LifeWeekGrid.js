import React, { useMemo } from "react";
import { Tooltip } from "react-tooltip";
import { buildCalendarYearRows, isDateWithinSlot } from "../../lifeGrid";

function formatSlotRange(slot, formatDate, copy) {
  if (!slot.startDate || !slot.endDate) {
    return copy.emptySlot;
  }

  return `${formatDate(slot.startDate, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })} - ${formatDate(slot.endDate, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
}

export default function LifeWeekGrid({
  percentUsed,
  birthDate,
  expectedAge,
  bodyFactsMap,
  futurePredictionsMap,
  techEventsMap,
  copy,
  formatDate,
}) {
  const calendarRows = useMemo(
    () => buildCalendarYearRows(birthDate, expectedAge, new Date()),
    [birthDate, expectedAge]
  );
  const birthStartDate = useMemo(() => {
    const firstRow = calendarRows[0];
    return firstRow?.slots.find((slot) => slot.startDate)?.startDate || null;
  }, [calendarRows]);

  return (
    <section className="life-redesign-section life-redesign-grid-section" id="life-week-grid">
      <div className="life-redesign-section-copy">
        <span className="life-redesign-eyebrow">{copy.eyebrow}</span>
        <h2>{copy.title.replace("{value}", percentUsed.toFixed(1))}</h2>
        <p>{copy.body}</p>
        <p className="life-redesign-now">{copy.now}</p>
        <p className="sr-only">{copy.title.replace("{value}", percentUsed.toFixed(1))}</p>
      </div>

      <div className="life-redesign-calendar-detail">
        <div className="life-redesign-calendar-header">
          <strong>{copy.calendarTitle}</strong>
          <span>{copy.slotsPerYear}</span>
        </div>

        <div className="life-redesign-calendar-grid" aria-hidden="true">
          {calendarRows.map((row) => (
            <div key={row.year} className="life-redesign-calendar-row">
              <span className="life-redesign-calendar-year">
                {row.age % 10 === 0 ? `${row.year} / age ${row.age}` : ""}
              </span>
              <span className="life-redesign-calendar-slots">
                {row.slots.map((slot) => {
                  const now = new Date();
                  const hasLife = Boolean(slot.startDate);
                  const isCurrent = isDateWithinSlot(now, slot);
                  const isPast = hasLife && slot.endDate < now;
                  const state = !hasLife ? "empty" : isCurrent ? "current" : isPast ? "used" : "remaining";
                  const effectiveAge = slot.representativeDate && birthStartDate
                    ? Math.max(0, Math.floor((slot.representativeDate - birthStartDate) / (365.25 * 24 * 60 * 60 * 1000)))
                    : row.age;
                  const bodyText = bodyFactsMap[effectiveAge] || copy.bodyFallback;
                  const eventText =
                    techEventsMap[row.year] ||
                    (futurePredictionsMap[row.year] ? `${copy.prediction}: ${futurePredictionsMap[row.year]}` : copy.noEvent);
                  const label = `${formatSlotRange(slot, formatDate, copy)} | ${copy.tooltip
                    .replace("{year}", row.year)
                    .replace("{slot}", slot.index + 1)
                    .replace("{age}", effectiveAge)
                    .replace("{state}", state)
                    .replace("{body}", bodyText)
                    .replace("{world}", eventText)}`;

                  return (
                    <span
                      key={`${row.year}-${slot.index}`}
                      className={`life-redesign-calendar-slot ${state}`}
                      data-tooltip-id="life-calendar-tooltip"
                      data-tooltip-content={label}
                    />
                  );
                })}
              </span>
            </div>
          ))}
        </div>
        <Tooltip id="life-calendar-tooltip" place="top" />
      </div>
    </section>
  );
}
