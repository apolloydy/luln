import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {
  accidentalDeathCauses,
  accidentalDeathCausesSource,
} from "./data/wellbing/accidentalDeathCauses";

// 注册 Chart.js 组件
Chart.register(ArcElement, Tooltip, Legend);

const AccidentCauses = () => {
    const causes = accidentalDeathCauses;

    const chartData = {
        labels: causes.map(cause => cause.name),
        datasets: [
            {
                data: causes.map(cause => cause.percentage),
                backgroundColor: causes.map(cause => cause.color),
                hoverBackgroundColor: causes.map(cause => cause.color),
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "right",
                labels: {
                    color: "white",
                    font: { size: 14 },
                },
            },
            tooltip: {
                backgroundColor: "rgba(255,255,255,0.95)",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#ccc",
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (tooltipItem) {
                        const cause = causes[tooltipItem.dataIndex];
                        return `${cause.name}: ${cause.percentage}%`;
                    },
                }
            }
        }
    };

    return (
        <div className="p-6 flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-4 text-white">Accidental Death Causes</h2>
            <div className="relative w-full" style={{ maxWidth: "600px", height: "400px" }}>
                <Pie data={chartData} options={chartOptions} />
            </div>
            <p className="death-footnote w-full" style={{ maxWidth: "600px" }}>
                Source: <a href={accidentalDeathCausesSource.url} target="_blank" rel="noopener noreferrer" className="death-inline-link">{accidentalDeathCausesSource.label}</a>. Accessed {accidentalDeathCausesSource.accessed}. {accidentalDeathCausesSource.notes}
            </p>
        </div>
    );
};

export default AccidentCauses;
