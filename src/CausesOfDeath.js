import React from "react";
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

const causes = leadingCausesOfDeath2024;

const topThree = causes.slice(0, 3);

const CausesOfDeath = () => {
  const { t, formatNumber } = useLocale();
  const causeLabels = t("death.causeLabels");

  const chartData = {
    labels: causes.slice(0, 10).map((cause) => `${cause.rank}. ${causeLabels[cause.name] || cause.name}`),
    datasets: [
      {
        label: t("death.leadingCauses.chartLabel"),
        data: causes.slice(0, 10).map((cause) => cause.percentage),
        backgroundColor: causes.slice(0, 10).map((cause) => cause.color),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 18,
      },
    ],
  };

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
        callbacks: {
          label(context) {
            const cause = causes[context.dataIndex];
            return t("death.leadingCauses.tooltipLine1", { value: cause.percentage });
          },
          afterLabel(context) {
            const cause = causes[context.dataIndex];
            return t("death.leadingCauses.tooltipLine2", {
              deaths: formatNumber(cause.deaths),
              rate: cause.rate,
            });
          },
        },
      },
    },
  };

  return (
    <section className="death-card">
      <div className="death-card-header">
        <div>
          <span className="death-eyebrow">{t("death.leadingCauses.eyebrow")}</span>
          <h2 className="death-title">{t("death.leadingCauses.title")}</h2>
          <p className="death-subtitle">{t("death.leadingCauses.subtitle")}</p>
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

      <div className="death-summary-grid">
        {topThree.map((cause) => (
          <article key={cause.name} className="death-summary-item">
            <span className="death-rank">{`#${cause.rank}`}</span>
            <strong>{causeLabels[cause.name] || cause.name}</strong>
            <span>{t("common.ofAllDeaths", { value: cause.percentage })}</span>
            <span>{t("death.leadingCauses.deaths", { value: formatNumber(cause.deaths) })}</span>
          </article>
        ))}
      </div>

      <div className="death-layout">
        <div className="death-chart-panel">
          <div className="relative h-[420px] w-full">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="death-list-panel">
          {causes.map((cause) => (
            <article key={cause.name} className="death-list-item">
              <div className="death-list-heading">
                <div className="death-list-title-wrap">
                  <span
                    className="death-color-dot"
                    style={{ backgroundColor: cause.color }}
                    aria-hidden="true"
                  />
                  <strong>{cause.rank ? `${cause.rank}. ${causeLabels[cause.name] || cause.name}` : causeLabels[cause.name] || cause.name}</strong>
                </div>
                <span className="death-list-percent">{cause.percentage}%</span>
              </div>

              <div className="death-list-meta">
                <span>{t("death.leadingCauses.deaths", { value: formatNumber(cause.deaths) })}</span>
                {cause.rate !== null ? <span>{t("death.leadingCauses.rate", { value: cause.rate })}</span> : <span>{t("common.residualCategory")}</span>}
              </div>
            </article>
          ))}
        </div>
      </div>

      <p className="death-footnote">
        {t("common.source")}: <a href={leadingCausesOfDeath2024Source.url} target="_blank" rel="noopener noreferrer" className="death-inline-link">{leadingCausesOfDeath2024Source.label}</a>. {t("common.accessedOn", { date: leadingCausesOfDeath2024Source.accessed })}.
      </p>
    </section>
  );
};

export default CausesOfDeath;
