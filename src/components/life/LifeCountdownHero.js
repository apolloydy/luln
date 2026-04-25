import React, { useEffect, useRef, useState } from "react";

function useAnimatedNumber(value) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      setDisplayValue(value);
      previousValueRef.current = value;
      return undefined;
    }

    const startValue = previousValueRef.current;
    const difference = value - startValue;
    const startedAt = performance.now();
    let frameId;

    function tick(now) {
      const progress = Math.min(1, (now - startedAt) / 520);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + difference * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = value;
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return displayValue;
}

export default function LifeCountdownHero({
  birthDate,
  currentAge,
  expectedAge,
  stats,
  copy,
  formatNumber,
  onBirthDateChange,
  onExpectedAgeChange,
  onShowGrid,
}) {
  const animatedDays = useAnimatedNumber(stats.remainingDays);

  return (
    <section className="life-redesign-hero">
      <div className="life-redesign-hero-copy">
        <span className="life-redesign-eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>

        <div className="life-redesign-inputs" aria-label="Life input controls">
          <label className="life-redesign-field">
            <span>{copy.birthday}</span>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => onBirthDateChange(event.target.value)}
            />
          </label>

          <label className="life-redesign-field">
            <span>{copy.expectedLifespan}</span>
            <input
              type="number"
              min="1"
              max="120"
              value={expectedAge}
              onChange={(event) => onExpectedAgeChange(event.target.value)}
              inputMode="numeric"
            />
          </label>
        </div>

        {Number(currentAge) >= Number(expectedAge) ? (
          <p className="life-redesign-warning">{copy.warning}</p>
        ) : null}

        <button className="life-redesign-primary-button" type="button" onClick={onShowGrid}>
          {copy.cta}
        </button>
      </div>

      <div className="life-redesign-countdown" aria-label={copy.daysLeft}>
        <article className="life-redesign-hero-stat">
          <span>{copy.currentAge}</span>
          <strong className="tabular-nums">{formatNumber(currentAge, { maximumFractionDigits: 1 })}</strong>
        </article>
        <article className="life-redesign-hero-stat">
          <span>{copy.daysLeft}</span>
          <strong className="tabular-nums">{formatNumber(animatedDays)}</strong>
        </article>
        <article className="life-redesign-hero-stat">
          <span>{copy.weeksLeft}</span>
          <strong className="tabular-nums">{formatNumber(Math.round(stats.remainingWeeks))}</strong>
        </article>
      </div>
    </section>
  );
}
