"use client";

import { useTheme } from "@/app/ThemeContext";
import { PMOrderProvider } from "@/frontend/Manager/(pm)/context/PMOrderContext";
import { PMSidebarProvider } from "@/frontend/Manager/(pm)/components/layout/PMSidebarProvider";
import { PMSidebar } from "@/frontend/Manager/(pm)/components/layout/PMSidebar";
import { PMShell } from "@/frontend/Manager/(pm)/components/layout/PMShell";

function PMLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <PMSidebarProvider>
      <PMOrderProvider>
        <div className={`${theme === "dark" ? "manager-dark" : "manager-light"} flex min-h-screen bg-background text-on-surface`} suppressHydrationWarning>
          <PMSidebar />
          <PMShell>{children}</PMShell>
        </div>
      </PMOrderProvider>
    </PMSidebarProvider>
  );
}

export default function PMLayout({ children }: { children: React.ReactNode }) {
  return <PMLayoutContent>{children}</PMLayoutContent>;
}
