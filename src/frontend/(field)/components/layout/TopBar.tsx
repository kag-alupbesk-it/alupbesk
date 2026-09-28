"use client";

import { clsx } from "clsx";
import { useSidebar } from "./SidebarProvider";
import ThemeToggle from "@/app/ThemeToggle";

export default function TopBar({ title }: { title: string }) {
  const { toggle, toggleDesktop, desktopOpen } = useSidebar();

  return (
    <header
      className={clsx(
        "fixed top-0 right-0 z-40 bg-primary-container/80 backdrop-blur-md border-b border-outline/40 flex items-center h-12 lg:h-16 transition-all duration-300",
        desktopOpen ? "left-0 lg:left-64" : "left-0"
      )}
    >
      <button
        onClick={toggle}
        className="lg:hidden flex items-center justify-center w-12 h-12 shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      <button
        onClick={toggleDesktop}
        className="hidden lg:flex items-center justify-center w-12 h-16 shrink-0 text-on-surface-variant hover:text-on-surface transition-colors relative z-[60] cursor-pointer"
      >
        <span className="material-symbols-outlined text-[22px]">
          {desktopOpen ? "menu_open" : "menu"}
        </span>
      </button>

      <h2 className="text-sm lg:text-lg font-bold text-on-surface font-headline truncate pr-4">
        {title}
      </h2>

      <div className="ml-auto flex items-center gap-2 lg:gap-4 pr-3 lg:pr-6">
        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] group-focus-within:text-secondary transition-colors">
            search
          </span>
          <input
            className="bg-surface-variant border border-outline/50 rounded-pill pl-9 pr-3 py-1.5 w-36 lg:w-64 text-xs text-on-surface placeholder:text-on-surface-variant focus:ring-1 focus:ring-secondary focus:border-secondary transition-all outline-none"
            placeholder="Search..."
            type="text"
          />
        </div>
        <button className="text-on-surface-variant hover:text-secondary transition-colors relative">
          <span className="material-symbols-outlined text-[18px] lg:text-[20px]">notifications</span>
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
        </button>
        <ThemeToggle />
        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden border-2 border-outline hover:border-secondary transition-colors cursor-pointer">
          <div className="w-full h-full bg-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-xs lg:text-sm">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}