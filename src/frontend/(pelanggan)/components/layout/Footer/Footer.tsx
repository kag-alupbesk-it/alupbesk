"use client";

import FooterLinks from "../../shared/FooterLinks/FooterLinks";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import { catalogApi } from "@/services/api";
import type { Product } from "@/services/catalog";
import { useCallback } from "react";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { contactDefaultsId, contactDefaultsEn, profileDefaultsId, profileDefaultsEn } from "@/frontend/(pelanggan)/data/siteContentDefaults";
import { usePublicSiteContent } from "@/frontend/(pelanggan)/hooks/usePublicSiteContent";

export default function Footer() {
  const { language, t } = useLanguage();
  const { data: profile } = usePublicSiteContent("profile", profileDefaultsId, profileDefaultsEn);
  const { data: contact } = usePublicSiteContent("contact", contactDefaultsId, contactDefaultsEn);
  const loadProducts = useCallback(() => catalogApi.getProducts(), []);
  const { data: products } = usePollingResource<Product[]>(loadProducts, []);
  const productCategories = [...new Set(products.map((product) => product.category.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const mapUrl = contact.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`
    : "";

  return (
    <footer className="bg-primary-container py-16 text-on-surface">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-headline-h2 font-bold text-secondary">
                ALUPBESK
              </span>
            </div>
            <p className="text-label-sm leading-relaxed text-on-surface-variant">{profile.description1}</p>
          </div>
          <FooterLinks
            title={t("quickLinks")}
            links={[
              { label: t("home"), href: "/catalog#beranda" },
              { label: t("aboutCompany"), href: "/catalog#profile" },
              { label: t("productCatalog"), href: "/catalog#katalog" },
              { label: t("partners"), href: "/catalog#partners" },
              { label: language === "en" ? "FAQ" : "Pertanyaan Umum", href: "/catalog#faq" },
            ]}
          />
          <FooterLinks
            title={t("mainProducts")}
            links={productCategories.map((category) => ({
              label: category,
              href: `/catalog?kategori=${encodeURIComponent(category)}#katalog`,
            }))}
          />
          <div className="space-y-4">
            <h3 className="text-headline-h3 font-semibold text-secondary">
              {t("ourLocation")}
            </h3>
            {mapUrl && <div className="overflow-hidden rounded-xl border border-outline/20">
              <iframe
                src={mapUrl}
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Lokasi ${contact.address}`}
                className="rounded-xl"
              />
            </div>}
            <p className="text-label-sm leading-relaxed text-on-surface-variant">
              {contact.address}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-6 border-t border-outline/20 pt-8 md:flex-row">
          <p className="text-label-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} Alupbesk Industrial. {t("allRightsReserved")}
          </p>
          <div className="flex gap-8 text-label-sm text-on-surface-variant">
            <a className="transition-colors hover:text-on-surface" href="#">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-on-surface" href="#">
              Terms of Service
            </a>
            <a className="transition-colors hover:text-on-surface" href="#">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
