import React from "react";
import CausesOfDeath from "./CausesOfDeath";
import CancerStatistics from "./CancerStatistics";
import AccidentCauses from "./AccidentCauses";

const DeathStatistics = () => {
  return (
    <div className="death-page">
      <section className="death-hero">
        <div>
          <span className="death-eyebrow">Wellbing / Cause of Death</span>
          <h1 className="death-page-title">Mortality patterns, updated to CDC 2024 final data</h1>
          <p className="death-page-copy">
            Start with the national picture, then drill into cancer and accidental causes as
            supplementary views. The goal is not shock value. The goal is perspective.
          </p>
        </div>

        <div className="death-hero-note">
          <strong>2024 key shift</strong>
          <span>Suicide became the 10th leading cause of death.</span>
          <span>COVID-19 fell out of the top 10 and dropped to 15th.</span>
        </div>
      </section>

      <CausesOfDeath />

      <section className="death-secondary-grid">
        <section className="death-secondary-card">
          <div className="death-card-header">
            <div>
              <span className="death-eyebrow">Supplementary Breakdown</span>
              <h2 className="death-title">Cancer death causes</h2>
              <p className="death-subtitle">
                Sex-specific breakdown for major cancer death categories, kept as a supporting view.
              </p>
            </div>
            <a
              href="https://www.cancer.org/research/cancer-facts-statistics/all-cancer-facts-figures/2025-cancer-facts-figures.html"
              target="_blank"
              rel="noopener noreferrer"
              className="death-source-link"
            >
              American Cancer Society
            </a>
          </div>
          <CancerStatistics />
        </section>

        <section className="death-secondary-card">
          <div className="death-card-header">
            <div>
              <span className="death-eyebrow">Supplementary Breakdown</span>
              <h2 className="death-title">Accidental death causes</h2>
              <p className="death-subtitle">
                A focused view on unintentional injury categories to complement the national top-10 list.
              </p>
            </div>
            <a
              href="https://www.cdc.gov/injury/wisqars/"
              target="_blank"
              rel="noopener noreferrer"
              className="death-source-link"
            >
              CDC WISQARS
            </a>
          </div>
          <AccidentCauses />
        </section>
      </section>
    </div>
  );
};

export default DeathStatistics;
