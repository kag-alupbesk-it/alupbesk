"use client";

import { useTheme } from "@/app/ThemeContext";

function KeuanganLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div
      className={`${
        theme === "dark" ? "manager-dark" : "manager-light"
      } flex min-h-screen bg-primary-container`}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}

export default function KeuanganLayout({ children }: { children: React.ReactNode }) {
  return <KeuanganLayoutInner>{children}</KeuanganLayoutInner>;
}