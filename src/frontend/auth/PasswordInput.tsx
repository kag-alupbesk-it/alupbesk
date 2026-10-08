"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  inputClassName?: string;
};

export function PasswordInput({ inputClassName = "", className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${inputClassName} pr-12`}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 inline-flex min-h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-secondary"
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
          {visible ? "visibility_off" : "visibility"}
        </span>
      </button>
    </div>
  );
}
