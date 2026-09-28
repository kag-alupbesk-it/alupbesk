/**
 * theme-script.ts  — NO "use client" directive
 * ─────────────────────────────────────────────
 * Exports only a plain string (not JSX) so it can be safely
 * imported in a Server Component (layout.tsx) without Next.js
 * treating the whole module as client-only.
 *
 * The script reads localStorage before React hydrates and
 * adds/removes class="dark" on <html> to prevent flicker.
 */

export const THEME_STORAGE_KEY = "alupbesk-theme";

/**
 * Stringified IIFE to inject into <head> via InlineScript.
 * Must NOT reference any runtime imports — plain JS only.
 * The storage key is interpolated from THEME_STORAGE_KEY so the script and
 * ThemeContext can never drift apart.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})();`;
