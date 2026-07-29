"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import * as styles from "./style";

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
    <aside className={styles.aside}>
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
              className={clsx(styles.navLink, active ? styles.navLinkActive : styles.navLinkInactive)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.ctaWrapper}>
        <Link href="/manager/reports" className={styles.ctaLink}>
          <span className={styles.ctaIcon}>add_chart</span>
          Create Report
        </Link>
      </div>

      <div className={styles.footer}>
        <Link href="#" className={styles.footerLink}>
          <span className={styles.footerIcon}>settings</span>
          <span>Settings</span>
        </Link>
        <Link href="/" className={styles.footerLink}>
          <span className={styles.footerIcon}>logout</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
