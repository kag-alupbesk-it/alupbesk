"use client";

import { useTheme } from "@/app/ThemeContext";
import { Sidebar, SidebarProvider, ManagerShell } from "@/frontend/(manager)/components/layout";

function ManagerLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <SidebarProvider>
      {/*
       * suppressHydrationWarning: className differs on server ("manager-dark",
       * the SSR default) vs. client (could be "manager-light" after the
       * theme script runs). React would normally warn about this; we suppress
       * it since the visual correction happens before the first paint anyway.
       */}
      <div
        className={`${
          theme === "dark" ? "manager-dark" : "manager-light"
        } flex min-h-screen bg-primary-container`}
        suppressHydrationWarning
      >
        <Sidebar />
        <ManagerShell>{children}</ManagerShell>
      </div>
    </SidebarProvider>
  );
}

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <ManagerLayoutInner>{children}</ManagerLayoutInner>;
}
