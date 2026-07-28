"use client";

import { partners } from "./data";

// Function untuk menampilkan logo mitra yang bergerak otomatis.
export function PartnerCarousel() {
  const loopedPartners = [...partners, ...partners];
  return <div className="overflow-hidden" aria-label="Mitra ALUPBESK"><div className="partner-track flex w-max gap-5 py-2" style={{ animation: "partner-scroll 14s linear infinite" }}>{loopedPartners.map((partner, index) => <article key={`${partner.name}-${index}`} className="w-32 shrink-0 text-center sm:w-40" aria-hidden={index >= partners.length}><div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 p-3 shadow-lg transition-transform duration-300 hover:scale-105 sm:size-24">{partner.logoUrl ? <img src={partner.logoUrl} alt="" className="size-full object-contain" /> : <span className="text-xl font-black text-secondary">{partner.initials}</span>}</div><p className="mt-3 text-xs font-bold text-white/70">{partner.name}</p></article>)}</div></div>;
}
