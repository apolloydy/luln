import React from "react";
import { Link } from "react-router-dom";

export default function MortalityTransition({ copy }) {
  return (
    <section className="life-redesign-section life-redesign-mortality">
      <div className="life-redesign-risk-curve" aria-hidden="true" />
      <div className="life-redesign-section-copy">
        <span className="life-redesign-eyebrow">{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p className="life-redesign-section-lead">{copy.lead}</p>
        <p>{copy.body}</p>
      </div>

      <div className="life-redesign-link-row">
        <Link to="/wellbing/mortality-explorer">{copy.exploreRisk}</Link>
        <Link to="/wellbing/chronic-disease">{copy.chronic}</Link>
        <Link to="/wellbing/cause-of-death">{copy.overview}</Link>
      </div>
    </section>
  );
}
