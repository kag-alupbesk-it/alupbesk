"use client";

/**
 * ThemeContext
 * ─────────────────────────────────────────────────────────
 * Sumber kebenaran tema adalah class "dark" pada <html>, bukan state React.
 *
 * Alurnya:
 *   1. SSR selalu merender tema default ("dark") supaya HTML server deterministik.
 *   2. Script inline di layout.tsx (lihat InlineScript) sudah menulis class yang
 *      benar ke <html> saat browser parse HTML, jadi tidak ada kedipan tema.
 *   3. Context membaca class itu sebagai external store lewat MutationObserver.
 *      Menghemat satu round render dibanding menyalin DOM ke state lewat effect,
 *      dan theme toggle cukup mengubah class — satu sumber kebenaran, dua tempat.
 *
 * Komponen yang butuh nilai final setelah hydration memakai flag `mounted`:
 *
 *   const { theme, mounted } = useTheme();
 *   if (!mounted) return null; // atau skeleton
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "./theme-script";

type Theme = "dark" | "light";

const THEME_CLASS = "dark";

function subscribeToThemeClass(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains(THEME_CLASS) ? "dark" : "light";
}

// Snapshot server dipakai saat hydration agar React tidak menganggap perbedaan
// dengan HTML server sebagai mismatch. Nilai final diambil setelah hydration.
function getThemeServerSnapshot(): Theme {
  return "dark";
}

const subscribeToNothing = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

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
  const theme = useSyncExternalStore(subscribeToThemeClass, getThemeSnapshot, getThemeServerSnapshot);
  const mounted = useSyncExternalStore(subscribeToNothing, getMountedSnapshot, getServerMountedSnapshot);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle(THEME_CLASS, next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage tidak tersedia (mode private / cookie diblokir).
      // Tema tetap berlaku untuk sesi ini, hanya tidak ikut tersimpan.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getThemeSnapshot() === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, mounted, setTheme, toggleTheme }),
    [theme, mounted, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
