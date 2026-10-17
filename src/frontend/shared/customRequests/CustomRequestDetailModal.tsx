"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type {
  CustomRequest,
  CustomRequestStatus,
} from "@/backend/modules/custom";
import {
  CUSTOM_REQUEST_STATUS_LABELS,
  CUSTOM_REQUEST_STATUS_OPTIONS,
  customStatusBadgeClass,
} from "./labels";

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function infoRow(label: string, value?: string) {
  return (
    <div className="flex justify-between gap-3 py-2 text-sm">
      <span className="shrink-0 text-on-surface-variant">{label}</span>
      <span className="text-right font-bold text-on-surface">{value?.trim() || "-"}</span>
    </div>
  );
}

interface CustomRequestDetailModalProps {
  isOpen: boolean;
  request: CustomRequest | null;
  canEditStatus: boolean;
  statusBusy?: boolean;
  onClose: () => void;
  onStatusChange?: (status: CustomRequestStatus) => void;
  extraActions?: ReactNode;
}

export function CustomRequestDetailModal({
  isOpen,
  request,
  canEditStatus,
  statusBusy = false,
  onClose,
  onStatusChange,
  extraActions,
}: CustomRequestDetailModalProps) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:justify-center" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-outline/30 bg-primary-container p-5 shadow-2xl sm:p-6">
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 p-1 text-on-surface-variant transition-colors hover:text-on-surface">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="mb-2">
          <h4 className="font-headline text-xl font-bold text-on-surface">
            Request Kustom
          </h4>
          <p className="text-sm text-on-surface-variant">Detail permintaan jasa custom dari website</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${customStatusBadgeClass(request.status)}`}>
            {CUSTOM_REQUEST_STATUS_LABELS[request.status] ?? request.status}
          </span>
          <span className="rounded-full border border-outline/25 px-2.5 py-0.5 font-mono text-[10px] font-bold text-on-surface-variant">
            {request.id.slice(0, 8)}
          </span>
        </div>

        <div className="mb-6">
          <h5 className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Data Pemesan</h5>
          {infoRow("Nama", request.nama)}
          {infoRow("Kode Produksi", request.kode)}
          {infoRow("Perusahaan", request.perusahaan)}
          {infoRow("Email", request.email)}
          {infoRow("No. WA", request.telp)}
          {infoRow("Alamat Proyek", request.projectAddress)}
          {infoRow("Layanan", request.layanan)}
          {infoRow("Target Deadline", request.deadline)}
          {infoRow("Dibuat", formatDate(request.createdAt))}
        </div>

        <div className="mb-6">
          <h5 className="mb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Spesifikasi Item ({request.items.length})
          </h5>
          {request.items.length === 0 ? (
            <p className="text-sm text-on-surface-variant/60">Belum ada item.</p>
          ) : (
            request.items
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => (
                <div key={item.id} className="mb-3 rounded-xl border border-outline/10 bg-surface-variant/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-on-surface">{item.name}</p>
                    <span className="shrink-0 text-sm font-bold text-secondary">{item.quantity} {item.unit}</span>
                  </div>
                  {item.technicalNote && (
                    <p className="mt-1.5 text-xs text-on-surface-variant">Catatan: {item.technicalNote}</p>
                  )}
                </div>
              ))
          )}
        </div>

        {request.rawImage && (
          <div className="mb-6">
            <h5 className="mb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Gambar Referensi</h5>
            <div className="overflow-hidden rounded-xl border border-outline/25 bg-slate-100">
              <div className="relative h-52 w-full sm:h-64">
                <Image src={request.rawImage} alt="Gambar referensi request custom" fill unoptimized className="object-contain" />
              </div>
              {request.rawImageName && (
                <p className="truncate border-t border-outline/15 bg-surface-variant/40 px-3.5 py-2 text-[10px] text-on-surface-variant">{request.rawImageName}</p>
              )}
            </div>
          </div>
        )}

        {canEditStatus && (
          <div className="mb-4">
            <label htmlFor="custom-request-status" className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Ubah Status
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id="custom-request-status"
                value={request.status}
                disabled={statusBusy}
                onChange={(event) => onStatusChange?.(event.target.value as CustomRequestStatus)}
                className="rounded-xl border border-outline/35 bg-surface px-4 py-2.5 text-xs font-bold text-on-surface outline-none focus:border-secondary/70"
              >
                {CUSTOM_REQUEST_STATUS_OPTIONS.filter((option) => option !== "ALL").map((option) => (
                  <option key={option} value={option}>
                    {CUSTOM_REQUEST_STATUS_LABELS[option] ?? option}
                  </option>
                ))}
              </select>
              {statusBusy && <span className="text-[10px] text-on-surface-variant">Menyimpan...</span>}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-outline/20 pt-4">
          {request.deskripsi && (
            <p className="w-full text-xs leading-relaxed text-on-surface-variant">
              <span className="font-bold uppercase tracking-wider">Deskripsi: </span>
              {request.deskripsi}
            </p>
          )}
          {extraActions}
          <button onClick={onClose} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-outline/30 px-4 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-variant">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}