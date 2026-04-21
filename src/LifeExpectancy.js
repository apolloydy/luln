import React, { useEffect, useState } from "react";
import "./styles.css";
import { Tooltip } from "react-tooltip";
import techEvents from "./techEvents";
import quotes from "./quote";
import bodyDevelopmentFacts from "./bodyDevelopmentFacts";
import futurePredictions from "./futurePredictions";
import {
  buildCalendarYearRows,
  calculateMetrics,
  isDateWithinSlot,
  parseLocalDate,
} from "./lifeGrid";

function getColorTran(pct) {
  const hue = 140 - pct * 1.35;
  const lightness = 80 - pct * 0.35;
  const finalLightness = Math.max(34, Math.min(82, lightness));
  return `hsl(${hue}, 84%, ${finalLightness}%)`;
}

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getSlotRangeLabel(slot) {
  if (!slot.startDate || !slot.endDate) {
    return `${formatDisplayDate(slot.representativeDate)} (empty slot)`;
  }

  return `${formatDisplayDate(slot.startDate)} - ${formatDisplayDate(slot.endDate)}`;
}

function renderGrid({
  birthDate,
  lifeExpectancy,
  firstChildBirth,
  lastChildBirth,
  metrics,
  techEventsMap,
  bodyFactsMap,
  futurePredictionsMap,
}) {
  const birth = metrics.birth;
  const deathDate = metrics.deathDate;

  if (!birth || !deathDate) {
    return null;
  }

  const rows = buildCalendarYearRows(birthDate, lifeExpectancy, metrics.today);
  const firstChild = parseLocalDate(firstChildBirth);
  const lastChild = parseLocalDate(lastChildBirth);
  const raisingEnd = lastChild || firstChild ? new Date((lastChild || firstChild).getTime()) : null;

  if (raisingEnd) {
    raisingEnd.setFullYear(raisingEnd.getFullYear() + 18);
  }

  return (
    <div className="grid-container">
      {rows.map(({ year, age, slots, isLastFiveYears }) => {
        const shouldShowLabel = age % 5 === 0;

        return (
          <div key={`calendar-year-${year}`} className="year-row">
            {shouldShowLabel ? (
              <span className="year-label year-label-inline">
                <span className="year-label-main">{year}</span>
                <span className="year-label-divider">·</span>
                <span className="year-label-age">{`Age ${age}`}</span>
              </span>
            ) : (
              <span className="year-label-placeholder">....</span>
            )}

            <div className="weeks">
              {slots.map((slot) => {
                const referenceDate = slot.representativeDate;
                const effectiveAge = Math.max(0, Math.floor((referenceDate - birth) / (365.25 * 24 * 60 * 60 * 1000)));
                const rangeLabel = getSlotRangeLabel(slot);

                let eventText = "";

                if (techEventsMap[year]) {
                  eventText = techEventsMap[year];
                } else if (futurePredictionsMap[year]) {
                  eventText = `(Prediction) ${futurePredictionsMap[year]}`;
                } else {
                  eventText = "The future belongs to those who innovate.";
                }

                const bodyDevelopmentFactsText =
                  bodyFactsMap[effectiveAge] ||
                  "You have unlocked the secret to immortality. Please share the cheat code!";
                const tooltipText = `[${rangeLabel}]<br/>[age ${effectiveAge}]: ${bodyDevelopmentFactsText}<br/>[${year}]: ${eventText}`;

                const hasLife = Boolean(slot.startDate);
                const isCurrent = hasLife && isDateWithinSlot(metrics.today, slot);
                const isPast = hasLife && slot.endDate < metrics.today;
                const isFirstChildBirth = isDateWithinSlot(firstChild, slot);
                const isLastChildBirth = isDateWithinSlot(lastChild, slot);
                const isChildTurns18 = isDateWithinSlot(raisingEnd, slot);
                const isRaisingChildren =
                  hasLife &&
                  firstChild &&
                  raisingEnd &&
                  slot.endDate >= firstChild &&
                  slot.startDate <= raisingEnd;

                let boxClass = "grid-box";
                let content = null;

                if (!hasLife) {
                  boxClass += " empty placeholder";
                } else if (isCurrent) {
                  boxClass += " current";
                } else if (isPast) {
                  boxClass += " past";
                } else if (isLastFiveYears) {
                  boxClass += " last-years";
                } else {
                  boxClass += " remaining";
                }

                if (isFirstChildBirth || isLastChildBirth) {
                  boxClass += " child-birth";
                }

                if (isChildTurns18) {
                  boxClass += " child-18";
                }

                if (isRaisingChildren && !isFirstChildBirth && !isLastChildBirth && !isChildTurns18) {
                  content = <span className="child-raising-text">-</span>;
                }

                return (
                  <div
                    key={`${year}-${slot.index}`}
                    className={boxClass}
                    data-tooltip-id="year-tooltip"
                    data-tooltip-html={tooltipText}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <Tooltip id="year-tooltip" place="top" effect="solid" />
    </div>
  );
}

const LifeExpectancy = () => {
  const [birthDate, setBirthDate] = useState(() => localStorage.getItem("birthDate") || "1962-06-18");
  const [firstChildBirth, setFirstChildBirth] = useState(() => localStorage.getItem("firstChildBirth") || "");
  const [lastChildBirth, setLastChildBirth] = useState(() => localStorage.getItem("lastChildBirth") || "");
  const [lifeExpectancy, setLifeExpectancy] = useState(() => Number(localStorage.getItem("lifeExpectancy")) || 80);
  const [quote, setQuote] = useState(getRandomQuote());

  useEffect(() => {
    localStorage.setItem("birthDate", birthDate);
  }, [birthDate]);

  useEffect(() => {
    localStorage.setItem("lifeExpectancy", String(lifeExpectancy));
  }, [lifeExpectancy]);

  useEffect(() => {
    localStorage.setItem("firstChildBirth", firstChildBirth);
  }, [firstChildBirth]);

  useEffect(() => {
    localStorage.setItem("lastChildBirth", lastChildBirth);
  }, [lastChildBirth]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(getRandomQuote());
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const metrics = calculateMetrics(birthDate, lifeExpectancy, new Date());
  const remainingColor = getColorTran(100 - Number(metrics.lifePercentage));
  const livedPercentage = (100 - Number(metrics.lifePercentage)).toFixed(1);

  return (
    <div className="life-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Time, made visible</span>
          <h2>Life Expectancy</h2>
          <p className="hero-lead">
            Each square is a week-like step inside a year. The point is not fear. The point is clarity.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <span className="stat-label">Days Left</span>
            <strong className="stat-value" style={{ color: remainingColor }}>
              {metrics.remainingDays.toLocaleString()}
            </strong>
            <span className="stat-meta">Approximately {metrics.remainingWeeks.toLocaleString()} weeks</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Years Left</span>
            <strong className="stat-value">{metrics.yearsLeft.toFixed(1)}</strong>
            <span className="stat-meta">Based on current life expectancy</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Life Remaining</span>
            <strong className="stat-value">{metrics.lifePercentage}%</strong>
            <span className="stat-meta">{livedPercentage}% already used</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Current Age</span>
            <strong className="stat-value">{metrics.ageYears}</strong>
            <span className="stat-meta">{metrics.livedDays.toLocaleString()} days lived</span>
          </div>
        </div>
      </section>

      <section className="control-panel">
        <div className="panel-header">
          <h3>Inputs</h3>
          <p>Tune the model, then inspect the timeline below.</p>
        </div>

        <div className="input-grid">
          <label className="field">
            <span className="field-label">Birth Date</span>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Life Expectancy</span>
            <input
              type="number"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(Number(e.target.value))}
              min="1"
              max="120"
            />
          </label>

          <label className="field">
            <span className="field-label">First Child Birth Date</span>
            <input type="date" value={firstChildBirth} onChange={(e) => setFirstChildBirth(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Last Child Birth Date</span>
            <input type="date" value={lastChildBirth} onChange={(e) => setLastChildBirth(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="quote-card">
        <span className="quote-kicker">Rotating Reminder</span>
        <em>
          {quote.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </em>
      </section>

      <section className="grid-panel">
        <div className="panel-header">
          <h3>Your Years</h3>
        </div>

        {renderGrid({
          birthDate,
          lifeExpectancy,
          firstChildBirth,
          lastChildBirth,
          metrics,
          techEventsMap: techEvents,
          bodyFactsMap: bodyDevelopmentFacts,
          futurePredictionsMap: futurePredictions,
        })}
      </section>

      <p className="grid-note">
        Each row is one calendar year. Each row has 54 fixed slots, and dates are rounded into the nearest slot inside that year.
      </p>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box current"></div>
          <span>Current Slot</span>
        </div>
        <div className="legend-item">
          <div className="legend-box past"></div>
          <span>Past</span>
        </div>
        <div className="legend-item">
          <div className="legend-box remaining"></div>
          <span>Remaining</span>
        </div>
        <div className="legend-item">
          <div className="legend-box child-birth"></div>
          <span>Child Birth</span>
        </div>
        <div className="legend-item">
          <div className="legend-box child-18"></div>
          <span>Child Turns 18</span>
        </div>
        <div className="legend-item">
          <span className="raising-symbol">-</span>
          <span>Raising Children</span>
        </div>
        <div className="legend-item">
          <div className="legend-box last-years"></div>
          <span>Last 5 Years</span>
        </div>
      </div>
    </div>
  );
};

export default LifeExpectancy;
