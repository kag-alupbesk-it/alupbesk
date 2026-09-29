"use client";

import type { ReactNode } from "react";
import { usePMSidebar } from "./PMSidebarProvider";
import { PMTopBar } from "./PMTopBar";

export function PMShell({ children }: { children: ReactNode }) {
  const { desktopOpen } = usePMSidebar();

  return (
    <div className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${desktopOpen ? "lg:ml-[264px]" : "lg:ml-0"}`}>
      <PMTopBar />
      <main className="min-h-screen flex-1 px-4 pb-12 pt-[104px] sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
