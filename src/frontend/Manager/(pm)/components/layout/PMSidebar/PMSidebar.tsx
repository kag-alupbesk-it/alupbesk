"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRolePagePath } from "@/frontend/shared/navigation/getRolePagePath";
import { clsx } from "clsx";
import {
  ClipboardCheck,
  FilePlus2,
  LayoutDashboard,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePMOrders } from "../../../context/PMOrderContext/PMOrderContext";
import { needsDrawingApproval } from "../../../orderStatus/orderStatus";
import { usePMSidebar } from "../PMSidebarProvider/PMSidebarProvider";

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function PMSidebar() {
  const pathname = getRolePagePath(usePathname());
  const { open, close, desktopOpen } = usePMSidebar();
  const { orders } = usePMOrders();
  const pendingApproval = orders.filter(needsDrawingApproval).length;

  const navigation: NavigationItem[] = [
    { href: "/pm", label: "Overview", icon: LayoutDashboard },
    { href: "/pm/approval", label: "Approval Gambar", icon: ClipboardCheck, badge: pendingApproval },
  ];

  const isActive = (href: string) => pathname === href;

  const sidebarContent = (
    <aside className="flex h-screen w-[264px] flex-col border-r border-outline/30 bg-primary-container px-4 py-6">
      <div className="flex items-start justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary shadow-lg shadow-secondary/20">
            <span className="text-lg font-black">A</span>
          </div>
          <div>
            <p className="font-headline text-[17px] font-extrabold tracking-[0.16em] text-on-surface">ALUPBESK</p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-secondary">Project Manager</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={close}
          className="mt-1 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface lg:hidden"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-8 px-3">
        <Link
          href="/pm/orders/create"
          onClick={close}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-extrabold text-primary shadow-lg shadow-secondary/20 transition-colors hover:brightness-105"
        >
          <FilePlus2 size={16} strokeWidth={2.5} />
          Tambah Order Baru
        </Link>
      </div>

      <nav className="mt-7 flex-1" aria-label="Navigasi modul PM">
        <p className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">Workspace</p>
        <div className="mt-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold transition-colors",
                  active
                    ? "bg-secondary/12 text-secondary"
                    : "text-on-surface-variant hover:bg-surface-variant/70 hover:text-on-surface",
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.3 : 1.8} />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={clsx("rounded-full px-1.5 py-0.5 text-[9px] font-bold", active ? "bg-secondary text-primary" : "bg-secondary/15 text-secondary")}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );

  return (
    <>
      <div className={clsx("hidden lg:block", desktopOpen ? "block" : "pointer-events-none opacity-0")}>
        <div className={clsx("fixed inset-y-0 left-0 z-50 transition-transform duration-300", desktopOpen ? "translate-x-0" : "-translate-x-full")}>
          {sidebarContent}
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Tutup navigasi" onClick={close} className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          <div className="animate-slideRight absolute inset-y-0 left-0">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
