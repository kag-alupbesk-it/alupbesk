"use client";

import { useCallback } from "react";
import Image from "next/image";
import { contentApi } from "@/services/api/index";
import type { Partner } from "@/backend/modules/content/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import { getFallbackPartners } from "../getFallbackPartners";

export function PartnerCarousel() {
  const { t } = useLanguage();
  const loadPartners = useCallback(() => contentApi.getPartners(), []);
  const { data: partnerData, loading } = usePollingResource<Partner[]>(loadPartners, []);
  const partners = (partnerData.length ? partnerData : getFallbackPartners()).filter((partner) => partner.active);

  if (loading && partners.length === 0) {
    return <div className="rounded-2xl border border-outline/20 bg-surface-container p-8 text-center text-sm text-on-surface/50">Memuat mitra...</div>;
  }

  if (partners.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline/30 bg-surface-container p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface/20 mb-3 inline-block">handshake</span>
        <p className="text-[15px] font-semibold text-on-surface/50 mb-1">Mitra masih kosong</p>
        <p className="text-[13px] text-on-surface/30">{t("noPartners")}</p>
      </div>
    );
  }

  const loopedPartners = [...partners, ...partners];
  return <div className="overflow-hidden" aria-label="Mitra ALUPBESK"><div className="partner-track flex w-max gap-5 py-2" style={{ animation: "partner-scroll 14s linear infinite" }}>{loopedPartners.map((partner, index) => <article key={`${partner.id}-${index}`} className="w-32 shrink-0 text-center sm:w-40" aria-hidden={index >= partners.length}><div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full border border-outline/50 bg-surface-container p-3 shadow-lg transition-transform duration-300 hover:scale-105 sm:size-24">{partner.logoUrl ? <Image src={partner.logoUrl} alt="" width={96} height={96} unoptimized className="size-full object-contain" /> : <span className="text-xl font-black text-secondary">{partner.initials}</span>}</div><p className="mt-3 text-xs font-bold text-on-surface/70">{partner.name}</p></article>)}</div></div>;
}
