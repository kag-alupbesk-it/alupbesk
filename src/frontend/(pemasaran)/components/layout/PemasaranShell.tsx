"use client";

import { clsx } from "clsx";
import TopBar from "./TopBar";
import { useSidebar } from "./SidebarProvider";

export default function PemasaranShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const { desktopOpen } = useSidebar();

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title={title ?? "Pemasaran"} />
      <main className="flex-1 pt-12 lg:pt-16">{children}</main>
    </div>
  );
}
