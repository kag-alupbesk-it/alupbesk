"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useSidebar } from "./SidebarProvider";

const navItems = [
  { href: "/gudang", label: "Data Gudang", icon: "inventory_2" },
  { href: "/gudang/pesanan", label: "Pesanan Gudang", icon: "assignment" },
  { href: "/gudang/pesanan-proyek", label: "Pesanan Proyek", icon: "apartment" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open, close, desktopOpen } = useSidebar();

  const isActive = (href: string) =>
    href === "/gudang"
      ? pathname === "/gudang"
      : pathname === href || pathname.startsWith(`${href}/`);

  const sidebarContent = (
    <aside
      className={clsx(
        "w-64 h-screen fixed left-0 top-0 bg-primary-container border-r border-outline/30 shadow-2xl z-50 flex flex-col py-6 lg:py-10 max-lg:shadow-none transition-all duration-300",
        desktopOpen
          ? "lg:translate-x-0"
          : "lg:-translate-x-full lg:pointer-events-none lg:opacity-0"
      )}
    >
      <div className="px-5 lg:px-8 mb-8 lg:mb-12">
        <h1 className="text-xl lg:text-2xl font-extrabold text-secondary tracking-tighter uppercase font-headline">
          ALUPBESK
        </h1>
        <p className="text-on-surface-variant text-[9px] lg:text-[10px] font-semibold tracking-widest uppercase mt-1">
          Gudang Inventaris
        </p>
      </div>

      <nav className="flex-1 px-3 lg:px-4 space-y-0.5 lg:space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className={clsx(
              "flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all text-xs lg:text-sm",
              isActive(item.href)
                ? "bg-secondary text-on-secondary font-bold shadow-lg shadow-secondary/20"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
            )}
          >
            <span className="material-symbols-outlined text-[18px] lg:text-[20px]">
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-3 lg:px-4 space-y-0.5 border-t border-outline/20 pt-6">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-on-surface-variant hover:text-on-surface transition-colors text-xs lg:text-sm rounded-lg"
        >
          <span className="material-symbols-outlined text-[18px] lg:text-[20px]">storefront</span>
          <span className="font-medium">Kembali ke Website</span>
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{sidebarContent}</div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-[55] animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="absolute left-0 top-0 h-full w-64 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
