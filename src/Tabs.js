import React from "react";
import { NavLink } from "react-router-dom";
import { useLocale } from "./i18n/LocaleProvider";
import { SUPPORTED_LOCALES } from "./i18n/config";

const navLinkClass = ({ isActive }) =>
  `site-nav-link${isActive ? " is-active" : ""}`;

const Tabs = () => {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <h1 className="site-brand">
          <span className="site-brand-letter">L</span>ife is{" "}
          <span className="site-brand-letter">U</span>rgent,{" "}
          <span className="site-brand-letter">L</span>ife is{" "}
          <span className="site-brand-letter">N</span>ow
        </h1>

        <div className="site-header-actions">
          <nav className="site-nav" aria-label={t("nav.wellbing")}>
            <NavLink to="/time-you-have" className={navLinkClass}>
              {t("nav.lifeExpectancy")}
            </NavLink>
            <NavLink to="/wellbing" className={navLinkClass}>
              {t("nav.wellbing")}
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              {t("nav.contact")}
            </NavLink>
          </nav>

          <div className="locale-switcher">
            <svg
              className="locale-switcher-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0 -18" />
            </svg>
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
            <svg
              className="locale-switcher-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Tabs;
