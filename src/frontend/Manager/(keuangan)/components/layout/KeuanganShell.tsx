"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import TopBar from "./TopBar";
import { useSidebar } from "./SidebarProvider";
import { KeuanganProvider } from "../keuangan/KeuanganContext";

const pageTitles: Record<string, string> = {
  "/keuangan": "Kas",
  "/keuangan/penagihan": "Penagihan",
  "/keuangan/laporan": "Laporan Keuangan",
};

export default function KeuanganShell({ children }: { children: React.ReactNode }) {
  const { desktopOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <KeuanganProvider>
      <div
        className={clsx(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          desktopOpen ? "lg:ml-64" : "lg:ml-0"
        )}
      >
        <TopBar title={pageTitles[pathname] ?? "Keuangan"} />
        <main className="flex-1 pt-12 lg:pt-16">{children}</main>
      </div>
    </KeuanganProvider>
  );
}
