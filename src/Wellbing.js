// Wellbing.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Wellbing = () => {
  return (
    <div className="flex min-h-screen">
      {/* 左侧竖直导航栏 */}
      <nav className="w-48 border-r p-4">
        <NavLink
          to="cause-of-death"
          className={({ isActive }) =>
            // 根据 isActive 动态设置类名
            `block mb-4 ${
              isActive
                ? 'text-green-400 font-bold'
                : 'text-gray-600 hover:text-green-400'
            }`
          }
        >
          Cause of Death
        </NavLink>

        <NavLink
          to="chronic-disease"
          className={({ isActive }) =>
            `block mb-4 ${
              isActive
                ? 'text-green-400 font-bold'
                : 'text-gray-600 hover:text-green-400'
            }`
          }
        >
          Chronic Disease
        </NavLink>

        <NavLink
          to="life-style-changes"
          className={({ isActive }) =>
            `block mb-4 ${
              isActive
                ? 'text-green-400 font-bold'
                : 'text-gray-600 hover:text-green-400'
            }`
          }
        >
          Life Style Changes
        </NavLink>

        <NavLink
          to="vo2max"
          className={({ isActive }) =>
            `block mb-4 ${
              isActive
                ? 'text-green-400 font-bold'
                : 'text-gray-600 hover:text-green-400'
            }`
          }
        >
          VO₂ Max
        </NavLink>
      </nav>

      {/* 右侧内容区域：用于渲染子路由的内容 */}
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Wellbing;