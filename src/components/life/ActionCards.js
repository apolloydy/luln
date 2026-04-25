import React from "react";
import { Link } from "react-router-dom";

export default function ActionCards({ copy }) {
  return (
    <section className="life-redesign-section">
      <div className="life-redesign-section-copy">
        <span className="life-redesign-eyebrow">{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </div>

      <div className="life-redesign-action-grid">
        {copy.cards.map(([marker, title, body, cta]) => (
          <Link key={title} className="life-redesign-action-card" to="/wellbing/life-style-changes">
            <span className="life-redesign-action-icon" aria-hidden="true">{marker}</span>
            <h3>{title}</h3>
            <p>{body}</p>
            <strong>{cta}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
