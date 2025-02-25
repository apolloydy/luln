


import React, { useState, useEffect } from "react";
import "./styles.css";
import { Tooltip } from "react-tooltip";
import techEvents from "./techEvents"; // 导入科技事件
import quotes from "./quote"; // 导入名言
import bodyDevelopmentFacts from "./bodyDevelopmentFacts"; // 导入身体发育事实
import futurePredictions from "./futurePredictions"; // 导入身体发育事实

function getWeekOfYear(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1); // 当年的 1 月 1 日
  const daysElapsed = Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24)); // 计算过去的天数
  return Math.floor(daysElapsed / 7) + 1; // 计算第几周
}

function getPct(year, lifeExpectancy, birthDate) {
  const birth = new Date(birthDate);
  const currentDate = new Date(year, 0, 1);
  const pct = (currentDate - birth) * 100 / (lifeExpectancy * 365.25 * 24 * 60 * 60 * 1000)
  if (pct < 0) {
    return 0
  }
  if (pct > 100) {
    return 100
  }
  return pct
}

function getColorTran(pct) {
  // 使用 HSL 让颜色深浅随百分比变化
  const hue = 120 - (pct * 1.2);  // 120° (绿色) → 0° (红色)
  const lightness = 90 - (pct * 0.6); // 90% (浅色) → 40% (深色)
  // 确保 lightness 在合理范围
  const finalLightness = Math.max(30, Math.min(90, lightness));
  const pctColor = `hsl(${hue}, 80%, ${finalLightness}%)`;
  return pctColor
}

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function calculateDays(birthDate, expectancy, setThisWeek, setRemainingWeeks, setRemainingDays, setThisYear, setBirthWeekOfYear, setDeathWeekOfYear, setLifePercentage) {
  const birth = new Date(birthDate);
  const today = new Date();
  const deathDate = new Date(birth.getTime() + expectancy * 365.25 * 24 * 60 * 60 * 1000);

  if (today < birth) {
    setThisWeek(0);
    setRemainingWeeks(Math.floor((expectancy * 365.25) / 7));
    return;
  }

  const totalDays = Math.round(expectancy * 365.25);
  const past = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
  const remaining = totalDays - past;

  setThisYear(today.getFullYear());
  setThisWeek(getWeekOfYear(today));
  setRemainingWeeks(remaining > 0 ? Math.floor(remaining / 7) : 0);
  setRemainingDays(remaining > 0 ? remaining : 0);

  // 计算出生年的第几周
  const startOfYear = new Date(birth.getFullYear(), 0, 1);
  setBirthWeekOfYear(Math.floor((birth - startOfYear) / (1000 * 60 * 60 * 24 * 7)));

  // 计算去世年的第几周
  const startOfDeathYear = new Date(deathDate.getFullYear(), 0, 1);
  setDeathWeekOfYear(Math.floor((deathDate - startOfDeathYear) / (1000 * 60 * 60 * 24 * 7)));

  // 剩余百分比
  const percentage = (remaining * 100 / totalDays).toFixed(1);
  setLifePercentage(percentage);
}

function renderGrid(birthDate, lifeExpectancy, firstChildBirth, lastChildBirth, thisYear, thisWeek, birthWeekOfYear, deathWeekOfYear, techEvents, bodyDevelopmentFacts, futurePredictions) {
  const birthYear = new Date(birthDate).getFullYear();
  const deathYear = birthYear + Math.floor(lifeExpectancy) + 1;
  const totalYears = deathYear - birthYear;

  const firstChild = new Date(firstChildBirth)
  const firstChildYear = firstChild.getFullYear();
  const firstChildWeek = getWeekOfYear(firstChild);

  const lastChild = new Date(lastChildBirth)
  const lastChildYear = (lastChild.getFullYear() > firstChildYear) ? lastChild.getFullYear() : firstChildYear;
  const lastChildWeek = (lastChild.getFullYear() >= firstChildYear) ? getWeekOfYear(lastChild) : firstChildWeek;

  return (
    <div className="grid-container">
      {Array.from({ length: totalYears }).map((_, yearOffset) => {
        const year = birthYear + yearOffset;
        if (year < birthYear || year > deathYear) return null;

        return (
          <div key={year} className="year-row">
            {(() => {
              if (year % 5 === 0) {
                return <span className="year-label">{year}</span>;
              } else if (year % 5 === 1) {
                const pct = getPct(year - 1, lifeExpectancy, birthDate).toFixed(0);
                const pctColor = getColorTran(pct);
                return <span className="year-label" style={{ color: pctColor }} >{"(" + getPct(year - 1, lifeExpectancy, birthDate).toFixed(0) + "%)"}</span>;
              } else {
                return <span className="year-label-placeholder">{"____"}</span>; // 为空但保持对齐
              }
            })()}
            <div className="weeks">
              {Array.from({ length: 52 }).map((_, week) => {
                let boxClass = "grid-box";
                let content = "";
                let age
                if (week < birthWeekOfYear) {
                  age = year - new Date(birthDate).getFullYear() - 1;
                  if (age < 0) {
                    age = 0;
                  }
                } else {
                  age = year - new Date(birthDate).getFullYear();
                }
                let eventText = "";

                if (techEvents[year]) {
                  eventText = techEvents[year]; // 如果有历史事件，就用它
                } else if (futurePredictions[year]) {
                  eventText = `(Prediction) ${futurePredictions[year]}`; // 如果是未来预测，前面加上 "(Prediction)"
                } else {
                  eventText = "The future belongs to those who innovate."; // 如果都没有，使用默认文本
                }
                let bodyDevelopmentFactsText = bodyDevelopmentFacts[age] || "You’ve unlocked the secret to immortality. Please share the cheat code!";
                const tooltipText = `[age ${age}]: ${bodyDevelopmentFactsText} <br />  [${year}]: ${eventText}`;

                if ((year === birthYear && week < birthWeekOfYear) || (year === deathYear - 1 && week > deathWeekOfYear)) {
                  boxClass += " empty"; // 渲染与背景色相同的格子
                } else if ((year < thisYear) || (year === thisYear && thisWeek > week)) {
                  boxClass += " past";
                } else if (year >= deathYear - 5 || (year === deathYear - 6 && week > deathWeekOfYear)) {
                  boxClass += " last-years"; // last 5 years
                } else {
                  boxClass += " remaining";
                }

                if (firstChildYear === year && firstChildWeek === week) boxClass += " child-birth";
                if (lastChildYear === year && lastChildWeek === week) boxClass += " child-birth";
                if (lastChildWeek === week && year === lastChildYear + 18) boxClass += " child-18";
                if (((firstChildYear < year) || (firstChildYear === year && firstChildWeek <= week)) && (year < lastChildYear + 18 || (year === lastChildYear + 18 && lastChildWeek >= week))) {
                  content = <span className="child-raising-text" style={{ color: "orange" }}>-</span>
                }

                return (
                  <div
                    key={week}
                    className={boxClass}
                    data-tooltip-id="year-tooltip"
                    data-tooltip-html={tooltipText}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 这里是 Tooltip 组件，必须独立存在 */}
      <Tooltip id="year-tooltip" place="top" effect="solid" />
    </div>
  );
}



const LifeExpectancy = () => {
    const [birthDate, setBirthDate] = useState(() => localStorage.getItem("birthDate") || "1962-06-18");
    const [firstChildBirth, setFirstChildBirth] = useState(() => localStorage.getItem("firstChildBirth") || "")
    const [lastChildBirth, setLastChildBirth] = useState(() => localStorage.getItem("lastChildBirth") || "");
    const [lifeExpectancy, setLifeExpectancy] = useState(() => localStorage.getItem("lifeExpectancy") || 80);
    const [remainingDays, setRemainingDays] = useState(0);
    const [remainingWeeks, setRemainingWeeks] = useState(0);
    const [thisWeek, setThisWeek] = useState(0);
    const [thisYear, setThisYear] = useState(0);
    const [birthWeekOfYear, setBirthWeekOfYear] = useState(0);
    const [deathWeekOfYear, setDeathWeekOfYear] = useState(0);
    const [lifePercentage, setLifePercentage] = useState(0);
    const [quote, setQuote] = useState(getRandomQuote());
  
    useEffect(() => {
      localStorage.setItem("birthDate", birthDate);
      localStorage.setItem("lifeExpectancy", lifeExpectancy);
      if (birthDate) {
        calculateDays(birthDate, lifeExpectancy, setThisWeek, setRemainingWeeks, setRemainingDays, setThisYear, setBirthWeekOfYear, setDeathWeekOfYear, setLifePercentage);
      }
    }, [birthDate, lifeExpectancy]);
  
    useEffect(() => {
      localStorage.setItem("firstChildBirth", firstChildBirth);
    }, [firstChildBirth]);
  
    useEffect(() => {
      localStorage.setItem("lastChildBirth", lastChildBirth);
    }, [lastChildBirth]);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setQuote(getRandomQuote());
      }, 20000); // 20 秒换一句
  
      return () => clearInterval(interval);
    }, []);
  
    const remiainColor = getColorTran(100 - lifePercentage);
  
    return (
      <div className="container" style={{ backgroundColor: "black", color: "white" }}>
        <div className="input-container">
          <label>Birth Date: <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
          <label>Life Expectancy: <input type="number" value={lifeExpectancy} onChange={(e) => setLifeExpectancy(Number(e.target.value))} min="1" max="120" /></label>
          <label>
            First Child Birth Date:
            <input type="date"
              value={firstChildBirth ? firstChildBirth : ""}
              onChange={(e) => setFirstChildBirth(e.target.value || null)} />
          </label>
          <label>Last Child Birth Date: <input type="date" value={lastChildBirth ? lastChildBirth : ""} onChange={(e) => setLastChildBirth(e.target.value || null)} /></label>
        </div>
        <h2 style={{ fontSize: "20px" }}>
          <span
            className={remainingDays > 0 ? "remaining-days-animated" : ""}
            style={{ color: remiainColor }}>{remainingDays.toLocaleString()}
          </span> days left (
          <span
            className={remainingDays > 0 ? "remaining-days-animated" : ""}
            style={{ color: remiainColor }}>{remainingWeeks}
          </span> weeks),
          <span
            className={remainingDays > 0 ? "remaining-days-animated" : ""}
            style={{ color: remiainColor }}>{lifePercentage}%
          </span> remaining
        </h2>
        <div className="quote-section" style={{ marginTop: "20px" }}>
          <em>
            {/* 2) 将 \n 转换为 <br /> */}
            {quote.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </em>
        </div>
        {renderGrid(birthDate, lifeExpectancy, firstChildBirth, lastChildBirth, thisYear, thisWeek, birthWeekOfYear, deathWeekOfYear, techEvents, bodyDevelopmentFacts, futurePredictions)}
        <div className="legend">
          <div className="legend-item"><div className="legend-box past"></div><span> Past</span></div>
          <div className="legend-item"><div className="legend-box remaining"></div><span> Remaining</span></div>
          <div className="legend-item"><div className="legend-box child-birth"></div><span> Child Birth</span></div>
          <div className="legend-item"><div className="legend-box child-18"></div><span> Child Turns 18</span></div>
          <div className="legend-item"><span className="raising-symbol">-</span><span> Raising Children</span></div>
          <div className="legend-item"><div className="legend-box last-years"></div> Last 5 Years</div>
        </div>
      </div>
    );
};

export default LifeExpectancy;