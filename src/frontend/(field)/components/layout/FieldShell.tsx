"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import { useSidebar } from "./SidebarProvider";

const TITLES: Record<string, string> = {
  "/field": "Dashboard Antrean",
  "/field/surat-jalan": "Surat Jalan & Partial Shipment",
  "/field/pod": "POD, Geotagging & E-Signature",
};

export default function FieldShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { desktopOpen } = useSidebar();

  const title = TITLES[pathname] ?? "Manajer Lapangan";

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        desktopOpen ? "lg:ml-64" : "lg:ml-0"
      )}
    >
      <TopBar title={title} />
      <main className="flex-1 pt-12 lg:pt-16">{children}</main>
    </div>
  );
}