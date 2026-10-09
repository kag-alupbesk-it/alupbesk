"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as styles from "../../style/style";
import { useApi } from "@/frontend/Manager/(manager)/hooks/useApi/useApi";
import { fetchDashboardData } from "@/frontend/Manager/(manager)/services/dashboard/dashboard";
import { getOrders, decideOrder } from "@/frontend/Manager/(manager)/services/orders/orders";
import { reviewRoleRequest } from "@/services/api/roleRequests/index";
import { request } from "@/services/api/request";
import type { AuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import type { LocalOrder } from "@/services/orders/index";
import type { Registration } from "@/frontend/Manager/(manager)/services/dashboard/dashboard";
import { periodLabels, type Period } from "@/frontend/Manager/(manager)/types/types";

function LoadingSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.cardGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.metricCard}>
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
  const { data, loading, error, refetch } = useApi(() => fetchDashboardData(period), { interval: 30000, key: period });
  const { data: orders, refetch: refetchOrders } = useApi(() => getOrders(), { interval: 30000 });
  const { data: profile } = useApi(
    () => request<AuthenticatedProfile>("/auth/profile"),
    { interval: 60000 },
  );
  const [rejectTarget, setRejectTarget] = useState<LocalOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectBusy, setRejectBusy] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const pendingOrders = (orders ?? []).filter((order) => order.status === "submitted_to_manager");
  const displayRegistrations = data?.registrations ?? [];
  const canApproveRoleRequests = profile?.role === "owner";

  const handleRoleDecision = async (
    registration: Registration,
    decision: "approve" | "reject",
  ) => {
    setReviewingRequestId(registration.id);
    setActionError("");
    try {
      await reviewRoleRequest(registration.id, decision, {
        role: registration.requestedRole,
        dept: registration.dept,
      });
      await refetch();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Permintaan role gagal diproses.");
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleApproveOrder = async (id: string) => {
    setActionError("");
    try {
      await decideOrder(id, "confirmed");
      refetchOrders();
      refetch();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Gagal menyetujui pesanan.");
    }
  };

  const submitRejectOrder = async () => {
    if (!rejectTarget) return;
    setRejectBusy(true);
    setActionError("");
    try {
      await decideOrder(rejectTarget.id, "rejected_by_manager", rejectReason);
      setRejectTarget(null);
      setRejectReason("");
      refetchOrders();
      refetch();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Gagal menolak pesanan.");
    } finally {
      setRejectBusy(false);
    }
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

  const financialCards = data?.financialCards ?? [];
  const activities = data?.activities ?? [];
  const sysStatus = data?.systemStatus ?? { serverGudang: "--", dbLatency: "--" };

  return (
    <div className={`${styles.container} max-lg:!flex-col max-lg:!gap-4 max-lg:!p-4`}>
      <div className={`${styles.mainContent} max-lg:!w-full`}>
        <section className={styles.cardGrid}>
          {financialCards.map((card) => (
            <div key={card.label} className={styles.metricCard}>
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
            <button onClick={() => router.push("/manager/users")} className={styles.viewAllButton}>Lihat Semua</button>
          </div>
          <div className={styles.mobileList}>
            {displayRegistrations.length === 0 && (
              <div className={`${styles.card} py-10 text-center text-xs text-on-surface-variant`}>
                Belum ada pendaftaran baru.
              </div>
            )}
            {displayRegistrations.map((r) => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={styles.avatar}>{r.initial}</div>
                    <span className={`${styles.nameText} truncate`}>{r.name}</span>
                  </div>
                  <span className={styles.statusPending}>Menunggu</span>
                </div>
                <div className={styles.cardInfo}>
                  <div className="break-all">{r.email}</div>
                  <div className="truncate">Role: {r.requestedRole}{r.dept ? ` · ${r.dept}` : ""}</div>
                  <div>Terdaftar: {r.date}</div>
                </div>
                {canApproveRoleRequests ? (
                  <div className={`${styles.cardActions} gap-2`}>
                    <button
                      disabled={reviewingRequestId !== null}
                      onClick={() => void handleRoleDecision(r, "approve")}
                      className={`${styles.approveButton} w-full disabled:opacity-50`}
                    >
                      {reviewingRequestId === r.id ? "Memproses..." : "Setujui"}
                    </button>
                    <button
                      disabled={reviewingRequestId !== null}
                      onClick={() => void handleRoleDecision(r, "reject")}
                      className={`${styles.rejectButton} w-full disabled:opacity-50`}
                    >
                      Tolak
                    </button>
                  </div>
                ) : <p className="mt-3 text-[10px] text-on-surface-variant">Menunggu persetujuan Owner.</p>}
              </div>
            ))}
          </div>
          <div className={`${styles.tableWrapper} ${styles.desktopOnly}`}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeaderRow}>
                  <th className={styles.tableHeaderCell}>Nama</th>
                  <th className={styles.tableHeaderCell}>Departemen</th>
                  <th className={styles.tableHeaderCell}>Tanggal Daftar</th>
                  <th className={styles.tableHeaderCellRight}>Aksi</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {displayRegistrations.map((r) => (
                  <tr key={r.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.avatar}>{r.initial}</div>
                      <div className="min-w-0">
                        <span className={styles.nameText}>{r.name}</span>
                        <p className="break-all text-[10px] text-on-surface-variant">{r.email}</p>
                      </div>
                    </td>
                    <td className={styles.tableCellSimple}>
                      <span className="capitalize">{r.requestedRole}</span>
                      {r.dept && <p className="text-[10px] text-on-surface-variant">{r.dept}</p>}
                    </td>
                    <td className={styles.tableCellSimple}>{r.date}</td>
                    <td className={styles.tableCellActions}>
                      {canApproveRoleRequests ? (
                        <>
                          <button
                            disabled={reviewingRequestId !== null}
                            onClick={() => void handleRoleDecision(r, "approve")}
                            className={`${styles.approveButton} disabled:opacity-50`}
                          >
                            {reviewingRequestId === r.id ? "Memproses..." : "Setujui"}
                          </button>
                          <button
                            disabled={reviewingRequestId !== null}
                            onClick={() => void handleRoleDecision(r, "reject")}
                            className={`${styles.rejectButton} disabled:opacity-50`}
                          >
                            Tolak
                          </button>
                        </>
                      ) : <span className={styles.statusPending}>Menunggu Owner</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.registrationSection}>
          <div className={styles.registrationHeader}>
            <h4 className={styles.registrationTitle}>Pesanan Perlu Persetujuan</h4>
            <span className={styles.viewAllButton}>{pendingOrders.length} menunggu</span>
          </div>
          {actionError && (
            <p className="px-6 py-3 text-xs text-red-400 bg-red-500/10 border-b border-red-500/20">
              {actionError}
            </p>
          )}
          <div className={styles.mobileList}>
            {pendingOrders.length === 0 && (
              <div className={`${styles.card} py-10 text-center text-xs text-on-surface-variant`}>
                Tidak ada pesanan yang menunggu persetujuan.
              </div>
            )}
            {pendingOrders.map((order) => (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.orderIdText}>{order.id}</span>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{order.items.length} item</span>
                </div>
                <div className={styles.cardInfo}>
                  <div className="truncate font-bold text-on-surface">{order.customer.name}</div>
                  <div className="truncate">{order.customer.phone}</div>
                </div>
                <div className={styles.cardMeta}>
                  <span className="text-xs text-on-surface-variant">Total</span>
                  <span className="text-xs font-bold text-secondary">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.total)}
                  </span>
                </div>
                <div className={`${styles.cardActions} gap-2`}>
                  <button onClick={() => handleApproveOrder(order.id)} className={`${styles.approveButton} w-full`}>Setujui</button>
                  <button onClick={() => setRejectTarget(order)} className={`${styles.rejectButton} w-full`}>Tolak</button>
                </div>
              </div>
            ))}
          </div>
          <div className={`${styles.tableWrapper} ${styles.desktopOnly}`}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeaderRow}>
                  <th className={styles.tableHeaderCell}>ID Pesanan</th>
                  <th className={styles.tableHeaderCell}>Pelanggan</th>
                  <th className={styles.tableHeaderCell}>Produk</th>
                  <th className={styles.tableHeaderCell}>Total</th>
                  <th className={styles.tableHeaderCellRight}>Aksi</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {pendingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Tidak ada pesanan yang menunggu persetujuan.
                    </td>
                  </tr>
                ) : (
                  pendingOrders.map((order) => (
                    <tr key={order.id} className={styles.tableRow}>
                      <td className={styles.tableCellSimple}>
                        <span className={styles.orderIdText}>{order.id}</span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.avatar}>
                          {(order.customer.name.trim()[0] ?? "?").toUpperCase()}
                        </div>
                        <div>
                          <span className={styles.nameText}>{order.customer.name}</span>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{order.customer.phone}</p>
                        </div>
                      </td>
                      <td className={styles.tableCellSimple}>{order.items.length} item</td>
                      <td className={styles.tableCellSimple}>
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.total)}
                      </td>
                      <td className={styles.tableCellActions}>
                        <button onClick={() => handleApproveOrder(order.id)} className={styles.approveButton}>Setujui</button>
                        <button onClick={() => setRejectTarget(order)} className={styles.rejectButton}>Tolak</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className={`${styles.sidebar} max-lg:!w-full`}>
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

      {rejectTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h5 className={styles.modalTitle}>Tolak Pesanan {rejectTarget.id}</h5>
            <p className={styles.modalText}>
              Beri alasan penolakan. Alasan ini akan terlihat di bagian marketing.
            </p>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Tuliskan alasan penolakan..."
              rows={4}
              className={styles.modalTextarea}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason("");
                }}
                className={styles.modalCancel}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={rejectBusy || !rejectReason.trim()}
                onClick={submitRejectOrder}
                className={styles.modalConfirm}
              >
                {rejectBusy ? "Mengirim..." : "Tolak Pesanan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
