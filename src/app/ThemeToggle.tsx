"use client";

import { useTheme } from "@/app/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle
 * ─────────────────────────────────────────────────────────
 * Renders a neutral icon until mounted (prevents hydration
 * mismatch on the icon text content), then shows the correct
 * light_mode / dark_mode icon based on the active theme.
 */
export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, mounted, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={!mounted ? "Toggle tema" : isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
      title={!mounted ? "Toggle theme" : isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={[
        "flex items-center justify-center w-8 h-8 rounded-full",
        "text-on-surface-variant hover:text-secondary",
        "hover:bg-surface-variant transition-all duration-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/*
       * Always render a fixed icon server-side (before mount).
       * After mount, show the correct icon for the active theme.
       * This avoids the hydration mismatch on icon text content.
       */}
      <span
        className="material-symbols-outlined text-[20px] select-none"
        suppressHydrationWarning
      >
        {!mounted ? "contrast" : isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
