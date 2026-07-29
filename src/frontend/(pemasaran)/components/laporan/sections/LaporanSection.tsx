"use client";

import { useState, useMemo } from "react";
import * as s from "../style";
import type { LaporanRekap } from "../../../types";
import { dummyOrders } from "../../../data/pemasaranData";
import { formatCurrency, formatDate, statusBg, statusColor, STATUS_LABELS } from "./helpers";

export default function LaporanSection() {
  const [period, setPeriod] = useState<"7hari" | "30hari" | "semua">("semua");

  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return dummyOrders.filter((o) => {
      if (period === "semua") return true;
      const diff = now - new Date(o.createdAt).getTime();
      const days = period === "7hari" ? 7 : 30;
      return diff <= days * 86400000;
    });
  }, [period]);

  const rekap: LaporanRekap = useMemo(() => ({
    totalPesanan: filteredOrders.length,
    disetujui: filteredOrders.filter((o) => o.status === "confirmed").length,
    ditolak: filteredOrders.filter((o) => o.status === "rejected_by_manager").length,
    menunggu: filteredOrders.filter((o) => o.status === "pending" || o.status === "submitted_to_manager").length,
  }), [filteredOrders]);

  const maxVal = Math.max(rekap.totalPesanan, 1);
  const barData = [
    { label: "Total Masuk", value: rekap.totalPesanan, pct: (rekap.totalPesanan / maxVal) * 100, color: "bg-secondary" },
    { label: "Disetujui", value: rekap.disetujui, pct: (rekap.disetujui / maxVal) * 100, color: "bg-secondary" },
    { label: "Ditolak", value: rekap.ditolak, pct: (rekap.ditolak / maxVal) * 100, color: "bg-red-400" },
    { label: "Menunggu", value: rekap.menunggu, pct: (rekap.menunggu / maxVal) * 100, color: "bg-blue-400" },
  ];

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h3 className={s.title}>Laporan Pemasaran</h3>
        <p className={s.subtitle}>Rekap pesanan masuk, disetujui, dan ditolak untuk evaluasi kinerja divisi pemasaran.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {(["7hari", "30hari", "semua"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2 rounded-pill text-xs font-bold transition-all ${
              period === p
                ? "bg-secondary text-primary shadow-lg shadow-secondary/20"
                : "bg-primary-container border border-outline/30 text-on-surface-variant hover:border-secondary/50"
            }`}
          >
            {p === "7hari" ? "7 Hari" : p === "30hari" ? "30 Hari" : "Semua Waktu"}
          </button>
        ))}
      </div>

      <div className={s.cardGrid}>
        <div className={s.card}>
          <div className={`${s.cardIcon} bg-secondary/10`}>
            <span className="material-symbols-outlined text-secondary">receipt_long</span>
          </div>
          <p className={s.cardLabel}>Total Pesanan</p>
          <p className={`${s.cardValue} text-on-surface`}>{rekap.totalPesanan}</p>
        </div>
        <div className={s.card}>
          <div className={`${s.cardIcon} bg-secondary/10`}>
            <span className="material-symbols-outlined text-secondary">check_circle</span>
          </div>
          <p className={s.cardLabel}>Disetujui</p>
          <p className={`${s.cardValue} text-secondary`}>{rekap.disetujui}</p>
        </div>
        <div className={s.card}>
          <div className={`${s.cardIcon} bg-red-400/10`}>
            <span className="material-symbols-outlined text-red-400">cancel</span>
          </div>
          <p className={s.cardLabel}>Ditolak</p>
          <p className={`${s.cardValue} text-red-400`}>{rekap.ditolak}</p>
        </div>
        <div className={s.card}>
          <div className={`${s.cardIcon} bg-blue-400/10`}>
            <span className="material-symbols-outlined text-blue-400">hourglass_top</span>
          </div>
          <p className={s.cardLabel}>Menunggu</p>
          <p className={`${s.cardValue} text-blue-400`}>{rekap.menunggu}</p>
        </div>
      </div>

      <div className={s.barSection}>
        <h4 className={s.barTitle}>Distribusi Status Pesanan</h4>
        <div className={s.barList}>
          {barData.map((bar) => (
            <div key={bar.label} className={s.barItem}>
              <span className={s.barLabel}>{bar.label}</span>
              <div className={s.barTrack}>
                <div className={`${s.barFill} ${bar.color}`} style={{ width: `${bar.pct}%` }} />
              </div>
              <span className={s.barValue}>{bar.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={s.tableSection}>
        <div className={s.tableHeader}>
          <h4 className={s.tableSectionTitle}>Riwayat Pesanan</h4>
        </div>
        <table className={s.table}>
          <thead>
            <tr className={s.tableHeaderRow}>
              <th className={s.tableHeaderCell}>ID</th>
              <th className={s.tableHeaderCell}>Pelanggan</th>
              <th className={s.tableHeaderCell}>Tanggal</th>
              <th className={s.tableHeaderCell}>Status</th>
              <th className={s.tableHeaderCellRight}>Total</th>
            </tr>
          </thead>
          <tbody className={s.tableBody}>
            {filteredOrders.map((order) => (
              <tr key={order.id} className={s.tableRow}>
                <td className={s.tableCell}><span className="font-bold text-on-surface">{order.id}</span></td>
                <td className={s.tableCell}>
                  <p className="font-bold text-on-surface">{order.customer.name}</p>
                  <p className="text-[10px] text-on-surface-variant">{order.customer.phone}</p>
                </td>
                <td className={s.tableCell}>{formatDate(order.createdAt)}</td>
                <td className={s.tableCell}>
                  <span className={`${s.statusBadge} ${statusBg(order.status)}`}>
                    <span className={`${s.statusDot} ${statusColor(order.status)}`} />
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td className={s.tableCellRight}><span className="font-bold text-secondary">{formatCurrency(order.total)}</span></td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-on-surface-variant">Belum ada data pesanan</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
