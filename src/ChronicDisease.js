import React from "react";
import { useLocale } from "./i18n/LocaleProvider";

const diseases = [
  "atherosclerotic",
  "cancer",
  "neuro",
  "metabolic",
  "immune",
];

const ChronicDisease = () => {
  const { t } = useLocale();

  return (
    <div className="well-page">
      <section className="well-hero">
        <div>
          <span className="well-eyebrow">{t("chronic.heroEyebrow")}</span>
          <h1 className="well-title">{t("chronic.heroTitle")}</h1>
          <p className="well-copy">{t("chronic.heroCopy")}</p>
        </div>

        <div className="well-hero-note">
          <strong>{t("chronic.noteTitle")}</strong>
          <span>{t("chronic.noteLine1")}</span>
          <span>{t("chronic.noteLine2")}</span>
        </div>
      </section>

      <section className="well-card">
        <div className="well-card-header">
          <div>
            <span className="well-eyebrow">{t("chronic.frameworkEyebrow")}</span>
            <h2 className="well-card-title">{t("chronic.frameworkTitle")}</h2>
            <p className="well-card-copy">{t("chronic.frameworkCopy")}</p>
          </div>
        </div>

        <div className="horsemen-grid">
          {diseases.map((diseaseKey, index) => (
            <article key={diseaseKey} className="horseman-card">
              <span className="horseman-rank">{`0${index + 1}`}</span>
              <h3>{t(`chronic.diseases.${diseaseKey}.title`)}</h3>
              <p>{t(`chronic.diseases.${diseaseKey}.description`)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ChronicDisease;
