import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const vo2MaxCategories = [
  { min: 0, max: 25, description: "Even daily activities might feel difficult; the priority is building basic aerobic capacity." },
  { min: 25, max: 35, description: "Regular walking, light jogging, and basic fitness routines are realistic here." },
  { min: 35, max: 45, description: "Moderate running, cycling, and structured training become sustainable." },
  { min: 45, max: 55, description: "Strong recreational fitness; 5K/10K work and interval training fit here." },
  { min: 55, max: 65, description: "Endurance-event territory: marathons, triathlons, and sustained aerobic work." },
  { min: 65, max: 80, description: "High-level endurance athlete range." },
  { min: 80, max: 200, description: "Elite/professional outlier range." },
];

function getAnnualDeclineRate30to60(level, customRate) {
  if (level === "high") return 1 - Math.pow(0.97, 1 / 10);
  if (level === "moderate") return 1 - Math.pow(0.95, 1 / 10);
  if (level === "low") return 1 - Math.pow(0.9, 1 / 10);
  if (level === "custom") return customRate;
  return 0.01;
}

function getAnnualDeclineRateAfter60(annualRate30to60) {
  return annualRate30to60 * 1.5;
}

function getPeakLimitAt30(level) {
  if (level === "high") return 60;
  if (level === "moderate") return 55;
  if (level === "low") return 45;
  return 60;
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function generateVo2Array(ageNow, vo2Now, trainingLevel, customRate, endAge) {
  const arr = [];
  const annualRate30to60 = getAnnualDeclineRate30to60(trainingLevel, customRate);
  const annualRateAfter60 = getAnnualDeclineRateAfter60(annualRate30to60);
  const limitAt30 = getPeakLimitAt30(trainingLevel);
  const target30 = vo2Now >= limitAt30 ? vo2Now : limitAt30;

  function getVo2Before30(age) {
    if (ageNow >= 30) return target30;
    if (age <= ageNow) return vo2Now;
    if (age >= 30) return target30;

    const yearsTo30 = 30 - ageNow;
    const slope = (target30 - vo2Now) / yearsTo30;
    return vo2Now + slope * (age - ageNow);
  }

  function getVo2After30(age) {
    if (age < 30) return target30;
    if (age <= 60) {
      return target30 * Math.pow(1 - annualRate30to60, age - 30);
    }

    const vo2At60 = target30 * Math.pow(1 - annualRate30to60, 30);
    return vo2At60 * Math.pow(1 - annualRateAfter60, age - 60);
  }

  const transition30 = 1;
  const transition60 = 1;

  for (let age = ageNow; age <= endAge; age += 1) {
    let vo2;
    const lower30 = 30 - transition30;
    const upper30 = 30 + transition30;

    if (age < lower30) {
      vo2 = getVo2Before30(age);
    } else if (age > upper30) {
      vo2 = getVo2After30(age);
    } else {
      const t = (age - lower30) / (upper30 - lower30);
      vo2 = lerp(getVo2Before30(age), getVo2After30(age), t);
    }

    if (age >= 60 - transition60 && age <= 60 + transition60) {
      const lower60 = 60 - transition60;
      const upper60 = 60 + transition60;
      const t2 = (age - lower60) / (upper60 - lower60);

      const vo2_30to60 = target30 * Math.pow(1 - annualRate30to60, Math.min(age, 60) - 30);
      const vo2At60 = target30 * Math.pow(1 - annualRate30to60, 30);
      const vo2_after60 = age < 60 ? vo2At60 : vo2At60 * Math.pow(1 - annualRateAfter60, age - 60);

      vo2 = (vo2 + lerp(vo2_30to60, vo2_after60, t2)) / 2;
    }

    arr.push({ age, vo2 });
  }

  return arr;
}

function Vo2Max() {
  const storedBirthday = localStorage.getItem("birthDate") || "1962-03-02";
  const now = new Date();
  const birth = new Date(storedBirthday);
  let ageNow = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    ageNow -= 1;
  }

  if (ageNow < 0) ageNow = 0;

  const storedLifeExp = localStorage.getItem("lifeExpectancy");
  const endAge = storedLifeExp ? parseInt(storedLifeExp, 10) : 80;

  const [currentVo2, setCurrentVo2] = useState(() => parseInt(localStorage.getItem("currentVo2"), 10) || 40);
  const [trainingLevel, setTrainingLevel] = useState(() => localStorage.getItem("trainingLevel") || "moderate");
  const [customDeclineRate, setCustomDeclineRate] = useState(() => parseFloat(localStorage.getItem("customDeclineRate")) || 0.01);

  useEffect(() => {
    localStorage.setItem("currentVo2", String(currentVo2));
  }, [currentVo2]);

  useEffect(() => {
    localStorage.setItem("trainingLevel", trainingLevel);
  }, [trainingLevel]);

  useEffect(() => {
    localStorage.setItem("customDeclineRate", String(customDeclineRate));
  }, [customDeclineRate]);

  const vo2MaxData = generateVo2Array(ageNow, currentVo2, trainingLevel, customDeclineRate, endAge);

  const chartData = {
    datasets: [
      {
        label: "VO2 Max (ml/kg/min)",
        data: vo2MaxData.map((d) => ({ x: d.age, y: d.vo2 })),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        cubicInterpolationMode: "monotone",
        tension: 0.35,
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Age",
          color: "#cbd5e1",
        },
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.12)",
        },
      },
      y: {
        title: {
          display: true,
          text: "VO2 Max (ml/kg/min)",
          color: "#cbd5e1",
        },
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.12)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0",
        },
      },
    },
  };

  return (
    <div className="well-page">
      <section className="well-hero">
        <div>
          <span className="well-eyebrow">Aerobic Reserve</span>
          <h1 className="well-title">VO2 Max is not vanity. It is capacity.</h1>
          <p className="well-copy">
            Cardiorespiratory fitness tells you how much aerobic reserve you can draw on. That is
            one reason it correlates so strongly with long-term outcomes.
          </p>
        </div>

        <div className="well-hero-note">
          <strong>Current setup</strong>
          <span>{`Birthday: ${storedBirthday}`}</span>
          <span>{`Current age: ${ageNow} | Life expectancy: ${endAge}`}</span>
        </div>
      </section>

      <section className="well-card">
        <div className="well-card-header">
          <div>
            <span className="well-eyebrow">Projection Inputs</span>
            <h2 className="well-card-title">Estimate the decline curve</h2>
            <p className="well-card-copy">
              This is a simple scenario model, not a diagnostic tool. Change the assumptions and
              inspect the slope.
            </p>
          </div>
        </div>

        <div className="well-input-grid">
          <label className="field">
            <span className="field-label">Current VO2 Max</span>
            <input type="number" step="1" value={currentVo2} onChange={(e) => setCurrentVo2(Number(e.target.value))} />
          </label>

          <label className="field">
            <span className="field-label">Training Level</span>
            <select value={trainingLevel} onChange={(e) => setTrainingLevel(e.target.value)}>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          {trainingLevel === "custom" ? (
            <label className="field">
              <span className="field-label">Custom Annual Decline</span>
              <input
                type="number"
                step="0.001"
                value={customDeclineRate}
                onChange={(e) => setCustomDeclineRate(Number(e.target.value))}
              />
            </label>
          ) : null}
        </div>

        <div className="vo2-chart-wrap">
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>

      <section className="well-card">
        <div className="well-card-header">
          <div>
            <span className="well-eyebrow">Reference Ranges</span>
            <h2 className="well-card-title">What the numbers usually mean</h2>
          </div>
        </div>

        <div className="vo2-table-wrap">
          <table className="vo2-table">
            <thead>
              <tr>
                <th>VO2 Max Range</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {vo2MaxCategories.map((cat) => (
                <tr key={`${cat.min}-${cat.max}`}>
                  <td>{`${cat.min}-${cat.max} ml/kg/min`}</td>
                  <td>{cat.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Vo2Max;
