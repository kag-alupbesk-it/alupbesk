"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import * as s from "../../style/style";
import { customApi } from "@/services/api/index";
import type { CustomRequest, CustomRequestStatus } from "@/backend/modules/custom";
import { CustomRequestDetailModal } from "@/frontend/shared/customRequests/CustomRequestDetailModal";
import {
  CUSTOM_REQUEST_STATUS_LABELS,
  CUSTOM_REQUEST_STATUS_OPTIONS,
  customStatusBadgeClass,
} from "@/frontend/shared/customRequests/labels";
import { useReadOnly } from "@/frontend/shared/access/AccessModeProvider";

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CustomRequestsSection({
  requests,
  loading,
  error,
  refresh,
}: {
  requests: CustomRequest[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}) {
  const readOnly = useReadOnly();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CustomRequest | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    if (requestId && requests.length > 0) {
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        openDetail(request);
      }
    }
  }, [requestId, requests]);

  const filtered = requests.filter((request) => {
    const matchSearch =
      search === "" ||
      request.nama.toLowerCase().includes(search.toLowerCase()) ||
      request.telp.includes(search) ||
      (request.kode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || request.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    pending: requests.filter((request) => request.status === "submitted").length,
    quoted: requests.filter((request) => request.status === "quoted").length,
    accepted: requests.filter((request) => request.status === "accepted").length,
    total: requests.length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / 5));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * 5, safePage * 5);

  const openDetail = (request: CustomRequest) => {
    setSelected(request);
    setStatusError("");
    setShowDetail(true);
  };

  const handleStatusChange = async (status: CustomRequestStatus) => {
    if (!selected) return;
    setStatusBusy(true);
    setStatusError("");
    try {
      await customApi.updateStatus(selected.id, status);
      refresh();
    } catch (reason) {
      setStatusError(reason instanceof Error ? reason.message : "Status gagal diubah.");
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <>
      {(error || statusError) && (
        <p className="mb-4 text-sm text-red-400">{error || statusError}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          ["Total Request", counts.total, "text-secondary"],
          ["Pending", counts.pending, "text-yellow-400"],
          ["Quotation Sent", counts.quoted, "text-violet-400"],
          ["Approved", counts.accepted, "text-emerald-400"],
        ].map(([label, value, cls]) => (
          <div key={String(label)} className="bg-primary-container border border-outline/30 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{String(label)}</p>
            <p className={`text-2xl font-bold font-headline ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className={s.filterBar}>
        <div className={s.searchCard}>
          <span className={`${s.icon} ${s.searchIcon}`}>search</span>
          <input
            className={s.searchInput}
            placeholder="Cari nama, telepon, atau kode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="text-on-surface-variant hover:text-on-surface">
              <span className={s.icon}>close</span>
            </button>
          )}
        </div>
        <div className={s.filterCard} onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
          <span className={s.filterCardLabel}>Status: {statusFilter === "ALL" ? "Semua" : CUSTOM_REQUEST_STATUS_LABELS[statusFilter]}</span>
          <span className={`${s.icon} ${s.expandIcon}`}>expand_more</span>
          {showStatusDropdown && (
            <div className={s.dropdown}>
              {CUSTOM_REQUEST_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={(e) => { e.stopPropagation(); setStatusFilter(opt); setShowStatusDropdown(false); setPage(1); }}
                  className={`${s.dropdownItem} ${statusFilter === opt ? s.dropdownActive : s.dropdownInactive}`}
                >
                  {opt === "ALL" ? "Semua" : CUSTOM_REQUEST_STATUS_LABELS[opt]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && requests.length === 0 ? (
        <p className="py-20 text-center text-sm text-on-surface-variant">Memuat request kustom...</p>
      ) : paginated.length === 0 ? (
        <p className="py-20 text-center text-sm text-on-surface-variant">Tidak ada request yang cocok.</p>
      ) : (
        <>
          <div className={`${s.tableContainer} hidden md:block`}>
            <table className={s.table}>
              <thead className={s.tableHeaderRow}>
                <tr>
                  <th className={s.tableHeaderCell}>Kode</th>
                  <th className={s.tableHeaderCell}>Nama</th>
                  <th className={s.tableHeaderCell}>Layanan</th>
                  <th className={s.tableHeaderCell}>Target</th>
                  <th className={s.tableHeaderCell}>Status</th>
                </tr>
              </thead>
              <tbody className={s.tableBody}>
                {paginated.map((request) => (
                  <tr key={request.id} className={s.tableRow} onClick={() => openDetail(request)}>
                    <td className={s.tableCell}><span className="font-mono text-xs font-bold text-secondary">{request.kode?.trim() || request.id.slice(0, 8)}</span></td>
                    <td className={s.tableCell}>
                      <p className="font-bold text-on-surface text-sm">{request.nama}</p>
                      <p className="text-xs text-on-surface-variant">{request.telp}</p>
                    </td>
                    <td className={s.tableCell}><span className="text-sm text-on-surface-variant">{request.layanan}</span></td>
                    <td className={s.tableCell}><span className="text-sm text-on-surface-variant">{formatDate(request.deadline)}</span></td>
                    <td className={s.tableCell}>
                      <span className={`${s.statusBadge} ${customStatusBadgeClass(request.status)}`}>
                        {CUSTOM_REQUEST_STATUS_LABELS[request.status] ?? request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`${s.mobileList} md:hidden`}>
            {paginated.map((request) => (
              <button key={request.id} onClick={() => openDetail(request)} className={`${s.card} w-full text-left`}>
                <div className={s.cardTop}>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{request.nama}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{request.layanan}</p>
                  </div>
                  <span className={`${s.statusBadge} ${customStatusBadgeClass(request.status)}`}>
                    {CUSTOM_REQUEST_STATUS_LABELS[request.status] ?? request.status}
                  </span>
                </div>
                <div className={s.cardInfo}>
                  <p>{request.kode?.trim() || request.id.slice(0, 8)} · {request.telp}</p>
                  <p>Target: {formatDate(request.deadline)}</p>
                </div>
              </button>
            ))}
          </div>

          <div className={s.pagination}>
            <p className={s.paginationText}>
              Menampilkan <span className={s.paginationHighlight}>{paginated.length > 0 ? (safePage - 1) * 5 + 1 : 0}</span> hingga{' '}
              <span className={s.paginationHighlight}>{Math.min(safePage * 5, filtered.length)}</span> dari{' '}
              <span className={s.paginationHighlight}>{filtered.length}</span> request
            </p>
            <div className={s.paginationButtons}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className={s.paginationNav}>SEBELUMNYA</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`${s.pageButton} ${n === safePage ? s.activePage : s.inactivePage}`}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className={s.paginationNav}>SELANJUTNYA</button>
            </div>
          </div>
        </>
      )}

      <CustomRequestDetailModal
        isOpen={showDetail}
        request={selected}
        canEditStatus={!readOnly}
        statusBusy={statusBusy}
        onClose={() => { setShowDetail(false); setSelected(null); setStatusError(""); }}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}