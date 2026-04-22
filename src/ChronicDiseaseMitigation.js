import React from "react";
import { useLocale } from "./i18n/LocaleProvider";

const measures = [
  {
    key: "exercise",
  },
  {
    key: "screening",
    source: {
      url: "https://www.cancer.org/health-care-professionals/american-cancer-society-prevention-early-detection-guidelines.html",
    },
  },
  {
    key: "sleep",
    source: {
      url: "https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need",
    },
  },
  {
    key: "stress",
  },
  {
    key: "diet",
  },
];

const ChronicDiseaseMitigation = () => {
  const { t } = useLocale();

  return (
    <div className="well-page">
      <section className="well-hero">
        <div>
          <span className="well-eyebrow">{t("lifestyle.heroEyebrow")}</span>
          <h1 className="well-title">{t("lifestyle.heroTitle")}</h1>
          <p className="well-copy">{t("lifestyle.heroCopy")}</p>
        </div>

        <div className="well-hero-note">
          <strong>{t("lifestyle.noteTitle")}</strong>
          <span>{t("lifestyle.noteLine1")}</span>
          <span>{t("lifestyle.noteLine2")}</span>
        </div>
      </section>

      <section className="well-card">
        <div className="well-card-header">
          <div>
            <span className="well-eyebrow">{t("lifestyle.leversEyebrow")}</span>
            <h2 className="well-card-title">{t("lifestyle.leversTitle")}</h2>
            <p className="well-card-copy">{t("lifestyle.leversCopy")}</p>
          </div>
        </div>

        <div className="mitigation-grid">
          {measures.map((measure) => (
            <article key={measure.key} className="mitigation-card">
              <h3>{t(`lifestyle.measures.${measure.key}.title`)}</h3>
              {t(`lifestyle.measures.${measure.key}.body`).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {measure.source ? (
                <a
                  href={measure.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="well-inline-link"
                >
                  {t(`lifestyle.measures.${measure.key}.sourceLabel`)}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <p className="well-note">{t("common.notMedicalAdvice")}</p>
    </div>
  );
};

export default ChronicDiseaseMitigation;
