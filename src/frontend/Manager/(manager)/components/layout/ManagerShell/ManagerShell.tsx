"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import TopBar from "../TopBar/TopBar";
import { useSidebar } from "../SidebarProvider/SidebarProvider";
import { getRolePagePath } from "@/frontend/shared/navigation/getRolePagePath";

const pageTitles: Record<string, string> = {
  "/manager": "Overview",
  "/manager/financials": "Financials",
  "/manager/users": "User Management",
  "/manager/inventory": "Inventory",
  "/manager/reports": "Reports",
  "/manager/audit": "Riwayat Aktivitas",
};

export default function ManagerShell({ children }: { children: React.ReactNode }) {
  const pathname = getRolePagePath(usePathname());
  const title = pageTitles[pathname] || "Dashboard";
  const { desktopOpen } = useSidebar();

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
