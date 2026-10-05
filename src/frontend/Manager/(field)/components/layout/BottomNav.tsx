"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { href: "/field", label: "Pengiriman", icon: "local_shipping" },
  { href: "/field/surat-jalan", label: "Surat Jalan", icon: "description" },
  { href: "/field/pod", label: "Bukti Terima", icon: "document_scanner" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/field"
      ? pathname === "/field"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-outline/40 bg-primary-container/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-semibold transition-colors",
                active
                  ? "bg-secondary/15 text-secondary"
                  : "text-on-surface-variant active:bg-surface-variant"
              )}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
