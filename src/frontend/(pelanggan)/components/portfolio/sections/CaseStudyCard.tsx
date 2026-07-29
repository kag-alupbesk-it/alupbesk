import type { caseStudies } from "@/services/portfolio";
import { portfolioStyles as styles } from "../style";

export default function CaseStudyCard({
  study,
}: {
  study: (typeof caseStudies)[number];
}) {
  return (
    <article className={styles.caseCard}>
      <div className={styles.caseClient}>
        <div className={styles.logo}>
          <span className={styles.logoText}>{study.logo}</span>
        </div>

        <div>
          <p className={styles.clientName}>{study.client}</p>
          <p className={styles.meta}>
            {study.industry} &middot; {study.year}
          </p>
        </div>
      </div>

      <h3 className={styles.caseTitle}>{study.title}</h3>

      <p className={styles.caseDescription}>
        {study.desc}
      </p>

      <div className={styles.metrics}>
        {study.metrics.map((metric) => (
          <div
            key={metric.label}
            className={styles.metric}
          >
            <p className={styles.metricValue}>
              {metric.value}
            </p>

            <p className={styles.metricLabel}>
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
