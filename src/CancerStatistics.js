import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {
  cancerDeathCausesSource,
  femaleCancerDeathCauses,
  maleCancerDeathCauses,
} from "./data/wellbing/cancerDeathCauses";
import { useLocale } from "./i18n/LocaleProvider";

// 注册 Chart.js 组件
Chart.register(ArcElement, Tooltip, Legend);

const CancerStatistics = () => {
  const { t } = useLocale();
  const maleCancerCauses = maleCancerDeathCauses;
  const femaleCancerCauses = femaleCancerDeathCauses;
  const causeLabels = t("death.causeLabels");
  const renderModernDonut = (title, causes) => {
    const topCause = causes[0];
    const topLabel = causeLabels[topCause.name] || topCause.name;
    const chartData = createChartData(causes);

    return (
      <article className="modern-donut-card">
        <div className="modern-donut-card-header">
          <h3>{title}</h3>
          <span>{topLabel}</span>
        </div>

        <div className="modern-donut-layout">
          <div className="modern-donut-chart">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="modern-donut-center" aria-hidden="true">
              <strong>{topCause.percentage}%</strong>
              <span>{topLabel}</span>
            </div>
          </div>

          <div className="modern-donut-legend">
            {causes.map((cause) => (
              <div key={cause.name} className="modern-donut-legend-item">
                <span className="modern-donut-dot" style={{ background: cause.color }} />
                <span>{causeLabels[cause.name] || cause.name}</span>
                <strong>{cause.percentage}%</strong>
              </div>
            ))}
          </div>
        </div>
      </article>
    );
  };

  function createChartData(causes) {
    return {
    labels: causes.map((cause) => causeLabels[cause.name] || cause.name),
    datasets: [
      {
        data: causes.map((cause) => cause.percentage),
        backgroundColor: causes.map((cause) => cause.color),
        hoverBackgroundColor: causes.map((cause) => cause.color),
        borderColor: "rgba(15, 23, 42, 0.88)",
        borderWidth: 3,
        borderRadius: 8,
        spacing: 2,
      },
    ],
    };
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.96)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(148, 163, 184, 0.22)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label(tooltipItem) {
            const cause = tooltipItem.chart.data.labels[tooltipItem.dataIndex];
            const percentage = tooltipItem.raw;
            return `${cause}: ${percentage}%`;
          },
        },
      },
    },
  };

  return (
    <div className="modern-donut-section">
      <div className="modern-donut-grid">
        {renderModernDonut(`${t("death.filters.male")} ${t("death.supplementary.cancerTitle")}`, maleCancerCauses)}
        {renderModernDonut(`${t("death.filters.female")} ${t("death.supplementary.cancerTitle")}`, femaleCancerCauses)}
      </div>

      <p className="death-footnote modern-donut-source">
        {t("common.source")}: <a href={cancerDeathCausesSource.url} target="_blank" rel="noopener noreferrer" className="death-inline-link">{cancerDeathCausesSource.label}</a>. {t("common.accessedOn", { date: cancerDeathCausesSource.accessed })}. {cancerDeathCausesSource.notes}
      </p>
    </div>
  );
};

export default CancerStatistics;
