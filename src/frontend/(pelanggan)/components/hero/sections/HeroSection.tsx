"use client";

import { useCallback, useEffect, useState } from "react";
import { marketingApi } from "@/services/api";
import type { MarketingBanner } from "@/backend/modules/marketing";
import { heroDefaults } from "@/frontend/(pelanggan)/data/siteContentDefaults";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { usePublicSiteContent } from "@/frontend/(pelanggan)/hooks/usePublicSiteContent";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

function isWithinRange(banner: MarketingBanner): boolean {
  if (banner.startDate && new Date(banner.startDate).getTime() > Date.now()) return false;
  if (banner.endDate && new Date(banner.endDate).getTime() < Date.now()) return false;
  return true;
}

export default function HeroSection() {
  const { t } = useLanguage();
  const loadBanners = useCallback(() => marketingApi.getBanners(), []);
  const { data: bannerData } = usePollingResource<MarketingBanner[]>(loadBanners, []);
  const { data: hero } = usePublicSiteContent("hero", heroDefaults);
  const banners = bannerData
    .filter((banner) => banner.active && isWithinRange(banner))
    .sort((left, right) => left.order - right.order);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = banners.length ? activeIndex % banners.length : 0;

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section
        className="relative min-h-screen flex items-center pt-20 bg-primary-container overflow-hidden"
        id="beranda"
      >
        <div className="absolute inset-0 opacity-40">
          <div
            className="w-full h-full bg-cover bg-center"
            style={hero.imageUrl ? { backgroundImage: `url('${hero.imageUrl}')` } : undefined}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-display-hero-mobile md:text-display-hero font-display-hero text-on-surface leading-tight">
              {hero.title === heroDefaults.title ? t("heroTitle") : hero.title}
            </h1>
            <p className="text-on-surface-variant text-body-lg max-w-xl">
              {hero.subtitle === heroDefaults.subtitle ? t("heroDescription") : hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                className="px-8 py-4 bg-secondary text-primary font-bold rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-all group"
                href={hero.primaryLink || "#katalog"}
              >
                {hero.primaryCta ? (hero.primaryCta === heroDefaults.primaryCta ? t("viewCatalog") : hero.primaryCta) : t("viewCatalog")}
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
              <a
                className="px-8 py-4 border border-on-surface text-on-surface font-bold rounded-full flex items-center justify-center gap-2 hover:bg-on-surface hover:text-primary-container transition-all"
                href="#"
              >
                <span className="material-symbols-outlined">chat</span>
                {t("contactWhatsApp")}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen flex items-center pt-20 bg-primary-container overflow-hidden"
      id="beranda"
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === safeActiveIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${banner.imageUrl}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent"></div>
        </div>
      ))}

      <div className="relative z-10 max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-display-hero-mobile md:text-display-hero font-display-hero text-on-surface leading-tight">
            {banners[safeActiveIndex].title}
          </h1>
          {banners[safeActiveIndex].subtitle && (
            <p className="text-on-surface-variant text-body-lg max-w-xl">
              {banners[safeActiveIndex].subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              className="px-8 py-4 bg-secondary text-primary font-bold rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-all group"
              href={banners[safeActiveIndex].linkUrl || "#katalog"}
            >
              {banners[safeActiveIndex].linkUrl ? t("viewPromotion") : t("viewCatalog")}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
            <a
              className="px-8 py-4 border border-on-surface text-on-surface font-bold rounded-full flex items-center justify-center gap-2 hover:bg-on-surface hover:text-primary-container transition-all"
              href="#katalog"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              {t("viewCatalog")}
            </a>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Banner ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === safeActiveIndex
                  ? "w-8 bg-secondary"
                  : "w-2.5 bg-on-surface-variant/40 hover:bg-on-surface-variant/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
