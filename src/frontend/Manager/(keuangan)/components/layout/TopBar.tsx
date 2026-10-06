"use client";

import ThemeToggle from "@/app/ThemeToggle";

export default function TopBar({ title }: { title: string }) {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-12 items-center border-b border-outline/40 bg-primary-container/80 backdrop-blur-md lg:h-16">
      <h2 className="truncate pr-4 font-headline text-sm font-bold text-on-surface lg:text-lg">
        {title}
      </h2>

      <div className="ml-auto flex items-center gap-2 pr-3 lg:gap-4 lg:pr-6">
        <button className="relative text-on-surface-variant transition-colors hover:text-secondary">
          <span className="material-symbols-outlined text-[18px] lg:text-[20px]">notifications</span>
          <span className="absolute top-0 right-0 h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
        </button>
        <ThemeToggle />
        <div className="h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2 border-outline transition-colors hover:border-secondary lg:h-8 lg:w-8">
          <div className="flex h-full w-full items-center justify-center bg-surface-variant">
            <span className="material-symbols-outlined text-xs text-secondary lg:text-sm">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}