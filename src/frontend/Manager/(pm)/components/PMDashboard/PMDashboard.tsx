"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  Filter,
  FolderKanban,
  LayoutList,
  PackageCheck,
  Search,
  TimerReset,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePMOrders } from "../../context/PMOrderContext";
import { formatPMDate, getPMDayLabel, getPMGreeting, getPMInitials } from "../shared/date/date";
import { DrawingStatusBadge, PMBadge, ProjectStatusBadge } from "../shared/PMBadge/PMBadge";
import type { ProjectStatus } from "../../types";
import { statusFilterLabels } from "../../types";
import { needsDrawingApproval } from "../../orderStatus";

type StatusFilter = ProjectStatus | "all";

// Sapaan mengikuti jam lokal browser. useSyncExternalStore dipakai agar render server
// (zona waktu server) tidak bentrok dengan client: saat hidrasi React memakai
// serverSnapshot, lalu otomatis render ulang dengan nilai client tanpa setState di effect.
const subscribeToClock = () => () => {};
const getGreetingSnapshot = () => getPMGreeting(new Date());
const getGreetingServerSnapshot = () => "Selamat siang";

interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: "secondary" | "blue" | "green" | "red";
}

const statToneClasses = {
  secondary: {
    icon: "bg-secondary/12 text-secondary",
  },
  blue: {
    icon: "bg-blue-400/10 text-blue-300",
  },
  green: {
    icon: "bg-emerald-400/10 text-emerald-300",
  },
  red: {
    icon: "bg-red-400/10 text-red-300",
  },
};

function StatCard({ label, value, hint, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-outline/30 bg-surface-container-low p-5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statToneClasses[tone].icon}`}>
        <Icon size={19} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">{value}</p>
          <span className="truncate text-[10px] text-on-surface-variant/70">{hint}</span>
        </div>
      </div>
    </div>
  );
}

export function PMDashboard() {
  const { orders } = usePMOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const greeting = useSyncExternalStore(subscribeToClock, getGreetingSnapshot, getGreetingServerSnapshot);

  const priorityOrders = useMemo(() => orders.filter(needsDrawingApproval), [orders]);

  const metrics = useMemo(
    () => ({
      total: orders.length,
      waiting: priorityOrders.length,
      production: orders.filter((order) => order.projectStatus === "produksi").length,
      completed: orders.filter((order) => order.projectStatus === "selesai").length,
    }),
    [orders, priorityOrders.length],
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.projectStatus === statusFilter;
      const matchesSearch = !normalizedSearch || order.contractorCode.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const latestEnteredAt = orders.reduce<string | undefined>((latest, order) => {
    if (!latest || order.enteredAt > latest) return order.enteredAt;
    return latest;
  }, undefined);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
            <span className="inline-flex items-center gap-1.5 text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_0_4px_rgba(219,165,1,0.12)]" />
              Modul Produksi
            </span>
            <span className="text-outline">•</span>
            <span>{latestEnteredAt ? getPMDayLabel(latestEnteredAt) : "Belum ada order"}</span>
          </div>
          <h2 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            {greeting}, Project Manager<span className="text-secondary">.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Pantau order, koordinasikan perubahan, dan pastikan setiap proyek siap masuk produksi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/pm/approval"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-outline/40 bg-surface-container px-4 py-2.5 text-xs font-bold text-on-surface transition-all hover:border-secondary/50 hover:text-secondary md:min-h-0"
          >
            <ClipboardCheck size={15} />
            Review Gambar
            {metrics.waiting > 0 && <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] text-primary">{metrics.waiting}</span>}
          </Link>
          <Link
            href="/pm/orders/create"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-all hover:-translate-y-0.5 hover:brightness-105 md:min-h-0"
          >
            <FilePlus2 size={15} strokeWidth={2.5} />
            Tambah Order Baru
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Proyek" value={metrics.total} hint="order tercatat" icon={FolderKanban} tone="secondary" />
        <StatCard label="Menunggu ACC" value={metrics.waiting} hint="perlu keputusan" icon={Clock3} tone="red" />
        <StatCard label="Diproduksi" value={metrics.production} hint="di workshop" icon={PackageCheck} tone="blue" />
        <StatCard label="Selesai" value={metrics.completed} hint="order selesai" icon={CheckCircle2} tone="green" />
      </section>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 rounded-2xl border border-outline/30 bg-surface-container-low">
          <div className="flex flex-col gap-4 border-b border-outline/20 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <LayoutList size={16} />
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-on-surface">Daftar Proyek</h3>
                  <p className="mt-0.5 text-[10px] text-on-surface-variant">Monitor status order dari entry hingga selesai</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-outline/30 bg-surface-variant/50 px-3 py-1.5 text-[10px] font-bold text-on-surface-variant">
                {filteredOrders.length} dari {orders.length} order
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-outline/20 bg-surface-variant/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <label className="group flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-outline/30 bg-surface px-3 sm:max-w-sm focus-within:border-secondary/60">
              <Search size={15} className="shrink-0 text-on-surface-variant/60 transition-colors group-focus-within:text-secondary" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari Kode Produksi Kontraktor..."
                className="min-w-0 flex-1 bg-transparent text-xs text-on-surface outline-none placeholder:text-on-surface-variant/50"
              />
              {search && (
                <button type="button" aria-label="Hapus pencarian" onClick={() => setSearch("")} className="text-on-surface-variant hover:text-on-surface">
                  <X size={14} />
                </button>
              )}
            </label>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-on-surface-variant/60" />
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="h-10 w-full appearance-none rounded-xl border border-outline/30 bg-surface py-2 pl-3 pr-9 text-xs font-semibold text-on-surface outline-none transition-colors focus:border-secondary/60 sm:w-44"
                  aria-label="Filter status proyek"
                >
                  {(Object.keys(statusFilterLabels) as StatusFilter[]).map((status) => (
                    <option key={status} value={status}>{statusFilterLabels[status]}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              </div>
            </div>
          </div>

          {/* Kartu untuk layar kecil (Android) menggantikan tabel yang perlu scroll horizontal. */}
          <div className="md:hidden space-y-3 p-4">
            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-outline/30 bg-primary-container px-4 py-12 text-center shadow-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant">
                  <Search size={20} />
                </div>
                <p className="mt-4 text-sm font-bold text-on-surface">Order tidak ditemukan</p>
                <p className="mt-1 text-xs text-on-surface-variant">Coba ubah kata kunci atau filter status.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-outline/30 bg-primary-container p-4 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-secondary">{order.contractorCode}</p>
                      <p className="mt-1 truncate text-sm font-bold text-on-surface">{order.contractorName}</p>
                    </div>
                    <ProjectStatusBadge status={order.projectStatus} />
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-on-surface-variant">
                    <p className="truncate">Order ID {order.id}</p>
                    <p className="truncate">{order.items.length} item spesifikasi</p>
                    <p>Masuk {formatPMDate(order.enteredAt)}</p>
                    <p>Target {formatPMDate(order.targetDate)}</p>
                    <div className="pt-1.5">
                      <DrawingStatusBadge status={order.drawingStatus} />
                    </div>
                  </div>

                  <div className="mt-4 flex">
                    <Link
                      href={`/pm/orders/${order.id}`}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-colors hover:brightness-105 md:min-h-0"
                    >
                      <ArrowUpRight size={15} />
                      Buka Detail Order
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-surface-variant/35 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
                <tr>
                  <th className="px-5 py-4 font-bold sm:px-6">Kode Produksi</th>
                  <th className="px-5 py-4 font-bold">Nama Kontraktor</th>
                  <th className="px-5 py-4 font-bold">Tanggal Masuk</th>
                  <th className="px-5 py-4 font-bold">Target Selesai</th>
                  <th className="px-5 py-4 font-bold">Status Gambar</th>
                  <th className="px-5 py-4 font-bold sm:px-6">Status Proyek</th>
                  <th className="w-px whitespace-nowrap px-5 py-4 text-right font-bold sm:px-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/15">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant">
                        <Search size={20} />
                      </div>
                      <p className="mt-4 text-sm font-bold text-on-surface">Order tidak ditemukan</p>
                      <p className="mt-1 text-xs text-on-surface-variant">Coba ubah kata kunci atau filter status.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="group transition-colors hover:bg-surface-variant/25">
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-mono text-xs font-bold text-secondary">
                          {order.contractorCode}
                        </p>
                        <p className="mt-1 text-[9px] font-medium text-on-surface-variant/60">{order.id}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-[10px] font-extrabold text-secondary">
                            {getPMInitials(order.contractorName)}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-[170px] truncate text-xs font-bold text-on-surface">{order.contractorName}</p>
                            <p className="mt-0.5 text-[10px] text-on-surface-variant/70">{order.items.length} item spesifikasi</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-on-surface-variant">{formatPMDate(order.enteredAt)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-on-surface-variant">{formatPMDate(order.targetDate)}</td>
                      <td className="px-5 py-4"><DrawingStatusBadge status={order.drawingStatus} /></td>
                      <td className="px-5 py-4 sm:px-6"><ProjectStatusBadge status={order.projectStatus} /></td>
                      <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
                        <Link
                          href={`/pm/orders/${order.id}`}
                          aria-label={`Buka detail order ${order.contractorCode}`}
                          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-outline/40 px-3 py-2 text-[10px] font-bold text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary md:min-h-0"
                        >
                          <ArrowUpRight size={14} />
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-secondary">
                  <CircleAlert size={15} />
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.12em]">Prioritas Hari Ini</h3>
                </div>
                <p className="mt-1.5 text-[10px] text-on-surface-variant">Order yang menunggu keputusan PM</p>
              </div>
              <PMBadge tone={priorityOrders.length > 0 ? "red" : "green"}>{priorityOrders.length} item</PMBadge>
            </div>
            <div className="mt-5 space-y-3">
              {priorityOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline/30 p-5 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-400" size={22} />
                  <p className="mt-2 text-xs font-bold text-on-surface">Semua sudah beres</p>
                  <p className="mt-1 text-[10px] text-on-surface-variant">Tidak ada approval yang tertunda.</p>
                </div>
              ) : (
                priorityOrders.slice(0, 3).map((order) => (
                  <Link key={order.id} href={`/pm/orders/${order.id}`} className="group block rounded-xl border border-outline/25 bg-surface-variant/35 p-3.5 transition-colors hover:border-secondary/40">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${order.drawingStatus === "revisi" ? "bg-red-400/10 text-red-300" : "bg-secondary/10 text-secondary"}`}>
                        {order.drawingStatus === "revisi" ? <TimerReset size={15} /> : <Clock3 size={15} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold text-on-surface">{order.contractorCode}</p>
                          <ArrowUpRight size={13} className="shrink-0 text-on-surface-variant/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary" />
                        </div>
                        <p className="mt-1 truncate text-[10px] text-on-surface-variant">{order.contractorName}</p>
                        <div className="mt-2"><DrawingStatusBadge status={order.drawingStatus} /></div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
