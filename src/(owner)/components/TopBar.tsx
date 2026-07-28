"use client";

import { clsx } from "clsx";

interface TopBarProps {
  title: string;
  tabs?: { label: string; href: string; active?: boolean }[];
}

export default function TopBar({ title, tabs }: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline/50 flex justify-between items-center h-20 px-10">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-white font-headline">{title}</h2>
        {tabs && tabs.length > 0 && (
          <nav className="hidden lg:flex gap-8 ml-10 border-l border-outline/50 pl-10">
            {tabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "text-sm font-medium transition-colors",
                  tab.active
                    ? "text-secondary border-b-2 border-secondary pb-1"
                    : "text-on-surface-variant hover:text-secondary"
                )}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-secondary transition-colors">
            search
          </span>
          <input
            className="bg-surface border border-outline rounded-pill pl-10 pr-4 py-2 w-72 text-sm text-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary transition-all outline-none"
            placeholder="Search infrastructure..."
            type="text"
          />
        </div>

        <button className="text-on-surface-variant hover:text-secondary transition-colors relative">
          <span className="material-symbols-outlined text-[22px]">
            notifications
          </span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full animate-pulse" />
        </button>

        <button className="text-on-surface-variant hover:text-secondary transition-colors">
          <span className="material-symbols-outlined text-[22px]">
            calendar_today
          </span>
        </button>

        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-outline hover:border-secondary transition-colors cursor-pointer">
          <div className="w-full h-full bg-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-lg">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
