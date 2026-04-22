// Wellbing.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useLocale } from './i18n/LocaleProvider';

const Wellbing = () => {
  const { t } = useLocale();

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
          {t("wellbing.nav.causeOfDeath")}
        </NavLink>

        <NavLink
          to="mortality-explorer"
          className={({ isActive }) =>
            `block mb-4 ${
              isActive
                ? 'text-green-400 font-bold'
                : 'text-gray-600 hover:text-green-400'
            }`
          }
        >
          {t("wellbing.nav.mortalityExplorer")}
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
          {t("wellbing.nav.chronicDisease")}
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
          {t("wellbing.nav.lifeStyleChanges")}
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
          {t("wellbing.nav.vo2max")}
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
