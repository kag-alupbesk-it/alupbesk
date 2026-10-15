"use client";

import { clsx } from "clsx";
import TopBar from "../TopBar/TopBar";
import { useSidebar } from "../SidebarProvider/SidebarProvider";

export default function MarketingShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const { desktopOpen } = useSidebar();

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-56" : "lg:ml-0"
      )}
    >
      <TopBar title={title ?? "Marketing"} />
      <main className="roleMobileTypography flex-1 pb-24 pt-12 lg:pb-0 lg:pt-16">{children}</main>
    </div>
  );
}
