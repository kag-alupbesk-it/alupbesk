"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Factory, FileUp, LayoutDashboard, X, type LucideIcon } from "lucide-react";
import { useProduksi } from "../../context/ProduksiContext";
import { useProduksiSidebar } from "./ProduksiSidebarProvider";

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function ProduksiSidebar() {
  const pathname = usePathname();
  const { open, close, desktopOpen } = useProduksiSidebar();
  const { spk, spkPerluGambar } = useProduksi();

  const navigation: NavigationItem[] = [
    { href: "/produksi", label: "Antrean Produksi", icon: LayoutDashboard },
    { href: "/produksi/drawings", label: "Upload Gambar Teknik", icon: FileUp, badge: spkPerluGambar.length },
  ];

  // Detail SPK tidak punya halaman daftar sendiri, jadi itemnya ditandai aktif
  // lewat prefix agar sidebar ikut menyorot saat sedang membuka detail.
  const isActive = (href: string) => (href === "/produksi" ? pathname === href : pathname.startsWith(href));

  const dalamProduksi = spk.filter((item) => item.statusPengerjaan === "dalam_produksi").length;
  const siapKirim = spk.filter((item) => item.statusPengerjaan === "siap_kirim").length;

  const ringkasan = [
    { label: "Dalam Produksi", value: dalamProduksi, tone: "text-blue-300" },
    { label: "Siap Kirim", value: siapKirim, tone: "text-emerald-300" },
  ];

  const sidebarContent = (
    <aside className="flex h-screen w-[264px] flex-col border-r border-outline/30 bg-primary-container px-4 py-6">
      <div className="flex items-start justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary shadow-lg shadow-secondary/20">
            <span className="text-lg font-black">A</span>
          </div>
          <div>
            <p className="font-headline text-[17px] font-extrabold tracking-[0.16em] text-on-surface">ALUPBESK</p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-secondary">Manajer Produksi</p>
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
          href="/produksi/drawings"
          onClick={close}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-extrabold text-primary shadow-lg shadow-secondary/20 transition-colors hover:brightness-105"
        >
          <FileUp size={16} strokeWidth={2.5} />
          Upload Gambar Teknik
        </Link>
      </div>

      <nav className="mt-7 flex-1" aria-label="Navigasi modul produksi">
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
                  <span
                    className={clsx(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                      active ? "bg-secondary text-primary" : "bg-secondary/15 text-secondary",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="rounded-xl border border-outline/25 bg-surface-variant/30 p-4">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Factory size={15} />
          <p className="text-[9px] font-bold uppercase tracking-[0.16em]">Status Workshop</p>
        </div>
        <dl className="mt-3 space-y-2">
          {ringkasan.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-2">
              <dt className="text-[10px] text-on-surface-variant">{row.label}</dt>
              <dd className={`font-headline text-sm font-extrabold ${row.tone}`}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );

  return (
    <>
      <div className={clsx("hidden lg:block", desktopOpen ? "block" : "pointer-events-none opacity-0")}>
        <div
          className={clsx(
            "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
            desktopOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {sidebarContent}
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Tutup navigasi"
            onClick={close}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />
          <div className="animate-slideRight absolute inset-y-0 left-0">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
