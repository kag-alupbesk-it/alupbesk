"use client";

import { useCallback, useState } from "react";
import * as s from "../../style/style";
import PesananTable from "../PesananTable/PesananTable";
import PesananDetailModal from "../PesananDetailModal/PesananDetailModal";
import KonfirmasiModal from "../KonfirmasiModal/KonfirmasiModal";
import TolakModal from "../TolakModal/TolakModal";
import { marketingApi } from "@/services/api/index";
import type { MarketingOrder } from "@/backend/modules/marketing/index";
import { STATUS_LABELS, STATUS_OPTIONS } from "../data/data";
import { isNewOrder } from "../helpers/helpers";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

export default function PesananSection() {
  const loadOrders = useCallback(() => marketingApi.getOrders(), []);
  const { data: orders, loading, error: loadError, refresh } = usePollingResource<MarketingOrder[]>(loadOrders, []);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<MarketingOrder | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState<MarketingOrder | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = search === "" || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.name.toLowerCase().includes(search.toLowerCase()) || o.customer.phone.includes(search);
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / 5));
  const paginated = filtered.slice((page - 1) * 5, page * 5);

  function handleSelect(order: MarketingOrder) {
    setSelectedOrder(order);
    if (order.status === "rejected_by_manager") {
      setShowRejected(true);
    } else {
      setShowDetail(true);
    }
  }

  function handleOpenConfirm(order: MarketingOrder) {
    setConfirmOrder(order);
    setShowDetail(false);
    setShowConfirm(true);
  }

  async function handleConfirmOrder() {
    if (!confirmOrder) return;
    setError("");
    try {
      await marketingApi.submitOrder(confirmOrder.id);
      refresh();
      setShowConfirm(false);
      setConfirmOrder(null);
      setPage(1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Pesanan gagal dikonfirmasi.");
    }
  }

  const newOrders = orders.filter(isNewOrder);
  const pendingManager = orders.filter((o) => o.status === "submitted_to_manager");
  const confirmed = orders.filter((o) => o.status === "confirmed");
  const rejected = orders.filter((o) => o.status === "rejected_by_manager");

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h3 className={s.title}>Daftar Pesanan Masuk</h3>
          <p className={s.subtitle}>
            Kelola semua Purchase Order dari website, cek kelengkapan data, konfirmasi, dan ajukan verifikasi ke Manajer.
          </p>
        </div>
      </div>

      {(error || loadError) && <p className="mb-4 text-sm text-red-400">{error || loadError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-primary-container border border-outline/30 rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Pesanan Baru</p>
          <p className="text-2xl font-bold text-yellow-400 font-headline">{newOrders.length}</p>
        </div>
        <div className="bg-primary-container border border-outline/30 rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Menunggu Manager</p>
          <p className="text-2xl font-bold text-blue-400 font-headline">{pendingManager.length}</p>
        </div>
        <div className="bg-primary-container border border-outline/30 rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Disetujui</p>
          <p className="text-2xl font-bold text-secondary font-headline">{confirmed.length}</p>
        </div>
        <div className="bg-primary-container border border-outline/30 rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Ditolak</p>
          <p className="text-2xl font-bold text-red-400 font-headline">{rejected.length}</p>
        </div>
      </div>

      <div className={s.filterBar}>
        <div className={s.searchCard}>
          <span className={`${s.icon} ${s.searchIcon}`}>search</span>
          <input
            className={s.searchInput}
            placeholder="Cari ID, nama, atau telepon..."
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
          <span className={s.filterCardLabel}>Status: {statusFilter === "ALL" ? "Semua" : STATUS_LABELS[statusFilter]}</span>
          <span className={`${s.icon} ${s.expandIcon}`}>expand_more</span>
          {showStatusDropdown && (
            <div className={s.dropdown}>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={(e) => { e.stopPropagation(); setStatusFilter(opt); setShowStatusDropdown(false); setPage(1); }}
                  className={`${s.dropdownItem} ${statusFilter === opt ? s.dropdownActive : s.dropdownInactive}`}
                >
                  {opt === "ALL" ? "Semua" : STATUS_LABELS[opt]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-on-surface-variant">Memuat pesanan...</p>
      ) : (
        <PesananTable orders={paginated} onSelect={handleSelect} />
      )}

      <div className={s.pagination}>
        <p className={s.paginationText}>
          Menampilkan <span className={s.paginationHighlight}>{paginated.length > 0 ? (page - 1) * 5 + 1 : 0}</span> hingga{' '}
          <span className={s.paginationHighlight}>{Math.min(page * 5, filtered.length)}</span> dari{' '}
          <span className={s.paginationHighlight}>{filtered.length}</span> pesanan
        </p>
        <div className={s.paginationButtons}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={s.paginationNav}>SEBELUMNYA</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={`${s.pageButton} ${n === page ? s.activePage : s.inactivePage}`}>{n}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={s.paginationNav}>SELANJUTNYA</button>
        </div>
      </div>

      <PesananDetailModal
        isOpen={showDetail}
        order={selectedOrder}
        onClose={() => { setShowDetail(false); setSelectedOrder(null); }}
        onConfirm={handleOpenConfirm}
      />

      <KonfirmasiModal
        isOpen={showConfirm}
        order={confirmOrder}
        onClose={() => { setShowConfirm(false); setConfirmOrder(null); }}
        onConfirm={handleConfirmOrder}
      />

      <TolakModal
        isOpen={showRejected}
        order={selectedOrder}
        onClose={() => { setShowRejected(false); setSelectedOrder(null); }}
      />
    </div>
  );
}
