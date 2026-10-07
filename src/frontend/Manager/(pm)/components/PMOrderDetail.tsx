"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Factory,
  FileImage,
  FileText,
  MessageSquareText,
  PackageCheck,
  Play,
  Send,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { usePMOrders } from "../context/PMOrderContext";
import { formatPMDate } from "./shared/date";
import { DrawingPreview } from "./shared/DrawingPreview";
import { DownloadDrawingButton } from "./shared/DownloadDrawingButton";
import { DrawingStatusBadge, PMBadge, ProjectStatusBadge } from "./shared/PMBadge";
import type { PMOrder, ProjectStatus } from "../types";

interface TimelineStep {
  label: string;
  helper: string;
  icon: LucideIcon;
}

const timelineSteps: TimelineStep[] = [
  { label: "Order Entry", helper: "Data order dicatat", icon: FileText },
  { label: "ACC Gambar", helper: "Persetujuan gambar", icon: FileImage },
  { label: "Produksi", helper: "Pembuatan di workshop", icon: Factory },
  { label: "Siap Kirim", helper: "Serah terima order", icon: Truck },
];

function nextProjectStatus(status: ProjectStatus) {
  if (status === "siap_produksi") return "Mulai Produksi";
  if (status === "produksi") return "Tandai Siap Kirim";
  if (status === "siap_kirim") return "Tandai Selesai";
  return null;
}

function Timeline({ order }: { order: PMOrder }) {
  const isFinished = order.projectStatus === "selesai";
  return (
    <div className="relative mt-6">
      <div className="absolute left-[8%] right-[8%] top-5 hidden h-px bg-outline/25 md:block" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-3">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = isFinished || order.stage > index;
          const isCurrent = !isFinished && order.stage === index;
          return (
            <div key={step.label} className="relative flex items-center gap-3 md:block md:text-center">
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-4 border-surface-container-low md:mx-auto ${isComplete ? "bg-emerald-400 text-emerald-950" : isCurrent ? "bg-secondary text-primary shadow-lg shadow-secondary/25" : "bg-surface-variant text-on-surface-variant/60"}`}>
                {isComplete ? <Check size={17} strokeWidth={3} /> : <Icon size={16} strokeWidth={isCurrent ? 2.3 : 1.7} />}
              </div>
              <div className="md:mt-3">
                <p className={`text-xs font-bold ${isComplete ? "text-emerald-300" : isCurrent ? "text-secondary" : "text-on-surface-variant"}`}>{step.label}</p>
                <p className="mt-1 text-[9px] text-on-surface-variant/60">{step.helper}</p>
                {isCurrent && <span className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-secondary"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" /> Sedang berjalan</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailLabel({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-variant text-on-surface-variant"><Icon size={15} /></div>
      <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70">{label}</p><p className="mt-1 truncate text-xs font-bold text-on-surface">{value}</p></div>
    </div>
  );
}

export function PMOrderDetail({ orderId }: { orderId: string }) {
  const { orders, advanceOrder } = usePMOrders();
  const order = orders.find((currentOrder) => currentOrder.id === orderId);
  const nextAction = order ? nextProjectStatus(order.projectStatus) : null;

  if (!order) {
    return (
      <div className="mx-auto flex min-h-[560px] max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant"><FileText size={24} /></div>
        <h2 className="mt-5 font-headline text-2xl font-extrabold text-on-surface">Proyek tidak ditemukan</h2>
        <p className="mt-2 text-sm text-on-surface-variant">Order dengan ID ini tidak tersedia pada data modul PM.</p>
        <Link href="/pm" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-primary"><ArrowLeft size={14} /> Kembali ke dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <Link href="/pm" className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-secondary">
            <ArrowLeft size={14} /> Kembali ke overview
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">{order.contractorCode}</h2>
            <ProjectStatusBadge status={order.projectStatus} />
            <DrawingStatusBadge status={order.drawingStatus} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
            <span>{order.contractorName}</span><span className="text-outline">•</span><span>Order ID {order.id}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {order.projectStatus === "menunggu_acc" ? (
            <Link href="/pm/approval" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-colors hover:brightness-105 md:min-h-0">
              <Clock3 size={14} /> Review Gambar
            </Link>
          ) : nextAction ? (
            <button type="button" onClick={() => advanceOrder(order.id)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-colors hover:brightness-105 md:min-h-0">
              {order.projectStatus === "siap_produksi" ? <Play size={14} /> : order.projectStatus === "produksi" ? <PackageCheck size={14} /> : <CheckCircle2 size={14} />}
              {nextAction}
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-xl border border-outline/30 bg-surface-container-low p-4"><DetailLabel icon={UserRound} label="Kontraktor" value={order.contractorName} /></div>
        <div className="rounded-xl border border-outline/30 bg-surface-container-low p-4"><DetailLabel icon={CalendarDays} label="Tanggal Masuk" value={formatPMDate(order.enteredAt)} /></div>
        <div className="rounded-xl border border-outline/30 bg-surface-container-low p-4"><DetailLabel icon={Clock3} label="Target Selesai" value={formatPMDate(order.targetDate)} /></div>
        <div className="rounded-xl border border-outline/30 bg-surface-container-low p-4"><DetailLabel icon={PackageCheck} label="Total Item" value={`${order.items.length} spesifikasi`} /></div>
      </section>

      <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface">Timeline Proyek</h3>
            <p className="mt-1 text-[10px] text-on-surface-variant">Status order diperbarui oleh PM pada setiap tahap penting.</p>
          </div>
          <PMBadge tone="slate" dot>Last update · {formatPMDate(order.enteredAt)}</PMBadge>
        </div>
        <Timeline order={order} />
      </section>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-outline/30 bg-surface-container-low">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline/20 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300"><PackageCheck size={17} /></div>
                <div><h3 className="font-headline text-base font-bold text-on-surface">Spesifikasi Item</h3><p className="mt-1 text-[10px] text-on-surface-variant">Rincian kebutuhan yang dicatat pada order entry.</p></div>
              </div>
              <span className="rounded-full bg-surface-variant px-2.5 py-1 text-[10px] font-bold text-on-surface-variant">{order.items.length} item</span>
            </div>
            {/* Kartu untuk layar kecil (Android) menggantikan tabel yang perlu scroll horizontal. */}
            <div className="md:hidden space-y-3 p-4">
              {order.items.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-outline/30 bg-primary-container p-4 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-extrabold text-secondary">{String(index + 1).padStart(2, "0")}</p>
                      <p className="mt-1 text-sm font-bold text-on-surface">{item.name}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-surface-variant px-2.5 py-1 text-center">
                      <span className="font-headline text-sm font-extrabold text-on-surface">{item.quantity}</span>
                      <span className="ml-1 text-[10px] text-on-surface-variant">{item.unit}</span>
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-on-surface-variant">
                    <p>Catatan Teknis</p>
                    <p className="text-[11px] leading-relaxed">{item.technicalNote || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-surface-variant/35 text-[9px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70"><tr><th className="px-5 py-3.5 sm:px-6">Nama Item</th><th className="px-5 py-3.5">Kuantitas</th><th className="px-5 py-3.5">Satuan</th><th className="px-5 py-3.5 sm:px-6">Catatan Teknis</th></tr></thead>
                <tbody className="divide-y divide-outline/15">
                  {order.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-surface-variant/20">
                      <td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-[9px] font-extrabold text-secondary">{String(index + 1).padStart(2, "0")}</span><span className="text-xs font-bold text-on-surface">{item.name}</span></div></td>
                      <td className="px-5 py-4 text-xs font-bold text-on-surface">{item.quantity}</td>
                      <td className="px-5 py-4 text-xs text-on-surface-variant">{item.unit}</td>
                      <td className="px-5 py-4 text-[10px] leading-relaxed text-on-surface-variant sm:px-6">{item.technicalNote || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
            <h3 className="font-headline text-base font-bold text-on-surface">Referensi Gambar</h3>
            <p className="mt-1 text-[10px] text-on-surface-variant">Dokumentasi visual untuk komunikasi dan proses persetujuan.</p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-blue-400/20">
                <div className="flex items-center gap-2 border-b border-blue-400/20 bg-blue-400/8 px-3.5 py-3"><span className="h-2 w-2 rounded-full bg-blue-400" /><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-300">Gambar Mentah (Kontraktor)</p></div>
                <div className="h-64"><DrawingPreview order={order} kind="raw" scopeId={`pm-detail-raw-${order.id}`} /></div>
                <div className="flex items-center justify-between gap-2 border-t border-blue-400/15 px-3.5 py-2.5 text-[9px] text-on-surface-variant">
                  <span>{order.rawImageName ?? "Sketsa/design awal kontraktor"}</span>
                  {order.rawImage && (
                    <DownloadDrawingButton
                      scopeId={`pm-detail-raw-${order.id}`}
                      fileName={order.rawImageName || `gambar-mentah-${order.id}`}
                      source={order.rawImage}
                      className="border-blue-400/40 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20"
                    />
                  )}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-secondary/20">
                <div className="flex items-center gap-2 border-b border-secondary/20 bg-secondary/8 px-3.5 py-3"><span className="h-2 w-2 rounded-full bg-secondary" /><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-secondary">Gambar Produksi (Tim Teknis)</p></div>
                <div className="h-64"><DrawingPreview order={order} kind="production" scopeId={`pm-detail-production-${order.id}`} /></div>
                <div className="flex items-center justify-between gap-2 border-t border-secondary/15 px-3.5 py-2.5 text-[9px] text-on-surface-variant">
                  <span>{order.productionImageName ?? "Belum ada gambar produksi"}</span>
                  {order.productionImage && (
                    <DownloadDrawingButton
                      scopeId={`pm-detail-production-${order.id}`}
                      fileName={order.productionImageName || `gambar-matang-${order.id}`}
                      source={order.productionImage}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
            <div className="flex items-center gap-2"><MessageSquareText size={15} className="text-secondary" /><h3 className="text-xs font-bold text-on-surface">Catatan Komunikasi</h3></div>
            {order.revisionNote ? (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/8 p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-red-300">Catatan revisi {order.revisionCount > 1 ? `· ${order.revisionCount}×` : ""}</p>
                <p className="mt-2 text-[10px] leading-relaxed text-on-surface-variant">{order.revisionNote}</p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-outline/30 p-4 text-center"><Send size={18} className="mx-auto text-on-surface-variant/50" /><p className="mt-2 text-[10px] text-on-surface-variant">Belum ada catatan revisi.</p></div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
