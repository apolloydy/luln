import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// 注册 Chart.js 组件
Chart.register(...registerables);

/** 1) 定义一个 VO₂ Max 范围表，仅作示例 */
const vo2MaxCategories = [
  { min: 0,   max: 25,  description: "日常活动可能都吃力，需加强基础体能" },
  { min: 25,  max: 35,  description: "可进行轻度慢跑、日常健身" },
  { min: 35,  max: 45,  description: "可进行规律跑步、骑行等中等强度运动" },
  { min: 45,  max: 55,  description: "可进行5K、10K跑步，或高强度间歇训练" },
  { min: 55,  max: 65,  description: "可参与马拉松、铁人三项等耐力项目" },
  { min: 65,  max: 80,  description: "高水平耐力运动员水平" },
  { min: 80,  max: 200, description: "精英/职业运动员水平" },
];

/** 2) 计算在某年龄时的 VO₂ Max */
function getVO2MaxAtAge(age, peakVO2, peakAge, annualDeclineRate) {
  // 如果当前年龄 <= 峰值年龄，就认为还在峰值（或你可以做更复杂的“上升期”模型）
  if (age <= peakAge) {
    return peakVO2;
  }
  // 年龄超过峰值后，每年衰减 annualDeclineRate（如 1% = 0.01）
  const yearsAfterPeak = age - peakAge;
  // 指数型衰减：vo2 = peakVO2 * (1 - annualDeclineRate)^(yearsAfterPeak)
  return peakVO2 * Math.pow(1 - annualDeclineRate, yearsAfterPeak);
}

const Vo2Max = () => {
  // 默认峰值 VO₂ Max、峰值年龄、性别、绘图起止年龄
  const [peakVO2, setPeakVO2] = useState(50);    // 峰值 VO₂ Max (ml/kg/min)
  const [peakAge, setPeakAge] = useState(30);    // 到达峰值的年龄
  const [startAge, setStartAge] = useState(20);  // 绘图起始年龄
  const [endAge, setEndAge] = useState(80);      // 绘图结束年龄
  const [gender, setGender] = useState("male");  // 性别

  // 定义男女衰减率示例
  const getDeclineRate = (gender) => {
    if (gender === "male") {
      return 0.01;  // 男性 1%/年
    } else {
      return 0.008; // 女性 0.8%/年
    }
  };

  // 生成 [startAge, endAge] 范围内每一年的 VO₂ Max
  const generateVO2MaxData = () => {
    let results = [];
    const declineRate = getDeclineRate(gender);
    for (let age = startAge; age <= endAge; age++) {
      const vo2 = getVO2MaxAtAge(age, peakVO2, peakAge, declineRate);
      results.push({ age, vo2 });
    }
    return results;
  };

  const vo2MaxData = generateVO2MaxData();

  /** Chart.js 数据 */
  const chartData = {
    labels: vo2MaxData.map((item) => item.age),
    datasets: [
      {
        label: "VO₂ Max (ml/kg/min)",
        data: vo2MaxData.map((item) => item.vo2),
        borderColor: "blue",
        tension: 0.2,   // 让曲线更平滑
        fill: false,
      },
    ],
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", backgroundColor: "black", color: "white" }}>
      <h2>VO₂ Max Peak & Decline Model</h2>
      
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: 10 }}>
          Peak VO₂ Max:
          <input
            type="number"
            value={peakVO2}
            onChange={(e) => setPeakVO2(Number(e.target.value))}
            style={{ marginLeft: 5, width: 60 }}
          />
        </label>
        <label style={{ marginRight: 10 }}>
          Peak Age:
          <input
            type="number"
            value={peakAge}
            onChange={(e) => setPeakAge(Number(e.target.value))}
            style={{ marginLeft: 5, width: 60 }}
          />
        </label>
        <label style={{ marginRight: 10 }}>
          Start Age:
          <input
            type="number"
            value={startAge}
            onChange={(e) => setStartAge(Number(e.target.value))}
            style={{ marginLeft: 5, width: 60 }}
          />
        </label>
        <label style={{ marginRight: 10 }}>
          End Age:
          <input
            type="number"
            value={endAge}
            onChange={(e) => setEndAge(Number(e.target.value))}
            style={{ marginLeft: 5, width: 60 }}
          />
        </label>
        <label style={{ marginRight: 10 }}>
          Gender:
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ marginLeft: 5 }}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
      </div>

      <div style={{ width: "80%", margin: "20px auto" }}>
        <Line data={chartData} />
      </div>

      {/* VO₂ Max 范围对应活动示例 */}
      <h3>VO₂ Max 水平与对应活动</h3>
      <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid white" }}>
            <th style={{ padding: "8px 12px" }}>VO₂ Max 范围</th>
            <th style={{ padding: "8px 12px" }}>对应活动示例</th>
          </tr>
        </thead>
        <tbody>
          {vo2MaxCategories.map((cat, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid gray" }}>
              <td style={{ padding: "8px 12px" }}>
                {cat.min} - {cat.max} ml/kg/min
              </td>
              <td style={{ padding: "8px 12px" }}>{cat.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Vo2Max;