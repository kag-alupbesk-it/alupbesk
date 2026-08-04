"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as styles from "../style";
import { useApi } from "@/frontend/(owner)/hooks/useApi";
import { fetchDashboardData } from "@/frontend/(owner)/services/dashboard";
import { periodLabels, type Period } from "@/frontend/(owner)/types";

function LoadingSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.cardGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.card}>
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse mb-2" />
              <div className="h-6 w-28 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </section>
        <div className="h-64 bg-white/5 rounded animate-pulse mt-6" />
      </div>
    </div>
  );
}

export default function DashboardSection() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("monthly");
  const { data, loading, error, refetch } = useApi(() => fetchDashboardData(period), { interval: 30000 });

  const registrations = data?.registrations ?? [];

  if (loading && !data) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-icons text-4xl text-red-400 mb-4">error_outline</span>
          <p className="text-white/60 mb-4">{error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-secondary text-primary rounded-pill text-sm hover:brightness-110 transition-all">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const financialCards = data?.financialCards ?? [];
  const activities = data?.activities ?? [];
  const sysStatus = data?.systemStatus ?? { serverGudang: "--", dbLatency: "--" };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.cardGrid}>
          {financialCards.map((card) => (
            <div key={card.label} className={styles.card}>
              <p className={styles.cardLabel}>{card.label}</p>
              <h3 className={styles.cardValue}>{card.value}</h3>
              <div className={styles.cardChangeWrapper}>
                <span className={styles.cardBars}>
                  {card.bars.map((h, i) => (
                    <div key={i} className={styles.cardBar} style={{ height: `${h * 4}px`, backgroundColor: i === card.bars.length - 1 ? "var(--color-secondary)" : "rgba(219,165,1,0.3)" }} />
                  ))}
                </span>
                <span className={`${styles.changeText} ${card.positive ? styles.changePositive : styles.changeNegative}`}>{card.change}</span>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <div>
              <h4 className={styles.chartTitle}>Pemasukan vs Pengeluaran</h4>
              <p className={styles.chartSubtitle}>Financial trend comparison (Q4)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={styles.toggleGroup}>
                {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`${styles.toggleButton} ${period === p ? styles.toggleActive : styles.toggleInactive}`}>{periodLabels[p]}</button>
                ))}
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.chartLegendItem}><span className={styles.legendDotIncome} /><span className={styles.legendLabel}>Pemasukan</span></div>
                <div className={styles.chartLegendItem}><span className={styles.legendDotExpense} /><span className={styles.legendLabel}>Pengeluaran</span></div>
              </div>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <svg className={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 1000 300">
              {[0, 100, 200, 300].map((y) => (<line key={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="0" x2="1000" y1={y} y2={y} />))}
              <path d="M0,300 L1000,300" fill="none" stroke="#dba501" strokeLinecap="round" strokeWidth="3" className={styles.chartLinePath} />
              <defs><linearGradient id="goldGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#dba501" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
              <path d="M0,300 L1000,300 L1000,300 L0,300 Z" fill="url(#goldGrad)" opacity="0.05" />
            </svg>
            <div className={styles.chartMonthLabels}>
              {["JAN", "FEB", "MAR", "APR", "MEI", "JUN"].map((m) => (<span key={m} className={styles.chartMonthLabel}>{m}</span>))}
            </div>
          </div>
        </section>

        <section className={styles.registrationSection}>
          <div className={styles.registrationHeader}>
            <h4 className={styles.registrationTitle}>Pendaftaran Baru</h4>
            <button onClick={() => router.push("/owner/users")} className={styles.viewAllButton}>Lihat Semua</button>
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
                  <div className={`${styles.activityDot} ${a.highlight || a.system ? styles.activityDotHighlight : styles.activityDotNormal}`} />
                  {i < activities.length - 1 && <div className={styles.activityLine} />}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityTime}>{a.time}</p>
                  <p className={`${styles.activityText} ${a.system ? styles.activitySystem : styles.activityNormal}`}>
                    {a.system ? a.text : (<><span className={styles.activityHighlightName}>{a.text.split(":")[0]}:</span>{a.text.split(":").slice(1).join(":")}</>)}
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
                <div className={styles.systemStatusRow}><span className={styles.systemStatusLabel}>Server Gudang</span><span className={styles.systemStatusValue}>{sysStatus.serverGudang}</span></div>
                <div className={styles.progressBar}><div className={styles.progressBarFill} /></div>
              </div>
              <div className={styles.systemStatusRow}><span className={styles.systemStatusLabel}>Database Latency</span><span className={styles.systemStatusValue}>{sysStatus.dbLatency}</span></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
