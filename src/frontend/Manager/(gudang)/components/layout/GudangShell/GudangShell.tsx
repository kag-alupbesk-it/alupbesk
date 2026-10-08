"use client";

import { clsx } from "clsx";
import TopBar from "../TopBar/TopBar";
import MobileBottomNav from "@/app/MobileBottomNav";
import { useSidebar } from "../SidebarProvider/SidebarProvider";

const BOTTOM_NAV = [
  { href: "/gudang", label: "Gudang", icon: "inventory_2" },
  { href: "/gudang/pesanan", label: "Pesanan", icon: "assignment" },
  { href: "/gudang/pesanan-proyek", label: "Proyek", icon: "apartment" },
];

export default function GudangShell({ children }: { children: React.ReactNode }) {
  const { desktopOpen, toggle } = useSidebar();

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title="Data Gudang" />
      <main className="flex-1 pt-12 pb-24 lg:pt-16 lg:pb-0">{children}</main>
      <MobileBottomNav items={BOTTOM_NAV} onMore={toggle} />
    </div>
  );
}
