"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { flatNavItems } from "../nav/navItems";
import { usePopover } from "./usePopover";

const MAX_RESULTS = 6;

export default function QuickSearch() {
  const router = useRouter();
  const { open, setOpen, ref } = usePopover<HTMLDivElement>();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = term
      ? flatNavItems.filter(
          (item) =>
            item.label.toLowerCase().includes(term) ||
            item.group.toLowerCase().includes(term) ||
            item.href.toLowerCase().includes(term),
        )
      : flatNavItems;
    return matches.slice(0, MAX_RESULTS);
  }, [query]);

  function go(href: string) {
    setQuery("");
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) go(target.href);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative group hidden sm:block" ref={ref}>
      <span className="material-symbols-outlined absolute left-2.5 top-[6px] text-on-surface-variant text-[18px] group-focus-within:text-secondary transition-colors z-10">
        search
      </span>
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="bg-surface-variant border border-outline/50 rounded-pill pl-9 pr-3 py-1.5 w-36 lg:w-64 text-xs text-on-surface placeholder:text-on-surface-variant focus:ring-1 focus:ring-secondary focus:border-secondary transition-all outline-none"
        placeholder="Cari menu atau divisi..."
        type="text"
        aria-label="Cari menu atau divisi"
        role="combobox"
        aria-expanded={open}
        aria-controls="owner-quick-search"
        autoComplete="off"
      />

      {open && (
        <div
          id="owner-quick-search"
          role="listbox"
          className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-outline/40 bg-surface-container shadow-2xl z-[60]"
        >
          {results.length === 0 ? (
            <p className="px-3 py-3 text-xs text-on-surface-variant">Tidak ada menu yang cocok.</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.href}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(item.href)}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors ${
                  index === activeIndex
                    ? "bg-secondary/10 text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-on-surface-variant/70">
                  {item.group}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
