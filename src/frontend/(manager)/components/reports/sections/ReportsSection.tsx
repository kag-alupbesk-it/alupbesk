"use client";

import { useState } from "react";
import * as styles from "../style";
import { periodLabels, type Period } from "@/frontend/(manager)/types";

export default function ReportsSection() {
  const [period, setPeriod] = useState<Period>("monthly");

  return (
    <div className={styles.container}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={styles.title}>Reports</h2>
          <p className={styles.subtitle}>Laporan rekapitulasi {periodLabels[period].toLowerCase()}</p>
        </div>
        <div className={styles.toggleGroup}>
          {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`${styles.toggleButton} ${period === p ? styles.toggleActive : styles.toggleInactive}`}>{periodLabels[p]}</button>
          ))}
        </div>
      </div>
      <p className={styles.subtitle}>Pilih periode untuk menampilkan laporan.</p>
    </div>
  );
}
