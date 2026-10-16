"use client";

import { useCallback } from "react";
import Link from "next/link";
import { portfolioApi } from "@/services/api/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { Navbar } from "@/frontend/(pelanggan)/components/layout/index";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

import { portfolioStyles as styles } from "../../style/style";
import ProjectCard from "../ProjectCard/ProjectCard";
import CaseStudyCard from "../CaseStudyCard/CaseStudyCard";

export default function PortfolioSection({ hideNavbar = false, id }: { hideNavbar?: boolean; id?: string }) {
  const { t } = useLanguage();
  const loadPortfolio = useCallback(() => portfolioApi.getAll(), []);
  const { data, loading, error } = usePollingResource(loadPortfolio, { items: [], caseStudies: [] });
  const items = data.items;
  const caseStudies = data.caseStudies;

  return (
    <div className={styles.page} id={id}>
      {!hideNavbar && <Navbar />}
      <main className={styles.content}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{t("portfolioEyebrow")}</span>

          <h1 className={styles.heroTitle}>
            {t("portfolioTitle1")}
            <br />
            <span className="text-secondary">{t("portfolioTitle2")}</span>
          </h1>

          <p className={styles.description}>
            {t("portfolioDescription")}
          </p>
        </header>

        {error && <p className="text-sm text-red-400 mb-6">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 && caseStudies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface/20 mb-4">folder_open</span>
            <p className="text-[16px] font-semibold text-on-surface/50 mb-2">{t("noProjects")}</p>
            <p className="text-[13px] text-on-surface/30 max-w-md">
              {t("noProjectsDesc")}
            </p>
          </div>
        ) : (
          <>
            <section className={styles.grid}>
              {items.map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </section>

            {caseStudies.length > 0 && (
              <section className={styles.section}>
                <header className={styles.sectionHeader}>
                  <span className={styles.eyebrow}>{t("caseStudies")}</span>

                  <h2 className={styles.sectionTitle}>
                    {t("realImpact")}
                  </h2>
                </header>

                <div className={styles.caseGrid}>
                  {caseStudies.map((study) => (
                    <CaseStudyCard key={study.id} study={study} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <div className="mt-12 flex flex-col items-start gap-6 rounded-2xl border border-outline/20 bg-surface-container p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="material-symbols-outlined rounded-xl bg-secondary/10 p-3 text-[24px] text-secondary"
            >
              design_services
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-secondary">
                {t("customCtaEyebrow")}
              </p>
              <h3 className="mt-2 text-[20px] font-bold text-on-surface">
                {t("consultCustomNeeds")}
              </h3>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-on-surface/60">
                {t("consultCustomDesc")}
              </p>
            </div>
          </div>
          <Link
            href="/catalog/jasa-custom"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-[13px] font-bold text-primary transition-all hover:brightness-110"
          >
            {t("viewCustomService")}
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
