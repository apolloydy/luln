import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tabs from "./Tabs";
import LifeExpectancy from "./LifeExpectancy";
import Vo2Max from "./Vo2Max";
import ChronicDisease from "./ChronicDisease";
import DeathStatistics from "./DeathStatistics";
import Contact from './Contact';

const App = () => {
  return (
    <Router>
      <Tabs />
      <Routes>
        {/* 当访问根路径 `/` 时，自动跳转到 /life-expectancy */}
        <Route path="/" element={<Navigate to="/life-expectancy" replace />} />
        <Route path="/life-expectancy" element={<LifeExpectancy />} />
        <Route path="/Causes Of Death" element={<DeathStatistics />} />
        <Route path="/Chronic Disease" element={<ChronicDisease />} />
        <Route path="/vo2max" element={<Vo2Max />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;