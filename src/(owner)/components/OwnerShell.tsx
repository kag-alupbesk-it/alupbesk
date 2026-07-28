"use client";

import { usePathname } from "next/navigation";
import TopBar from "./TopBar";

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

  return (
    <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
      <TopBar title={title} />
      <main className="flex-1 pt-12 lg:pt-16">{children}</main>
    </div>
  );
}
