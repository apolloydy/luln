import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// 注册 Chart.js 组件
Chart.register(ArcElement, Tooltip, Legend);

const AccidentCauses = () => {
    let causes = [
        { name: "Motor Vehicle Crashes", percentage: 37.0, color: "#FF6384", source: "https://www.cdc.gov/injury/wisqars/" },
        { name: "Drug Overdose & Poisoning", percentage: 29.0, color: "#36A2EB", source: "https://www.cdc.gov/injury/wisqars/" },
        { name: "Falls", percentage: 21.0, color: "#FFCE56", source: "https://www.cdc.gov/injury/wisqars/" },
        { name: "Suffocation", percentage: 6.0, color: "#4BC0C0", source: "https://www.cdc.gov/injury/wisqars/" },
        { name: "Drowning", percentage: 3.5, color: "#9966FF", source: "https://www.cdc.gov/injury/wisqars/" },
        { name: "Fire & Smoke Exposure", percentage: 1.5, color: "#FF9F40", source: "https://www.cdc.gov/injury/wisqars/" },
        { name: "Others", percentage: 2.0, color: "#888888", source: "https://www.cdc.gov/injury/wisqars/" }
    ];

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
                    afterLabel: function (tooltipItem) {
                        const cause = causes[tooltipItem.dataIndex];
                        return `Source: ${cause.source}`;
                    }
                }
            }
        }
    };

    return (
        <div className="p-6 flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-4 text-white">Accidental Death Causes (2022)</h2>
            <div className="relative w-full" style={{ maxWidth: "600px", height: "400px" }}>
                <Pie data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default AccidentCauses;