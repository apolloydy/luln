import React from "react";
import CausesOfDeath from "./CausesOfDeath";
import CancerStatistics from "./CancerStatistics";
import AccidentCauses from "./AccidentCauses";
import { useLocale } from "./i18n/LocaleProvider";

const DeathStatistics = () => {
  const { t } = useLocale();

  return (
    <div className="death-page">
      <section className="death-hero">
        <div>
          <span className="death-eyebrow">{t("death.hero.eyebrow")}</span>
          <h1 className="death-page-title">{t("death.hero.title")}</h1>
          <p className="death-page-copy">{t("death.hero.copy")}</p>
        </div>

        <div className="death-hero-note">
          <strong>{t("death.hero.noteTitle")}</strong>
          <span>{t("death.hero.noteLine1")}</span>
          <span>{t("death.hero.noteLine2")}</span>
        </div>
      </section>

      <CausesOfDeath />

      <section className="death-secondary-grid">
        <section className="death-secondary-card">
          <div className="death-card-header">
            <div>
              <span className="death-eyebrow">{t("death.supplementary.eyebrow")}</span>
              <h2 className="death-title">{t("death.supplementary.cancerTitle")}</h2>
              <p className="death-subtitle">{t("death.supplementary.cancerSubtitle")}</p>
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
              <span className="death-eyebrow">{t("death.supplementary.eyebrow")}</span>
              <h2 className="death-title">{t("death.supplementary.accidentTitle")}</h2>
              <p className="death-subtitle">{t("death.supplementary.accidentSubtitle")}</p>
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
