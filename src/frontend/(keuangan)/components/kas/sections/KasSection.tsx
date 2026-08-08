"use client";

import { useState } from "react";
import { useApi } from "@/frontend/(keuangan)/hooks/useApi";
import { fetchKas, catatPengeluaran } from "@/frontend/(keuangan)/services/kas";
import type { KasEntry } from "./types";
import { formatRp, formatTanggal, combineEntries, kategoriBadge } from "./helpers";
import * as s from "../style";

export function KasSection() {
  const { data: kas, error, refetch } = useApi(fetchKas, { interval: 30000 });
  const [errorMsg, setErrorMsg] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCatat(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg("");
    setSaving(true);
    try {
      await catatPengeluaran({ deskripsi, jumlah: Number(jumlah) });
      setDeskripsi("");
      setJumlah("");
      refetch();
    } catch (reason) {
      setErrorMsg(reason instanceof Error ? reason.message : "Pengeluaran gagal dicatat.");
    } finally {
      setSaving(false);
    }
  }

  const entries = kas ? combineEntries(kas) : [];
  const jenisBadge = (entry: KasEntry) => (entry.tipe === "masuk" ? s.masukBadge : s.keluarBadge);
  const jumlahClass = (entry: KasEntry) => (entry.tipe === "masuk" ? s.jumlahMasuk : s.jumlahKeluar);
  const shownError = errorMsg || error;

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <header className={s.header}>
          <div>
            <h1 className={s.headerTitle}>Kas Masuk &amp; Keluar</h1>
            <p className={s.headerSubtitle}>Pemasukan otomatis dari pesanan disetujui, pengeluaran dicatat manual oleh Admin Keuangan.</p>
          </div>
          <span className={s.badge}>Admin Keuangan</span>
        </header>

        {shownError && <p className="mb-4 text-sm text-error">{shownError}</p>}

        <div className={s.cardGrid}>
          <div className={s.metricCard}>
            <div className={s.metricIcon}>
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <p className={s.metricLabel}>Saldo Kas</p>
              <p className={s.metricValue}>{kas ? formatRp(kas.saldo) : "…"}</p>
            </div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricIcon}>
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <div>
              <p className={s.metricLabel}>Total Pemasukan</p>
              <p className={s.metricValue}>{kas ? formatRp(kas.totalMasuk) : "…"}</p>
            </div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricIconOut}>
              <span className="material-symbols-outlined text-[20px]">trending_down</span>
            </div>
            <div>
              <p className={s.metricLabel}>Total Pengeluaran</p>
              <p className={s.metricValue}>{kas ? formatRp(kas.totalKeluar) : "…"}</p>
            </div>
          </div>
        </div>

        <div className={s.grid}>
          <form onSubmit={handleCatat} className={s.formCard}>
            <h2 className={s.formTitle}>Catat Pengeluaran</h2>
            <p className={`${s.formSubtitle} mb-4`}>Pengeluaran operasional kasir/gudang.</p>

            <label className={`${s.fieldLabel} mb-1`} htmlFor="deskripsi">Deskripsi</label>
            <input
              id="deskripsi"
              className={`${s.input} mb-4`}
              placeholder="cth: Belanja bahan baku"
              value={deskripsi}
              onChange={(event) => setDeskripsi(event.target.value)}
              required
            />

            <label className={`${s.fieldLabel} mb-1`} htmlFor="jumlah">Jumlah (Rp)</label>
            <input
              id="jumlah"
              className={`${s.input} mb-5`}
              type="number"
              min="1"
              step="1000"
              placeholder="cth: 500000"
              value={jumlah}
              onChange={(event) => setJumlah(event.target.value)}
              required
            />

            <button type="submit" className={s.submitButton} disabled={saving}>
              <span className="material-symbols-outlined text-[18px]">playlist_add</span>
              {saving ? "Menyimpan…" : "Simpan Pengeluaran"}
            </button>
          </form>

          <div className={s.tableCard}>
            <div className={s.tableToolbar}>
              <h2 className={s.tableTitle}>Riwayat Transaksi</h2>
            </div>
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead className={s.tableHead}>
                  <tr>
                    <th className={s.tableHeadCell}>Tanggal</th>
                    <th className={s.tableHeadCell}>Jenis</th>
                    <th className={s.tableHeadCell}>Keterangan</th>
                    <th className={s.tableHeadCell}>Kategori</th>
                    <th className={`${s.tableHeadCell} text-right`}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className={s.tableRow}>
                      <td className={s.tableCell}>{formatTanggal(entry.tanggal)}</td>
                      <td className={s.tableCell}>
                        <span className={`${s.badgeBase} ${jenisBadge(entry)}`}>{entry.tipe === "masuk" ? "Masuk" : "Keluar"}</span>
                      </td>
                      <td className={s.tableCell}>
                        <p className="font-medium text-on-surface">{entry.deskripsi}</p>
                        <p className="text-[10px] text-on-surface-variant">{entry.sumber}</p>
                      </td>
                      <td className={s.tableCell}>
                        <span className={`${s.badgeBase} ${kategoriBadge[entry.kategori]}`}>{entry.kategori}</span>
                      </td>
                      <td className={`${s.tableCell} text-right ${jumlahClass(entry)}`}>
                        {entry.tipe === "masuk" ? "+" : "-"}{formatRp(entry.jumlah)}
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={5} className={s.emptyState}>Belum ada transaksi kas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
