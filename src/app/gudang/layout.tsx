"use client";

import { useTheme } from "@/app/ThemeContext";
import { SidebarProvider } from "@/frontend/(gudang)/components/layout/SidebarProvider";
import Sidebar from "@/frontend/(gudang)/components/layout/Sidebar";
import GudangShell from "@/frontend/(gudang)/components/layout/GudangShell";

function GudangLayoutInner({ children }: { children: React.ReactNode }) {
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
        <GudangShell>{children}</GudangShell>
      </div>
    </SidebarProvider>
  );
}

export default function GudangLayout({ children }: { children: React.ReactNode }) {
  return <GudangLayoutInner>{children}</GudangLayoutInner>;
}
