"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  function handleLanguageChange(value: string) {
    if (value === "en" || value === "id") setLanguage(value);
  }

  return (
    <label title={t("language")} className={`relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-outline/30 bg-surface-container/70 text-on-surface-variant hover:text-secondary ${className}`}>
      <span aria-hidden="true" className="material-symbols-outlined text-[19px]">translate</span>
      <select
        aria-label={t("language")}
        value={language}
        onChange={(event) => handleLanguageChange(event.currentTarget.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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

