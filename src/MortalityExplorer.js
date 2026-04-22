import React, { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import {
  leadingCausesOfDeath2024,
  leadingCausesOfDeath2024Source,
} from "./data/wellbing/leadingCausesOfDeath2024";
import { useLocale } from "./i18n/LocaleProvider";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const sexOptions = ["all", "male", "female"];
const raceOptions = ["all", "white", "black", "asian", "aian"];
const ageOptions = ["allAges", "25-44", "45-64", "65-74", "75+"];

const MortalityExplorer = () => {
  const { t } = useLocale();
  const [sex, setSex] = useState("all");
  const [race, setRace] = useState("all");
  const [ageGroup, setAgeGroup] = useState("allAges");
  const causeLabels = t("death.causeLabels");
  const filterLabels = t("death.filters");

  const chartData = useMemo(() => {
    const filtered = leadingCausesOfDeath2024.slice(0, 10);

    return {
      labels: filtered.map((item) => causeLabels[item.name] || item.name),
      datasets: [
        {
          label: t("death.leadingCauses.chartLabel"),
          data: filtered.map((item) => item.percentage),
          backgroundColor: filtered.map((item) => item.color),
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 18,
        },
      ],
    };
  }, [causeLabels, t]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    scales: {
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.12)",
        },
        ticks: {
          color: "#cbd5e1",
          callback(value) {
            return `${value}%`;
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#e2e8f0",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.96)",
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        displayColors: false,
      },
    },
  };

  return (
    <div className="death-page">
      <section className="death-hero">
        <div>
          <span className="death-eyebrow">{t("death.explorer.heroEyebrow")}</span>
          <h1 className="death-page-title">{t("death.explorer.heroTitle")}</h1>
          <p className="death-page-copy">{t("death.explorer.heroCopy")}</p>
        </div>

        <div className="death-hero-note">
          <strong>{t("death.explorer.noteTitle")}</strong>
          <span>{t("death.explorer.noteLine1")}</span>
          <span>{t("death.explorer.noteLine2")}</span>
        </div>
      </section>

      <section className="death-card">
        <div className="death-card-header">
          <div>
            <span className="death-eyebrow">{t("death.explorer.filterEyebrow")}</span>
            <h2 className="death-title">{t("death.explorer.filterTitle")}</h2>
            <p className="death-subtitle">{t("death.explorer.filterSubtitle")}</p>
          </div>
        </div>

        <div className="well-input-grid">
          <label className="field">
            <span className="field-label">{t("death.explorer.sex")}</span>
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              {sexOptions.map((option) => (
                <option key={option} value={option}>
                  {filterLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">{t("death.explorer.race")}</span>
            <select value={race} onChange={(e) => setRace(e.target.value)}>
              {raceOptions.map((option) => (
                <option key={option} value={option}>
                  {filterLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">{t("death.explorer.ageGroup")}</span>
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
              {ageOptions.map((option) => (
                <option key={option} value={option}>
                  {filterLabels[option] || option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="death-card" style={{ marginTop: 20 }}>
        <div className="death-card-header">
          <div>
            <span className="death-eyebrow">{t("death.explorer.currentOutputEyebrow")}</span>
            <h2 className="death-title">{t("death.explorer.currentOutputTitle")}</h2>
            <p className="death-subtitle">
              {sex === "all" && race === "all" && ageGroup === "allAges"
                ? t("death.explorer.defaultNote")
                : t("death.explorer.filteredNote", {
                    sex: filterLabels[sex],
                    race: filterLabels[race],
                    ageGroup: filterLabels[ageGroup] || ageGroup,
                  })}
            </p>
          </div>
          <a
            href={leadingCausesOfDeath2024Source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="death-source-link"
          >
            {t("common.viewSource")}
          </a>
        </div>

        <div className="death-chart-panel">
          <div className="relative h-[420px] w-full">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <p className="death-footnote">
          {t("common.source")}:{" "}
          <a
            href={leadingCausesOfDeath2024Source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="death-inline-link"
          >
            {leadingCausesOfDeath2024Source.label}
          </a>
          . {t("common.accessedOn", { date: leadingCausesOfDeath2024Source.accessed })}. {leadingCausesOfDeath2024Source.notes}
        </p>
      </section>
    </div>
  );
};

export default MortalityExplorer;
