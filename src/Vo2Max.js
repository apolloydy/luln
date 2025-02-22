import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

/** VO₂ Max 范围表 */
const vo2MaxCategories = [
  { min: 0,   max: 25,  description: "日常活动可能都吃力，需加强基础体能" },
  { min: 25,  max: 35,  description: "可进行轻度慢跑、日常健身" },
  { min: 35,  max: 45,  description: "可进行规律跑步、骑行等中等强度运动" },
  { min: 45,  max: 55,  description: "可进行5K、10K跑步，或高强度间歇训练" },
  { min: 55,  max: 65,  description: "可参与马拉松、铁人三项等耐力项目" },
  { min: 65,  max: 80,  description: "高水平耐力运动员水平" },
  { min: 80,  max: 200, description: "精英/职业运动员水平" },
];

/** 30～60 岁的年衰减率 */
function getAnnualDeclineRate30to60(level, customRate) {
  if (level === "high") {
    // 10年降3%
    return 1 - Math.pow(0.97, 1 / 10);
  } else if (level === "moderate") {
    // 10年降5%
    return 1 - Math.pow(0.95, 1 / 10);
  } else if (level === "low") {
    // 10年降10%
    return 1 - Math.pow(0.90, 1 / 10);
  } else if (level === "custom") {
    return customRate;
  }
  return 0.01; // 默认1%/年
}

/** 60 岁以后衰减加速（示例：乘以1.5） */
function getAnnualDeclineRateAfter60(annualRate30to60) {
  return annualRate30to60 * 1.5;
}

/**
 * 根据 trainingLevel 设置 30岁时的“峰值限制”
 * - high => 60
 * - moderate => 55
 * - low => 45
 * - custom => 60 (示例)
 */
function getPeakLimitAt30(level) {
  if (level === "high") return 60;
  if (level === "moderate") return 55;
  if (level === "low") return 45;
  // custom 或其他 => 你可以再自定义
  return 60;
}

/**
 * 生成 VO₂ Max 数组
 *   - 若 < 30 岁：线性插值到 30 岁时的 target30
 *   - 30-60 岁：指数衰减 annualRate30to60
 *   - 60 岁后：annualRateAfter60
 */
function generateVo2Array(ageNow, vo2Now, trainingLevel, customRate, endAge) {
  const arr = [];
  const annualRate30to60 = getAnnualDeclineRate30to60(trainingLevel, customRate);
  const annualRateAfter60 = getAnnualDeclineRateAfter60(annualRate30to60);

  // 根据训练水平选择不同的峰值限制
  const limit = getPeakLimitAt30(trainingLevel);

  // 若当前vo2本来就比 limit 大，就直接用 currentVo2
  const target30 = vo2Now >= limit ? vo2Now : limit;

  for (let age = ageNow; age <= endAge; age++) {
    let vo2 = 0;
    if (age < 30) {
      // 线性插值
      const yearsTo30 = 30 - ageNow;
      if (yearsTo30 <= 0) {
        vo2 = vo2Now;
      } else {
        const slope = (target30 - vo2Now) / yearsTo30;
        const diff = age - ageNow;
        vo2 = vo2Now + slope * diff;
        if (vo2 > target30) vo2 = target30;
      }
    } else if (age <= 60) {
      // 指数衰减
      const yearsAfter30 = age - 30;
      vo2 = target30 * Math.pow(1 - annualRate30to60, yearsAfter30);
    } else {
      // 60 岁以后加速衰减
      const vo2At60 = target30 * Math.pow(1 - annualRate30to60, 30);
      const yearsAfter60 = age - 60;
      vo2 = vo2At60 * Math.pow(1 - annualRateAfter60, yearsAfter60);
    }
    arr.push({ age, vo2 });
  }
  return arr;
}

function Vo2Max() {
  // 读取 birthday
  const storedBirthday = localStorage.getItem("birthDate") || "1962-03-02";
  const now = new Date();
  const birth = new Date(storedBirthday);
  let ageNow = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    ageNow--;
  }
  if (ageNow < 0) ageNow = 0;

  // 读取 lifeExpectancy
  const storedLifeExp = localStorage.getItem("lifeExpectancy");
  const endAge = storedLifeExp ? parseInt(storedLifeExp, 10) : 80;

  // 当前 VO₂ Max （存/取 localStorage）
  const [currentVo2, setCurrentVo2] = useState(() => parseInt(localStorage.getItem("currentVo2"), 10) || 40);

  // 训练水平
  const [trainingLevel, setTrainingLevel] = useState(() => localStorage.getItem("trainingLevel") || "moderate");

  // 如果是 custom
  const [customDeclineRate, setCustomDeclineRate] = useState(0.01);

  // --- 新增/修改的 useEffect：初始化时一次性读取 localStorage ---
  useEffect(() => {
    // 读取 VO2
    const storedVo2 = localStorage.getItem("currentVo2");
    if (storedVo2) {
      setCurrentVo2(parseInt(storedVo2, 10));
    }

    // 读取训练水平
    const storedTrainingLevel = localStorage.getItem("trainingLevel");
    if (storedTrainingLevel) {
      setTrainingLevel(storedTrainingLevel);
    }

    // 读取自定义衰减率
    const storedCustomRate = localStorage.getItem("customDeclineRate");
    if (storedCustomRate) {
      setCustomDeclineRate(parseFloat(storedCustomRate));
    }
  }, []);

  // --- 当 currentVo2 / trainingLevel / customDeclineRate 变化时，写回 localStorage ---
  useEffect(() => {
    localStorage.setItem("currentVo2", String(currentVo2));
  }, [currentVo2]);

  useEffect(() => {
    localStorage.setItem("trainingLevel", trainingLevel);
  }, [trainingLevel]);

  useEffect(() => {
    localStorage.setItem("customDeclineRate", String(customDeclineRate));
  }, [customDeclineRate]);

  // 后面是你的 generateVo2Array、chartData 等逻辑
  const vo2MaxData = generateVo2Array(ageNow, currentVo2, trainingLevel, customDeclineRate, endAge);

  const chartData = {
    labels: vo2MaxData.map(d => d.age),
    datasets: [
      {
        label: "VO₂ Max (ml/kg/min)",
        data: vo2MaxData.map(d => d.vo2),
        borderColor: "blue",
        cubicInterpolationMode: "monotone",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  return (
    <div style={{ textAlign: "center", padding: 20, backgroundColor: "black", color: "white" }}>
      <h2>VO₂ Max with Different Peak Limits</h2>
      <p>生日: {storedBirthday} (推算年龄: {ageNow})</p>
      <p>寿命: {endAge} 岁 (localStorage.lifeExpectancy)</p>

      <div style={{ marginBottom: 10 }}>
        <label style={{ marginRight: 10 }}>
          当前 VO₂ Max:
          <input
            type="number"
            step="1"
            value={currentVo2}
            onChange={(e) => setCurrentVo2(Number(e.target.value))}
            style={{ marginLeft: 5, width: 80 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ marginRight: 10 }}>
          Training Level:
          <select
            value={trainingLevel}
            onChange={(e) => setTrainingLevel(e.target.value)}
            style={{ marginLeft: 5 }}
          >
            <option value="high">High (10年降3%，峰值limit=60)</option>
            <option value="moderate">Moderate (10年降5%，limit=55)</option>
            <option value="low">Low (10年降10%，limit=45)</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {trainingLevel === "custom" && (
          <label style={{ marginRight: 10 }}>
            自定义年衰减率(30-60):
            <input
              type="number"
              step="0.001"
              value={customDeclineRate}
              onChange={(e) => setCustomDeclineRate(Number(e.target.value))}
              style={{ marginLeft: 5, width: 80 }}
            />
          </label>
        )}
      </div>

      <div style={{ width: "80%", margin: "20px auto" }}>
        <Line data={chartData} />
      </div>

      <h3>VO₂ Max 范围对应活动示例</h3>
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
}

export default Vo2Max;