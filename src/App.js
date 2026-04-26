// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tabs from "./Tabs";
import LifeExpectancy from "./LifeExpectancy";
import Wellbing from "./Wellbing";          // 布局组件
import DeathStatistics from "./DeathStatistics";   // 子页面组件
import ChronicDisease from "./ChronicDisease";
import ChronicDiseaseMitigation from "./ChronicDiseaseMitigation";
import Vo2Max from "./Vo2Max";
import MortalityExplorer from "./MortalityExplorer";
import RiskPathways from "./RiskPathways";
import Contact from './Contact';

const App = () => {
  return (
    <Router>
      <Tabs />
      <Routes>
        {/* 当访问根路径 `/` 时，自动跳转到 /time-you-have */}
        <Route path="/" element={<Navigate to="/time-you-have" replace />} />

        {/* 其他一级路由 */}
        <Route path="/time-you-have" element={<LifeExpectancy />} />
        <Route path="/time-left" element={<Navigate to="/time-you-have" replace />} />
        <Route path="/life-expectancy" element={<Navigate to="/time-you-have" replace />} />
        <Route path="/contact" element={<Contact />} />

        {/* Wellbing 相关路由 */}
        <Route path="/wellbing" element={<Wellbing />}>
          {/* 当用户访问 /wellbing 时，自动跳转到 /wellbing/cause-of-death */}
          <Route index element={<Navigate to="cause-of-death" replace />} />
          {/* 在 Wellbing 的子路由下继续定义三个分支 */}
          <Route path="cause-of-death" element={<DeathStatistics />} />
          <Route path="mortality-explorer" element={<MortalityExplorer />} />
          <Route path="chronic-disease" element={<ChronicDisease />} />
          <Route path="risk-pathways" element={<RiskPathways />} />
          <Route path="life-style-changes" element={<ChronicDiseaseMitigation />} />
          <Route path="vo2max" element={<Vo2Max />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
