"use client";

import type { ReactNode } from "react";
import MobileBottomNav from "@/app/MobileBottomNav";
import { usePMSidebar } from "./PMSidebarProvider";
import { PMTopBar } from "./PMTopBar";

const BOTTOM_NAV = [
  { href: "/pm", label: "Overview", icon: "space_dashboard" },
  { href: "/pm/approval", label: "Approval", icon: "fact_check" },
  { href: "/pm/orders/create", label: "Order Baru", icon: "add_circle" },
];

export function PMShell({ children }: { children: ReactNode }) {
  const { desktopOpen, toggle } = usePMSidebar();

  return (
    <div className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${desktopOpen ? "lg:ml-[264px]" : "lg:ml-0"}`}>
      <PMTopBar />
      <main className="min-h-screen flex-1 px-4 pb-24 pt-[104px] sm:px-6 lg:px-8 lg:pb-12">{children}</main>
      <MobileBottomNav items={BOTTOM_NAV} onMore={toggle} />
    </div>
  );
}
