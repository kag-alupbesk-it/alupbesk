"use client";

import { useCallback, useState } from "react";
import { contentApi } from "@/services/api/index";
import type { FaqItem } from "@/backend/modules/content/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

export default function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const loadFaq = useCallback(() => contentApi.getFaq(), []);
  const { data: faqItems, loading, error } = usePollingResource<FaqItem[]>(loadFaq, []);

  return (
    <section className="bg-primary-container py-section-gap-desktop" id="faq">
      <div className="max-w-container-max mx-auto grid gap-16 px-margin-x-mobile md:px-margin-x-desktop lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="text-secondary font-eyebrow text-eyebrow uppercase">
            {t("commonQuestions")}
          </span>
          <h2 className="text-headline-h1 font-headline-h1 mt-4 mb-8 text-on-surface">
            {t("faqTitle")}
          </h2>
          <p className="text-on-surface-variant text-body-md mb-8">
            {t("faqDescription")}
          </p>
            <div className="rounded-xl bg-surface-container p-8 text-on-surface border border-outline/20">
            <h4 className="font-bold mb-2">{t("stillQuestions")}</h4>
            <p className="text-label-sm text-on-surface-variant mb-6">
              {t("freeConsultation")}
            </p>
            <a
              className="inline-block rounded-lg bg-secondary py-3 px-6 font-bold text-primary"
              href="#kontak"
            >
              {t("askNow")}
            </a>
          </div>
        </div>
        <div className="lg:col-span-7 space-y-4">
          {loading && faqItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface/50">{t("loadingFaq")}</p>
          ) : error && faqItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface/50">{t("noFaq")}</p>
          ) : faqItems.filter((item) => item.active).map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                className="overflow-hidden rounded-xl border border-outline/20 bg-surface-container backdrop-blur-sm"
                key={item.id}
              >
                <button
                  className="group flex w-full items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  type="button"
                >
                  <span className="font-bold text-on-surface transition-colors group-hover:text-secondary">
                    {item.question}
                  </span>
                  <span
                    className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? "rotate-180 text-secondary" : "text-on-surface/60"}`}
                  >
                    expand_more
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="p-6 pt-0 text-label-sm text-on-surface/70">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
