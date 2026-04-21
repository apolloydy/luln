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

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const sexOptions = ["All", "Male", "Female"];
const raceOptions = ["All", "White", "Black", "Asian", "AIAN"];
const ageOptions = ["All ages", "25-44", "45-64", "65-74", "75+"];

function getExplorerNote({ sex, race, ageGroup }) {
  if (sex === "All" && race === "All" && ageGroup === "All ages") {
    return "This first version uses the national 2024 leading-causes dataset as the base layer. The filter framework is live; deeper subgroup datasets will be connected next.";
  }

  return `Current filters are set to ${sex}, ${race}, ${ageGroup}. The UI is ready for subgroup data, but this version still displays the national 2024 baseline until the expanded dataset is wired in.`;
}

const MortalityExplorer = () => {
  const [sex, setSex] = useState("All");
  const [race, setRace] = useState("All");
  const [ageGroup, setAgeGroup] = useState("All ages");

  const chartData = useMemo(() => {
    const filtered = leadingCausesOfDeath2024.slice(0, 10);

    return {
      labels: filtered.map((item) => item.name),
      datasets: [
        {
          label: "% of all deaths",
          data: filtered.map((item) => item.percentage),
          backgroundColor: filtered.map((item) => item.color),
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 18,
        },
      ],
    };
  }, []);

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
          <span className="death-eyebrow">Interactive Explorer</span>
          <h1 className="death-page-title">Filter mortality patterns by the dimensions that matter.</h1>
          <p className="death-page-copy">
            This page is where the static overview becomes an explorable system. Start with sex,
            race, and age group, then trace how the pattern shifts.
          </p>
        </div>

        <div className="death-hero-note">
          <strong>Current version</strong>
          <span>Filter framework is now live.</span>
          <span>Expanded subgroup datasets are the next step.</span>
        </div>
      </section>

      <section className="death-card">
        <div className="death-card-header">
          <div>
            <span className="death-eyebrow">Filter Bar</span>
            <h2 className="death-title">Choose the population slice</h2>
            <p className="death-subtitle">These controls are intentionally narrow in v1: sex, race, and age group only.</p>
          </div>
        </div>

        <div className="well-input-grid">
          <label className="field">
            <span className="field-label">Sex</span>
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              {sexOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Race</span>
            <select value={race} onChange={(e) => setRace(e.target.value)}>
              {raceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Age Group</span>
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
              {ageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="death-card" style={{ marginTop: 20 }}>
        <div className="death-card-header">
          <div>
            <span className="death-eyebrow">Current Output</span>
            <h2 className="death-title">Leading causes view</h2>
            <p className="death-subtitle">{getExplorerNote({ sex, race, ageGroup })}</p>
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

        <div className="death-chart-panel">
          <div className="relative h-[420px] w-full">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <p className="death-footnote">
          Source:{" "}
          <a
            href={leadingCausesOfDeath2024Source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="death-inline-link"
          >
            {leadingCausesOfDeath2024Source.label}
          </a>
          . Accessed {leadingCausesOfDeath2024Source.accessed}. {leadingCausesOfDeath2024Source.notes}
        </p>
      </section>
    </div>
  );
};

export default MortalityExplorer;
