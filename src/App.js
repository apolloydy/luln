import React, { useState, useEffect } from "react";
import "./styles.css";

const App = () => {
  const [birthDate, setBirthDate] = useState("1989-01-06");
  const [firstChildBirth, setFirstChildBirth] = useState("2020-04-09");
  const [lastChildBirth, setLastChildBirth] = useState("2022-02-23");
  const [lifeExpectancy, setLifeExpectancy] = useState(74.5);
  const [remainingDays, setRemainingDays] = useState(0);
  const [remainingWeeks, setRemainingWeeks] = useState(0);
  const [pastDays, setPastDays] = useState(0);
  const [pastWeeks, setPastWeeks] = useState(0);
  const weeksPerRow = 52;

  useEffect(() => {
    if (birthDate) {
      calculateDays(birthDate, lifeExpectancy);
    }
  }, [birthDate, lifeExpectancy]);

  const calculateDays = (birthDate, expectancy) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const totalDays = Math.round(expectancy * 365.25);
    const past = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    const remaining = totalDays - past;
    setPastDays(past > 0 ? past : 0);
    setRemainingDays(remaining > 0 ? remaining : 0);
    setPastWeeks(Math.floor(past / 7));
    setRemainingWeeks(Math.floor(remaining / 7));
  };

  const renderGrid = () => {
    const totalWeeks = pastWeeks + remainingWeeks;
    const firstChildWeek = Math.floor((new Date(firstChildBirth) - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 7));
    const lastChildWeek = Math.floor((new Date(lastChildBirth) - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 7));
    const lastChildAdultWeek = Math.floor((new Date(lastChildBirth).setFullYear(new Date(lastChildBirth).getFullYear() + 18) - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 7));

    const lastFiveYearsStart = totalWeeks - 260; // Last 5 years of life (52 weeks * 5)

    return (
      <div className="grid-container">
        {Array.from({ length: totalWeeks }).map((_, index) => {
          let boxClass = "grid-box";
          let content = "";

          if (index < pastWeeks) boxClass += " past";
          else if (index >= lastFiveYearsStart) boxClass += " last-years"; // Last 5 years in red
          else boxClass += " remaining";

          if (index === firstChildWeek || index === lastChildWeek) boxClass += " child-birth";
          if (index === lastChildAdultWeek) boxClass += " child-18";
          if (index > firstChildWeek && index < lastChildAdultWeek) {
            boxClass += " child-raising";
            content = <span className="child-raising-text">＼</span>; // Use full-width backslash inside a span
          }

          return (
            <div key={index} className={boxClass}>
              {content}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>
        Life is <span className="urgent">Urgent</span>, Life is <span className="now">Now</span>
      </h1>
      <div className="input-container">
        <label>Birth Date: <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
        <label>First Child Birth Date: <input type="date" value={firstChildBirth} onChange={(e) => setFirstChildBirth(e.target.value)} /></label>
        <label>Last Child Birth Date: <input type="date" value={lastChildBirth} onChange={(e) => setLastChildBirth(e.target.value)} /></label>
        <label>Life Expectancy: <input type="number" value={lifeExpectancy} onChange={(e) => setLifeExpectancy(Number(e.target.value))} min="1" max="120" /></label>
      </div>
      <h2>{remainingDays.toLocaleString()} days left ({remainingWeeks} weeks)</h2>
      {renderGrid()}
      <div className="legend">
        <div className="legend-item"><div className="legend-box past"></div> Past</div>
        <div className="legend-item"><div className="legend-box remaining"></div> Remaining</div>
        <div className="legend-item"><div className="legend-box child-birth"></div> Child Birth</div>
        <div className="legend-item"><div className="legend-box child-18"></div> Child Turns 18</div>
        <div className="legend-item"><div className="legend-box child-raising"></div> Raising Children</div>
        <div className="legend-item"><div className="legend-box last-years"></div> Last 5 Years</div>
      </div>
    </div>
  );
};

export default App;
