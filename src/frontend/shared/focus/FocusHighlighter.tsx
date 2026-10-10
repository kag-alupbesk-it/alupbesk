"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setFocusValue } from "./focusStore";

const HIGHLIGHT_MS = 5000;
const RETRY_MS = 6000;
const ACCENT = "rgba(219,165,1,0.85)";
const PULSE = "rgba(219,165,1,0.35)";

const selectorFor = (focus: string) => `[data-focus-id="${CSS.escape(focus)}"]`;

/**
 * Menyorot elemen ber-`data-focus-id` yang cocok dengan `?focus=...` dari
 * Overview. Dipasang sekali di layout Owner, jadi setiap halaman divisi bisa
 * menandai baris/section-nya dengan `data-focus-id` tanpa logika tambahan.
 */
export default function FocusHighlighter() {
  const focus = useSearchParams().get("focus");

  useEffect(() => {
    setFocusValue(focus);
    return () => setFocusValue(null);
  }, [focus]);

  useEffect(() => {
    if (!focus) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let retryTimer: number | null = null;
    let clearTimer: number | null = null;
    const decorated: HTMLElement[] = [];

    const resetStyles = () => {
      for (const element of decorated) {
        element.style.outline = "";
        element.style.outlineOffset = "";
        element.style.borderRadius = "";
      }
      decorated.length = 0;
    };

    const apply = (): boolean => {
      if (cancelled) return false;
      const matches = Array.from(document.querySelectorAll<HTMLElement>(selectorFor(focus)));
      if (matches.length === 0) return false;

      resetStyles();
      for (const element of matches) {
        element.style.outline = `2px solid ${ACCENT}`;
        element.style.outlineOffset = "2px";
        if (!element.style.borderRadius) element.style.borderRadius = "0.75rem";
        element.animate(
          [
            { boxShadow: `0 0 0 0 ${PULSE}` },
            { boxShadow: `0 0 0 6px ${PULSE}` },
            { boxShadow: `0 0 0 0 ${PULSE}` },
          ],
          { duration: 1400, iterations: 2, easing: "ease-in-out" },
        );
        decorated.push(element);
      }

      const visible = matches.find((element) => element.offsetParent !== null) ?? matches[0];
      visible.scrollIntoView({ behavior: "smooth", block: "center" });

      if (clearTimer) window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(resetStyles, HIGHLIGHT_MS);
      return true;
    };

    const stopWatching = () => {
      observer?.disconnect();
      observer = null;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    if (!apply()) {
      // Data divisi dimuat async; pantau DOM sampai elemen target muncul.
      observer = new MutationObserver(() => {
        if (cancelled) return;
        if (apply()) stopWatching();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      retryTimer = window.setTimeout(() => {
        stopWatching();
        apply();
      }, RETRY_MS);
    }

    return () => {
      cancelled = true;
      stopWatching();
      if (clearTimer) window.clearTimeout(clearTimer);
      resetStyles();
    };
  }, [focus]);

  return null;
}
