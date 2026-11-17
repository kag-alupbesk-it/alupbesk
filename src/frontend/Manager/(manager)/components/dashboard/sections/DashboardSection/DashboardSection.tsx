"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/frontend/Manager/(manager)/hooks/useApi/useApi";
import { fetchDashboardData } from "@/frontend/Manager/(manager)/services/dashboard/dashboard";
import { getOrders, decideOrder } from "@/frontend/Manager/(manager)/services/orders/orders";
import { reviewRoleRequest } from "@/services/api/roleRequests/index";
import { request } from "@/services/api/request";
import type { AuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import type { LocalOrder, OrderStatus } from "@/services/orders/index";
import type {
  DashboardData,
  Registration,
} from "@/frontend/Manager/(manager)/services/dashboard/dashboard";
import { periodLabels, type Period } from "@/frontend/Manager/(manager)/types/types";

type OrderFilter = "all" | "attention" | "processing" | "completed" | "closed";

const periods: Period[] = ["daily", "weekly", "monthly", "yearly"];

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const orderStatus: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "Menunggu",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  submitted_to_manager: {
    label: "Perlu keputusan",
    className: "border-secondary/30 bg-secondary/10 text-secondary",
  },
  confirmed: {
    label: "Dikonfirmasi",
    className: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  rejected_by_manager: {
    label: "Ditolak",
    className: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  },
  processing: {
    label: "Diproses",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  completed: {
    label: "Selesai",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "border-outline/40 bg-surface-variant text-on-surface-variant",
  },
};

const orderFilters: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "attention", label: "Perlu keputusan" },
  { id: "processing", label: "Diproses" },
  { id: "completed", label: "Selesai" },
  { id: "closed", label: "Ditolak / batal" },
];

function matchesOrderFilter(order: LocalOrder, filter: OrderFilter): boolean {
  switch (filter) {
    case "attention":
      return order.status === "submitted_to_manager";
    case "processing":
      return order.status === "confirmed" || order.status === "processing";
    case "completed":
      return order.status === "completed";
    case "closed":
      return order.status === "rejected_by_manager" || order.status === "cancelled";
    default:
      return true;
  }
}

function formatOrderDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function LoadingSkeleton() {
  return (
    <div
      aria-label="Memuat dashboard Manajer"
      className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8"
    >
      <div className="h-20 animate-pulse rounded-2xl bg-surface-variant" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-2xl bg-surface-variant" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-surface-variant" />
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const item = orderStatus[status];

  return (
    <span
      aria-label={`Status: ${item.label}`}
      className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-outline/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-0.5 text-base font-bold text-on-surface sm:text-lg">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function DashboardSection() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("monthly");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const { data, loading, error, refetch } = useApi<DashboardData>(
    () => fetchDashboardData(period),
    { interval: 30000, key: period },
  );
  const {
    data: orders,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useApi(() => getOrders(), { interval: 30000 });
  const { data: profile } = useApi(
    () => request<AuthenticatedProfile>("/auth/profile"),
    { interval: 60000 },
  );
  const [rejectTarget, setRejectTarget] = useState<LocalOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectBusy, setRejectBusy] = useState(false);
  const [workingOrderId, setWorkingOrderId] = useState<string | null>(null);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const allOrders = orders ?? [];
  const pendingOrders = allOrders.filter((order) => order.status === "submitted_to_manager");
  const displayRegistrations = data?.registrations ?? [];
  const canApproveRoleRequests = profile?.role === "owner";
  const financialCards = data?.financialCards ?? [];
  const activities = data?.activities ?? [];
  const sysStatus = data?.systemStatus ?? {
    serverGudang: "Tidak diketahui",
    dbLatency: "Tidak tersedia",
  };
  const trendBars = financialCards[0]?.bars ?? [];
  const hasTrendData = trendBars.some((value) => value > 0);
  const normalizedSearch = orderSearch.trim().toLocaleLowerCase("id-ID");
  const filteredOrders = allOrders
    .filter((order) => matchesOrderFilter(order, orderFilter))
    .filter((order) => {
      if (!normalizedSearch) return true;
      return [order.id, order.customer.name, order.customer.phone]
        .join(" ")
        .toLocaleLowerCase("id-ID")
        .includes(normalizedSearch);
    })
    .sort((left, right) => {
      const leftDate = Date.parse(left.createdAt) || 0;
      const rightDate = Date.parse(right.createdAt) || 0;
      return rightDate - leftDate;
    });
  const visibleOrders = filteredOrders.slice(0, 8);
  const activeOrders = allOrders.filter(
    (order) => order.status === "confirmed" || order.status === "processing",
  ).length;
  const systemOnline = /online/i.test(sysStatus.serverGudang);

  const handleRoleDecision = async (
    registration: Registration,
    decision: "approve" | "reject",
  ) => {
    setReviewingRequestId(registration.id);
    setActionError("");
    try {
      await reviewRoleRequest(registration.id, decision);
      await refetch();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Permintaan role gagal diproses.");
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleApproveOrder = async (id: string) => {
    setWorkingOrderId(id);
    setActionError("");
    try {
      await decideOrder(id, "confirmed");
      void refetchOrders();
      void refetch();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Gagal menyetujui pesanan.");
    } finally {
      setWorkingOrderId(null);
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
      void refetchOrders();
      void refetch();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Gagal menolak pesanan.");
    } finally {
      setRejectBusy(false);
    }
  };

  if (loading && !data) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-[1600px] flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-red-500" aria-hidden="true">
          error
        </span>
        <p className="max-w-lg text-sm text-on-surface-variant">{error}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-5 text-sm font-bold text-primary transition hover:brightness-110"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const handleRefresh = () => {
    void refetch();
    void refetchOrders();
  };

  const metricIcons = ["payments", "shopping_bag", "pending_actions"];
  const quickActions = [
    { label: "Laporan", detail: "Pantau ringkasan usaha", icon: "monitoring", path: "/manager/reports" },
    { label: "Persediaan", detail: "Periksa stok barang", icon: "inventory_2", path: "/manager/inventory" },
    { label: "Pengguna", detail: "Kelola akses tim", icon: "group", path: "/manager/users" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-outline/30 bg-surface p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
            Pusat kendali
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-on-surface sm:text-2xl">
            Ringkasan Manajer
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Pantau kinerja, pesanan, dan keputusan operasional dari satu tempat.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-outline/40 px-3 text-xs font-semibold text-on-surface transition hover:border-secondary/60 hover:bg-surface-variant sm:flex-none"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              refresh
            </span>
            Muat ulang
          </button>
          <button
            type="button"
            onClick={() => router.push("/manager/reports")}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-bold text-primary transition hover:brightness-105 sm:flex-none"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              monitoring
            </span>
            Buka laporan
          </button>
        </div>
      </header>

      <section aria-label="Ringkasan kinerja" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {financialCards.map((card, index) => (
          <article
            key={card.label}
            className="group relative min-w-0 overflow-hidden rounded-2xl border border-outline/30 bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/50 hover:shadow-md sm:p-5"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-secondary/70" />
            <div className="flex items-start justify-between gap-3 pl-1">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-on-surface-variant">{card.label}</p>
                <p className="mt-2 break-words text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
                  {card.value}
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-[21px]" aria-hidden="true">
                  {metricIcons[index] ?? "analytics"}
                </span>
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-outline/20 pt-3 pl-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  card.positive
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  {card.positive ? "trending_up" : "info"}
                </span>
                {card.change}
              </span>
              <span className="text-[10px] text-on-surface-variant">{periodLabels[period]}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-outline/30 bg-surface shadow-sm">
          <SectionHeading
            eyebrow="Kinerja keuangan"
            title="Tren pendapatan"
            description="Perbandingan relatif lima interval pada periode yang dipilih."
            action={
              <div
                aria-label="Pilih periode"
                className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-variant p-1"
              >
                {periods.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={period === item}
                    onClick={() => setPeriod(item)}
                    className={`min-h-9 shrink-0 rounded-full px-3 text-[11px] font-semibold transition ${
                      period === item
                        ? "bg-secondary text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {periodLabels[item]}
                  </button>
                ))}
              </div>
            }
          />
          <div className="p-4 sm:p-5">
            {hasTrendData ? (
              <>
                <div
                  aria-label="Grafik tren pendapatan relatif"
                  className="grid h-44 grid-cols-5 items-end gap-3 border-b border-l border-outline/20 bg-[linear-gradient(to_bottom,transparent_24%,var(--color-outline)_25%,transparent_25%,transparent_49%,var(--color-outline)_50%,transparent_50%,transparent_74%,var(--color-outline)_75%,transparent_75%)] px-3 sm:h-52 sm:gap-5 sm:px-6"
                  role="img"
                >
                  {trendBars.map((value, index) => {
                    const relativeHeight = Math.min(100, Math.max(0, value * 100));
                    return (
                      <div
                        key={`${period}-${index}`}
                        className="group/bar flex h-full min-w-0 flex-col items-center justify-end gap-2"
                        title={`Interval ${index + 1}: ${Math.round(relativeHeight)}% dari interval tertinggi`}
                      >
                        <div
                          className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-secondary/60 to-secondary transition-all group-hover/bar:brightness-110"
                          style={{ height: `${Math.max(relativeHeight, value > 0 ? 6 : 1)}%` }}
                        />
                        <span className="absolute sr-only">
                          Interval {index + 1}: {Math.round(relativeHeight)}% dari interval tertinggi
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 grid grid-cols-5 gap-3 px-3 text-center text-[10px] font-medium text-on-surface-variant sm:gap-5 sm:px-6">
                  {trendBars.map((_, index) => (
                    <span key={`${period}-label-${index}`}>I{index + 1}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid min-h-44 place-items-center rounded-xl bg-surface-variant/50 px-4 text-center sm:min-h-52">
                <div>
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">
                    monitoring
                  </span>
                  <p className="mt-2 text-sm font-semibold text-on-surface">Belum ada pendapatan</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Grafik akan terisi setelah ada transaksi pada periode ini.
                  </p>
                </div>
              </div>
            )}
            <p className="mt-3 text-[10px] text-on-surface-variant">
              Tinggi batang menunjukkan perbandingan terhadap interval tertinggi, bukan nilai rupiah.
            </p>
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-outline/30 bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
                Akses cepat
              </p>
              <h2 className="mt-1 text-base font-bold text-on-surface">Kelola operasional</h2>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            {quickActions.map((action) => (
              <button
                key={action.path}
                type="button"
                onClick={() => router.push(action.path)}
                className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-outline/25 bg-surface-container-low px-3 py-2 text-left transition hover:border-secondary/50 hover:bg-surface-variant"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                    {action.icon}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-on-surface">{action.label}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-on-surface-variant">
                    {action.detail}
                  </span>
                </span>
                <span className="material-symbols-outlined text-[17px] text-on-surface-variant" aria-hidden="true">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-outline/20 bg-surface-container-low p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Koneksi layanan
                </p>
                <p className="mt-1 text-xs text-on-surface">Server gudang</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  systemOnline
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                <span className={`size-1.5 rounded-full ${systemOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
                {sysStatus.serverGudang}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-outline/20 pt-2 text-[10px]">
              <span className="text-on-surface-variant">Latensi database</span>
              <span className="font-semibold text-on-surface">{sysStatus.dbLatency}</span>
            </div>
          </div>
        </section>
      </div>

      <section id="manager-orders" className="min-w-0 overflow-hidden rounded-2xl border border-outline/30 bg-surface shadow-sm">
        <SectionHeading
          eyebrow="Monitoring"
          title="Pesanan"
          description={`${pendingOrders.length} pesanan menunggu keputusan Manajer · ${activeOrders} pesanan sedang berjalan`}
          action={
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-secondary/10 px-3 text-[11px] font-bold text-secondary">
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                pending_actions
              </span>
              {pendingOrders.length} perlu ditinjau
            </span>
          }
        />
        {actionError && (
          <p role="alert" className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300 sm:px-5">
            {actionError}
          </p>
        )}
        <div className="flex flex-col gap-3 border-b border-outline/20 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div aria-label="Filter status pesanan" className="flex gap-2 overflow-x-auto pb-1">
            {orderFilters.map((filter) => {
              const count = allOrders.filter((order) => matchesOrderFilter(order, filter.id)).length;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={orderFilter === filter.id}
                  onClick={() => setOrderFilter(filter.id)}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-[11px] font-semibold transition ${
                    orderFilter === filter.id
                      ? "border-secondary bg-secondary text-primary"
                      : "border-outline/30 bg-surface text-on-surface-variant hover:border-secondary/50 hover:text-on-surface"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      orderFilter === filter.id ? "bg-primary/10 text-primary" : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="relative block w-full xl:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">
              search
            </span>
            <input
              type="search"
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
              placeholder="Cari ID, pelanggan, atau telepon"
              aria-label="Cari pesanan"
              className="min-h-11 w-full rounded-xl border border-outline/30 bg-surface-container-low pl-10 pr-3 text-xs text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
        </div>

        {ordersError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs text-red-700 dark:text-red-300">
            <span>Daftar pesanan gagal dimuat: {ordersError}</span>
            <button type="button" onClick={() => void refetchOrders()} className="min-h-10 rounded-lg border border-red-500/30 px-3 font-semibold">
              Coba lagi
            </button>
          </div>
        )}

        {ordersLoading && !orders ? (
          <div className="space-y-3 p-4 sm:p-5" aria-label="Memuat daftar pesanan">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-xl bg-surface-variant" />
            ))}
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="px-4 py-12 text-center sm:px-5">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">
              inbox
            </span>
            <p className="mt-2 text-sm font-semibold text-on-surface">Pesanan tidak ditemukan</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {orderSearch
                ? "Coba ubah kata pencarian atau filter status."
                : "Belum ada pesanan pada status ini."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 xl:hidden">
              {visibleOrders.map((order) => (
                <article key={order.id} className="rounded-xl border border-outline/25 bg-surface-container-low p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-secondary">{order.id}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-on-surface">
                        {order.customer.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
                        {order.customer.phone}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-outline/20 pt-3 text-[11px]">
                    <div>
                      <p className="text-on-surface-variant">Item · {order.items.length}</p>
                      <p className="mt-1 text-on-surface-variant">{formatOrderDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-on-surface-variant">Total pesanan</p>
                      <p className="mt-1 font-bold text-on-surface">{currencyFormatter.format(order.total)}</p>
                    </div>
                  </div>
                  {order.status === "submitted_to_manager" && (
                    <div className="mt-3 flex gap-2 border-t border-outline/20 pt-3">
                      <button
                        type="button"
                        disabled={workingOrderId !== null || rejectBusy}
                        onClick={() => void handleApproveOrder(order.id)}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-secondary px-3 text-xs font-bold text-primary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[17px]" aria-hidden="true">check</span>
                        {workingOrderId === order.id ? "Memproses..." : "Setujui"}
                      </button>
                      <button
                        type="button"
                        disabled={workingOrderId !== null || rejectBusy}
                        onClick={() => {
                          setRejectTarget(order);
                          setActionError("");
                        }}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-red-500/30 px-3 text-xs font-bold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300"
                      >
                        <span className="material-symbols-outlined text-[17px]" aria-hidden="true">close</span>
                        Tolak
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[860px] text-left">
                <thead className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th scope="col" className="px-5 py-3">Pesanan</th>
                    <th scope="col" className="px-5 py-3">Pelanggan</th>
                    <th scope="col" className="px-5 py-3">Item</th>
                    <th scope="col" className="px-5 py-3">Total</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/15">
                  {visibleOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-surface-container-low/70">
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-secondary">{order.id}</p>
                        <p className="mt-1 text-[10px] text-on-surface-variant">{formatOrderDate(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-on-surface">{order.customer.name}</p>
                        <p className="mt-1 text-[10px] text-on-surface-variant">{order.customer.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-on-surface-variant">{order.items.length} item</td>
                      <td className="px-5 py-4 text-xs font-semibold text-on-surface">
                        {currencyFormatter.format(order.total)}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-5 py-4 text-right">
                        {order.status === "submitted_to_manager" ? (
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              disabled={workingOrderId !== null || rejectBusy}
                              onClick={() => void handleApproveOrder(order.id)}
                              className="min-h-10 rounded-lg bg-secondary px-3 text-[11px] font-bold text-primary disabled:opacity-50"
                            >
                              {workingOrderId === order.id ? "Memproses..." : "Setujui"}
                            </button>
                            <button
                              type="button"
                              disabled={workingOrderId !== null || rejectBusy}
                              onClick={() => {
                                setRejectTarget(order);
                                setActionError("");
                              }}
                              className="min-h-10 rounded-lg border border-red-500/30 px-3 text-[11px] font-bold text-red-600 hover:bg-red-500/10 disabled:opacity-50 dark:text-red-300"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-outline/20 px-4 py-3 text-[11px] text-on-surface-variant sm:px-5">
              Menampilkan {visibleOrders.length} dari {filteredOrders.length} pesanan
            </div>
          </>
        )}
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-outline/30 bg-surface shadow-sm">
          <SectionHeading
            eyebrow="Akses tim"
            title="Permintaan role"
            description="Permintaan akses yang menunggu peninjauan."
            action={
              <button
                type="button"
                onClick={() => router.push("/manager/users")}
                className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-secondary hover:bg-secondary/10"
              >
                Lihat semua
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
              </button>
            }
          />
          {displayRegistrations.length === 0 ? (
            <div className="px-4 py-10 text-center sm:px-5">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">
                person_search
              </span>
              <p className="mt-2 text-sm font-semibold text-on-surface">Tidak ada permintaan baru</p>
              <p className="mt-1 text-xs text-on-surface-variant">Semua permintaan role akan tampil di sini.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline/15">
              {displayRegistrations.slice(0, 5).map((registration) => (
                <article key={registration.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                      {registration.initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-on-surface">{registration.name}</p>
                      <p className="mt-0.5 break-all text-[10px] text-on-surface-variant">{registration.email}</p>
                      <p className="mt-1 text-[10px] capitalize text-on-surface-variant">
                        {registration.requestedRole}{registration.dept ? ` · ${registration.dept}` : ""}
                      </p>
                    </div>
                  </div>
                  {canApproveRoleRequests ? (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={reviewingRequestId !== null}
                        onClick={() => void handleRoleDecision(registration, "approve")}
                        className="min-h-10 rounded-lg bg-secondary px-3 text-[11px] font-bold text-primary disabled:opacity-50"
                      >
                        {reviewingRequestId === registration.id ? "Memproses..." : "Setujui"}
                      </button>
                      <button
                        type="button"
                        disabled={reviewingRequestId !== null}
                        onClick={() => void handleRoleDecision(registration, "reject")}
                        className="min-h-10 rounded-lg border border-red-500/30 px-3 text-[11px] font-bold text-red-600 disabled:opacity-50 dark:text-red-300"
                      >
                        Tolak
                      </button>
                    </div>
                  ) : (
                    <span className="w-fit rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      Menunggu Owner
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-outline/30 bg-surface shadow-sm">
          <SectionHeading
            eyebrow="Aktivitas terkini"
            title="Jejak operasional"
            description="Pembaruan pesanan dan permintaan terbaru."
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
                <span className="size-1.5 rounded-full bg-secondary" />
                Diperbarui berkala
              </span>
            }
          />
          {activities.length === 0 ? (
            <div className="px-4 py-10 text-center sm:px-5">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">
                history
              </span>
              <p className="mt-2 text-sm font-semibold text-on-surface">Belum ada aktivitas</p>
              <p className="mt-1 text-xs text-on-surface-variant">Aktivitas terbaru akan muncul di sini.</p>
            </div>
          ) : (
            <ol className="divide-y divide-outline/15">
              {activities.slice(0, 6).map((activity, index) => (
                <li key={`${activity.time}-${index}`} className="flex gap-3 px-4 py-3 sm:px-5">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${activity.highlight ? "bg-secondary" : "bg-outline"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs leading-relaxed text-on-surface">{activity.text}</p>
                    {activity.tag && (
                      <span className="mt-1.5 inline-flex max-w-full rounded-full border border-outline/25 bg-surface-container-low px-2 py-0.5 text-[10px] text-on-surface-variant">
                        {activity.tag}
                      </span>
                    )}
                  </div>
                  <time className="shrink-0 pt-0.5 text-[10px] font-medium text-on-surface-variant">
                    {activity.time}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <section
            aria-labelledby="reject-order-title"
            aria-modal="true"
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-outline/30 bg-surface p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            role="dialog"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">Keputusan pesanan</p>
            <h2 id="reject-order-title" className="mt-1 text-lg font-bold text-on-surface">
              Tolak pesanan {rejectTarget.id}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
              Tuliskan alasan agar tim terkait dapat menindaklanjuti penolakan ini.
            </p>
            <label htmlFor="reject-reason" className="mt-4 block text-xs font-semibold text-on-surface">
              Alasan penolakan
            </label>
            <textarea
              id="reject-reason"
              autoFocus
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Contoh: stok belum tersedia atau detail pesanan perlu diperbaiki."
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-outline/40 bg-surface-container-low p-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={rejectBusy}
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason("");
                }}
                className="min-h-11 rounded-xl border border-outline/40 px-4 text-xs font-semibold text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={rejectBusy || !rejectReason.trim()}
                onClick={() => void submitRejectOrder()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rejectBusy && (
                  <span className="material-symbols-outlined animate-spin text-[17px]" aria-hidden="true">
                    progress_activity
                  </span>
                )}
                {rejectBusy ? "Mengirim..." : "Tolak pesanan"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
