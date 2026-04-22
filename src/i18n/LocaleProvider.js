import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, getLocaleMeta, normalizeLocale } from "./config";
import { messages } from "./messages";

const STORAGE_KEY = "siteLocale";

const LocaleContext = createContext(null);

function resolvePath(obj, path) {
  return path.split(".").reduce((current, segment) => {
    if (current == null) {
      return undefined;
    }

    return current[segment];
  }, obj);
}

function interpolate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] ?? `{${key}}`;
  });
}

function getInitialLocale() {
  const savedLocale = window.localStorage.getItem(STORAGE_KEY);

  if (savedLocale) {
    return normalizeLocale(savedLocale);
  }

  return normalizeLocale(window.navigator.language);
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = getLocaleMeta(locale).htmlLang;
  }, [locale]);

  const value = useMemo(() => {
    const activeMessages = messages[locale] || messages[DEFAULT_LOCALE];
    const fallbackMessages = messages[DEFAULT_LOCALE];

    function setLocale(nextLocale) {
      setLocaleState(normalizeLocale(nextLocale));
    }

    function t(path, params) {
      const candidate = resolvePath(activeMessages, path);
      const fallback = resolvePath(fallbackMessages, path);
      const valueToUse = candidate ?? fallback ?? path;

      if (typeof valueToUse === "string") {
        return interpolate(valueToUse, params);
      }

      return valueToUse;
    }

    function formatNumber(value, options) {
      return new Intl.NumberFormat(locale, options).format(value);
    }

    function formatPercent(value, options) {
      return new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1,
        ...options,
      }).format(value);
    }

    function formatDate(value, options) {
      return new Intl.DateTimeFormat(locale, options).format(value);
    }

    return {
      locale,
      setLocale,
      t,
      formatNumber,
      formatPercent,
      formatDate,
      localeMeta: getLocaleMeta(locale),
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }

  return context;
}
