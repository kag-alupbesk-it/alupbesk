"use client";

import { useState } from "react";
import * as styles from "../../style/style";
import { useApi } from "@/frontend/Manager/(manager)/hooks/useApi/useApi";
import { fetchFinancialsData } from "@/frontend/Manager/(manager)/services/financials/financials";
import { periodLabels, type Period } from "@/frontend/Manager/(manager)/types/types";

function LoadingSkeleton() {
  return (
    <div className={styles.container}>
      <section className={styles.metricsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.metricCard}>
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse mb-3" />
            <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </section>
      <div className="h-80 bg-white/5 rounded animate-pulse mt-6" />
    </div>
  );
}

export default function FinancialsSection() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data, loading, error, refetch } = useApi(() => fetchFinancialsData(period as Period, { startDate: startDate || undefined, endDate: endDate || undefined }), { interval: 30000, key: period + startDate + endDate });

  const handleDownloadAll = () => {
    const stmts = data?.statements ?? [];
    const header = "Statement,Revenue,Profit,Margin\n";
    const rows = stmts.map((s) => `${s.period},${s.revenue},${s.profit},${s.margin}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Financial_Statements_All.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRow = (period: string) => {
    const s = data?.statements.find((st) => st.period === period);
    if (!s) return;
    const csv = `Statement,Revenue,Profit,Margin\n${s.period},${s.revenue},${s.profit},${s.margin}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${period.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const metrics = data?.metrics ?? [];
  const statements = data?.statements ?? [];
  const expenses = data?.expenses ?? [];
  const donut = data?.donut ?? [];
  const donutTotal = donut.reduce((sum, d) => sum + d.value, 0);
  const circumference = 2 * Math.PI * 40;
  const lead = donut[0];
  const leadPct = donutTotal > 0 && lead ? Math.round((lead.value / donutTotal) * 100) : 0;

  return (
    <div className={styles.container}>
      <section className={styles.metricsGrid}>
        {metrics.map((m, i) => (
          <div key={m.label} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>{m.label}</span>
              {m.icon && <span className={styles.metricIcon}>{m.icon}</span>}
              {m.isProgress && <div className={styles.metricPulse} />}
            </div>
            <div className={styles.metricValueWrapper}>
              <h3 className={styles.metricValue}>{m.value}</h3>
              {m.isProgress ? (
                <div className={styles.progressTrack}><div className={styles.progressFill} /></div>
              ) : m.sub ? (
                <p className={`${i === 0 ? styles.subColorSecondary : styles.subColorMuted} ${styles.metricSubtext}`}>{m.sub}</p>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className={styles.chartsRow}>
        <div className={styles.revenueChart}>
          <div className={styles.revenueChartHeader}>
            <div>
              <h4 className={styles.sectionTitle}>Revenue Stream Analysis</h4>
              <p className={styles.sectionSubtitle}>Precision Manufacturing & Logistics Dividends</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className={styles.toggleGroup}>
                {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`${styles.toggleButton} ${period === p ? styles.toggleActive : styles.toggleInactive}`}>{periodLabels[p]}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 text-[10px] items-center">
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="bg-white/5 border border-white/10 rounded px-1 py-0.5" />
                <span className="text-white/40">-</span>
                <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="bg-white/5 border border-white/10 rounded px-1 py-0.5" />
                <button onClick={()=>{setStartDate(""); setEndDate("");}} className="px-1 py-0.5 bg-white/5 rounded border border-white/10">Bersihkan</button>
              </div>
            </div>
          </div>
          <div className={styles.chartArea}>
            {(data?.barChart ?? Array(9).fill({ value: 0 })).map((b, i) => (
              <div key={i} className={`${styles.bar} ${styles.barNormal}`} style={{ height: `${b.value}%` }} />
            ))}
          </div>
          <div className={styles.chartLabels}>
            {period === "daily" ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => <span key={d}>{d}</span>) : period === "weekly" ? ["W1", "W2", "W3", "W4"].map((w) => <span key={w}>{w}</span>) : period === "monthly" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"].map((m) => <span key={m}>{m}</span>) : ["Q1", "Q2", "Q3", "Q4"].map((q) => <span key={q}>{q}</span>)}
          </div>
        </div>

        <div className={styles.expenseCard}>
          <div className={styles.expenseCardHeader}>
            <h4 className={styles.sectionTitle}>Revenue Split</h4>
            <p className={styles.sectionSubtitle}>Penjualan Eceran vs Pendapatan Proyek</p>
          </div>
          <div className={styles.donutContainer}>
            <svg className={styles.donutSvg} viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#242e36" strokeWidth="10" />
              {donut.map((d, i) => {
                const frac = d.value / donutTotal;
                const cumulative = donut.slice(0, i).reduce((sum, x) => sum + x.value, 0) / donutTotal;
                return (
                  <circle
                    key={d.label}
                    cx="50" cy="50" fill="transparent" r="40" stroke={d.color}
                    strokeDasharray={`${frac * circumference} ${circumference}`}
                    strokeDashoffset={-cumulative * circumference}
                    strokeLinecap="round" strokeWidth="10"
                  />
                );
              })}
            </svg>
            <div className={styles.donutCenter}>
              <span className={styles.donutCenterValue}>{donutTotal > 0 ? `${leadPct}%` : "0%"}</span>
              <span className={styles.donutCenterLabel}>{lead ? lead.label : "No Data"}</span>
            </div>
          </div>
          <div className={styles.expenseList}>
            {donutTotal > 0 ? donut.map((d) => (
              <div key={d.label} className={styles.expenseItem}>
                <div className={styles.expenseItemLeft}>
                  <span className={styles.expenseDot} style={{ backgroundColor: d.color }} />
                  <span className={styles.expenseLabel}>{d.label}</span>
                </div>
                <span className={styles.expenseValue}>{Math.round((d.value / donutTotal) * 100)}%</span>
              </div>
            )) : expenses.map((e) => (
              <div key={e.label} className={styles.expenseItem}>
                <div className={styles.expenseItemLeft}>
                  <span className={`${styles.expenseDot} ${e.color} ${e.color === "bg-secondary" ? styles.expenseDotShadow : ""}`} />
                  <span className={styles.expenseLabel}>{e.label}</span>
                </div>
                <span className={styles.expenseValue}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h4 className={styles.tableTitle}>Financial Statements</h4>
          <button onClick={handleDownloadAll} className={styles.downloadButton}>
            <span className={styles.downloadIcon}>download</span> DOWNLOAD ALL
          </button>
        </div>
        <div className={styles.mobileList}>
          {statements.length === 0 && (
            <div className={`${styles.card} py-10 text-center text-xs text-on-surface-variant`}>
              Belum ada financial statement.
            </div>
          )}
          {statements.map((s) => (
            <div key={s.period} className={styles.card}>
              <div className={styles.cardTop}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={styles.iconFont}>description</span>
                  <span className={`${styles.tableCellText} truncate`}>{s.period}</span>
                </div>
                <span className={styles.statusBadge}>Finalized</span>
              </div>
              <div className={styles.cardInfo}>
                <div className="flex items-center justify-between">
                  <span>Total Revenue</span>
                  <span className="font-bold text-on-surface">{s.revenue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Net Profit</span>
                  <span className={styles.tableCellHighlight}>{s.profit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Margin</span>
                  <span className="font-bold text-on-surface">{s.margin}</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleDownloadRow(s.period)}
                  className={`${styles.actionButton} w-full px-4 border border-outline/30 rounded-pill`}
                  title="Download"
                >
                  <span className={styles.iconFont}>download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={`${styles.tableWrapper} ${styles.desktopOnly}`}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.tableHeadCell}>Statement Period</th>
                <th className={styles.tableHeadCell}>Total Revenue</th>
                <th className={styles.tableHeadCell}>Net Profit</th>
                <th className={styles.tableHeadCell}>Margin</th>
                <th className={styles.tableHeadCell}>Status</th>
                <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {statements.map((s) => (
                <tr key={s.period} className={styles.tableRow}>
                  <td className={styles.tableCell}><div className={styles.tableCellContent}><span className={styles.tableCellIcon}>description</span><span className={styles.tableCellText}>{s.period}</span></div></td>
                  <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>{s.revenue}</td>
                  <td className={`${styles.tableCell} ${styles.tableCellHighlight}`}>{s.profit}</td>
                  <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>{s.margin}</td>
                  <td className={styles.tableCell}><span className={styles.statusBadge}>Finalized</span></td>
                  <td className={`${styles.tableCell} ${styles.tableCellRight}`}><button onClick={() => handleDownloadRow(s.period)} className={styles.actionButton} title="Download"><span className={styles.iconFont}>download</span></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setPreset(type: string, setStart: (v: string) => void, setEnd: (v: string) => void) {
  const now = new Date(); now.setHours(0,0,0,0);
  if (type === "today") { const s=formatDateForInput(now); setStart(s); setEnd(s); return; }
  if (type === "yesterday") { const d=new Date(now); d.setDate(d.getDate()-1); const s=formatDateForInput(d); setStart(s); setEnd(s); return; }
  if (type === "thisWeek") { const d=new Date(now); const day=d.getDay(); const diff=day===0?6:day-1; const start=new Date(d); start.setDate(d.getDate()-diff); setStart(formatDateForInput(start)); setEnd(formatDateForInput(now)); return; }
  if (type === "lastWeek") { const d=new Date(now); const day=d.getDay(); const diff=day===0?6:day-1; const end=new Date(d); end.setDate(d.getDate()-diff-1); const start=new Date(end); start.setDate(end.getDate()-6); setStart(formatDateForInput(start)); setEnd(formatDateForInput(end)); return; }
  if (type === "thisMonth") { const start=new Date(now.getFullYear(), now.getMonth(),1); setStart(formatDateForInput(start)); setEnd(formatDateForInput(now)); return; }
  if (type === "lastMonth") { const start=new Date(now.getFullYear(), now.getMonth()-1,1); const end=new Date(now.getFullYear(), now.getMonth(),0); setStart(formatDateForInput(start)); setEnd(formatDateForInput(end)); return; }
  if (type === "last3Months") { const start=new Date(now.getFullYear(), now.getMonth()-3,1); const end=new Date(now.getFullYear(), now.getMonth(),0); setStart(formatDateForInput(start)); setEnd(formatDateForInput(end)); return; }
  if (type === "last6Months") { const start=new Date(now.getFullYear(), now.getMonth()-6,1); const end=new Date(now.getFullYear(), now.getMonth(),0); setStart(formatDateForInput(start)); setEnd(formatDateForInput(end)); return; }
  if (type === "thisYear") { const start=new Date(now.getFullYear(),0,1); setStart(formatDateForInput(start)); setEnd(formatDateForInput(now)); return; }
  if (type === "lastYear") { const start=new Date(now.getFullYear()-1,0,1); const end=new Date(now.getFullYear()-1,11,31); setStart(formatDateForInput(start)); setEnd(formatDateForInput(end)); return; }
}
