import type { portfolioItems } from "@/services/portfolio";
import { portfolioStyles as styles } from "./style";

// Function untuk merender satu kartu proyek dari data portofolio.
export default function ProjectCard({
  item,
}: {
  item: (typeof portfolioItems)[number];
}) {
  return (
    <article className={styles.card}>
      <div className={styles.image}>
        <div
          className={styles.imageBackground}
          style={{
            backgroundImage: `url('${item.img}')`,
          }}
        />

        <div className={styles.overlay} />

        <div className={styles.badges}>
          <span className={styles.industry}>
            {item.industry}
          </span>

          <span className={styles.year}>
            {item.year}
          </span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <p className={styles.client}>
          {item.client}
        </p>

        <h3 className={styles.title}>
          {item.title}
        </h3>

        <div className={styles.tags}>
          {item.tags.map((tag) => (
            <span
              key={tag}
              className={styles.tag}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.details}>
          <div>
            <p
              className={`${styles.label} ${styles.challengeLabel}`}
            >
              Tantangan
            </p>

            <p className={styles.challenge}>
              {item.challenge}
            </p>
          </div>

          <div>
            <p
              className={`${styles.label} ${styles.resultLabel}`}
            >
              Hasil
            </p>

            <p className={styles.result}>
              {item.result}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}