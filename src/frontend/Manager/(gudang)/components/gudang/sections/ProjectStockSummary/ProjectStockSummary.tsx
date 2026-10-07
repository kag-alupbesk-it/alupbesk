"use client";

import type { GudangItem } from "../types/types";
import { computeMetrics } from "../helpers/helpers";
import * as s from "../../style/style";

interface ProjectStockSummaryProps {
  items: GudangItem[];
  selectedProyek: string;
  onProyekChange: (value: string) => void;
}

export function ProjectStockSummary({ items, selectedProyek, onProyekChange }: ProjectStockSummaryProps) {
  const { stokPerProyek } = computeMetrics(items);
  if (stokPerProyek.length === 0) return null;

  const totalLowStock = stokPerProyek.reduce((acc, [, entry]) => acc + entry.jumlahLowStock, 0);

  return (
    <div className={s.projectSummaryCard}>
      <div className={s.projectSummaryHeader}>
        <h2 className={s.projectSummaryTitle}>
          <span className="material-symbols-outlined text-[16px] text-tertiary">engineering</span>
          Stok per Proyek
        </h2>
        <span className={s.projectSummaryCount}>
          {stokPerProyek.length} proyek{totalLowStock > 0 ? ` · ${totalLowStock} item menipis` : ""}
        </span>
      </div>
      <div className={s.projectSummaryGrid}>
        {stokPerProyek.map(([namaProyek, entry]) => (
          <button
            key={namaProyek}
            className={s.projectSummaryItem}
            onClick={() => onProyekChange(selectedProyek === namaProyek ? "ALL" : namaProyek)}
            title="Klik untuk memfilter item proyek ini"
          >
            <div className={s.projectSummaryName}>
              <span>{namaProyek}</span>
              {selectedProyek === namaProyek && (
                <span className={s.projectSummaryBadge}>Filter Aktif</span>
              )}
            </div>
            <div className={s.projectSummaryMeta}>
              {entry.jumlahItem} item · {entry.stok.toLocaleString("id-ID")} unit stok
            </div>
            {entry.jumlahLowStock > 0 && (
              <div className={s.projectSummaryMeta}>
                <span className={s.projectSummaryLow}>{entry.jumlahLowStock} item menipis</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
