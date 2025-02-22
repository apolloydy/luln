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
  // custom 或其他 => 可以再自定义
  return 60;
}

/**
 * 一个简单的线性插值函数
 * t ∈ [0,1] 时, 返回 (1 - t)*start + t*end
 */
function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * 生成 VO₂ Max 数组，添加 30 岁、60 岁平滑过渡
 */
function generateVo2Array(ageNow, vo2Now, trainingLevel, customRate, endAge) {
  const arr = [];
  const annualRate30to60 = getAnnualDeclineRate30to60(trainingLevel, customRate);
  const annualRateAfter60 = getAnnualDeclineRateAfter60(annualRate30to60);

  // 根据训练水平选择不同的峰值限制
  const limitAt30 = getPeakLimitAt30(trainingLevel);

  // 若当前vo2本来就比 limit 大，就直接用 currentVo2
  const target30 = vo2Now >= limitAt30 ? vo2Now : limitAt30;

  // 计算 30 岁时，若一直线性提升到30岁的 VO2
  // （假设当前 ageNow <= 30；若实际 ageNow>30，依然可以用这个函数算一个“假设线性延伸”的值）
  function getVo2Before30(age) {
    if (ageNow >= 30) {
      // 若当前年龄已超过30，就直接返回“目标30值”
      return target30;
    }
    if (age <= ageNow) return vo2Now;
    if (age >= 30) return target30;

    const yearsTo30 = 30 - ageNow; 
    const slope = (target30 - vo2Now) / yearsTo30;
    const diff = age - ageNow;
    return vo2Now + slope * diff;
  }

  // 计算 30~60 岁以及 60 岁后指数衰减情况下的 VO2
  // 注意，这里要先假设“30 岁那年时 VO2 = target30”
  function getVo2After30(age) {
    if (age < 30) return target30; 
    if (age <= 60) {
      const yearsAfter30 = age - 30;
      return target30 * Math.pow(1 - annualRate30to60, yearsAfter30);
    } else {
      // 60岁后
      const vo2At60 = target30 * Math.pow(1 - annualRate30to60, 30);
      const yearsAfter60 = age - 60;
      return vo2At60 * Math.pow(1 - annualRateAfter60, yearsAfter60);
    }
  }

  // 对 60 岁之前做一次函数，60 岁之后做一次函数
  // 但为了让 30 岁处、60 岁处曲线更平滑，我们给每个拐点加一个 smallRange 的过渡
  const transition30 = 1; // 在 [29,31] 做插值
  const transition60 = 1; // 在 [59,61] 做插值

  for (let age = ageNow; age <= endAge; age++) {
    let vo2;

    // ========== 先处理 30 岁的过渡 ==========
    const lower30 = 30 - transition30;
    const upper30 = 30 + transition30;

    if (age < lower30) {
      // 还远没到 30 岁
      vo2 = getVo2Before30(age);
    } else if (age > upper30) {
      // 过了 30 岁的过渡区
      vo2 = getVo2After30(age);
    } else {
      // 在 [30-transition30, 30+transition30] 之间，做插值
      const t = (age - lower30) / (upper30 - lower30); 
      const linearVal = getVo2Before30(age); 
      const expoVal = getVo2After30(age); 
      vo2 = lerp(linearVal, expoVal, t);
    }

    // ========== 再处理 60 岁的过渡 ==========
    // 这里因为上一段已经把 age>=30 的都“走”到了 getVo2After30，但还可能在 59~61 的区间再次出现陡变
    // 可以类似加一段插值。思路一样：先算“纯粹 30~60 的指数衰减” vs “纯粹 60岁后加速衰减”这两种，然后在 [59,61] 混合。
    // 不过为了简化，这里演示一个写法：直接对 vo2 在 59~61 岁再进行一次插值矫正。
    // 如果你想让30~60岁和60岁后本就是一个公式，也可以把“60岁后”那段也整合进 getVo2After30(age) 的插值里。
    if (age >= 60 - transition60 && age <= 60 + transition60) {
      const lower60 = 60 - transition60;
      const upper60 = 60 + transition60;
      const t2 = (age - lower60) / (upper60 - lower60);

      // “纯粹 30-60 指数” 在 age 这点的值
      const vo2_30to60 = (() => {
        // 强行让 age 不超过60，用前面 30-60 的逻辑算
        const yrsAfter30 = Math.min(age, 60) - 30;
        return target30 * Math.pow(1 - annualRate30to60, yrsAfter30);
      })();

      // “纯粹 60 岁后加速衰减” 在 age 这点的值
      const vo2_after60 = (() => {
        const vo2At60 = target30 * Math.pow(1 - annualRate30to60, 30);
        if (age < 60) {
          // 强行让 age 不小于60
          return vo2At60;
        } else {
          const yrsAfter60 = age - 60;
          return vo2At60 * Math.pow(1 - annualRateAfter60, yrsAfter60);
        }
      })();

      // 把前面算出来的 vo2 与这两种纯粹值再插值一下
      // 这样做能在 59~61 之间进一步柔化衔接
      const blended = lerp(vo2_30to60, vo2_after60, t2);

      // 再和前面“可能已经过一次插值”的 vo2 做一个折中
      // 也可以直接赋值 = blended，看你是否希望 30 岁区的过渡优先级更高
      vo2 = (vo2 + blended) / 2; 
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

  // 初始化时一次性读取 localStorage
  useEffect(() => {
    const storedVo2 = localStorage.getItem("currentVo2");
    if (storedVo2) {
      setCurrentVo2(parseInt(storedVo2, 10));
    }

    const storedTrainingLevel = localStorage.getItem("trainingLevel");
    if (storedTrainingLevel) {
      setTrainingLevel(storedTrainingLevel);
    }

    const storedCustomRate = localStorage.getItem("customDeclineRate");
    if (storedCustomRate) {
      setCustomDeclineRate(parseFloat(storedCustomRate));
    }
  }, []);

  // 当 currentVo2 / trainingLevel / customDeclineRate 变化时，写回 localStorage
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
      <h2>VO₂ Max with Smooth Transition</h2>
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
            <option value="high">High (10年降3%，limit=60)</option>
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