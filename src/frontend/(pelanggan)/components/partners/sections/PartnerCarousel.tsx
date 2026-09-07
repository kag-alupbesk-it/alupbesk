"use client";

import { useEffect, useState } from "react";
import { contentApi } from "@/services/api";
import type { Partner } from "@/backend/modules/content";

export function PartnerCarousel() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    let active = true;
    contentApi
      .getPartners()
      .then((data) => {
        if (active) setPartners(data.filter((p) => p.active));
      })
      .catch(() => active && setPartners([]));
    return () => {
      active = false;
    };
  }, []);

  if (partners.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline/30 bg-surface-container p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface/20 mb-3 inline-block">handshake</span>
        <p className="text-[15px] font-semibold text-on-surface/50 mb-1">Mitra masih kosong</p>
        <p className="text-[13px] text-on-surface/30">Brand partner akan tampil di sini setelah dikelola dari admin.</p>
      </div>
    );
  }

  const loopedPartners = [...partners, ...partners];
  return <div className="overflow-hidden" aria-label="Mitra ALUPBESK"><div className="partner-track flex w-max gap-5 py-2" style={{ animation: "partner-scroll 14s linear infinite" }}>{loopedPartners.map((partner, index) => <article key={`${partner.id}-${index}`} className="w-32 shrink-0 text-center sm:w-40" aria-hidden={index >= partners.length}><div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full border border-outline/50 bg-surface-container p-3 shadow-lg transition-transform duration-300 hover:scale-105 sm:size-24">{partner.logoUrl ? <img src={partner.logoUrl} alt="" className="size-full object-contain" /> : <span className="text-xl font-black text-secondary">{partner.initials}</span>}</div><p className="mt-3 text-xs font-bold text-on-surface/70">{partner.name}</p></article>)}</div></div>;
}
