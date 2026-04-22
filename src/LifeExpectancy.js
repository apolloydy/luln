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
import { useLocale } from "./i18n/LocaleProvider";

function getColorTran(pct) {
  const hue = 140 - pct * 1.35;
  const lightness = 80 - pct * 0.35;
  const finalLightness = Math.max(34, Math.min(82, lightness));
  return `hsl(${hue}, 84%, ${finalLightness}%)`;
}

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getSlotRangeLabel(slot, formatDate, t) {
  if (!slot.startDate || !slot.endDate) {
    return t("life.slot.emptySlot", {
      date: formatDate(slot.representativeDate, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    });
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

function renderGrid({
  birthDate,
  lifeExpectancy,
  firstChildBirth,
  lastChildBirth,
  metrics,
  techEventsMap,
  bodyFactsMap,
  futurePredictionsMap,
  formatDate,
  t,
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
                <span className="year-label-age">{t("life.slot.age", { age })}</span>
              </span>
            ) : (
              <span className="year-label-placeholder">....</span>
            )}

            <div className="weeks">
              {slots.map((slot) => {
                const referenceDate = slot.representativeDate;
                const effectiveAge = Math.max(0, Math.floor((referenceDate - birth) / (365.25 * 24 * 60 * 60 * 1000)));
                const rangeLabel = getSlotRangeLabel(slot, formatDate, t);

                let eventText = "";

                if (techEventsMap[year]) {
                  eventText = techEventsMap[year];
                } else if (futurePredictionsMap[year]) {
                  eventText = `(${t("life.slot.predictionPrefix")}) ${futurePredictionsMap[year]}`;
                } else {
                  eventText = t("life.slot.defaultFuture");
                }

                const bodyDevelopmentFactsText =
                  bodyFactsMap[effectiveAge] ||
                  t("life.slot.immortalityFallback");
                const tooltipText = `[${rangeLabel}]<br/>${t("life.slot.tooltipAgeLine", {
                  age: effectiveAge,
                  text: bodyDevelopmentFactsText,
                })}<br/>${t("life.slot.tooltipYearLine", {
                  year,
                  text: eventText,
                })}`;

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
  const { t, formatDate, formatNumber } = useLocale();
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
          <span className="eyebrow">{t("life.eyebrow")}</span>
          <h2>{t("life.title")}</h2>
          <p className="hero-lead">{t("life.lead")}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <span className="stat-label">{t("life.stats.daysLeft")}</span>
            <strong className="stat-value" style={{ color: remainingColor }}>
              {formatNumber(metrics.remainingDays)}
            </strong>
            <span className="stat-meta">{t("life.stats.weeksApprox", { value: formatNumber(metrics.remainingWeeks) })}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">{t("life.stats.yearsLeft")}</span>
            <strong className="stat-value">{metrics.yearsLeft.toFixed(1)}</strong>
            <span className="stat-meta">{t("life.stats.basedOnLifeExpectancy")}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">{t("life.stats.lifeRemaining")}</span>
            <strong className="stat-value">{metrics.lifePercentage}%</strong>
            <span className="stat-meta">{t("life.stats.alreadyUsed", { value: livedPercentage })}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">{t("life.stats.currentAge")}</span>
            <strong className="stat-value">{metrics.ageYears}</strong>
            <span className="stat-meta">{t("life.stats.daysLived", { value: formatNumber(metrics.livedDays) })}</span>
          </div>
        </div>
      </section>

      <section className="control-panel">
        <div className="panel-header">
          <h3>{t("life.inputs.title")}</h3>
          <p>{t("life.inputs.subtitle")}</p>
        </div>

        <div className="input-grid">
          <label className="field">
            <span className="field-label">{t("life.inputs.birthDate")}</span>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">{t("life.inputs.lifeExpectancy")}</span>
            <input
              type="number"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(Number(e.target.value))}
              min="1"
              max="120"
            />
          </label>

          <label className="field">
            <span className="field-label">{t("life.inputs.firstChildBirthDate")}</span>
            <input type="date" value={firstChildBirth} onChange={(e) => setFirstChildBirth(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">{t("life.inputs.lastChildBirthDate")}</span>
            <input type="date" value={lastChildBirth} onChange={(e) => setLastChildBirth(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="quote-card">
        <span className="quote-kicker">{t("life.quoteKicker")}</span>
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
          <h3>{t("life.yearsTitle")}</h3>
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
          formatDate,
          t,
        })}
      </section>

      <p className="grid-note">{t("life.gridNote")}</p>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box current"></div>
          <span>{t("life.legend.current")}</span>
        </div>
        <div className="legend-item">
          <div className="legend-box past"></div>
          <span>{t("life.legend.past")}</span>
        </div>
        <div className="legend-item">
          <div className="legend-box remaining"></div>
          <span>{t("life.legend.remaining")}</span>
        </div>
        <div className="legend-item">
          <div className="legend-box child-birth"></div>
          <span>{t("life.legend.childBirth")}</span>
        </div>
        <div className="legend-item">
          <div className="legend-box child-18"></div>
          <span>{t("life.legend.childTurns18")}</span>
        </div>
        <div className="legend-item">
          <span className="raising-symbol">-</span>
          <span>{t("life.legend.raisingChildren")}</span>
        </div>
        <div className="legend-item">
          <div className="legend-box last-years"></div>
          <span>{t("life.legend.lastFiveYears")}</span>
        </div>
      </div>
    </div>
  );
};

export default LifeExpectancy;
