"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/app/ThemeContext";
import { SidebarProvider, Sidebar, DrafterShell } from "@/frontend/Manager/(drafter)/components/layout";

function DrafterLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isPrint = pathname.includes("/print");

  return (
    <SidebarProvider>
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
          <DrafterShell>{children}</DrafterShell>
        )}
      </div>
    </SidebarProvider>
  );
}

export default function DrafterLayout({ children }: { children: React.ReactNode }) {
  return <DrafterLayoutInner>{children}</DrafterLayoutInner>;
}
