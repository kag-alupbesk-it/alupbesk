"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";
import { useSidebar } from "./SidebarProvider";

const navItems = [
  { href: "/manager", label: "Overview", icon: "dashboard" },
  { href: "/manager/financials", label: "Financials", icon: "payments" },
  { href: "/manager/users", label: "User Management", icon: "group" },
  { href: "/manager/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/manager/reports", label: "Reports", icon: "assessment" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, close, desktopOpen } = useSidebar();
  const [showSettings, setShowSettings] = useState(false);
  const [settings] = useState({ businessName: "ALUPBESK" });
  const isActive = (href: string) => href === "/manager" ? pathname === "/manager" : pathname.startsWith(href);
  const sidebarContent = (
    <aside className={clsx("w-64 h-screen fixed left-0 top-0 bg-primary-container border-r border-white/10 shadow-2xl z-50 flex flex-col py-6 lg:py-10 max-lg:shadow-none transition-all duration-300", desktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full lg:pointer-events-none lg:opacity-0")}>
      <div className="px-5 lg:px-8 mb-8 lg:mb-12"><h1 className="text-xl lg:text-2xl font-extrabold text-secondary tracking-tighter uppercase font-headline">{settings.businessName}</h1><p className="text-on-surface-variant text-[9px] lg:text-[10px] font-semibold tracking-widest uppercase mt-1">Industrial Precision</p></div>
      <nav className="flex-1 px-3 lg:px-4 space-y-0.5 lg:space-y-1">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={close} className={clsx("flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all text-xs lg:text-sm", isActive(item.href) ? "bg-secondary text-on-secondary font-bold shadow-lg shadow-secondary/20" : "text-on-surface-variant hover:text-white hover:bg-surface-variant")}><span className="material-symbols-outlined text-[18px] lg:text-[20px]">{item.icon}</span><span className="font-medium">{item.label}</span></Link>)}</nav>
      <div className="px-4 lg:px-6 mb-6 lg:mb-8"><button onClick={() => { router.push("/manager/reports"); close(); }} className="w-full py-2.5 lg:py-3 bg-secondary text-on-secondary font-bold rounded-pill flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-secondary/20 text-xs lg:text-sm"><span className="material-symbols-outlined text-xs lg:text-sm">add_chart</span>Create Report</button></div>
      <div className="mt-auto px-3 lg:px-4 space-y-0.5 lg:space-y-1 border-t border-white/10 pt-4 lg:pt-6"><button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-on-surface-variant hover:text-white transition-colors text-xs lg:text-sm"><span className="material-symbols-outlined text-[16px] lg:text-[18px]">settings</span><span>Settings</span></button><Link href="/" className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-on-surface-variant hover:text-white transition-colors text-xs lg:text-sm"><span className="material-symbols-outlined text-[16px] lg:text-[18px]">logout</span><span>Logout</span></Link></div>
    </aside>
  );
  return <>{showSettings ? null : null}<div className="hidden lg:block">{sidebarContent}</div>{open && <div className="lg:hidden fixed inset-0 z-[55] animate-fadeIn"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} /><div className="absolute left-0 top-0 h-full w-64 animate-slideRight">{sidebarContent}</div></div>}</>;
}
