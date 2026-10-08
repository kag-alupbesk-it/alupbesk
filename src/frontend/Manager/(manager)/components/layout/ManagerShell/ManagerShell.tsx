"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import TopBar from "../TopBar/TopBar";
import MobileBottomNav from "@/app/MobileBottomNav";
import { useSidebar } from "../SidebarProvider/SidebarProvider";
import { getRolePagePath } from "@/frontend/shared/navigation/getRolePagePath";

const BOTTOM_NAV = [
  { href: "/manager", label: "Overview", icon: "dashboard" },
  { href: "/manager/financials", label: "Financials", icon: "payments" },
  { href: "/manager/pesanan", label: "Pesanan", icon: "apartment" },
  { href: "/manager/users", label: "Users", icon: "group" },
  { href: "/manager/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/manager/reports", label: "Reports", icon: "assessment" },
];

const pageTitles: Record<string, string> = {
  "/manager": "Overview",
  "/manager/financials": "Financials",
  "/manager/pesanan": "Pesanan Proyek",
  "/manager/users": "User Management",
  "/manager/inventory": "Inventory",
  "/manager/reports": "Reports",
};

export default function ManagerShell({ children }: { children: React.ReactNode }) {
  const pathname = getRolePagePath(usePathname());
  const title = pageTitles[pathname] || "Dashboard";
  const { desktopOpen, toggle } = useSidebar();

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title={title} />
      <main className="flex-1 pt-12 pb-24 lg:pt-16 lg:pb-0">{children}</main>
      <MobileBottomNav items={BOTTOM_NAV} onMore={toggle} />
    </div>
  );
}
