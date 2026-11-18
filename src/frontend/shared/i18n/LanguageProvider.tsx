"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translate, type Language, type MessageKey } from "./translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANGUAGE_STORAGE_KEY = "alupbesk-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setCurrentLanguage] = useState<Language>("id");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    // Start in Indonesian for SSR and restore a saved preference after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "en" || saved === "id") setCurrentLanguage(saved);
    window.localStorage.removeItem("cart");
    setInitialized(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    if (initialized) window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language, initialized]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setCurrentLanguage(nextLanguage);
  }, []);
  const t = useCallback((key: MessageKey) => translate(language, key), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
