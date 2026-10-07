"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CaseStudy, PortfolioItem } from "@/services/portfolio";
import { portfolioApi } from "@/services/api";
import { Navbar } from "@/frontend/(pelanggan)/components/layout";

import { portfolioStyles as styles } from "../../style/style";
import ProjectCard from "../ProjectCard/ProjectCard";
import CaseStudyCard from "../CaseStudyCard/CaseStudyCard";

export default function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    portfolioApi
      .getAll()
      .then((data) => {
        setItems(data.items);
        setCaseStudies(data.caseStudies);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Portofolio gagal dimuat."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.content}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>PORTOFOLIO</span>

          <h1 className={styles.heroTitle}>
            Proyek yang Sudah
            <br />
            <span className="text-secondary">Kami Kerjakan</span>
          </h1>

          <p className={styles.description}>
            Dari rangka conveyor hingga mounting panel surya &mdash; setiap proyek
            dikerjakan dengan presisi dan standar kualitas industrial.
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
            <p className="text-[16px] font-semibold text-on-surface/50 mb-2">Belum ada Proyek yang Kami Kerjakan</p>
            <p className="text-[13px] text-on-surface/30 max-w-md">
              Portofolio akan tampil setelah ada konten yang ditambahkan oleh tim kami.
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
                  <span className={styles.eyebrow}>STUDI KASUS</span>

                  <h2 className={styles.sectionTitle}>
                    Dampak Nyata bagi Klien Kami
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

        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>
            Punya Proyek Serupa?
          </h2>

          <p className={styles.description}>
            Ceritakan kebutuhan Anda dan kami akan bantu wujudkan dengan
            material terbaik.
          </p>

          <div className={styles.ctaButtons}>
            <Link
              href="/jasa-custom"
              className={styles.primary}
            >
              Request Custom Quote
            </Link>

            <Link
              href="/#kontak"
              className={styles.secondary}
            >
              Hubungi Tim Kami
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
