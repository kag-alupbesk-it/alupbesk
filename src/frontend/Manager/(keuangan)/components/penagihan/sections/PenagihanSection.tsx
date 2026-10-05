"use client";

import { useMemo, useState } from "react";
import { useApi } from "@/frontend/Manager/(keuangan)/hooks/useApi";
import { fetchPenagihan, setLunas } from "@/frontend/Manager/(keuangan)/services/penagihan";
import type { PenagihanItem } from "./types";
import { formatRp, formatTanggal, computeTotals } from "./helpers";
import * as s from "../style";

type StatusFilter = "ALL" | "belum_bayar" | "lunas";

function PenagihanAction({
  item,
  loading,
  onLunas,
  full = false,
}: {
  item: PenagihanItem;
  loading: boolean;
  onLunas: (item: PenagihanItem) => void;
  full?: boolean;
}) {
  if (item.status === "lunas") {
    return (
      <span className={full ? `${s.lunasDone} w-full` : s.lunasDone}>
        <span className="material-symbols-outlined text-[16px]">check_circle</span>
        Lunas
      </span>
    );
  }
  return (
    <button
      className={full ? `${s.lunasButton} w-full` : s.lunasButton}
      onClick={() => onLunas(item)}
      disabled={loading}
    >
      {loading ? (
        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
      ) : (
        <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
      )}
      Tandai Lunas
    </button>
  );
}

export function PenagihanSection() {
  const { data, error, refetch } = useApi(fetchPenagihan, { interval: 30000 });
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const items = useMemo(() => data ?? [], [data]);

  const totals = useMemo(() => computeTotals(items), [items]);

  const filtered = useMemo(
    () => (filter === "ALL" ? items : items.filter((item) => item.status === filter)),
    [items, filter]
  );

  async function handleLunas(item: PenagihanItem) {
    setErrorMsg("");
    setLoadingId(item.id);
    try {
      await setLunas(item.id);
      refetch();
    } catch (reason) {
      setErrorMsg(reason instanceof Error ? reason.message : "Gagal menandai lunas.");
    } finally {
      setLoadingId(null);
    }
  }

  const shownError = errorMsg || error;

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <header className={s.header}>
          <div>
            <h1 className={s.headerTitle}>Penagihan &amp; Piutang</h1>
            <p className={s.headerSubtitle}>Status pembayaran per pesanan, tandai lunas saat pembayaran diterima.</p>
          </div>
          <span className={s.badge}>Admin Keuangan</span>
        </header>

        {shownError && <p className="mb-4 text-sm text-error">{shownError}</p>}

        <div className={s.cardGrid}>
          <div className={s.metricCard}>
            <div className={s.metricIcon}>
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <p className={s.metricLabel}>Total Tagihan</p>
              <p className={s.metricValue}>{formatRp(totals.total)}</p>
            </div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricIconOut}>
              <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
            </div>
            <div>
              <p className={s.metricLabel}>Piutang</p>
              <p className={s.metricValue}>{formatRp(totals.piutang)}</p>
            </div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricIconOk}>
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
            <div>
              <p className={s.metricLabel}>Sudah Lunas</p>
              <p className={s.metricValue}>{formatRp(totals.lunas)}</p>
            </div>
          </div>
        </div>

        <div className={s.tableCard}>
          <div className={s.tableToolbar}>
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline">Daftar Tagihan</h2>
            <div className={s.filterGroup}>
              <select className={s.filterSelect} value={filter} onChange={(event) => setFilter(event.target.value as StatusFilter)}>
                <option value="ALL">Semua Status</option>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="lunas">Lunas</option>
              </select>
            </div>
          </div>
          <div className={`${s.mobileList} p-3`}>
            {filtered.length === 0 && (
              <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
                Belum ada tagihan.
              </div>
            )}
            {filtered.map((item) => (
              <div key={item.id} className={s.card}>
                <div className={s.cardTop}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface">{item.id}</p>
                    <p className="truncate text-[10px] text-on-surface-variant">{item.pelanggan}</p>
                  </div>
                  <span className={`${s.badgeBase} ${item.status === "lunas" ? s.lunasBadge : s.belumBadge}`}>
                    {item.status === "lunas" ? "Lunas" : "Belum Bayar"}
                  </span>
                </div>
                <div className={s.cardInfo}>
                  <div className="flex items-center gap-2">
                    Kategori
                    <span className={`${s.badgeBase} ${s.kategoriBadge[item.kategori]}`}>{item.kategori}</span>
                  </div>
                  <div className="truncate">{item.sumber}</div>
                  <div>{formatTanggal(item.tanggal)}</div>
                </div>
                <div className={s.cardMeta}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Nilai</span>
                  <span className="text-sm font-bold text-on-surface">{formatRp(item.nilai)}</span>
                </div>
                <div className={s.cardActions}>
                  <PenagihanAction
                    item={item}
                    loading={loadingId === item.id}
                    onLunas={handleLunas}
                    full
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`${s.tableWrapper} ${s.desktopOnly}`}>
            <table className={s.table}>
              <thead className={s.tableHead}>
                <tr>
                  <th className={s.tableHeadCell}>ID Pesanan</th>
                  <th className={s.tableHeadCell}>Sumber</th>
                  <th className={s.tableHeadCell}>Pelanggan</th>
                  <th className={s.tableHeadCell}>Kategori</th>
                  <th className={s.tableHeadCell}>Tanggal</th>
                  <th className={`${s.tableHeadCell} text-right`}>Nilai</th>
                  <th className={s.tableHeadCell}>Status</th>
                  <th className={s.tableHeadCell}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className={s.tableRow}>
                    <td className={`${s.tableCell} font-medium text-on-surface`}>{item.id}</td>
                    <td className={s.tableCell}>{item.sumber}</td>
                    <td className={s.tableCell}>{item.pelanggan}</td>
                    <td className={s.tableCell}>
                      <span className={`${s.badgeBase} ${s.kategoriBadge[item.kategori]}`}>{item.kategori}</span>
                    </td>
                    <td className={s.tableCell}>{formatTanggal(item.tanggal)}</td>
                    <td className={`${s.tableCell} text-right font-bold text-on-surface`}>{formatRp(item.nilai)}</td>
                    <td className={s.tableCell}>
                      <span className={`${s.badgeBase} ${item.status === "lunas" ? s.lunasBadge : s.belumBadge}`}>
                        {item.status === "lunas" ? "Lunas" : "Belum Bayar"}
                      </span>
                    </td>
                    <td className={s.tableCell}>
                      <PenagihanAction
                        item={item}
                        loading={loadingId === item.id}
                        onLunas={handleLunas}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className={s.emptyState}>Belum ada tagihan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
