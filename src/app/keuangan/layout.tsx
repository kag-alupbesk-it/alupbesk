"use client";

import { useTheme } from "@/app/ThemeContext";
import KeuanganShell from "@/frontend/Manager/(keuangan)/components/layout/KeuanganShell";

function KeuanganLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    /*
     * suppressHydrationWarning: className differs on server ("manager-dark")
     * vs. client (could be "manager-light"). Correct value is applied before
     * first paint via the inline theme script, so this is safe.
     */
    <div
      className={`${
        theme === "dark" ? "manager-dark" : "manager-light"
      } flex min-h-screen bg-primary-container`}
      suppressHydrationWarning
    >
      <KeuanganShell>{children}</KeuanganShell>
    </div>
  );
}

export default function KeuanganLayout({ children }: { children: React.ReactNode }) {
  return <KeuanganLayoutInner>{children}</KeuanganLayoutInner>;
}