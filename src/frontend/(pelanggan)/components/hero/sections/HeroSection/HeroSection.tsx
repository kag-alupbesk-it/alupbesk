"use client";

import { useEffect, useState } from "react";

interface MarketingBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
}

function isWithinRange(banner: MarketingBanner): boolean {
  if (banner.startDate && new Date(banner.startDate).getTime() > Date.now()) return false;
  if (banner.endDate && new Date(banner.endDate).getTime() < Date.now()) return false;
  return true;
}

export default function HeroSection() {
  const [banners, setBanners] = useState<MarketingBanner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/marketing/banners")
      .then((response) => response.json())
      .then((body) => {
        if (cancelled) return;
        const active = (body.data as MarketingBanner[] | undefined)
          ?.filter((banner) => banner.active && isWithinRange(banner))
          .sort((a, b) => a.order - b.order) ?? [];
        setBanners(active);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAF01DjQuzxqehDWahuPf_aFZ3DcXxh2BQCZ6HnCpt0_6BjRemnRnCOreO2TuteIan0mTHZDXWotXGPoHKMVkicB5M76tANcB8cictuFOPGDHTtjt4X50Klwc7yOeYbxWSeeQhk2awTZI3kVF80cvuF_fo60X4dAZeiHPA-U-2pkWgj2_SYaqTqgKLwGjJ1hjgIBqe1Nu9AVSLCoCEbRxMKYknt41vggriwhwoIgYvhxTnUvHQZ495EOROjUTitJHD1WSaQZeQs1vk')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-display-hero-mobile md:text-display-hero font-display-hero text-on-surface leading-tight">
              Solusi Produk Aluminium &amp; Komponen Industrial{" "}
              <span className="text-secondary">Terpercaya</span>
            </h1>
            <p className="text-on-surface-variant text-body-lg max-w-xl">
              Menyediakan material aluminium berkualitas tinggi dan komponen
              industri presisi untuk mendukung akselerasi produksi bisnis Anda di
              seluruh Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                className="px-8 py-4 bg-secondary text-primary font-bold rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-all group"
                href="#katalog"
              >
                Lihat Katalog
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
              <a
                className="px-8 py-4 border border-on-surface text-on-surface font-bold rounded-full flex items-center justify-center gap-2 hover:bg-on-surface hover:text-primary-container transition-all"
                href="#"
              >
                <span className="material-symbols-outlined">chat</span>
                Hubungi via WhatsApp
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
            index === activeIndex ? "opacity-100" : "opacity-0"
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
            {banners[activeIndex].title}
          </h1>
          {banners[activeIndex].subtitle && (
            <p className="text-on-surface-variant text-body-lg max-w-xl">
              {banners[activeIndex].subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              className="px-8 py-4 bg-secondary text-primary font-bold rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-all group"
              href={banners[activeIndex].linkUrl || "#katalog"}
            >
              {banners[activeIndex].linkUrl ? "Lihat Promo" : "Lihat Katalog"}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
            <a
              className="px-8 py-4 border border-on-surface text-on-surface font-bold rounded-full flex items-center justify-center gap-2 hover:bg-on-surface hover:text-primary-container transition-all"
              href="#katalog"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              Lihat Katalog
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
                index === activeIndex
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
