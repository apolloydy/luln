// Wellbing.js
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useLocale } from './i18n/LocaleProvider';

const Wellbing = () => {
  const { t } = useLocale();
  const location = useLocation();
  const theme =
    location.pathname.includes("life-style-changes")
      ? "lifestyle"
      : location.pathname.includes("chronic-disease")
        ? "chronic"
        : location.pathname.includes("mortality-explorer")
          ? "explorer"
          : location.pathname.includes("vo2max")
            ? "vo2"
            : "overview";

  return (
    <div className={`wellbing-layout wellbing-theme-${theme}`}>
      {/* 左侧竖直导航栏 */}
      <nav className="wellbing-side-nav">
        <NavLink
          to="cause-of-death"
          className={({ isActive }) =>
            // 根据 isActive 动态设置类名
            `wellbing-nav-link ${
              isActive
                ? 'active'
                : ''
            }`
          }
        >
          {t("wellbing.nav.causeOfDeath")}
        </NavLink>

        <NavLink
          to="mortality-explorer"
          className={({ isActive }) =>
            `wellbing-nav-link ${
              isActive
                ? 'active'
                : ''
            }`
          }
        >
          {t("wellbing.nav.mortalityExplorer")}
        </NavLink>

        <NavLink
          to="chronic-disease"
          className={({ isActive }) =>
            `wellbing-nav-link ${
              isActive
                ? 'active'
                : ''
            }`
          }
        >
          {t("wellbing.nav.chronicDisease")}
        </NavLink>

        <NavLink
          to="life-style-changes"
          className={({ isActive }) =>
            `wellbing-nav-link ${
              isActive
                ? 'active'
                : ''
            }`
          }
        >
          {t("wellbing.nav.lifeStyleChanges")}
        </NavLink>

        <NavLink
          to="vo2max"
          className={({ isActive }) =>
            `wellbing-nav-link ${
              isActive
                ? 'active'
                : ''
            }`
          }
        >
          {t("wellbing.nav.vo2max")}
        </NavLink>
      </nav>

      {/* 右侧内容区域：用于渲染子路由的内容 */}
      <div className="wellbing-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Wellbing;
