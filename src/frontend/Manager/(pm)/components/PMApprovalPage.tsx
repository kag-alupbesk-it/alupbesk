"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FileDiff,
  Info,
  MessageSquareText,
  Plus,
  RotateCcw,
  Send,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { usePMOrders } from "../context/PMOrderContext";
import { formatPMDate, getPMInitials } from "./shared/date";
import { DrawingPreview } from "./shared/DrawingPreview";
import { DownloadDrawingButton } from "./shared/DownloadDrawingButton";
import { DrawingStatusBadge, PMBadge, ProjectStatusBadge } from "./shared/PMBadge";
import type { PMOrder } from "../types";
import { needsDrawingApproval } from "../orderStatus";

type ListMode = "review" | "all";
type Feedback = { type: "success" | "error"; message: string };

function getRevisionNumber(order: PMOrder) {
  return order.revisionCount + 1;
}

export function PMApprovalPage() {
  const { orders, approveOrder, requestRevision } = usePMOrders();
  const [selectedId, setSelectedId] = useState<string | undefined>(orders.find((order) => order.hasProductionDrawing)?.id);
  const [listMode, setListMode] = useState<ListMode>("review");
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [zoom, setZoom] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const ordersWithProduction = useMemo(() => orders.filter((order) => order.hasProductionDrawing), [orders]);
  const reviewOrders = useMemo(() => ordersWithProduction.filter(needsDrawingApproval), [ordersWithProduction]);
  const visibleOrders = listMode === "review" ? reviewOrders : ordersWithProduction;
  const selectedOrder = useMemo(
    () => visibleOrders.find((order) => order.id === selectedId) ?? visibleOrders[0],
    [selectedId, visibleOrders],
  );
  const revisionNote = selectedOrder ? revisionNotes[selectedOrder.id] ?? selectedOrder.revisionNote ?? "" : "";
  const pendingCount = reviewOrders.length;

  const handleSelect = (order: PMOrder) => {
    setSelectedId(order.id);
    setZoom(1);
    setFeedback(null);
  };

  const handleApprove = () => {
    if (!selectedOrder) return;
    approveOrder(selectedOrder.id);
    setFeedback({ type: "success", message: `Gambar ${selectedOrder.contractorCode} disetujui. Order masuk status Siap Produksi.` });
    if (listMode === "review") {
      const nextOrder = visibleOrders.find((order) => order.id !== selectedOrder.id);
      setSelectedId(nextOrder?.id);
    }
    setRevisionNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      delete nextNotes[selectedOrder.id];
      return nextNotes;
    });
  };

  const handleRequestRevision = () => {
    if (!selectedOrder || !revisionNote.trim()) {
      setFeedback({ type: "error", message: "Tambahkan catatan revisi sebelum mengirim ke kontraktor." });
      return;
    }
    requestRevision(selectedOrder.id, revisionNote);
    setFeedback({ type: "success", message: `Catatan revisi untuk ${selectedOrder.contractorCode} siap dikirim melalui komunikasi internal.` });
    setRevisionNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      delete nextNotes[selectedOrder.id];
      return nextNotes;
    });
  };

  const handleListModeChange = (mode: ListMode) => {
    setListMode(mode);
    if (mode === "review" && selectedOrder?.drawingStatus === "acc_gambar") {
      setSelectedId(reviewOrders[0]?.id);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section>
        <Link href="/pm" className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-secondary">
          <ArrowLeft size={14} /> Kembali ke overview
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Approval Gambar</h2>
          <PMBadge tone={pendingCount > 0 ? "red" : "green"} dot>{pendingCount} perlu review</PMBadge>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">Bandingkan gambar mentah kontraktor dengan gambar produksi tim teknis sebelum proyek masuk antrean produksi.</p>
      </section>

      {feedback && (
        <div role={feedback.type === "error" ? "alert" : "status"} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs ${feedback.type === "error" ? "border-red-400/25 bg-red-400/10 text-red-300" : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"}`}>
          {feedback.type === "error" ? <CircleAlert size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} className="ml-auto text-current/70 hover:text-current">Tutup</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-outline/30 bg-surface-container-low">
          <div className="border-b border-outline/20 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-sm font-bold text-on-surface">Daftar Order</h3>
                <p className="mt-1 text-[10px] text-on-surface-variant">Gambar produksi sudah diunggah tim teknis</p>
              </div>
              <span className="text-[10px] font-bold text-secondary">{ordersWithProduction.length} file</span>
            </div>
            <div className="mt-4 grid grid-cols-2 rounded-lg border border-outline/25 bg-surface-variant/50 p-1">
              <button type="button" aria-pressed={listMode === "review"} onClick={() => handleListModeChange("review")} className={`rounded-md px-2 py-2 text-[10px] font-bold transition-colors ${listMode === "review" ? "bg-surface text-secondary shadow-sm" : "text-on-surface-variant"}`}>
                Perlu review <span className="ml-1 opacity-60">{reviewOrders.length}</span>
              </button>
              <button type="button" aria-pressed={listMode === "all"} onClick={() => handleListModeChange("all")} className={`rounded-md px-2 py-2 text-[10px] font-bold transition-colors ${listMode === "all" ? "bg-surface text-secondary shadow-sm" : "text-on-surface-variant"}`}>
                Semua <span className="ml-1 opacity-60">{ordersWithProduction.length}</span>
              </button>
            </div>
          </div>
          <div className="max-h-[650px] space-y-2 overflow-y-auto p-3">
            {visibleOrders.length === 0 ? (
              <div className="px-4 py-14 text-center">
                <CheckCircle2 className="mx-auto text-emerald-400" size={24} />
                <p className="mt-3 text-xs font-bold text-on-surface">Tidak ada order menunggu</p>
                <p className="mt-1 text-[10px] text-on-surface-variant">Semua gambar sudah direview.</p>
              </div>
            ) : (
              visibleOrders.map((order) => {
                const active = selectedOrder?.id === order.id;
                return (
                  <button key={order.id} type="button" onClick={() => handleSelect(order)} className={`w-full rounded-xl border p-3.5 text-left transition-all ${active ? "border-secondary/45 bg-secondary/8 shadow-sm" : "border-outline/20 bg-surface-variant/25 hover:border-outline/40"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-extrabold ${active ? "bg-secondary text-primary" : "bg-surface text-secondary"}`}>
                        {getPMInitials(order.contractorName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate font-mono text-[11px] font-bold ${active ? "text-secondary" : "text-on-surface"}`}>{order.contractorCode}</p>
                          <ChevronRight size={14} className={active ? "text-secondary" : "text-on-surface-variant/50"} />
                        </div>
                        <p className="mt-1 truncate text-[10px] text-on-surface-variant">{order.contractorName}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5"><DrawingStatusBadge status={order.drawingStatus} /></div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-outline/15 pt-2.5 text-[9px] text-on-surface-variant/70">
                      <span>Target {formatPMDate(order.targetDate)}</span>
                      <span className="font-bold">Rev {String(getRevisionNumber(order)).padStart(2, "0")}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {selectedOrder ? (
          <section className="min-w-0 rounded-2xl border border-outline/30 bg-surface-container-low">
            <div className="flex flex-col justify-between gap-4 border-b border-outline/20 p-5 sm:flex-row sm:items-start sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><FileDiff size={19} /></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-headline text-lg font-extrabold text-on-surface">{selectedOrder.contractorCode}</h3>
                    <DrawingStatusBadge status={selectedOrder.drawingStatus} />
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">{selectedOrder.contractorName} · Order {selectedOrder.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ProjectStatusBadge status={selectedOrder.projectStatus} />
                <Link href={`/pm/orders/${selectedOrder.id}`} className="rounded-lg border border-outline/30 p-2 text-on-surface-variant transition-colors hover:border-secondary/40 hover:text-secondary" aria-label="Buka detail proyek">
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface">Perbandingan Gambar</h4>
                  <p className="mt-1 text-[10px] text-on-surface-variant">Pastikan detail material, dimensi, dan sambungan sudah sesuai.</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-outline/25 bg-surface p-1">
                  <button type="button" onClick={() => setZoom((current) => Math.max(0.8, Number((current - 0.1).toFixed(1))))} aria-label="Perkecil gambar" className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"><ZoomOut size={14} /></button>
                  <span className="min-w-10 text-center text-[9px] font-bold text-on-surface-variant">{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={() => setZoom((current) => Math.min(1.4, Number((current + 0.1).toFixed(1))))} aria-label="Perbesar gambar" className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"><ZoomIn size={14} /></button>
                  <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom" className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"><RotateCcw size={13} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-blue-400/25 bg-slate-100">
                  <div className="flex items-center justify-between border-b border-blue-400/20 bg-blue-400/8 px-3.5 py-3">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-400" /><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-blue-300">Gambar Mentah (Kontraktor)</p></div>
                    <div className="flex items-center gap-2">
                      <DownloadDrawingButton
                        scopeId={`pm-approval-raw-${selectedOrder.id}`}
                        fileName={selectedOrder.rawImageName || `gambar-mentah-${selectedOrder.id}.svg`}
                        className="border-blue-400/40 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20"
                      />
                      <span className="text-[9px] font-bold text-blue-300/70">REV 01</span>
                    </div>
                  </div>
                  <div className="h-[280px] overflow-hidden sm:h-[360px]"><div className="h-full w-full" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}><DrawingPreview order={selectedOrder} kind="raw" scopeId={`pm-approval-raw-${selectedOrder.id}`} /></div></div>
                  <div className="border-t border-blue-400/15 bg-blue-400/5 px-3.5 py-2.5 text-[9px] text-on-surface-variant">{selectedOrder.rawImageName ?? "Sketsa/design awal kontraktor"}</div>
                </div>
                <div className="overflow-hidden rounded-xl border border-secondary/30 bg-slate-100">
                  <div className="flex items-center justify-between border-b border-secondary/25 bg-secondary/8 px-3.5 py-3">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-secondary" /><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-secondary">Gambar Produksi (Tim Teknis)</p></div>
                    <div className="flex items-center gap-2">
                      <DownloadDrawingButton
                        scopeId={`pm-approval-production-${selectedOrder.id}`}
                        fileName={selectedOrder.productionImageName || `gambar-matang-${selectedOrder.id}.svg`}
                      />
                      <span className="text-[9px] font-bold text-secondary/70">REV {String(getRevisionNumber(selectedOrder)).padStart(2, "0")}</span>
                    </div>
                  </div>
                  <div className="h-[280px] overflow-hidden sm:h-[360px]"><div className="h-full w-full" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}><DrawingPreview order={selectedOrder} kind="production" scopeId={`pm-approval-production-${selectedOrder.id}`} /></div></div>
                  <div className="border-t border-secondary/20 bg-secondary/5 px-3.5 py-2.5 text-[9px] text-on-surface-variant">{selectedOrder.productionImageName ?? "Draft gambar produksi tim teknis"}</div>
                </div>
              </div>

              <div className="mt-6 border-t border-outline/20 pt-5">
                {selectedOrder.drawingStatus === "acc_gambar" ? (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/8 p-4">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
                    <div>
                      <p className="text-sm font-bold text-emerald-300">Gambar sudah disetujui</p>
                      <p className="mt-1 text-[10px] text-on-surface-variant">Order ini sudah berstatus Siap Produksi dan siap dijadwalkan.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">Keputusan PM</h4>
                        <p className="mt-1 text-[10px] text-on-surface-variant">Catatan revisi akan menjadi acuan komunikasi berikutnya dengan kontraktor.</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60">Internal action</span>
                    </div>
                    <label htmlFor="revision-note" className="mt-4 block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Catatan Revisi dari Kontraktor</label>
                    <div className="relative mt-2">
                      <MessageSquareText size={15} className="pointer-events-none absolute left-3.5 top-3.5 text-on-surface-variant/50" />
                      <textarea
                        id="revision-note"
                        value={revisionNote}
                        onChange={(event) => {
                          const note = event.target.value;
                          setRevisionNotes((currentNotes) => ({
                            ...currentNotes,
                            [selectedOrder.id]: note,
                          }));
                        }}
                        rows={3}
                        placeholder="Contoh: Mohon perjelas detail sambungan dan tambahkan dimensi..."
                        className="w-full resize-none rounded-xl border border-outline/35 bg-surface py-3 pl-10 pr-3 text-xs leading-relaxed text-on-surface outline-none placeholder:text-on-surface-variant/45 focus:border-secondary/70 focus:ring-2 focus:ring-secondary/10"
                      />
                    </div>
                    {selectedOrder.revisionNote && !revisionNote && <p className="mt-2 text-[10px] text-red-300">Catatan sebelumnya: {selectedOrder.revisionNote}</p>}
                    <div className="mt-4 flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
                      <button type="button" onClick={handleRequestRevision} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/35 px-4 py-2.5 text-[10px] font-bold text-red-300 transition-colors hover:bg-red-400/10">
                        <Send size={14} /> Minta Revisi
                      </button>
                      <button type="button" onClick={handleApprove} className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-[10px] font-extrabold text-primary shadow-lg shadow-secondary/15 transition-all hover:brightness-105">
                        <Check size={15} strokeWidth={2.5} /> ACC Gambar
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-outline/15 pt-4 text-[9px] text-on-surface-variant/70">
                <span className="inline-flex items-center gap-1.5"><SlidersHorizontal size={12} /> {selectedOrder.items.length} item spesifikasi</span>
                <span className="inline-flex items-center gap-1.5"><Info size={12} /> {selectedOrder.lastActivity}</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-dashed border-outline/35 bg-surface-container-low p-8 text-center">
            <ClipboardCheck size={30} className="text-on-surface-variant/50" />
            <h3 className="mt-4 font-headline text-lg font-bold text-on-surface">Belum ada gambar untuk direview</h3>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-on-surface-variant">Order dengan gambar produksi yang diunggah tim teknis akan muncul di daftar ini.</p>
            <Link href="/pm/orders/create" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-primary"><Plus size={15} /> Tambah Order Baru</Link>
          </section>
        )}
      </div>
    </div>
  );
}
