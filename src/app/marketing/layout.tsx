"use client";

import { useTheme } from "@/app/ThemeContext";
import { SidebarProvider, Sidebar, MarketingShell } from "@/frontend/(marketing)/components/layout";

function MarketingLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <SidebarProvider>
      <div
        className={`${
          theme === "dark" ? "manager-dark" : "manager-light"
        } flex min-h-screen bg-primary-container`}
        suppressHydrationWarning
      >
        <Sidebar />
        <MarketingShell>{children}</MarketingShell>
      </div>
    </SidebarProvider>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingLayoutInner>{children}</MarketingLayoutInner>;
}
