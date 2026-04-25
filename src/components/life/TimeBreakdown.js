import React from "react";
import { calculateTimeBreakdown } from "./lifeCalculations";

const BREAKDOWN_KEYS = ["sleepDays", "workDays", "screenDays", "obligationDays", "meaningfulDays"];

export default function TimeBreakdown({ remainingDays, copy, formatNumber }) {
  const breakdown = calculateTimeBreakdown(remainingDays);
  const maxValue = Math.max(...BREAKDOWN_KEYS.map((key) => breakdown[key]), 1);

  return (
    <section className="life-redesign-section life-redesign-compression">
      <div className="life-redesign-section-copy">
        <span className="life-redesign-eyebrow">{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>

      <div className="life-redesign-breakdown">
        {BREAKDOWN_KEYS.map((key) => {
          const isMeaningful = key === "meaningfulDays";
          const width = `${Math.max(5, (breakdown[key] / maxValue) * 100)}%`;

          return (
            <article key={key} className={`life-redesign-breakdown-card${isMeaningful ? " meaningful" : ""}`}>
              <div>
                <span>{copy.labels[key]}</span>
                <strong className="tabular-nums">{copy.days.replace("{value}", formatNumber(breakdown[key]))}</strong>
              </div>
              <div className="life-redesign-bar" aria-hidden="true">
                <span style={{ width }} />
              </div>
            </article>
          );
        })}
      </div>

      <p className="life-redesign-emphasis">{copy.emphasis}</p>
    </section>
  );
}
