"use client";

import FooterLinks from "../../shared/FooterLinks/FooterLinks";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

export default function Footer() {
  const { language, t } = useLanguage();
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
            <p className="text-label-sm leading-relaxed text-on-surface-variant">
              {language === "en"
                ? "Industrial aluminium solutions focused on precision, quality, and reliable material supply."
                : "Penyedia solusi aluminium industrial dengan fokus pada presisi, kualitas, dan pasokan material yang andal."}
            </p>
          </div>
          <FooterLinks
            title={t("quickLinks")}
            links={[
              t("home"),
              t("aboutCompany"),
              t("productCatalog"),
              t("partners"),
              language === "en" ? "FAQ" : "Pertanyaan Umum",
            ]}
          />
          <FooterLinks
            title={t("mainProducts")}
            links={[
              "Aluminum Extrusion",
              "Linear Guides",
              "Structural Framing",
              "Custom Machining",
            ]}
          />
          <div className="space-y-4">
            <h3 className="text-headline-h3 font-semibold text-secondary">
              {t("ourLocation")}
            </h3>
            <div className="overflow-hidden rounded-xl border border-outline/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.849310412219!2d110.444865!3d-7.832166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5100040e42c3%3A0xedafc0d0b2eb3e8d!2sCV%20ALUPBESK%20CONTRACTOR!5e0!3m2!1sid!2sid!4v1"
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="CV ALUPBESK CONTRACTOR - Google Maps"
                className="rounded-xl"
              />
            </div>
            <p className="text-label-sm leading-relaxed text-on-surface-variant">
            Karang Tengah Sitimulyo, Karang Anom, Sitimulyo, Piyungan, Bantul, Special Region of Yogyakarta, Indonesia
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
