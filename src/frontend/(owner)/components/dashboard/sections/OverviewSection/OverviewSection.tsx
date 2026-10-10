"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as styles from "../../style/style";
import { useApi } from "@/frontend/(owner)/hooks/useApi/useApi";
import { fetchOwnerOverview } from "@/frontend/(owner)/services/overview/overview";
import { periodLabels, type Period } from "@/frontend/(owner)/types/types";

const CURRENCY = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatRp(value: number): string {
  return CURRENCY.format(value).replace(/\s/g, " ");
}

const PERIODS: Period[] = ["daily", "weekly", "monthly", "yearly"];

function LoadingSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.divisionGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.divisionCard}>
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse mb-4" />
              <div className="h-6 w-32 bg-white/5 rounded animate-pulse mb-4" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </section>
        <div className="h-64 bg-white/5 rounded animate-pulse" />
      </div>
      <aside className={styles.sidebar}>
        <div className="h-96 bg-white/5 rounded animate-pulse" />
      </aside>
    </div>
  );
}

export default function OverviewSection() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("monthly");
  const { data, loading, error, refetch } = useApi(() => fetchOwnerOverview(period), {
    interval: 30000,
    key: period,
  });

  if (loading && !data) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center py-20 w-full">
          <span className="material-icons text-4xl text-red-400 mb-4">error_outline</span>
          <p className="text-on-surface-variant mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-secondary text-primary rounded-pill text-sm hover:brightness-110 transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const cards = data?.cards ?? [];
  const attention = data?.attention ?? [];
  const cashflow = data?.cashflow ?? [];
  const totals = data?.totals ?? { saldo: 0, totalMasuk: 0, totalKeluar: 0 };
  const registrations = data?.registrations ?? [];
  const activities = data?.activities ?? [];
  const sysStatus = data?.systemStatus ?? { serverGudang: "--", dbLatency: "--" };

  const maxCash = Math.max(1, ...cashflow.flatMap((point) => [point.masuk, point.keluar]));
  const toX = (index: number) =>
    cashflow.length > 1 ? (index / (cashflow.length - 1)) * 1000 : 500;
  const toY = (value: number) => 300 - (value / maxCash) * 250;
  const incomePoints = cashflow
    .map((point, index) => `${toX(index)},${toY(point.masuk)}`)
    .join(" ");
  const expensePoints = cashflow
    .map((point, index) => `${toX(index)},${toY(point.keluar)}`)
    .join(" ");
  const areaFrom = (points: string) =>
    points ? `M ${points.replace(/ /g, " L ")} L 1000,300 L 0,300 Z` : "";

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section>
          <div className={styles.chartHeader}>
            <div>
              <h4 className={styles.chartTitle}>Command Center</h4>
              <p className={styles.chartSubtitle}>
                KPI lintas divisi — klik kartu untuk membuka modul
              </p>
            </div>
            <div className={styles.toggleGroup}>
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`${styles.toggleButton} ${
                    period === p ? styles.toggleActive : styles.toggleInactive
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.divisionGrid}>
            {cards.map((card) => (
              <Link key={card.division} href={card.href} className={styles.divisionCard}>
                <div className={styles.divisionCardTop}>
                  <span className={styles.divisionCardLabel}>
                    <span className={styles.divisionCardIcon}>{card.icon}</span>
                    {card.label}
                  </span>
                  {card.attention > 0 && (
                    <span className={styles.divisionCardBadge}>{card.attention}</span>
                  )}
                </div>
                <p className={styles.divisionCardValue}>{card.headline.value}</p>
                <div className={styles.divisionCardMetrics}>
                  {card.metrics.map((item) => (
                    <div key={item.label} className={styles.divisionCardMetricRow}>
                      <span className={styles.divisionCardMetricLabel}>{item.label}</span>
                      <span className={styles.divisionCardMetricValue}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.attentionSection}>
          <div className={styles.attentionHeader}>
            <div>
              <h4 className={styles.attentionTitle}>Butuh Perhatian Owner</h4>
              <p className={styles.attentionSubtitle}>
                Antrian lintas divisi yang menunggu keputusan
              </p>
            </div>
            <span className={styles.divisionCardBadge}>
              {attention.length}
            </span>
          </div>
          {attention.length === 0 ? (
            <p className={styles.attentionEmpty}>
              Tidak ada antrian. Semua divisi dalam kondisi aman.
            </p>
          ) : (
            <div className={styles.attentionList}>
              {attention.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={styles.attentionItem}
                >
                  <span
                    className={`${styles.attentionDot} ${
                      item.level === "high"
                        ? styles.attentionDotHigh
                        : styles.attentionDotMedium
                    }`}
                  />
                  <span className={styles.attentionBody}>
                    <span className={styles.attentionItemDivision}>{item.division}</span>
                    <p className={styles.attentionItemTitle}>{item.title}</p>
                    <p className={styles.attentionItemDetail}>{item.detail}</p>
                  </span>
                  <span className={styles.attentionLink}>Buka</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <div>
              <h4 className={styles.chartTitle}>Pemasukan vs Pengeluaran</h4>
              <p className={styles.chartSubtitle}>Arus kas aktual dari modul Keuangan</p>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.chartLegendItem}>
                <span className={styles.legendDotIncome} />
                <span className={styles.legendLabel}>Pemasukan</span>
              </div>
              <div className={styles.chartLegendItem}>
                <span className={styles.legendDotExpense} />
                <span className={styles.legendLabel}>Pengeluaran</span>
              </div>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <svg
              className={styles.chartSvg}
              preserveAspectRatio="none"
              viewBox="0 0 1000 300"
            >
              {[0, 100, 200, 300].map((y) => (
                <line
                  key={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  x1="0"
                  x2="1000"
                  y1={y}
                  y2={y}
                />
              ))}
              <defs>
                <linearGradient id="goldGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#dba501" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path d={areaFrom(incomePoints)} fill="url(#goldGrad)" opacity="0.12" />
              <polyline
                points={expensePoints}
                fill="none"
                className={styles.chartLineExpense}
                strokeLinecap="round"
                strokeWidth="2"
              />
              <polyline
                points={incomePoints}
                fill="none"
                stroke="#dba501"
                strokeLinecap="round"
                strokeWidth="3"
                className={styles.chartLinePath}
              />
            </svg>
            <div className={styles.chartMonthLabels}>
              {cashflow.map((point, index) => (
                <span key={`${point.label}-${index}`} className={styles.chartMonthLabel}>
                  {point.label}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.chartTotalRow}>
            <span className={styles.chartTotalItem}>
              <span className={styles.chartTotalLabel}>Pemasukan</span>
              <span className={styles.chartTotalValue}>{formatRp(totals.totalMasuk)}</span>
            </span>
            <span className={styles.chartTotalItem}>
              <span className={styles.chartTotalLabel}>Pengeluaran</span>
              <span className={styles.chartTotalValue}>{formatRp(totals.totalKeluar)}</span>
            </span>
            <span className={styles.chartTotalItem}>
              <span className={styles.chartTotalLabel}>Saldo</span>
              <span className={styles.chartTotalValue}>{formatRp(totals.saldo)}</span>
            </span>
          </div>
        </section>

        <section className={styles.registrationSection}>
          <div className={styles.registrationHeader}>
            <div>
              <h4 className={styles.registrationTitle}>Pendaftaran Baru</h4>
              <p className={styles.attentionSubtitle}>
                Permintaan akun yang menunggu persetujuan
              </p>
            </div>
            <button
              onClick={() => router.push("/owner/users")}
              className={styles.viewAllButton}
            >
              Lihat Semua
            </button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeaderRow}>
                  <th className={styles.tableHeaderCell}>Nama</th>
                  <th className={styles.tableHeaderCell}>Departemen</th>
                  <th className={styles.tableHeaderCell}>Tanggal Daftar</th>
                  <th className={styles.tableHeaderCellRight}>Status</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {registrations.length === 0 && (
                  <tr>
                    <td className={styles.tableCellSimple} colSpan={4}>
                      Belum ada pendaftaran baru.
                    </td>
                  </tr>
                )}
                {registrations.map((r) => (
                  <tr key={r.name} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.avatar}>{r.initial}</div>
                      <span className={styles.nameText}>{r.name}</span>
                    </td>
                    <td className={styles.tableCellSimple}>{r.dept}</td>
                    <td className={styles.tableCellSimple}>{r.date}</td>
                    <td className={styles.tableCellActions}>
                      {r.status === "approved" ? (
                        <span className={styles.statusApproved}>Disetujui</span>
                      ) : r.status === "rejected" ? (
                        <span className={styles.statusRejected}>Ditolak</span>
                      ) : (
                        <span className={styles.statusPending}>Menunggu</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarHeader}>
            <h5 className={styles.sidebarTitle}>Aktivitas Real-time</h5>
            <span className={styles.liveDot} />
          </div>
          <div className={styles.activityList}>
            {activities.map((a, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityTimeline}>
                  <div
                    className={`${styles.activityDot} ${
                      a.highlight || a.system
                        ? styles.activityDotHighlight
                        : styles.activityDotNormal
                    }`}
                  />
                  {i < activities.length - 1 && <div className={styles.activityLine} />}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityTime}>{a.time}</p>
                  <p
                    className={`${styles.activityText} ${
                      a.system ? styles.activitySystem : styles.activityNormal
                    }`}
                  >
                    {a.system ? (
                      a.text
                    ) : (
                      <>
                        <span className={styles.activityHighlightName}>
                          {a.text.split(":")[0]}:
                        </span>
                        {a.text.split(":").slice(1).join(":")}
                      </>
                    )}
                  </p>
                  {a.tag && <span className={styles.activityTag}>{a.tag}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.systemStatus}>
            <h6 className={styles.systemStatusTitle}>Status Sistem</h6>
            <div className={styles.systemStatusContent}>
              <div className={styles.systemStatusItem}>
                <div className={styles.systemStatusRow}>
                  <span className={styles.systemStatusLabel}>Server Gudang</span>
                  <span className={styles.systemStatusValue}>{sysStatus.serverGudang}</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressBarFill} />
                </div>
              </div>
              <div className={styles.systemStatusRow}>
                <span className={styles.systemStatusLabel}>Database Latency</span>
                <span className={styles.systemStatusValue}>{sysStatus.dbLatency}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
