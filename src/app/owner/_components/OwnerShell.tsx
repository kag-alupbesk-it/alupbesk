"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import TopBar from "./TopBar";
import { useSidebar } from "./SidebarProvider";

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
  const { desktopOpen } = useSidebar();

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title={title} />
      <main className="flex-1 pt-12 lg:pt-16">{children}</main>
    </div>
  );
}
