import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// 注册 Chart.js 组件
Chart.register(...registerables);

const Vo2Max = () => {
  const [startVO2Max, setStartVO2Max] = useState(50); // 假设用户的 VO2Max 初始值
  const [startAge, setStartAge] = useState(30); // 用户开始的年龄
  const [gender, setGender] = useState("male"); // 性别

  // 根据性别计算 VO2Max 随年龄的下降速率
  const getDeclineRate = (gender) => (gender === "male" ? 0.5 : 0.4); // 男性每年下降 0.5，女性 0.4

  // 计算 30 岁到 90 岁的 VO2Max
  const generateVO2MaxData = () => {
    let vo2MaxValues = [];
    let declineRate = getDeclineRate(gender);
    let vo2 = startVO2Max;

    for (let age = startAge; age <= 90; age++) {
      vo2MaxValues.push({ age, vo2 });
      vo2 -= declineRate; // 每年递减
    }
    return vo2MaxValues;
  };

  const vo2MaxData = generateVO2MaxData();

  const chartData = {
    labels: vo2MaxData.map((data) => data.age),
    datasets: [
      {
        label: "VO₂ Max over Time",
        data: vo2MaxData.map((data) => data.vo2),
        borderColor: "blue",
        fill: false,
      },
    ],
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", backgroundColor: "black", color: "white" }}>
      <h2>[WIP] VO₂ Max Decline Over Time</h2>
      <div>
        <label>Initial VO₂ Max: </label>
        <input
          type="number"
          value={startVO2Max}
          onChange={(e) => setStartVO2Max(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Start Age: </label>
        <input
          type="number"
          value={startAge}
          onChange={(e) => setStartAge(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Gender: </label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div style={{ width: "80%", margin: "20px auto" }}>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default Vo2Max;