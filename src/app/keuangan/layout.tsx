"use client";

import { useTheme } from "@/app/ThemeContext";
import { SidebarProvider } from "@/frontend/(keuangan)/components/layout/SidebarProvider";
import Sidebar from "@/frontend/(keuangan)/components/layout/Sidebar";
import KeuanganShell from "@/frontend/(keuangan)/components/layout/KeuanganShell";

function KeuanganLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <SidebarProvider>
      {/*
       * suppressHydrationWarning: className differs on server ("manager-dark")
       * vs. client (could be "manager-light"). Correct value is applied before
       * first paint via the inline theme script, so this is safe.
       */}
      <div
        className={`${
          theme === "dark" ? "manager-dark" : "manager-light"
        } flex min-h-screen bg-primary-container`}
        suppressHydrationWarning
      >
        <Sidebar />
        <KeuanganShell>{children}</KeuanganShell>
      </div>
    </SidebarProvider>
  );
}

export default function KeuanganLayout({ children }: { children: React.ReactNode }) {
  return <KeuanganLayoutInner>{children}</KeuanganLayoutInner>;
}
