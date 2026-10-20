"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { getRolePagePath } from "./getRolePagePath";
import type { NavigationRole, RoleNavigationItem } from "./roleNavigation";

interface ResponsiveRoleNavigationProps {
  role: NavigationRole;
  items: RoleNavigationItem[];
  desktopOpen?: boolean;
  selectedKey?: string;
  badges?: Record<string, number>;
  desktopFooter?: ReactNode;
  onSelect?: (key: string) => void;
}

const MOBILE_VISIBLE_COUNT = 3;
const ROLE_LABELS: Record<NavigationRole, string> = {
  owner: "Owner",
  manager: "Manager",
  marketing: "Marketing",
  gudang: "Gudang",
  keuangan: "Keuangan",
  proyek: "Project Manager",
  produksi: "Produksi",
  field: "Field",
  drafter: "Drafter",
};

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ResponsiveRoleNavigation({
  role,
  items,
  desktopOpen = true,
  selectedKey,
  badges,
  desktopFooter,
  onSelect,
}: ResponsiveRoleNavigationProps) {
  const pathname = getRolePagePath(usePathname());
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const expanded = expandedPath === pathname;
  const mobileNavId = `${role}-role-navigation`;
  const visibleCount = items.length > MOBILE_VISIBLE_COUNT + 1 ? MOBILE_VISIBLE_COUNT : items.length;
  const showMore = items.length > visibleCount;
  const currentItem = selectedKey
    ? items.find((item) => item.key === selectedKey)
    : [...items]
        .filter((item) => item.href && matchesPath(pathname, item.href))
        .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0];
  const moreActive = showMore && !!currentItem && items.indexOf(currentItem) >= visibleCount;
  const activeIndex = moreActive
    ? visibleCount
    : currentItem
      ? items.indexOf(currentItem)
      : -1;
  const slotCount = visibleCount + (showMore ? 1 : 0);

  const itemClass = (active: boolean, usesMobileIndicator = false) =>
    clsx(
      "relative z-10 flex w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold leading-tight transition-colors lg:flex-none lg:flex-row lg:justify-start lg:gap-2 lg:rounded-md lg:px-3 lg:py-2 lg:text-sm",
      active
        ? clsx(
            "text-secondary lg:bg-secondary/10",
            !usesMobileIndicator && "bg-secondary/15",
          )
        : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface",
    );

  return (
    <nav
      aria-label={`Navigasi ${role}`}
      className={clsx(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col border-t border-outline/40 bg-primary-container/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-2xl backdrop-blur-md lg:inset-y-0 lg:right-auto lg:w-56 lg:border-r lg:border-t-0 lg:px-2.5 lg:py-6",
        desktopOpen ? "lg:flex" : "lg:hidden",
        expanded && "max-h-[75dvh] overflow-y-auto lg:max-h-none lg:overflow-visible",
      )}
    >
      <div className="mb-4 hidden items-center justify-center lg:flex lg:mb-8 lg:justify-start lg:px-3">
        <Image
          alt="ALUPBESK"
          width={120}
          height={36}
          unoptimized
          className="h-8 w-auto"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkO_l-9w6bkkBin3qoTG6N3CPGHRgmgHamUsLFsVuhUSz9-trFcZtc4J9-3VD2qtWy_mUatmgb-mBU2vA9Fo9eXrTZLsP7XYbnfpRDy4SxTPRtfcpkRFOmqJX2ICxC1DhosDrXu_ez0qbfpA9MFuX62sPdXm3UFe5lXo4TFu1a2NkAgqah8Xk4c8hy__wtXqML5NwpPBoCcLsq2DXxmxbTp5D4xmZfgk7jRZ59yEBHit7D8Nvon3bSuVUeVMKInwKE7xH4c39y5lI"
        />
        <span className="ml-3 hidden min-w-0 lg:block">
          <span className="block truncate font-headline text-base font-extrabold tracking-[0.12em] text-on-surface">
            ALUPBESK
          </span>
          <span className="block truncate text-[9px] font-bold uppercase tracking-[0.16em] text-secondary">
            {ROLE_LABELS[role]}
          </span>
        </span>
      </div>

      <ul
        id={mobileNavId}
        className={clsx(
          "relative w-full items-stretch gap-1 lg:flex lg:flex-col lg:gap-1.5",
          expanded ? "grid grid-cols-2 lg:flex lg:flex-col" : "flex flex-row lg:flex-col",
        )}
      >
        {!expanded && activeIndex >= 0 && !moreActive && (
          <li
            role="presentation"
            aria-hidden="true"
            className="mobileBottomNavIndicator pointer-events-none absolute inset-y-0 left-0 z-0 rounded-xl bg-secondary/15 lg:hidden"
            style={{
              width: `calc((100% - ${(slotCount - 1) * 0.25}rem) / ${slotCount})`,
              transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
            }}
          />
        )}
        {items.map((item, index) => {
          const active = currentItem?.key === item.key;
          const isMobileOverflow = showMore && index >= visibleCount;
          const badge = badges?.[item.key];
          const content = (
            <>
              <span
                aria-hidden="true"
                className="material-symbols-outlined relative shrink-0 text-[21px] lg:text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white lg:hidden">
                    {badge}
                  </span>
                )}
              </span>
              <span className="max-w-[76px] truncate text-center text-[10px] leading-tight lg:max-w-none lg:flex-1 lg:text-left lg:text-sm lg:leading-normal">
                {item.label}
              </span>
              {badge !== undefined && badge > 0 && (
                <span className="hidden min-w-5 items-center justify-center rounded-full bg-secondary/15 px-1.5 py-0.5 text-[9px] font-bold text-secondary lg:flex">
                  {badge}
                </span>
              )}
            </>
          );

          return (
            <li
              key={item.key}
              className={clsx(
                "min-w-0 lg:w-full",
                isMobileOverflow && !expanded ? "hidden lg:flex" : "flex",
                expanded && "lg:flex",
                !expanded && !isMobileOverflow && "flex-1",
              )}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                  onClick={() => setExpandedPath(null)}
                  className={itemClass(active, !expanded && !moreActive)}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-label={item.label}
                  aria-pressed={active}
                  title={item.label}
                  onClick={() => {
                    onSelect?.(item.key);
                    setExpandedPath(null);
                  }}
                  className={itemClass(active, !expanded && !moreActive)}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
        {showMore && (
          <li className="flex min-w-0 flex-1 lg:hidden">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={mobileNavId}
              onClick={() => setExpandedPath(expanded ? null : pathname)}
              className={itemClass(moreActive, !expanded && !moreActive)}
            >
              <span className="material-symbols-outlined text-[21px]">
                {expanded ? "close" : "apps"}
              </span>
              <span className="max-w-[76px] truncate text-center text-[10px] leading-tight">
                {expanded ? "Tutup" : "Lainnya"}
              </span>
            </button>
          </li>
        )}
      </ul>
      {desktopFooter && (
        <div className="mt-auto hidden px-2 pb-2 lg:block">
          {desktopFooter}
        </div>
      )}
    </nav>
  );
}
