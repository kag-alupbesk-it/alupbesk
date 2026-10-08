"use client";

import { profileDefaults } from "@/frontend/(pelanggan)/data/siteContentDefaults";
import { usePublicSiteContent } from "@/frontend/(pelanggan)/hooks/usePublicSiteContent";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

export default function ProfileSection() {
  const { t } = useLanguage();
  const { data: profile } = usePublicSiteContent("profile", profileDefaults);

  return (
    <section className="py-section-gap-desktop bg-primary-container" id="profile">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
          <div>
            <span className="text-secondary font-eyebrow text-eyebrow">
              {t("aboutUs")}
            </span>
            <h2 className="text-headline-h1 font-headline-h1 mt-4 mb-8 text-primary">
              <span className="text-on-surface">
              {profile.title === profileDefaults.title ? t("aboutTitle") : profile.title}
              </span>
            </h2>
            <div className="space-y-6 text-on-surface-variant text-body-md">
              <p>
                {profile.description1 === profileDefaults.description1 ? t("aboutDescriptionOne") : profile.description1}
              </p>
              <p>
                {profile.description2 === profileDefaults.description2 ? t("aboutDescriptionTwo") : profile.description2}
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="p-6 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">
                  visibility
                </span>
                <h4 className="font-bold text-on-surface mb-2">{profile.visionTitle === profileDefaults.visionTitle ? t("ourVision") : profile.visionTitle}</h4>
                <p className="text-label-sm">
                  {profile.visionText === profileDefaults.visionText ? t("ourVisionText") : profile.visionText}
                </p>
              </div>
              <div className="p-6 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">
                  rocket_launch
                </span>
                <h4 className="font-bold text-on-surface mb-2">{profile.missionTitle === profileDefaults.missionTitle ? t("ourMission") : profile.missionTitle}</h4>
                <p className="text-label-sm">
                  {profile.missionText === profileDefaults.missionText ? t("ourMissionText") : profile.missionText}
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden border-8 border-surface-container shadow-xl">
              <div
                className="w-full h-full bg-cover bg-center"
                style={profile.imageUrl ? { backgroundImage: `url('${profile.imageUrl}')` } : undefined}
              ></div>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-surface-container-high text-on-surface p-8 rounded-xl max-w-xs shadow-2xl border border-outline/20">
              <p className="italic text-body-md">
                &ldquo;{profile.quote === profileDefaults.quote ? t("profileQuote") : profile.quote}&rdquo;
              </p>
              <div className="mt-4 font-bold text-secondary text-label-sm">
                &mdash; {profile.quoteAuthor === profileDefaults.quoteAuthor ? t("profileQuoteAuthor") : profile.quoteAuthor}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center"></div>
      </div>
    </section>
  );
}
