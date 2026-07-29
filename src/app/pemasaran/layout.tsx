"use client";

import { useTheme } from "@/app/ThemeContext";
import { SidebarProvider, Sidebar, PemasaranShell } from "@/frontend/(pemasaran)/components/layout";

function PemasaranLayoutInner({ children }: { children: React.ReactNode }) {
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
        <PemasaranShell>{children}</PemasaranShell>
      </div>
    </SidebarProvider>
  );
}

export default function PemasaranLayout({ children }: { children: React.ReactNode }) {
  return <PemasaranLayoutInner>{children}</PemasaranLayoutInner>;
}
