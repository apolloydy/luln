import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// 注册 Chart.js 组件
Chart.register(ArcElement, Tooltip, Legend);

const CancerStatistics = () => {
  // 男性癌症死亡数据
  const maleCancerCauses = [
    { name: "Lung Cancer", percentage: 21.0, color: "#FF6384" },
    { name: "Prostate Cancer", percentage: 10.0, color: "#36A2EB" },
    { name: "Colorectal Cancer", percentage: 9.0, color: "#FFCE56" },
    { name: "Pancreatic Cancer", percentage: 8.0, color: "#4BC0C0" },
    { name: "Liver Cancer", percentage: 6.0, color: "#9966FF" },
    { name: "Leukemia", percentage: 5.0, color: "#FF9F40" },
    { name: "Esophageal Cancer", percentage: 4.0, color: "#C9CBCF" },
    { name: "Others", percentage: 37.0, color: "#888888" },
  ];

  // 女性癌症死亡数据
  const femaleCancerCauses = [
    { name: "Lung Cancer", percentage: 22.0, color: "#FF6384" },
    { name: "Breast Cancer", percentage: 15.0, color: "#36A2EB" },
    { name: "Colorectal Cancer", percentage: 9.0, color: "#FFCE56" },
    { name: "Pancreatic Cancer", percentage: 8.0, color: "#4BC0C0" },
    { name: "Ovarian Cancer", percentage: 5.0, color: "#9966FF" },
    { name: "Uterine Cancer", percentage: 4.0, color: "#FF9F40" },
    { name: "Leukemia", percentage: 3.0, color: "#C9CBCF" },
    { name: "Others", percentage: 34.0, color: "#888888" },
  ];

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
        Cancer Death Statistics (2022)
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
    </div>
  );
};

export default CancerStatistics;