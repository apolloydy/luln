import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// 注册 Chart.js 组件
Chart.register(ArcElement, Tooltip, Legend);

const CausesOfDeath = () => {
    let causes = [
        { name: "Heart Disease", percentage: 21.4, color: "#FF6384", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "Cancer", percentage: 18.5, color: "#36A2EB", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "Accidents (Unintentional Injuries)", percentage: 6.9, color: "#FFCE56", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "COVID-19", percentage: 5.7, color: "#4BC0C0", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "Stroke", percentage: 5.0, color: "#9966FF", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "Chronic Lower Respiratory Diseases", percentage: 4.5, color: "#FF9F40", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "Alzheimer’s Disease", percentage: 3.7, color: "#C9CBCF", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "Diabetes", percentage: 3.1, color: "#F7464A", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "Kidney Diseases", percentage: 1.8, color: "#46BFBD", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" },
        { name: "Liver Disease", percentage: 1.6, color: "#FDB45C", source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" }
    ];

    // 计算现有总和
    let totalPercentage = causes.reduce((sum, cause) => sum + cause.percentage, 0);

    // 如果总和小于 100%，添加 "Others"
    if (totalPercentage < 100) {
        causes.push({
            name: "Others",
            percentage: (100 - totalPercentage).toFixed(1), // 保留一位小数
            color: "#888888", // 低饱和度灰色
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        });
    }

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
                        return cause.name === "Others" ? "Includes various minor causes" : `Source: ${cause.source}`;
                    }
                }
            }
        }
    };

    return (
        <div className="p-6 flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-4 text-white">Leading Causes of Death (2022)</h2>
            <div className="relative w-full" style={{ maxWidth: "600px", height: "400px" }}>
                <Pie data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default CausesOfDeath;