"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/app/ThemeContext";
import { SidebarProvider } from "@/frontend/Manager/(field)/components/layout/SidebarProvider/SidebarProvider";
import Sidebar from "@/frontend/Manager/(field)/components/layout/Sidebar/Sidebar";
import FieldShell from "@/frontend/Manager/(field)/components/layout/FieldShell/FieldShell";

function FieldLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  // Halaman cetak ditampilkan tanpa sidebar/topbar agar hasil print A4 bersih.
  const isPrint = pathname.includes("/print");

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
        {!isPrint && <Sidebar />}
        {isPrint ? (
          <div className="flex-1 min-w-0">{children}</div>
        ) : (
          <FieldShell>{children}</FieldShell>
        )}
      </div>
    </SidebarProvider>
  );
}

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return <FieldLayoutInner>{children}</FieldLayoutInner>;
}