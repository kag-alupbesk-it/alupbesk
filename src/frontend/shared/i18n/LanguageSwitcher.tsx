"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  function handleLanguageChange(value: string) {
    if (value === "en" || value === "id") setLanguage(value);
  }

  return (
    <label className={`inline-flex min-h-10 items-center rounded-full border border-outline/30 bg-surface-container/70 px-3 ${className}`}>
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={language}
        onChange={(event) => handleLanguageChange(event.currentTarget.value)}
        className="min-h-9 cursor-pointer border-0 bg-transparent py-1 pl-1 pr-2 text-xs font-bold text-on-surface outline-none focus:ring-0"
      >
        <option className="bg-surface text-on-surface" value="en">
          English
        </option>
        <option className="bg-surface text-on-surface" value="id">
          Bahasa Indonesia
        </option>
      </select>
    </label>
  );
}

