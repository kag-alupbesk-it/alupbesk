"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";

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

  return (
    <>
      <aside className="w-64 h-screen fixed left-0 top-0 bg-surface border-r border-outline/20 shadow-2xl z-50 flex flex-col py-10">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-extrabold text-secondary tracking-tighter uppercase font-headline">
            {settings.businessName}
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
          <button
            onClick={() => router.push("/owner/reports")}
            className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-pill flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-secondary/20 text-sm"
          >
            <span className="material-symbols-outlined text-sm">add_chart</span>
            Create Report
          </button>
        </div>

        <div className="mt-auto px-4 space-y-1 border-t border-outline/50 pt-6">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-white transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-white transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn" onClick={() => setShowSettings(false)}>
          <div className="bg-surface border border-outline rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-xl font-bold text-on-surface font-headline">Pengaturan</h4>
              <button onClick={() => setShowSettings(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Nama Bisnis</label>
                <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={settings.businessName} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Email</label>
                  <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Telepon</label>
                  <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Alamat</label>
                <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Bahasa</label>
                  <select className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })} className="w-5 h-5 accent-secondary" />
                    <span className="text-sm text-on-surface">Notifikasi Aktif</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-3 border border-outline rounded-pill text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors">Batal</button>
              <button onClick={handleSaveSettings} className="flex-1 py-3 bg-secondary text-on-secondary rounded-pill font-bold text-sm hover:brightness-110 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
