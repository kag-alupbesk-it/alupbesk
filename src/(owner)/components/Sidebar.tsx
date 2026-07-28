"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";
import { useSidebar } from "./SidebarProvider";

const navItems = [
  { href: "/owner", label: "Overview", icon: "dashboard" },
  { href: "/owner/financials", label: "Financials", icon: "payments" },
  { href: "/owner/users", label: "User Management", icon: "group" },
  { href: "/owner/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/owner/reports", label: "Reports", icon: "assessment" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, close } = useSidebar();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    businessName: "ALUPBESK",
    email: "admin@alupbesk.com",
    phone: "+62 812-3456-7890",
    address: "Surabaya, Jawa Timur",
    language: "id",
    notifications: true,
  });

  const isActive = (href: string) => {
    if (href === "/owner") return pathname === "/owner";
    return pathname.startsWith(href);
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
  };

  const sidebarContent = (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-primary-container border-r border-white/10 shadow-2xl z-50 flex flex-col py-6 lg:py-10 max-lg:shadow-none">
      <div className="px-5 lg:px-8 mb-8 lg:mb-12">
        <h1 className="text-xl lg:text-2xl font-extrabold text-secondary tracking-tighter uppercase font-headline">
          {settings.businessName}
        </h1>
        <p className="text-on-surface-variant text-[9px] lg:text-[10px] font-semibold tracking-widest uppercase mt-1">
          Industrial Precision
        </p>
      </div>

      <nav className="flex-1 px-3 lg:px-4 space-y-0.5 lg:space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={clsx(
                "flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all text-xs lg:text-sm",
                active
                  ? "bg-secondary text-on-secondary font-bold shadow-lg shadow-secondary/20"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant"
              )}
            >
              <span className="material-symbols-outlined text-[18px] lg:text-[20px]">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 lg:px-6 mb-6 lg:mb-8">
        <button
          onClick={() => { router.push("/owner/reports"); close(); }}
          className="w-full py-2.5 lg:py-3 bg-secondary text-on-secondary font-bold rounded-pill flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-secondary/20 text-xs lg:text-sm"
        >
          <span className="material-symbols-outlined text-xs lg:text-sm">add_chart</span>
          Create Report
        </button>
      </div>

      <div className="mt-auto px-3 lg:px-4 space-y-0.5 lg:space-y-1 border-t border-white/10 pt-4 lg:pt-6">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-on-surface-variant hover:text-white transition-colors text-xs lg:text-sm"
        >
          <span className="material-symbols-outlined text-[16px] lg:text-[18px]">settings</span>
          <span>Settings</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-on-surface-variant hover:text-white transition-colors text-xs lg:text-sm"
        >
          <span className="material-symbols-outlined text-[16px] lg:text-[18px]">logout</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[55] animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="absolute left-0 top-0 h-full w-64 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-primary-container border border-white/10 rounded-2xl p-5 sm:p-8 w-full max-w-lg shadow-2xl animate-scaleIn max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5 sm:mb-6">
              <h4 className="text-lg sm:text-xl font-bold text-on-surface font-headline">Pengaturan</h4>
              <button onClick={() => setShowSettings(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Nama Bisnis</label>
                <input className="w-full bg-background border border-outline rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={settings.businessName} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Email</label>
                  <input className="w-full bg-background border border-outline rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Telepon</label>
                  <input className="w-full bg-background border border-outline rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Alamat</label>
                <input className="w-full bg-background border border-outline rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Bahasa</label>
                  <select className="w-full bg-background border border-outline rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })} className="w-4 h-4 sm:w-5 sm:h-5 accent-secondary" />
                    <span className="text-xs sm:text-sm text-on-surface">Notifikasi Aktif</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-2.5 sm:py-3 border border-white/10 rounded-pill text-on-surface-variant font-bold text-xs sm:text-sm hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleSaveSettings} className="flex-1 py-2.5 sm:py-3 bg-secondary text-on-secondary rounded-pill font-bold text-xs sm:text-sm hover:brightness-110 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
