"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { href: "/manager", label: "Overview", icon: "dashboard" },
  { href: "/manager/financials", label: "Financials", icon: "payments" },
  { href: "/manager/users", label: "User Management", icon: "group" },
  { href: "/manager/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/manager/reports", label: "Reports", icon: "assessment" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/manager") return pathname === "/manager";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-primary-container border-r border-white/10 shadow-2xl z-50 flex flex-col py-10">
      <div className="px-8 mb-12">
        <h1 className="text-2xl font-extrabold text-secondary tracking-tighter uppercase font-headline">
          ALUPBESK
        </h1>
        <p className="text-on-surface-variant text-[10px] font-semibold tracking-widest uppercase mt-1">
          Industrial Precision
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm",
                active
                  ? "bg-secondary text-on-secondary font-bold shadow-lg shadow-secondary/20"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mb-8">
        <Link
          href="/manager/reports"
          className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-pill flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-secondary/20 text-sm"
        >
          <span className="material-symbols-outlined text-sm">add_chart</span>
          Create Report
        </Link>
      </div>

      <div className="mt-auto px-4 space-y-1 border-t border-white/10 pt-6">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-white transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span>Settings</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-white transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
