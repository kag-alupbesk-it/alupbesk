"use client";

import ResponsiveRoleNavigation from "@/frontend/shared/navigation/ResponsiveRoleNavigation";
import { getRoleNavigationItems } from "@/frontend/shared/navigation/roleNavigation";
import { Factory } from "lucide-react";
import { useProduksi } from "../../../context/ProduksiContext/ProduksiContext";
import { alurSPK } from "../../../utils/alur/alur";
import { useProduksiSidebar } from "../ProduksiSidebarProvider/ProduksiSidebarProvider";

export function ProduksiSidebar() {
  const { desktopOpen } = useProduksiSidebar();
  const { spk, spkPerluGambar } = useProduksi();

  const dalamProduksi = spk.filter((item) => alurSPK(item) === "dalam_produksi").length;
  const siapKirim = spk.filter((item) => alurSPK(item) === "siap_kirim").length;

  return (
    <ResponsiveRoleNavigation
      role="produksi"
      items={getRoleNavigationItems("produksi")}
      desktopOpen={desktopOpen}
      badges={{ drawings: spkPerluGambar.length }}
      desktopFooter={
        <div className="rounded-xl border border-outline/25 bg-surface-variant/30 p-4">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Factory size={15} />
            <p className="text-[9px] font-bold uppercase tracking-[0.16em]">Status Workshop</p>
          </div>
          <dl className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[10px] text-on-surface-variant">Dalam Produksi</dt>
              <dd className="font-headline text-sm font-extrabold text-blue-300">{dalamProduksi}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[10px] text-on-surface-variant">Siap Kirim</dt>
              <dd className="font-headline text-sm font-extrabold text-emerald-300">{siapKirim}</dd>
            </div>
          </dl>
        </div>
      }
    />
  );
}
