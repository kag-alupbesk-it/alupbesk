import { PartnerCarousel } from "./PartnerCarousel";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

export default function PartnersSection() {
  const { t } = useLanguage();
  return (
    <section className="py-section-gap-desktop bg-primary-container" id="partners">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="mb-10 text-center">
          <span className="text-secondary font-eyebrow text-eyebrow">{t("partners")}</span>
          <h2 className="text-headline-h1 font-headline-h1 mt-4 text-on-surface">{t("trustedPartners")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface/50">{t("partnerManagement")}</p>
        </div>
        <PartnerCarousel />
      </div>
    </section>
  );
}
