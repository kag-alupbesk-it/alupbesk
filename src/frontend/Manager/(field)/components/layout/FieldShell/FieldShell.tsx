"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import TopBar from "../TopBar/TopBar";
import BottomNav from "../BottomNav/BottomNav";
import { useSidebar } from "../SidebarProvider/SidebarProvider";
import { getRolePagePath } from "@/frontend/shared/navigation/getRolePagePath";

const TITLES: Record<string, string> = {
  "/field": "Daftar Pengiriman",
  "/field/surat-jalan": "Surat Jalan & Pengiriman Bertahap",
  "/field/pod": "Bukti Terima",
};

export default function FieldShell({ children }: { children: React.ReactNode }) {
  const pathname = getRolePagePath(usePathname());
  const { desktopOpen } = useSidebar();

  const title = TITLES[pathname] ?? "Manajer Lapangan";

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title={title} />
      <main className="flex-1 pt-12 pb-24 lg:pt-16 lg:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
