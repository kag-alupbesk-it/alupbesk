"use client";

import MobileBottomNav from "@/app/MobileBottomNav";
import TopBar from "./TopBar";

const BOTTOM_NAV = [{ href: "/keuangan", label: "Keuangan", icon: "account_balance_wallet" }];

export default function KeuanganShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <TopBar title="Operasional Keuangan" />
      <main className="flex-1 pt-12 pb-24 lg:pt-16 lg:pb-0">{children}</main>
      <MobileBottomNav items={BOTTOM_NAV} />
    </div>
  );
}