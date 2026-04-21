import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {
  cancerDeathCausesSource,
  femaleCancerDeathCauses,
  maleCancerDeathCauses,
} from "./data/wellbing/cancerDeathCauses";

// 注册 Chart.js 组件
Chart.register(ArcElement, Tooltip, Legend);

const CancerStatistics = () => {
  const maleCancerCauses = maleCancerDeathCauses;
  const femaleCancerCauses = femaleCancerDeathCauses;

  const createChartData = (causes) => ({
    labels: causes.map((cause) => cause.name),
    datasets: [
      {
        data: causes.map((cause) => cause.percentage),
        backgroundColor: causes.map((cause) => cause.color),
        hoverBackgroundColor: causes.map((cause) => cause.color),
        borderWidth: 1,
      },
    ],
  });

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
            const cause = tooltipItem.chart.data.labels[tooltipItem.dataIndex];
            const percentage = tooltipItem.raw;
            return `${cause}: ${percentage}%`;
          },
        },
      },
    },
  };

  return (
    <div className="p-6 flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Cancer Death Statistics
      </h1>

      {/* 并排布局：外层一个 flex row，里面两个各占一半宽度 */}
      <div className="w-full max-w-4xl flex flex-row justify-between items-start space-x-4">
        {/* 左侧：男性癌症饼图 */}
        <div className="w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Male Cancer Death Causes
          </h2>
          <div className="relative w-full" style={{ height: "400px" }}>
            <Pie
              data={createChartData(maleCancerCauses)}
              options={chartOptions}
            />
          </div>
        </div>

        {/* 右侧：女性癌症饼图 */}
        <div className="w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Female Cancer Death Causes
          </h2>
          <div className="relative w-full" style={{ height: "400px" }}>
            <Pie
              data={createChartData(femaleCancerCauses)}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      <p className="death-footnote w-full max-w-4xl">
        Source: <a href={cancerDeathCausesSource.url} target="_blank" rel="noopener noreferrer" className="death-inline-link">{cancerDeathCausesSource.label}</a>. Accessed {cancerDeathCausesSource.accessed}. {cancerDeathCausesSource.notes}
      </p>
    </div>
  );
};

export default CancerStatistics;
