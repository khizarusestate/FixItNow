import { createContext, useContext, useMemo, useState, useEffect } from "react";
import en from "../i18n/locales/en.json";
import ur from "../i18n/locales/ur.json";

const STORAGE_KEY = "fixitnow-locale";

const catalogs = { en, ur };

const I18nContext = createContext(null);

function getNested(obj, key) {
  return obj[key] ?? key;
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem(STORAGE_KEY) || "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ur" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo(() => {
    const messages = catalogs[locale] || catalogs.en;
    return {
      locale,
      setLocale: setLocaleState,
      t: (key) => getNested(messages, key),
    };
  }, [locale]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
