"use client";

import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePMSidebar } from "./PMSidebarProvider";
import ThemeToggle from "@/app/ThemeToggle";

function getPageTitle(pathname: string) {
  if (pathname === "/pm") return "Overview";
  if (pathname.startsWith("/pm/orders/create")) return "Tambah Order Baru";
  if (pathname.startsWith("/pm/approval")) return "Approval Gambar";
  if (pathname.startsWith("/pm/orders/")) return "Detail Proyek";
  return "Project Manager";
}

export function PMTopBar() {
  const pathname = usePathname();
  const { desktopOpen, toggle, toggleDesktop } = usePMSidebar();
  const title = getPageTitle(pathname);

  return (
    <header className={`fixed right-0 top-0 z-40 flex h-[72px] items-center border-b border-outline/30 bg-primary-container/85 px-4 backdrop-blur-xl transition-[left] duration-300 lg:px-7 ${desktopOpen ? "left-0 lg:left-[264px]" : "left-0"}`}>
      <button type="button" onClick={toggle} aria-label="Buka navigasi" className="mr-3 rounded-xl p-2 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface lg:hidden">
        <Menu size={20} />
      </button>
      <button type="button" onClick={toggleDesktop} aria-label={desktopOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"} className="mr-3 hidden rounded-xl p-2 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface lg:block">
        {desktopOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
      </button>

      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">
          <span>Workspace</span>
          <span className="text-secondary">/</span>
          <span className="truncate">{title}</span>
        </div>
        <h1 className="mt-1 truncate font-headline text-base font-bold text-on-surface lg:text-lg">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/15 text-[10px] font-extrabold text-secondary">PM</span>
          <span className="hidden lg:block">
            <span className="block text-[11px] font-bold text-on-surface">Project Manager</span>
            <span className="mt-0.5 block text-[9px] text-on-surface-variant">Modul Produksi</span>
          </span>
        </div>
      </div>
    </header>
  );
}
