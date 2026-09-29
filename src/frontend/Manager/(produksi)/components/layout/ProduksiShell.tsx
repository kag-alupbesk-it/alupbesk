"use client";

import type { ReactNode } from "react";
import { ProduksiTopBar } from "./ProduksiTopBar";
import { useProduksiSidebar } from "./ProduksiSidebarProvider";

export function ProduksiShell({ children }: { children: ReactNode }) {
  const { desktopOpen } = useProduksiSidebar();

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${
        desktopOpen ? "lg:ml-[264px]" : "lg:ml-0"
      }`}
    >
      <ProduksiTopBar />
      <main className="min-h-screen flex-1 px-4 pb-12 pt-[104px] sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
