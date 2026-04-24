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
  leadingCausesBySlice2024,
  leadingCausesBySlice2024Source,
} from "./data/wellbing/leadingCausesBySlice2024";
import {
  uscsCancerMortality2023,
  uscsCancerMortality2023Source,
} from "./data/wellbing/uscsCancerMortality2023";
import { useLocale } from "./i18n/LocaleProvider";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const sexOptions = ["all", "male", "female"];
const raceOptions = ["all", "white", "black", "asian", "aian"];
const locationOptions = [
  ["national", "National"],
  ["alabama", "Alabama"],
  ["alaska", "Alaska"],
  ["arizona", "Arizona"],
  ["arkansas", "Arkansas"],
  ["california", "California"],
  ["colorado", "Colorado"],
  ["connecticut", "Connecticut"],
  ["delaware", "Delaware"],
  ["districtOfColumbia", "District of Columbia"],
  ["florida", "Florida"],
  ["georgia", "Georgia"],
  ["hawaii", "Hawaii"],
  ["idaho", "Idaho"],
  ["illinois", "Illinois"],
  ["indiana", "Indiana"],
  ["iowa", "Iowa"],
  ["kansas", "Kansas"],
  ["kentucky", "Kentucky"],
  ["louisiana", "Louisiana"],
  ["maine", "Maine"],
  ["maryland", "Maryland"],
  ["massachusetts", "Massachusetts"],
  ["michigan", "Michigan"],
  ["minnesota", "Minnesota"],
  ["mississippi", "Mississippi"],
  ["missouri", "Missouri"],
  ["montana", "Montana"],
  ["nebraska", "Nebraska"],
  ["nevada", "Nevada"],
  ["newHampshire", "New Hampshire"],
  ["newJersey", "New Jersey"],
  ["newMexico", "New Mexico"],
  ["newYork", "New York"],
  ["northCarolina", "North Carolina"],
  ["northDakota", "North Dakota"],
  ["ohio", "Ohio"],
  ["oklahoma", "Oklahoma"],
  ["oregon", "Oregon"],
  ["pennsylvania", "Pennsylvania"],
  ["rhodeIsland", "Rhode Island"],
  ["southCarolina", "South Carolina"],
  ["southDakota", "South Dakota"],
  ["tennessee", "Tennessee"],
  ["texas", "Texas"],
  ["utah", "Utah"],
  ["vermont", "Vermont"],
  ["virginia", "Virginia"],
  ["washington", "Washington"],
  ["washingtonDc", "Washington DC"],
  ["westVirginia", "West Virginia"],
  ["wisconsin", "Wisconsin"],
  ["wyoming", "Wyoming"],
];
const ageOptions = [
  "allAges",
  "25-29",
  "30-34",
  "35-39",
  "40-44",
  "45-49",
  "50-54",
  "55-59",
  "60-64",
  "65-69",
  "70-74",
  "75-79",
  "80-84",
  "85+",
];
const viewOptions = ["leadingCauses", "cancerMortality"];

const MortalityExplorer = () => {
  const { t, formatNumber } = useLocale();
  const [view, setView] = useState("cancerMortality");
  const [sex, setSex] = useState("all");
  const [race, setRace] = useState("all");
  const [location, setLocation] = useState("national");
  const [ageGroup, setAgeGroup] = useState("allAges");
  const causeLabels = t("death.causeLabels");
  const cancerSiteLabels = t("death.cancerSiteLabels");
  const filterLabels = t("death.filters");
  const viewLabels = t("death.explorer.views");
  const isCancerView = view === "cancerMortality";
  const isNational = location === "national";
  const locationLabel = locationOptions.find(([value]) => value === location)?.[1] || location;
  const effectiveAgeGroup = isCancerView && !isNational ? "allAges" : ageGroup;
  const leadingSlice =
    leadingCausesBySlice2024[`${sex}|${race}|${effectiveAgeGroup}`] ||
    leadingCausesBySlice2024["all|all|allAges"];
  const cancerKey = isNational
    ? `${sex}|${race}|${effectiveAgeGroup}`
    : `${sex}|${race}|allAges|${location}`;
  const cancerSlice =
    uscsCancerMortality2023[cancerKey] ||
    uscsCancerMortality2023["all|all|allAges"];
  const activeSource = isCancerView ? uscsCancerMortality2023Source : leadingCausesBySlice2024Source;
  const rateLabel =
    cancerSlice.rateType === "ageAdjusted"
      ? t("death.explorer.ageAdjustedRate")
      : t("death.explorer.ageSpecificRate");

  const chartData = useMemo(() => {
    if (isCancerView) {
      return {
        labels: cancerSlice.sites.map((item) => cancerSiteLabels[item.site] || item.site),
        datasets: [
          {
            label: t("death.explorer.cancerDeathsLabel"),
            data: cancerSlice.sites.map((item) => item.deaths),
            backgroundColor: cancerSlice.sites.map((item) => item.color),
            borderRadius: 10,
            borderSkipped: false,
            maxBarThickness: 18,
          },
        ],
      };
    }

    return {
      labels: leadingSlice.causes.slice(0, 12).map((item) => causeLabels[item.name] || item.name),
      datasets: [
        {
          label: t("death.leadingCauses.chartLabel"),
          data: leadingSlice.causes.slice(0, 12).map((item) => item.percentage),
          backgroundColor: leadingSlice.causes.slice(0, 12).map((item) => item.color),
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 18,
        },
      ],
    };
  }, [cancerSiteLabels, cancerSlice, causeLabels, isCancerView, leadingSlice, t]);

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
            if (isCancerView) {
              return formatNumber(value, { notation: "compact", maximumFractionDigits: 1 });
            }
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
            if (!isCancerView) {
              const item = leadingSlice.causes[context.dataIndex];
              return [
                t("death.explorer.tooltipShare", { value: context.parsed.x }),
                t("death.explorer.tooltipDeaths", { value: formatNumber(item.deaths) }),
              ];
            }

            const item = cancerSlice.sites[context.dataIndex];
            return [
              t("death.explorer.tooltipDeaths", { value: formatNumber(item.deaths) }),
              t("death.explorer.tooltipShare", { value: item.percentage }),
              t("death.explorer.tooltipRate", { label: rateLabel, value: item.rate }),
            ];
          },
        },
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
            <span className="field-label">{t("death.explorer.view")}</span>
            <select value={view} onChange={(e) => setView(e.target.value)}>
              {viewOptions.map((option) => (
                <option key={option} value={option}>
                  {viewLabels[option]}
                </option>
              ))}
            </select>
          </label>

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
            <span className="field-label">{t("death.explorer.location")}</span>
            <select
              value={location}
              disabled={!isCancerView}
              onChange={(e) => {
                setLocation(e.target.value);
                if (e.target.value !== "national") {
                  setAgeGroup("allAges");
                }
              }}
            >
              {locationOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {value === "national" ? t("death.filters.national") : label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">{t("death.explorer.ageGroup")}</span>
            <select
              value={effectiveAgeGroup}
              disabled={isCancerView && !isNational}
              onChange={(e) => setAgeGroup(e.target.value)}
            >
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
            <h2 className="death-title">
              {isCancerView
                ? t("death.explorer.cancerOutputTitle")
                : t("death.explorer.currentOutputTitle")}
            </h2>
            <p className="death-subtitle">
              {isCancerView
                ? t("death.explorer.cancerNote", {
                    sex: filterLabels[sex],
                    race: filterLabels[race],
                    ageGroup: filterLabels[effectiveAgeGroup] || effectiveAgeGroup,
                    location: isNational ? t("death.filters.national") : locationLabel,
                    deaths: formatNumber(cancerSlice.totalDeaths),
                    rateLabel,
                    rate: cancerSlice.totalRate,
                  })
                : t("death.explorer.leadingNote", {
                    sex: filterLabels[sex],
                    race: filterLabels[race],
                    ageGroup: filterLabels[effectiveAgeGroup] || effectiveAgeGroup,
                    deaths: formatNumber(leadingSlice.totalDeaths),
                  })}
            </p>
          </div>
          <a
            href={activeSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="death-source-link"
          >
            {t("common.viewSource")}
          </a>
        </div>

        {isCancerView && (
          <div className="death-summary-grid death-summary-grid-compact">
            <div className="death-summary-item">
              <span>{t("death.explorer.totalCancerDeaths")}</span>
              <strong>{formatNumber(cancerSlice.totalDeaths)}</strong>
            </div>
            <div className="death-summary-item">
              <span>{rateLabel}</span>
              <strong>{t("death.leadingCauses.rate", { value: cancerSlice.totalRate })}</strong>
            </div>
            <div className="death-summary-item">
              <span>{t("death.explorer.cdcPopulation")}</span>
              <strong>{formatNumber(cancerSlice.population)}</strong>
            </div>
          </div>
        )}

        <div className="death-chart-panel">
          <div className="relative h-[420px] w-full">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <p className="death-footnote">
          {t("common.source")}:{" "}
          <a
            href={activeSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="death-inline-link"
          >
            {activeSource.label}
          </a>
          . {t("common.accessedOn", { date: activeSource.accessed })}. {activeSource.notes}{" "}
          {isCancerView ? t("death.explorer.ageDataAvailable") : ""}
          {isCancerView && !isNational ? ` ${t("death.explorer.locationAgeNote")}` : ""}
        </p>
      </section>
    </div>
  );
};

export default MortalityExplorer;
