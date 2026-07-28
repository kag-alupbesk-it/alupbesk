"use client";

import { clsx } from "clsx";
import { useSidebar } from "./SidebarProvider";

interface TopBarProps {
  title: string;
  tabs?: { label: string; href: string; active?: boolean }[];
}

export default function TopBar({ title, tabs }: TopBarProps) {
  const { toggle } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 z-40 bg-primary-container/80 backdrop-blur-md border-b border-white/10 flex items-center h-12 lg:h-16">
      <button onClick={toggle} className="lg:hidden flex items-center justify-center w-12 h-12 shrink-0 text-on-surface-variant hover:text-white transition-colors">
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>
      <h2 className="text-sm lg:text-lg font-bold text-white font-headline truncate pr-4">{title}</h2>
      <div className="ml-auto flex items-center gap-2 lg:gap-4 pr-3 lg:pr-6">
        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] group-focus-within:text-secondary transition-colors">
            search
          </span>
          <input
            className="bg-white/[0.05] border border-white/10 rounded-pill pl-9 pr-3 py-1.5 w-36 lg:w-64 text-xs text-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary transition-all outline-none"
            placeholder="Search..."
            type="text"
          />
        </div>
        <button className="text-on-surface-variant hover:text-secondary transition-colors relative">
          <span className="material-symbols-outlined text-[18px] lg:text-[20px]">
            notifications
          </span>
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
        </button>
        <button className="text-on-surface-variant hover:text-secondary transition-colors hidden md:block">
          <span className="material-symbols-outlined text-[18px] lg:text-[20px]">
            calendar_today
          </span>
        </button>
        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden border-2 border-outline hover:border-secondary transition-colors cursor-pointer">
          <div className="w-full h-full bg-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-xs lg:text-sm">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
