"use client";

import type { ReactNode } from "react";
import MobileBottomNav from "@/app/MobileBottomNav";
import { ProduksiTopBar } from "../ProduksiTopBar/ProduksiTopBar";
import { useProduksiSidebar } from "../ProduksiSidebarProvider/ProduksiSidebarProvider";
import { useProduksi } from "../../../context/ProduksiContext/ProduksiContext";

const BOTTOM_NAV = [
  { href: "/produksi", label: "Produksi", icon: "precision_manufacturing" },
  { href: "/produksi/drawings", label: "Gambar", icon: "upload_file" },
];

export function ProduksiShell({ children }: { children: ReactNode }) {
  const { desktopOpen, toggle } = useProduksiSidebar();
  const { error, clearError } = useProduksi();

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${
        desktopOpen ? "lg:ml-[264px]" : "lg:ml-0"
      }`}
    >
      <ProduksiTopBar />
      <main className="min-h-screen flex-1 px-4 pb-24 pt-[104px] sm:px-6 lg:px-8 lg:pb-12">
        {error && (
          <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="font-bold text-red-100 underline">Tutup</button>
          </div>
        )}
        {children}
      </main>
      <MobileBottomNav items={BOTTOM_NAV} onMore={toggle} />
    </div>
  );
}
