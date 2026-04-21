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

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const causes = leadingCausesOfDeath2024;

const chartData = {
  labels: causes.slice(0, 10).map((cause) => `${cause.rank}. ${cause.name}`),
  datasets: [
    {
      label: "% of total deaths",
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
          return `${cause.percentage}% of all U.S. deaths in 2024`;
        },
        afterLabel(context) {
          const cause = causes[context.dataIndex];
          return `Deaths: ${cause.deaths.toLocaleString()} | Rate: ${cause.rate} per 100,000`;
        },
      },
    },
  },
};

const topThree = causes.slice(0, 3);

const CausesOfDeath = () => {
  return (
    <section className="death-card">
      <div className="death-card-header">
        <div>
          <span className="death-eyebrow">CDC Final Data</span>
          <h2 className="death-title">Leading causes of death in the United States, 2024</h2>
          <p className="death-subtitle">
            Suicide entered the top 10 in 2024, replacing COVID-19, while heart disease, cancer,
            and unintentional injuries remained the top three causes.
          </p>
        </div>
        <a
          href={leadingCausesOfDeath2024Source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="death-source-link"
        >
          View Source
        </a>
      </div>

      <div className="death-summary-grid">
        {topThree.map((cause) => (
          <article key={cause.name} className="death-summary-item">
            <span className="death-rank">{`#${cause.rank}`}</span>
            <strong>{cause.name}</strong>
            <span>{cause.percentage}% of all deaths</span>
            <span>{cause.deaths.toLocaleString()} deaths</span>
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
                  <strong>{cause.rank ? `${cause.rank}. ${cause.name}` : cause.name}</strong>
                </div>
                <span className="death-list-percent">{cause.percentage}%</span>
              </div>

              <div className="death-list-meta">
                <span>{cause.deaths.toLocaleString()} deaths</span>
                {cause.rate !== null ? <span>{cause.rate} per 100,000</span> : <span>Residual category</span>}
              </div>
            </article>
          ))}
        </div>
      </div>

      <p className="death-footnote">
        Source: <a href={leadingCausesOfDeath2024Source.url} target="_blank" rel="noopener noreferrer" className="death-inline-link">{leadingCausesOfDeath2024Source.label}</a>. Accessed {leadingCausesOfDeath2024Source.accessed}.
      </p>
    </section>
  );
};

export default CausesOfDeath;
