"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export interface BottomNavItem {
  href: string;
  label: string;
  icon: string;
}

interface Props {
  items: BottomNavItem[];
  /**
   * Dipanggil saat pengguna menekan "Lainnya". Biasanya membuka drawer sidebar.
   * Hanya tampil bila item lebih dari 4.
   */
  onMore?: () => void;
}

const MAX_SLOTS = 4;

export default function MobileBottomNav({ items, onMore }: Props) {
  const pathname = usePathname();
  const showMore = items.length > MAX_SLOTS && typeof onMore === "function";
  const visible = showMore ? items.slice(0, MAX_SLOTS - 1) : items;

  const matched = [...items]
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const moreActive = showMore && !visible.some((item) => item.href === matched?.href);

  const itemClass = (active: boolean) =>
    clsx(
      "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-semibold transition-colors",
      active ? "bg-secondary/15 text-secondary" : "text-on-surface-variant active:bg-surface-variant"
    );

  const iconStyle = (active: boolean) => ({
    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
  });

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-outline/40 bg-primary-container/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
        {visible.map((item) => {
          const active = matched?.href === item.href;
          return (
            <Link key={item.href} href={item.href} className={itemClass(active)}>
              <span className="material-symbols-outlined text-[22px]" style={iconStyle(active)}>
                {item.icon}
              </span>
              <span className="max-w-[72px] truncate">{item.label}</span>
            </Link>
          );
        })}
        {showMore && (
          <button type="button" onClick={onMore} className={itemClass(moreActive)}>
            <span className="material-symbols-outlined text-[22px]" style={iconStyle(moreActive)}>
              apps
            </span>
            <span>Lainnya</span>
          </button>
        )}
      </div>
    </nav>
  );
}
