"use client";

import { useState } from "react";
import * as styles from "../../style/style";
import type { Period } from "@/frontend/Manager/(manager)/types/types";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import type { MessageKey } from "@/frontend/shared/i18n/translations";

const periodLabelKeys: Record<Period, MessageKey> = {
  daily: "periodToday",
  weekly: "periodThisWeek",
  monthly: "periodThisMonth",
  yearly: "periodThisYear",
};

export default function ReportsSection() {
  const [period, setPeriod] = useState<Period>("monthly");
  const { language, t } = useLanguage();
  const periodLabel = t(periodLabelKeys[period]).toLocaleLowerCase(language === "en" ? "en-US" : "id-ID");

  return (
    <div className={styles.container}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={styles.title}>{t("reports")}</h2>
          <p className={styles.subtitle}>{t("managerReportsPeriodDescription").replace("{period}", periodLabel)}</p>
        </div>
        <div className={styles.toggleGroup} aria-label={t("managerSelectPeriod")}>
          {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={`${styles.toggleButton} ${period === p ? styles.toggleActive : styles.toggleInactive}`}
            >
              {t(periodLabelKeys[p])}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.subtitle}>{t("managerSelectPeriod")}</p>
    </div>
  );
}
