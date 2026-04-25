import React from "react";
import { NavLink } from "react-router-dom";
import { useLocale } from "./i18n/LocaleProvider";
import { SUPPORTED_LOCALES } from "./i18n/config";

const Tabs = () => {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="site-header flex items-center justify-between px-6 py-4 bg-black">
      <h1 className="site-brand text-3xl font-bold text-white">
        <span className="site-brand-letter">L</span>ife is <span className="site-brand-letter">U</span>rgent, <span className="site-brand-letter">L</span>ife is <span className="site-brand-letter">N</span>ow
      </h1>

      <div className="site-header-actions">
        <nav className="site-nav flex space-x-6">
          <NavLink
            to="/time-you-have"
            className={({ isActive }) =>
              "text-lg font-semibold transition " +
              (isActive
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-300 hover:text-white")
            }
          >
            {t("nav.lifeExpectancy")}
          </NavLink>

          <NavLink
            to="/wellbing"
            className={({ isActive }) =>
              "text-lg font-semibold transition " +
              (isActive
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-300 hover:text-white")
            }
          >
            {t("nav.wellbing")}
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              "text-lg font-semibold transition " +
              (isActive
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-300 hover:text-white")
            }
          >
            {t("nav.contact")}
          </NavLink>
        </nav>

        <label className="locale-switcher">
          <span>{t("common.language")}</span>
          <select
            aria-label={t("localeSwitcher.ariaLabel")}
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
          >
            {SUPPORTED_LOCALES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.nativeLabel}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
};

export default Tabs;
