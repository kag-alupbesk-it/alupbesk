"use client";

import { useTheme } from "@/app/ThemeContext";
import {
  PMOrderProvider,
  usePMOrders,
} from "@/frontend/Manager/(pm)/context/PMOrderContext";
import { PMSidebarProvider } from "@/frontend/Manager/(pm)/components/layout/PMSidebarProvider/PMSidebarProvider";
import { PMSidebar } from "@/frontend/Manager/(pm)/components/layout/PMSidebar/PMSidebar";
import { PMShell } from "@/frontend/Manager/(pm)/components/layout/PMShell/PMShell";

function PMLayoutFrame({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { error, clearError } = usePMOrders();

  return (
    <PMSidebarProvider>
      <div className={`${theme === "dark" ? "manager-dark" : "manager-light"} flex min-h-screen bg-background text-on-surface`} suppressHydrationWarning>
        <PMSidebar />
        <PMShell>
          {error && (
            <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">
              <span>{error}</span>
              <button type="button" onClick={clearError} className="font-bold text-red-100 underline">Tutup</button>
            </div>
          )}
          {children}
        </PMShell>
      </div>
    </PMSidebarProvider>
  );
}

export default function PMLayout({ children }: { children: React.ReactNode }) {
  return (
    <PMOrderProvider>
      <PMLayoutFrame>{children}</PMLayoutFrame>
    </PMOrderProvider>
  );
}
