"use client";

import { clsx } from "clsx";
import TopBar from "./TopBar";
import { useSidebar } from "./SidebarProvider";

export default function GudangShell({ children }: { children: React.ReactNode }) {
  const { desktopOpen } = useSidebar();

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title="Data Gudang" />
      <main className="flex-1 pt-12 lg:pt-16">{children}</main>
    </div>
  );
}
