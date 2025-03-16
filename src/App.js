// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tabs from "./Tabs";
import LifeExpectancy from "./LifeExpectancy";
import Wellbing from "./Wellbing";          // 布局组件
import DeathStatistics from "./DeathStatistics";   // 子页面组件
import ChronicDisease from "./ChronicDisease";
import Vo2Max from "./Vo2Max";
import Contact from './Contact';

const App = () => {
  return (
    <Router>
      <Tabs />
      <Routes>
        {/* 当访问根路径 `/` 时，自动跳转到 /life-expectancy */}
        <Route path="/" element={<Navigate to="/life-expectancy" replace />} />

        {/* 其他一级路由 */}
        <Route path="/life-expectancy" element={<LifeExpectancy />} />
        <Route path="/contact" element={<Contact />} />

        {/* Wellbing 相关路由 */}
        <Route path="/wellbing" element={<Wellbing />}>
          {/* 当用户访问 /wellbing 时，自动跳转到 /wellbing/cause-of-death */}
          <Route index element={<Navigate to="cause-of-death" replace />} />
          {/* 在 Wellbing 的子路由下继续定义三个分支 */}
          <Route path="cause-of-death" element={<DeathStatistics />} />
          <Route path="chronic-disease" element={<ChronicDisease />} />
          <Route path="vo2max" element={<Vo2Max />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;