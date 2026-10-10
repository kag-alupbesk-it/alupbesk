"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import TopBar from "../TopBar/TopBar";
import MobileBottomNav from "@/app/MobileBottomNav";
import { useSidebar } from "../SidebarProvider/SidebarProvider";
import { getRolePagePath } from "@/frontend/shared/navigation/getRolePagePath";

const BOTTOM_NAV = [
  { href: "/owner", label: "Overview", icon: "dashboard" },
  { href: "/owner/pesanan", label: "Pesanan", icon: "receipt_long" },
  { href: "/owner/keuangan", label: "Keuangan", icon: "payments" },
  { href: "/owner/gudang", label: "Inventory", icon: "inventory_2" },
  { href: "/owner/users", label: "Users", icon: "group" },
];

const pageTitles: Record<string, string> = {
  "/owner": "Overview",
  "/owner/pesanan": "Pesanan Masuk",
  "/owner/keuangan": "Keuangan",
  "/owner/gudang": "Inventory",
  "/owner/proyek": "Proyek",
  "/owner/produksi": "Produksi",
  "/owner/field": "Pengiriman",
  "/owner/users": "User Management",
  "/owner/reports": "Reports",
};

export default function OwnerShell({ children }: { children: React.ReactNode }) {
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
