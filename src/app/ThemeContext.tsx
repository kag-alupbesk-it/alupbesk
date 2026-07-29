"use client";

/**
 * ThemeContext
 * ─────────────────────────────────────────────────────────
 * Hydration-safe theme provider.
 *
 * Strategy to avoid SSR/client mismatch:
 *   1. SSR always renders the default theme ("dark") so the
 *      server HTML is deterministic.
 *   2. The inline <script> in layout.tsx runs before React
 *      hydrates and sets the correct class on <html> — so
 *      the user sees the right colours immediately.
 *   3. On client mount, useEffect reads the actual class from
 *      <html> and updates React state — this happens after
 *      hydration, so React never sees a mismatch.
 *
 * Components that render theme-dependent UI can use the
 * `mounted` flag to defer rendering until after hydration:
 *
 *   const { theme, mounted } = useTheme();
 *   if (!mounted) return null; // or a skeleton
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "./theme-script";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  mounted: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start with "dark" to match SSR output.
  // After mount, we sync from the DOM (which the inline script already fixed).
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Read the actual theme from the DOM after first client render.
  // This runs AFTER React hydration is complete, so no mismatch.
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  // Sync class on <html> and persist whenever theme changes.
  useEffect(() => {
    if (!mounted) return; // don't run before we've read the real theme
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, mounted, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
