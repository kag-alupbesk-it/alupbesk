"use client";

import {
  Fragment,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { getRolePagePath } from "./getRolePagePath";
import type { NavigationRole, RoleNavigationItem } from "./roleNavigation";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import { translate, type MessageKey } from "@/frontend/shared/i18n/translations";

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
const MANAGER_RETURN_KEY = "alupbesk:manager-return";
const MANAGER_RETURN_EVENT = "alupbesk:manager-return-change";
const MANAGER_SECTION_LABELS: Record<string, MessageKey> = {
  overview: "managerSummary",
  "cash-operations": "roleAccess",
  users: "administration",
};
const ROLE_LABELS: Record<NavigationRole, MessageKey> = {
  owner: "roleOwner",
  manager: "roleManager",
  marketing: "roleMarketing",
  gudang: "roleWarehouse",
  keuangan: "roleFinance",
  proyek: "roleProject",
  produksi: "roleProduction",
  field: "roleField",
  drafter: "roleDrafter",
};

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function subscribeToManagerReturn(callback: () => void) {
  window.addEventListener(MANAGER_RETURN_EVENT, callback);
  return () => window.removeEventListener(MANAGER_RETURN_EVENT, callback);
}

function getManagerReturnSnapshot() {
  return window.sessionStorage.getItem(MANAGER_RETURN_KEY) === "true";
}

function getManagerReturnServerSnapshot() {
  return false;
}

function setManagerReturn(enabled: boolean) {
  if (enabled) {
    window.sessionStorage.setItem(MANAGER_RETURN_KEY, "true");
  } else {
    window.sessionStorage.removeItem(MANAGER_RETURN_KEY);
  }
  window.dispatchEvent(new Event(MANAGER_RETURN_EVENT));
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
  const { language, t } = useLanguage();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const canReturnToManager = useSyncExternalStore(
    subscribeToManagerReturn,
    getManagerReturnSnapshot,
    getManagerReturnServerSnapshot,
  );
  const expanded = expandedPath === pathname;

  useEffect(() => {
    if (role === "manager") setManagerReturn(false);
  }, [role]);

  const navigationItems: RoleNavigationItem[] =
    role !== "manager" && canReturnToManager
      ? [
          ...items,
          {
            key: "return-to-manager",
            href: "/manager",
            permissionPath: "/manager",
            label: translate(language, "returnToManager"),
            icon: "arrow_back",
          },
        ]
      : items;
  const mobileNavId = `${role}-role-navigation`;
  const visibleCount =
    navigationItems.length > MOBILE_VISIBLE_COUNT + 1
      ? MOBILE_VISIBLE_COUNT
      : navigationItems.length;
  const showMore = navigationItems.length > visibleCount;
  const currentItem = selectedKey
    ? navigationItems.find((item) => item.key === selectedKey)
    : [...navigationItems]
        .filter((item) => item.href && matchesPath(pathname, item.href))
        .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0];
  const moreActive =
    showMore && !!currentItem && navigationItems.indexOf(currentItem) >= visibleCount;
  const activeIndex = moreActive
    ? visibleCount
    : currentItem
      ? navigationItems.indexOf(currentItem)
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
      aria-label={`${t("commonRoleNavigation")}: ${translate(language, ROLE_LABELS[role])}`}
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
            {translate(language, ROLE_LABELS[role])}
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
        {navigationItems.map((item, index) => {
          const active = currentItem?.key === item.key;
          const isMobileOverflow = showMore && index >= visibleCount;
          const badge = badges?.[item.key];
          const sectionLabel =
            role === "manager" ? MANAGER_SECTION_LABELS[item.key] : undefined;
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
            <Fragment key={item.key}>
              {sectionLabel && (
                <li
                  className={clsx(
                    "hidden w-full px-3 lg:block",
                    sectionLabel === "managerSummary" ? "pt-1" : "pt-3",
                  )}
                >
                  <p
                    className={clsx(
                      "text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant",
                      sectionLabel !== "managerSummary" && "border-t border-outline/40 pt-3",
                    )}
                  >
                    {translate(language, sectionLabel)}
                  </p>
                </li>
              )}
              <li
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
                    onClick={() => {
                      if (role === "manager" && item.href) {
                        const isManagerPage =
                          item.href === "/manager" || item.href.startsWith("/manager/");
                        setManagerReturn(!isManagerPage);
                      }
                      setExpandedPath(null);
                    }}
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
            </Fragment>
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
                {expanded ? t("commonClose") : t("commonMore")}
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
