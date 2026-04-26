import React from "react";
import { useLocale } from "./i18n/LocaleProvider";
import {
  riskPathwayDiseases,
  riskPathwayEdges,
  riskPathwaysSources,
} from "./data/wellbing/riskPathways";
import { formatEffect, formatPaf } from "./components/wellbing/riskPathwayFormat";

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
          {riskPathwayDiseases.map((disease, index) => {
            const incoming = riskPathwayEdges
              .filter(
                (edge) =>
                  edge.to === disease.id &&
                  ["exercise", "diet", "screening", "sleep", "stress"].includes(edge.from)
              )
              .sort((a, b) => b.paf - a.paf)
              .slice(0, 3);

            return (
              <article key={disease.id} className="horseman-card">
                <span className="horseman-rank">{`0${index + 1}`}</span>
                <h3>{t(`chronic.diseases.${disease.id}.title`)}</h3>
                <p>{t(`chronic.diseases.${disease.id}.description`)}</p>

                {incoming.length > 0 && (
                  <div className="well-evidence">
                    <span className="well-evidence-title">
                      {t("chronic.evidence.title")}
                    </span>
                    <ul className="well-evidence-list">
                      {incoming.map((edge) => {
                        const source = riskPathwaysSources[edge.sourceId];
                        return (
                          <li key={`${edge.from}-${edge.to}-${edge.sourceId}`}>
                            <span className="well-evidence-from">
                              {t(`lifestyle.measures.${edge.from}.title`)}
                            </span>
                            <span className="well-evidence-effect">
                              {formatEffect(edge.effect, t)}
                            </span>
                            <span className="well-evidence-paf">
                              {formatPaf(edge.paf, t)}
                            </span>
                            {source && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="well-evidence-source"
                                title={source.label}
                              >
                                {t("chronic.evidence.sourceLabel")}
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ChronicDisease;
