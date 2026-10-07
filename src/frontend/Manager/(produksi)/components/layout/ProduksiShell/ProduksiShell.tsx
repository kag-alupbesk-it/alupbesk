"use client";

import type { ReactNode } from "react";
import MobileBottomNav from "@/app/MobileBottomNav";
import { ProduksiTopBar } from "../ProduksiTopBar/ProduksiTopBar";
import { useProduksiSidebar } from "../ProduksiSidebarProvider/ProduksiSidebarProvider";

const BOTTOM_NAV = [
  { href: "/produksi", label: "Produksi", icon: "precision_manufacturing" },
  { href: "/produksi/drawings", label: "Gambar", icon: "upload_file" },
];

export function ProduksiShell({ children }: { children: ReactNode }) {
  const { desktopOpen, toggle } = useProduksiSidebar();

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${
        desktopOpen ? "lg:ml-[264px]" : "lg:ml-0"
      }`}
    >
      <ProduksiTopBar />
      <main className="min-h-screen flex-1 px-4 pb-24 pt-[104px] sm:px-6 lg:px-8 lg:pb-12">{children}</main>
      <MobileBottomNav items={BOTTOM_NAV} onMore={toggle} />
    </div>
  );
}
