"use client";

import { useTheme } from "@/app/ThemeContext";
import { ProduksiSidebarProvider } from "@/frontend/Manager/(produksi)/components/layout/ProduksiSidebarProvider/ProduksiSidebarProvider";
import { ProduksiSidebar } from "@/frontend/Manager/(produksi)/components/layout/ProduksiSidebar/ProduksiSidebar";
import { ProduksiShell } from "@/frontend/Manager/(produksi)/components/layout/ProduksiShell/ProduksiShell";
import { ProduksiProvider } from "@/frontend/Manager/(produksi)/context/ProduksiContext/ProduksiContext";

function ProduksiLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <ProduksiSidebarProvider>
      <ProduksiProvider>
        {/* Module ini memakai override token manager-dark/manager-light yang
            sama dengan modul lain: belum ada scope warna khusus produksi. */}
        <div
          className={`${theme === "dark" ? "manager-dark" : "manager-light"} flex min-h-screen bg-background text-on-surface`}
          suppressHydrationWarning
        >
          <ProduksiSidebar />
          <ProduksiShell>{children}</ProduksiShell>
        </div>
      </ProduksiProvider>
    </ProduksiSidebarProvider>
  );
}

export default function ProduksiLayout({ children }: { children: React.ReactNode }) {
  return <ProduksiLayoutContent>{children}</ProduksiLayoutContent>;
}
