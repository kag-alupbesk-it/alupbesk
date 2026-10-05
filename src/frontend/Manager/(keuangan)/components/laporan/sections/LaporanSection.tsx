"use client";

import { useState } from "react";
import { useApi } from "@/frontend/Manager/(keuangan)/hooks/useApi";
import { fetchLaporanKeuangan } from "@/frontend/Manager/(keuangan)/services/laporan";
import { periodLabels, type Period, type FinancialsData } from "./types";
import { barLabels, emptyFinancials } from "./helpers";
import * as s from "../style";

export function LaporanSection() {
  const [period, setPeriod] = useState<Period>("monthly");
  const { data, loading, error } = useApi(() => fetchLaporanKeuangan(period), { key: period });

  const dataNow: FinancialsData = data ?? emptyFinancials();
  const donut = dataNow.donut;
  const donutTotal = donut.reduce((sum, segment) => sum + segment.value, 0);
  const circumference = 2 * Math.PI * 40;
  const lead = donut[0];
  const leadPct = donutTotal > 0 && lead ? Math.round((lead.value / donutTotal) * 100) : 0;
  const labels = barLabels[period];

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <header className={s.header}>
          <div>
            <h1 className={s.headerTitle}>Laporan Keuangan</h1>
            <p className={s.headerSubtitle}>Ringkasan revenue, profit, dan komposisi penjualan sesuai periode.</p>
          </div>
          <span className={s.badge}>Admin Keuangan</span>
        </header>

        {error && <p className="mb-4 text-sm text-error">{error}</p>}

        <div className={s.metricsGrid}>
          {dataNow.metrics.map((metric) => (
            <div key={metric.label} className={s.metricCard}>
              <p className={s.metricLabel}>{metric.label}</p>
              <p className={s.metricValue}>{metric.value}</p>
            </div>
          ))}
          {!loading && dataNow.metrics.length === 0 && (
            <div className={`${s.metricCard} col-span-full`}>
              <p className="text-xs text-on-surface-variant">Belum ada data untuk periode ini.</p>
            </div>
          )}
        </div>

        <div className={s.chartsRow}>
          <div className={s.revenueChart}>
            <div className={s.revenueChartHeader}>
              <div>
                <h4 className={s.sectionTitle}>Analisis Revenue</h4>
                <p className={s.sectionSubtitle}>Tren pendapatan dari pesanan disetujui</p>
              </div>
              <div className={s.toggleGroup}>
                {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((key) => (
                  <button key={key} onClick={() => setPeriod(key)} className={`${s.toggleButton} ${period === key ? s.toggleActive : s.toggleInactive}`}>
                    {periodLabels[key]}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.chartArea}>
              {(loading ? Array(12).fill({ value: 0 }) : dataNow.barChart).map((bar, index) => (
                <div key={index} className={s.bar} style={{ height: `${bar.value}%` }} />
              ))}
            </div>
            <div className={s.chartLabels}>
              {labels.map((label) => (
                <span key={label} className={s.chartLabel}>{label}</span>
              ))}
            </div>
          </div>

          <div className={s.expenseCard}>
            <div className={s.expenseCardHeader}>
              <h4 className={s.sectionTitle}>Revenue Split</h4>
              <p className={s.sectionSubtitle}>Penjualan Eceran vs Pendapatan Proyek</p>
            </div>
            <div className={s.donutContainer}>
              <svg className={s.donutSvg} viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="var(--color-outline)" strokeOpacity="0.3" strokeWidth="10" />
                {donut.map((segment, index) => {
                  const frac = segment.value / donutTotal;
                  const cumulative = donut.slice(0, index).reduce((sum, current) => sum + current.value, 0) / donutTotal;
                  return (
                    <circle
                      key={segment.label}
                      cx="50" cy="50" fill="transparent" r="40" stroke={segment.color}
                      strokeDasharray={`${frac * circumference} ${circumference}`}
                      strokeDashoffset={-cumulative * circumference}
                      strokeLinecap="round" strokeWidth="10"
                    />
                  );
                })}
              </svg>
              <div className={s.donutCenter}>
                <span className={s.donutCenterValue}>{donutTotal > 0 ? `${leadPct}%` : "0%"}</span>
                <span className={s.donutCenterLabel}>{lead ? lead.label : "Belum ada data"}</span>
              </div>
            </div>
            <div className={s.expenseList}>
              {donutTotal > 0 ? donut.map((segment) => (
                <div key={segment.label} className={s.expenseItem}>
                  <div className={s.expenseItemLeft}>
                    <span className={s.expenseDot} style={{ backgroundColor: segment.color }} />
                    <span className={s.expenseLabel}>{segment.label}</span>
                  </div>
                  <span className={s.expenseValue}>{Math.round((segment.value / donutTotal) * 100)}%</span>
                </div>
              )) : (
                <div className={s.expenseItem}>
                  <span className={s.expenseLabel}>Belum ada data</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={s.tableCard}>
          <div className={s.tableHeader}>
            <h4 className={s.tableTitle}>Financial Statements</h4>
          </div>

          <div className={`${s.mobileList} p-3`}>
            {dataNow.statements.length === 0 && !loading && (
              <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
                Belum ada laporan.
              </div>
            )}
            {dataNow.statements.map((statement) => (
              <div key={statement.period} className={s.card}>
                <div className={s.cardTop}>
                  <span className="text-sm font-medium text-on-surface">{statement.period}</span>
                  <span className={s.statusBadge}>Finalized</span>
                </div>
                <div className={s.cardMeta}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Total Revenue</span>
                  <span className="text-sm font-bold text-on-surface">{statement.revenue}</span>
                </div>
                <div className={s.cardInfo}>
                  <div className="flex items-center justify-between gap-3">
                    <span>Net Profit</span>
                    <span className={`text-sm font-bold ${s.tableCellHighlight}`}>{statement.profit}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Margin</span>
                    <span className={`font-bold text-on-surface ${s.tableCellSecondary}`}>{statement.margin}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`${s.tableWrapper} ${s.desktopOnly}`}>
            <table className={s.table}>
              <thead className={s.tableHead}>
                <tr>
                  <th className={s.tableHeadCell}>Periode</th>
                  <th className={s.tableHeadCell}>Total Revenue</th>
                  <th className={s.tableHeadCell}>Net Profit</th>
                  <th className={s.tableHeadCell}>Margin</th>
                  <th className={s.tableHeadCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dataNow.statements.map((statement) => (
                  <tr key={statement.period} className={s.tableRow}>
                    <td className={`${s.tableCell} font-medium text-on-surface`}>{statement.period}</td>
                    <td className={`${s.tableCell} ${s.tableCellSecondary}`}>{statement.revenue}</td>
                    <td className={`${s.tableCell} ${s.tableCellHighlight}`}>{statement.profit}</td>
                    <td className={`${s.tableCell} ${s.tableCellSecondary}`}>{statement.margin}</td>
                    <td className={s.tableCell}>
                      <span className={s.statusBadge}>Finalized</span>
                    </td>
                  </tr>
                ))}
                {dataNow.statements.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className={s.emptyState}>Belum ada laporan.</td>
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
