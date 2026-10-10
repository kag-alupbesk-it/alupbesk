"use client";

import { clsx } from "clsx";
import { useSidebar } from "../SidebarProvider/SidebarProvider";
import ThemeToggle from "@/app/ThemeToggle";
import QuickSearch from "./QuickSearch";
import NotificationBell from "./NotificationBell";
import DateBadge from "./DateBadge";
import ProfileMenu from "./ProfileMenu";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { toggle, toggleDesktop, desktopOpen } = useSidebar();

  return (
    <header className={clsx(
      "fixed top-0 right-0 z-40 bg-primary-container/80 backdrop-blur-md border-b border-outline/40 flex items-center h-12 lg:h-16 transition-all duration-300",
      desktopOpen ? "left-0 lg:left-64" : "left-0"
    )}>
      <button onClick={toggle} className="lg:hidden flex items-center justify-center w-12 h-12 shrink-0 text-on-surface-variant hover:text-on-surface transition-colors">
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>
      <button onClick={toggleDesktop} className="hidden lg:flex items-center justify-center w-12 h-12 lg:h-16 shrink-0 text-on-surface-variant hover:text-on-surface transition-colors relative z-[60] cursor-pointer">
        <span className="material-symbols-outlined text-[22px]">{desktopOpen ? "menu_open" : "menu"}</span>
      </button>
      <h2 className="text-sm lg:text-lg font-bold text-on-surface font-headline truncate pr-4">{title}</h2>
      <div className="ml-auto flex items-center gap-2 lg:gap-4 pr-3 lg:pr-6">
        <QuickSearch />
        <NotificationBell />
        <DateBadge />
        {/* ── Theme toggle ── */}
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
