"use client";

import { clsx } from "clsx";
import TopBar from "../TopBar/TopBar";
import MobileBottomNav from "@/app/MobileBottomNav";
import { useSidebar } from "../SidebarProvider/SidebarProvider";

const BOTTOM_NAV = [
  { href: "/marketing", label: "Promosi", icon: "campaign" },
  { href: "/marketing/produk", label: "Produk", icon: "inventory_2" },
  { href: "/marketing/pesanan", label: "Pesanan", icon: "receipt_long" },
  { href: "/marketing/konten", label: "Konten", icon: "edit_note" },
  { href: "/marketing/laporan", label: "Laporan", icon: "bar_chart" },
];

export default function MarketingShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const { desktopOpen, toggle } = useSidebar();

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title={title ?? "Marketing"} />
      <main className="flex-1 pt-12 pb-24 lg:pt-16 lg:pb-0">{children}</main>
      <MobileBottomNav items={BOTTOM_NAV} onMore={toggle} />
    </div>
  );
}
