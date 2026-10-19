"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, FilePlus2, Inbox, Search } from "lucide-react";
import type { CustomRequest } from "@/backend/modules/custom";
import { useCustomRequests } from "@/frontend/shared/customRequests/useCustomRequests";
import { CustomRequestDetailModal } from "@/frontend/shared/customRequests/CustomRequestDetailModal";
import {
  CUSTOM_REQUEST_STATUS_LABELS,
  CUSTOM_REQUEST_STATUS_OPTIONS,
  customStatusBadgeClass,
} from "@/frontend/shared/customRequests/labels";
import { PMBadge } from "../shared/PMBadge/PMBadge";
import type { CustomStatusTone } from "@/frontend/shared/customRequests/labels";

const statStyles: Record<CustomStatusTone, string> = {
  neutral: "text-slate-300",
  blue: "text-blue-300",
  violet: "text-violet-300",
  green: "text-emerald-300",
  red: "text-red-300",
};

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function PMPesananPage() {
  const router = useRouter();
  const { data: requests, loading, error: loadError } = useCustomRequests();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = useMemo(
    () =>
      requests.filter((request) => {
        const matchSearch =
          search.trim() === "" ||
          request.nama.toLowerCase().includes(search.toLowerCase()) ||
          (request.kode ?? "").toLowerCase().includes(search.toLowerCase()) ||
          request.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "ALL" || request.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [requests, search, statusFilter],
  );

  const stats = useMemo(
    () => ({
      submitted: requests.filter((request) => request.status === "submitted").length,
      reviewed: requests.filter((request) => request.status === "reviewed").length,
      quoted: requests.filter((request) => request.status === "quoted").length,
      accepted: requests.filter((request) => request.status === "accepted").length,
    }),
    [requests],
  );

  const openDetail = (request: CustomRequest) => {
    setSelectedRequest(request);
    setShowDetail(true);
  };

  const startConversion = () => {
    if (!selectedRequest) return;
    router.push(`/pm/orders/create?from=${selectedRequest.id}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section>
        <Link href="/pm" className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-secondary">
          <ArrowLeft size={14} /> Kembali ke overview
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Pesanan Masuk</h2>
          <PMBadge tone={stats.submitted + stats.reviewed + stats.quoted > 0 ? "red" : "green"} dot>{stats.submitted + stats.reviewed + stats.quoted} perlu tindak lanjut</PMBadge>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          Request kustom dari website. Formatnya disamakan dengan Tambah Order — klik baris lalu &quot;Jadikan Order PM&quot; agar data langsung terisi tanpa mengetik ulang.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pending", stats.submitted, "neutral"],
          ["In Review", stats.reviewed, "blue"],
          ["Quotation Sent", stats.quoted, "violet"],
          ["Approved", stats.accepted, "green"],
        ].map(([label, count, tone]) => (
          <div key={String(label)} className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">{String(label)}</p>
            <p className={`font-headline mt-1 text-2xl font-extrabold ${statStyles[tone as CustomStatusTone]}`}>{count}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-outline/30 bg-surface-container-low">
        <div className="flex flex-col gap-3 border-b border-outline/20 p-5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, kode produksi, atau ID..."
              className="w-full rounded-xl border border-outline/35 bg-surface py-2.5 pl-10 pr-3 text-xs text-on-surface outline-none placeholder:text-on-surface-variant/45 focus:border-secondary/70 focus:ring-2 focus:ring-secondary/10"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-outline/35 bg-surface px-4 py-2.5 pr-8 text-xs font-bold text-on-surface outline-none focus:border-secondary/70"
            >
              {CUSTOM_REQUEST_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "Semua Status" : CUSTOM_REQUEST_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && requests.length === 0 ? (
          <p className="py-20 text-center text-sm text-on-surface-variant">Memuat request kustom...</p>
        ) : loadError && requests.length === 0 ? (
          <p className="py-20 text-center text-sm text-red-300">{loadError}</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <Inbox size={28} className="text-on-surface-variant/50" />
            <p className="mt-3 text-xs font-bold text-on-surface">Tidak ada request yang cocok</p>
            <p className="mt-1 text-[10px] text-on-surface-variant">Ubah kata kunci atau filter status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-outline/20 bg-surface-variant/40">
                  {["Kode Produksi", "Nama Pemesan", "Layanan", "Item", "Target", "Status"].map((heading) => (
                    <th key={heading} className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/15">
                {filtered.map((request) => (
                  <tr key={request.id} onClick={() => openDetail(request)} className="cursor-pointer transition-colors hover:bg-surface-variant/30">
                    <td className="px-5 py-4 font-mono text-[11px] font-bold text-secondary">{request.kode?.trim() || request.id.slice(0, 8)}</td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-on-surface">{request.nama}</p>
                      <p className="mt-0.5 text-[10px] text-on-surface-variant">{request.telp}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">{request.layanan}</td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">{request.items.length} item</td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">{formatDate(request.deadline)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${customStatusBadgeClass(request.status)}`}>
                        {CUSTOM_REQUEST_STATUS_LABELS[request.status] ?? request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CustomRequestDetailModal
        isOpen={showDetail}
        request={selectedRequest}
        canEditStatus={false}
        onClose={() => { setShowDetail(false); setSelectedRequest(null); }}
        extraActions={
          selectedRequest && selectedRequest.status !== "accepted" ? (
            <button
              onClick={(event) => { event.stopPropagation(); startConversion(); }}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm font-bold text-secondary transition-colors hover:bg-secondary/20"
            >
              <FilePlus2 size={16} /> Jadikan Order PM
            </button>
          ) : selectedRequest && selectedRequest.status === "accepted" ? (
            <span className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/8 px-4 py-3 text-sm font-bold text-emerald-300">
              <CheckCircle2 size={16} /> Sudah jadi proyek
            </span>
          ) : undefined
        }
      />
    </div>
  );
}