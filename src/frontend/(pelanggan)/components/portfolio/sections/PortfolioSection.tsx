import { portfolioItems, caseStudies } from "@/services/portfolio";
import Link from "next/link";

import { portfolioStyles as styles } from "../style";
import ProjectCard from "./ProjectCard";
import CaseStudyCard from "./CaseStudyCard";

export default function PortfolioSection() {
  return (
    <div className={styles.page}>
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

        <section className={styles.grid}>
          {portfolioItems.map((item) => (
            <ProjectCard
              key={item.id}
              item={item}
            />
          ))}
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.eyebrow}>STUDI KASUS</span>

            <h2 className={styles.sectionTitle}>
              Dampak Nyata bagi Klien Kami
            </h2>
          </header>

          <div className={styles.caseGrid}>
            {caseStudies.map((study) => (
              <CaseStudyCard
                key={study.id}
                study={study}
              />
            ))}
          </div>
        </section>

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
