import React from "react";
import { Link } from "react-router-dom";

export default function FinalLifeCTA({ copy }) {
  return (
    <section className="life-redesign-final">
      <h2>{copy.title}</h2>
      <p>{copy.subtitle}</p>
      <div className="life-redesign-link-row final">
        <Link to="/wellbing/life-style-changes">{copy.primary}</Link>
        <Link to="/wellbing/mortality-explorer">{copy.secondary}</Link>
      </div>
    </section>
  );
}
