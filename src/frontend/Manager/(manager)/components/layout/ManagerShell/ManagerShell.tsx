"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import TopBar from "../TopBar/TopBar";
import { useSidebar } from "../SidebarProvider/SidebarProvider";
import { getRolePagePath } from "@/frontend/shared/navigation/getRolePagePath";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import type { MessageKey } from "@/frontend/shared/i18n/translations";

const pageTitleKeys: Record<string, MessageKey> = {
  "/manager": "managerOverviewTitle",
  "/manager/financials": "financials",
  "/manager/users": "userManagement",
  "/manager/inventory": "inventory",
  "/manager/reports": "reports",
  "/manager/audit": "activityHistory",
};

export default function ManagerShell({ children }: { children: React.ReactNode }) {
  const pathname = getRolePagePath(usePathname());
  const { t } = useLanguage();
  const title = t(pageTitleKeys[pathname] ?? "managerOverviewTitle");
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
