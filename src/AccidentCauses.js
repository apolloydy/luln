import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {
  accidentalDeathCauses,
  accidentalDeathCausesSource,
} from "./data/wellbing/accidentalDeathCauses";
import { useLocale } from "./i18n/LocaleProvider";

// 注册 Chart.js 组件
Chart.register(ArcElement, Tooltip, Legend);

const AccidentCauses = () => {
    const { t } = useLocale();
    const causes = accidentalDeathCauses;
    const causeLabels = t("death.causeLabels");
    const topCause = causes[0];
    const topLabel = causeLabels[topCause.name] || topCause.name;

    const chartData = {
        labels: causes.map(cause => causeLabels[cause.name] || cause.name),
        datasets: [
            {
                data: causes.map(cause => cause.percentage),
                backgroundColor: causes.map(cause => cause.color),
                hoverBackgroundColor: causes.map(cause => cause.color),
                borderColor: "rgba(15, 23, 42, 0.88)",
                borderWidth: 3,
                borderRadius: 8,
                spacing: 2,
            },
        ],
    };

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
                    label: function (tooltipItem) {
                        const cause = causes[tooltipItem.dataIndex];
                        return `${causeLabels[cause.name] || cause.name}: ${cause.deaths.toLocaleString()} deaths (${cause.percentage}%)`;
                    },
                }
            }
        }
    };

    return (
        <div className="modern-donut-section">
            <article className="modern-donut-card modern-donut-card-wide">
                <div className="modern-donut-card-header">
                    <h3>{t("death.supplementary.accidentTitle")}</h3>
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
            <p className="death-footnote modern-donut-source">
                {t("common.source")}: <a href={accidentalDeathCausesSource.url} target="_blank" rel="noopener noreferrer" className="death-inline-link">{accidentalDeathCausesSource.label}</a>. {t("common.accessedOn", { date: accidentalDeathCausesSource.accessed })}. {accidentalDeathCausesSource.notes}
            </p>
        </div>
    );
};

export default AccidentCauses;
