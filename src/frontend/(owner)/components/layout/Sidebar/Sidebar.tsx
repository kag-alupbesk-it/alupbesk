"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRolePagePath } from "@/frontend/shared/navigation/getRolePagePath";
import { clsx } from "clsx";
import { useSidebar } from "../SidebarProvider/SidebarProvider";
import * as styles from "../style/style";

const navItems = [
  { href: "/owner", label: "Overview", icon: "dashboard" },
  { href: "/owner/financials", label: "Financials", icon: "payments" },
  { href: "/owner/users", label: "User Management", icon: "group" },
  { href: "/owner/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/owner/reports", label: "Reports", icon: "assessment" },
];

export default function Sidebar() {
  const pathname = getRolePagePath(usePathname());
  const { open, close, desktopOpen } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/owner") return pathname === "/owner";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <aside
      className={clsx(
        "w-64 h-screen fixed left-0 top-0 bg-primary-container border-r border-outline/30 shadow-2xl z-50 flex flex-col py-10 max-lg:shadow-none transition-all duration-300",
        desktopOpen
          ? "lg:translate-x-0"
          : "lg:-translate-x-full lg:pointer-events-none lg:opacity-0"
      )}
    >
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>ALUPBESK</h1>
        <p className={styles.brandSub}>Industrial Precision</p>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={clsx(styles.navLink, active ? styles.navLinkActive : styles.navLinkInactive)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={styles.footer}>
        <Link href="#" onClick={close} className={styles.footerLink}>
          <span className={styles.footerIcon}>settings</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop view */}
      <div className="hidden lg:block">{sidebarContent}</div>
      
      {/* Mobile view with backdrop drawer */}
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
