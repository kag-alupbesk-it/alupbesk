"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import TopBar from "./TopBar";
import MobileBottomNav from "@/app/MobileBottomNav";
import { useSidebar } from "./SidebarProvider";

const BOTTOM_NAV = [
  { href: "/owner", label: "Overview", icon: "dashboard" },
  { href: "/owner/financials", label: "Financials", icon: "payments" },
  { href: "/owner/users", label: "Users", icon: "group" },
  { href: "/owner/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/owner/reports", label: "Reports", icon: "assessment" },
];

const pageTitles: Record<string, string> = {
  "/owner": "Overview",
  "/owner/financials": "Financials",
  "/owner/users": "User Management",
  "/owner/inventory": "Inventory",
  "/owner/reports": "Reports",
};

export default function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
