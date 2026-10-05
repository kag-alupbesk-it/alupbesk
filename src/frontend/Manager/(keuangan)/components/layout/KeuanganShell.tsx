"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import TopBar from "./TopBar";
import MobileBottomNav from "@/app/MobileBottomNav";
import { useSidebar } from "./SidebarProvider";
import { KeuanganProvider } from "../keuangan/KeuanganContext";

const pageTitles: Record<string, string> = {
  "/keuangan": "Kas",
  "/keuangan/penagihan": "Penagihan",
  "/keuangan/laporan": "Laporan Keuangan",
};

const BOTTOM_NAV = [
  { href: "/keuangan", label: "Kas", icon: "payments" },
  { href: "/keuangan/penagihan", label: "Penagihan", icon: "receipt_long" },
  { href: "/keuangan/laporan", label: "Laporan", icon: "bar_chart" },
];

export default function KeuanganShell({ children }: { children: React.ReactNode }) {
  const { desktopOpen, toggle } = useSidebar();
  const pathname = usePathname();

  return (
<<<<<<< HEAD
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
=======
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title={pageTitles[pathname] ?? "Keuangan"} />
      <main className="flex-1 pt-12 pb-24 lg:pt-16 lg:pb-0">{children}</main>
      <MobileBottomNav items={BOTTOM_NAV} onMore={toggle} />
    </div>
>>>>>>> 90be3dd65645e7de893169c161203964b02b17a1
  );
}
