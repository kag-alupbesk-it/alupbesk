"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import TopBar from "../TopBar/TopBar";
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
        desktopOpen ? "lg:ml-56" : "lg:ml-0"
      )}
    >
      <TopBar title={title} />
      <main className="roleMobileTypography flex-1 pb-24 pt-12 lg:pb-0 lg:pt-16">{children}</main>
    </div>
  );
}
