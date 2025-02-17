import React, { useState, useEffect } from "react";
import "./styles.css";

const App = () => {
  const [birthDate, setBirthDate] = useState("1989-01-06");
  const [firstChildBirth, setFirstChildBirth] = useState("2020-04-09");
  const [lastChildBirth, setLastChildBirth] = useState("2022-02-23");
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  const [remainingDays, setRemainingDays] = useState(0);
  const [remainingWeeks, setRemainingWeeks] = useState(0);
  const [pastWeeks, setPastWeeks] = useState(0);
  const [birthWeekOfYear, setBirthWeekOfYear] = useState(0);
  const [deathWeekOfYear, setDeathWeekOfYear] = useState(0);
  const [lifePercentage, setLifePercentage] = useState(0);

  useEffect(() => {
    if (birthDate) {
      calculateDays(birthDate, lifeExpectancy);
    }
  }, [birthDate, lifeExpectancy]);

  const calculateDays = (birthDate, expectancy) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const deathDate = new Date(birth + expectancy * 365.25 * 60 * 60 * 1000);


    if (today < birth) {
      setPastWeeks(0);
      setRemainingWeeks(Math.floor((expectancy * 365.25) / 7));
      return;
    }

    const totalDays = Math.round(expectancy * 365.25);
    const past = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    const remaining = totalDays - past;

    setPastWeeks(past > 0 ? Math.floor(past / 7) : 0);
    setRemainingWeeks(remaining > 0 ? Math.floor(remaining / 7) : 0);
    setRemainingDays(remaining > 0 ? remaining : 0);
    setPastWeeks(Math.floor(past / 7));

    // 计算出生年的第几周
    const startOfYear = new Date(birth.getFullYear(), 0, 1);
    setBirthWeekOfYear(Math.floor((birth - startOfYear) / (1000 * 60 * 60 * 24 * 7)));

    // 计算去世年的第几周
    const startOfDeathYear = new Date(deathDate.getFullYear(), 0, 1);
    setDeathWeekOfYear(Math.floor((deathDate - startOfDeathYear) / (1000 * 60 * 60 * 24 * 7)));

    // 剩余百分比
    const percentage = (remaining * 100 / totalDays).toFixed(1);
    setLifePercentage(percentage);

  };

  const renderGrid = () => {
    const birthYear = new Date(birthDate).getFullYear();
    const deathYear = birthYear + Math.floor(lifeExpectancy)+1;
    const totalYears = deathYear - birthYear;

    const firstChildWeek = Math.floor((new Date(firstChildBirth) - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 7));
    const lastChildWeek = Math.floor((new Date(lastChildBirth) - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 7));
    const lastChildAdultWeek = Math.floor(
      (new Date(lastChildBirth).setFullYear(new Date(lastChildBirth).getFullYear() + 18) - new Date(birthDate)) /
        (1000 * 60 * 60 * 24 * 7)
    );


    return (
      <div className="grid-container">
        {Array.from({ length: totalYears }).map((_, yearOffset) => {
          const year = birthYear + yearOffset;
          if (year < birthYear || year > deathYear) return null;

          return (
            <div key={year} className="year-row">
              {(year % 5 === 0) ? (
               <span className="year-label">{year}</span>
                ) : (
                 <span className="year-label-placeholder">{"____"}</span> /* 为空但保持对齐 */
                )
              }
              <div className="weeks">
                {Array.from({ length: 52 }).map((_, week) => {
                  const weekIndex = yearOffset * 52 + week;
                  let boxClass = "grid-box";
                  let content = "";

                  if ((year === birthYear && week < birthWeekOfYear) || (year === deathYear - 1 && week > deathWeekOfYear)) {
                    boxClass += " empty"; // 渲染与背景色相同的格子
                  } else if (weekIndex < pastWeeks) {
                    boxClass += " past";
                  } else if (year >= deathYear - 5 || ( year === deathYear -6 && week > deathWeekOfYear)) {
                    boxClass += " last-years"; // last 5 years
                  } else {
                    boxClass += " remaining";
                  }

                  if (weekIndex === firstChildWeek || weekIndex === lastChildWeek) boxClass += " child-birth";
                  if (weekIndex === lastChildAdultWeek) boxClass += " child-18";
                  if (weekIndex > firstChildWeek && weekIndex < lastChildAdultWeek) {
                    content = <span className="child-raising-text" style={{ color: "orange" }}>/</span>;
                  }

                  return <div key={week} className={boxClass}>{content}</div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container" style={{ backgroundColor: "black", color: "white" }}>
      <h1>
        <span style={{ color: "green" }}>L</span>ife is <span style={{ color: "green" }}>U</span>rgent, <span style={{ color: "green" }}>L</span>ife is <span style={{ color: "green" }}>N</span>ow
      </h1>
      <div className="input-container">
        <label>Birth Date: <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
        <label>First Child Birth Date: <input type="date" value={firstChildBirth} onChange={(e) => setFirstChildBirth(e.target.value)} /></label>
        <label>Last Child Birth Date: <input type="date" value={lastChildBirth} onChange={(e) => setLastChildBirth(e.target.value)} /></label>
        <label>Life Expectancy: <input type="number" value={lifeExpectancy} onChange={(e) => setLifeExpectancy(Number(e.target.value))} min="1" max="120" /></label>
      </div>
      <h2 style={{ fontSize: "20px" }}>{remainingDays.toLocaleString()} days left ({remainingWeeks} weeks), <span style={{ color: "red" }}>{lifePercentage}% </span> remaining</h2>
      <div className="legend">
        <div className="legend-item"><div className="legend-box past"></div><span> Past</span></div>
        <div className="legend-item"><div className="legend-box remaining"></div><span> Remaining</span></div>
        <div className="legend-item"><div className="legend-box child-birth"></div><span> Child Birth</span></div>
        <div className="legend-item"><div className="legend-box child-18"></div><span> Child Turns 18</span></div>
        <div className="legend-item"><span className="raising-symbol">/</span><span> Raising Children</span></div>
        <div className="legend-item"><div className="legend-box last-years"></div> Last 5 Years</div>
      </div>
      {renderGrid()}
    </div>
  );
};

export default App;
