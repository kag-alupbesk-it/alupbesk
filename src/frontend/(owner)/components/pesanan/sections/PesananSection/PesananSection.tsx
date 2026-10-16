"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import * as s from "../../style/style";
import PesananTable from "../PesananTable/PesananTable";
import PesananDetailModal from "../PesananDetailModal/PesananDetailModal";
import TolakModal from "../TolakModal/TolakModal";
import { getPesanan } from "@/frontend/(owner)/services/pesanan/pesanan";
import { getPengiriman } from "@/frontend/(owner)/services/pesanan/pengiriman";
import type { MarketingOrder } from "@/backend/modules/marketing/index";
import type { FieldDelivery } from "@/services/field/types";
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  PROGRESS_STAGES,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_OPTIONS,
} from "../data/data";
import {
  isNewOrder,
  formatDate,
  deliveryStatusColor,
  deliveryStatusBg,
  podStatus,
} from "../helpers/helpers";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { useFocusValue } from "@/frontend/shared/focus/focusStore";

const DELIVERY_VISIBLE = 6;

export default function PesananSection() {
  const loadOrders = useCallback(() => getPesanan(), []);
  const { data: orders, loading, error: loadError } = usePollingResource<MarketingOrder[]>(loadOrders, []);

  const loadDeliveries = useCallback(() => getPengiriman(), []);
  const {
    data: deliveries,
    loading: loadingDeliveries,
    error: deliveryError,
  } = usePollingResource<FieldDelivery[]>(loadDeliveries, []);

  const [searchOverride, setSearchOverride] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<MarketingOrder | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const focus = useFocusValue();

  // Deep-link dari Overview (/owner/pesanan?focus=order-<id>): awali pencarian
  // dengan ID pesanan itu supaya barisnya langsung terlihat, sampai user
  // mengetik/menghapus pencarian sendiri.
  const focusOrderId = focus?.startsWith("order-") ? focus.slice("order-".length) : null;
  const search = searchOverride ?? focusOrderId ?? "";

  const filtered = orders.filter((o) => {
    const matchSearch = search === "" || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.name.toLowerCase().includes(search.toLowerCase()) || o.customer.phone.includes(search);
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / 5));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * 5, safePage * 5);

  function handleSelect(order: MarketingOrder) {
    setSelectedOrder(order);
    if (order.status === "rejected_by_manager") {
      setShowRejected(true);
    } else {
      setShowDetail(true);
    }
  }

  const newOrders = orders.filter(isNewOrder);

  // Ringkasan progres: hitungan tiap tahap alur normal + pesanan yang keluar
  // dari alur (ditolak/batalkan).
  const stageCounts = PROGRESS_STAGES.map((stage) => ({
    ...stage,
    count: orders.filter((o) => o.status === stage.key).length,
  }));
  const rejectedCount = orders.filter((o) => o.status === "rejected_by_manager").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const totalOrders = orders.length;

  const deliveryCounts = DELIVERY_STATUS_OPTIONS.filter((key) => key !== "ALL").map((key) => ({
    key,
    label: DELIVERY_STATUS_LABELS[key],
    count: deliveries.filter((d) => d.status === key).length,
  }));
  const filteredDeliveries = deliveries.filter(
    (d) => deliveryFilter === "ALL" || d.status === deliveryFilter,
  );
  const visibleDeliveries = filteredDeliveries.slice(0, DELIVERY_VISIBLE);

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h3 className={s.title}>Pesanan Masuk</h3>
          <p className={s.subtitle}>
            Pantau progres pesanan dari website sampai selesai, lengkap dengan status surat jalan dan bukti terima. Mode pemantauan (read-only) tanpa aksi.
          </p>
        </div>
      </div>

      {loadError && <p className="mb-4 text-sm text-red-400">{loadError}</p>}

      {/* Ringkasan progres pesanan */}
      <section className="bg-primary-container border border-outline/30 rounded-xl p-5 mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Ringkasan Progres</p>
            <p className="text-2xl font-bold text-on-surface font-headline">
              {totalOrders} <span className="text-sm font-semibold text-on-surface-variant">pesanan</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {newOrders.length > 0 && (
              <span className="px-3 py-1 rounded-pill bg-yellow-400/10 text-yellow-400 font-bold">Baru {newOrders.length}</span>
            )}
            {rejectedCount > 0 && (
              <span className="px-3 py-1 rounded-pill bg-red-400/10 text-red-400 font-bold">Ditolak {rejectedCount}</span>
            )}
            {cancelledCount > 0 && (
              <span className="px-3 py-1 rounded-pill bg-white/5 text-on-surface-variant font-bold">Dibatalkan {cancelledCount}</span>
            )}
            <span className="px-3 py-1 rounded-pill bg-success/10 text-success font-bold">
              Selesai {stageCounts.find((stage) => stage.key === "completed")?.count ?? 0}
            </span>
          </div>
        </div>

        <div className="h-3 w-full rounded-full bg-surface-variant/60 overflow-hidden flex">
          {totalOrders > 0 &&
            stageCounts.map((stage) =>
              stage.count > 0 ? (
                <div
                  key={stage.key}
                  className={`${stage.barBg} h-full transition-all`}
                  style={{ width: `${(stage.count / totalOrders) * 100}%` }}
                  title={`${stage.label}: ${stage.count}`}
                />
              ) : null,
            )}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {stageCounts.map((stage) => (
            <span key={stage.key} className="inline-flex items-center gap-1.5 text-[11px] text-on-surface-variant">
              <span className={`h-2 w-2 rounded-full ${stage.barBg}`} />
              {stage.label}
              <span className={`font-bold ${stage.text}`}>{stage.count}</span>
            </span>
          ))}
        </div>
      </section>

      <div className={s.filterBar}>
        <div className={s.searchCard}>
          <span className={`${s.icon} ${s.searchIcon}`}>search</span>
          <input
            className={s.searchInput}
            placeholder="Cari ID, nama, atau telepon..."
            value={search}
            onChange={(e) => { setSearchOverride(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => { setSearchOverride(""); setPage(1); }} className="text-on-surface-variant hover:text-on-surface">
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
          Menampilkan <span className={s.paginationHighlight}>{paginated.length > 0 ? (safePage - 1) * 5 + 1 : 0}</span> hingga{' '}
          <span className={s.paginationHighlight}>{Math.min(safePage * 5, filtered.length)}</span> dari{' '}
          <span className={s.paginationHighlight}>{filtered.length}</span> pesanan
        </p>
        <div className={s.paginationButtons}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className={s.paginationNav}>SEBELUMNYA</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={`${s.pageButton} ${n === safePage ? s.activePage : s.inactivePage}`}>{n}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className={s.paginationNav}>SELANJUTNYA</button>
        </div>
      </div>

      {/* Panel pengiriman & bukti terima */}
      <section className="bg-primary-container border border-outline/30 rounded-xl p-5 mt-10">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Pengiriman &amp; Bukti Terima</p>
            <p className="text-xs text-on-surface-variant max-w-xl leading-relaxed">
              Status surat jalan beserta kelengkapan bukti terima (tanda tangan penerima dan foto proyek) dari modul lapangan.
            </p>
          </div>
          <Link href="/owner/field" className="text-xs font-bold text-secondary hover:underline shrink-0">
            Buka modul Pengiriman →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <button
            onClick={() => setDeliveryFilter("ALL")}
            className={`rounded-xl border p-4 text-left transition-colors ${deliveryFilter === "ALL" ? "border-secondary/60 bg-secondary/5" : "border-outline/30 hover:border-secondary/40"}`}
          >
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Semua</p>
            <p className="text-xl font-bold text-on-surface font-headline">{deliveries.length}</p>
          </button>
          {deliveryCounts.map((item) => (
            <button
              key={item.key}
              onClick={() => setDeliveryFilter(item.key)}
              className={`rounded-xl border p-4 text-left transition-colors ${deliveryFilter === item.key ? "border-secondary/60 bg-secondary/5" : "border-outline/30 hover:border-secondary/40"}`}
            >
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{item.label}</p>
              <p className={`text-xl font-bold font-headline ${deliveryStatusColor(item.key)}`}>{item.count}</p>
            </button>
          ))}
        </div>

        {deliveryError && <p className="mb-4 text-sm text-red-400">{deliveryError}</p>}

        {loadingDeliveries && deliveries.length === 0 ? (
          <p className="py-10 text-center text-sm text-on-surface-variant">Memuat pengiriman...</p>
        ) : visibleDeliveries.length === 0 ? (
          <div className="py-10 text-center text-on-surface-variant">
            <span className={`${s.icon} text-4xl mb-4 block`}>local_shipping</span>
            <p className="font-bold text-sm">Belum ada surat jalan</p>
            <p className="text-xs mt-1">Pengiriman akan muncul setelah pesanan proyek siap kirim</p>
          </div>
        ) : (
          <div className="divide-y divide-outline/15">
            {visibleDeliveries.map((delivery) => {
              const pod = podStatus(delivery);
              return (
                <div key={delivery.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold text-on-surface">{delivery.kodeProduksi}</p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {delivery.namaKontraktor}{delivery.alamatProyek ? ` · ${delivery.alamatProyek}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-on-surface-variant">{formatDate(delivery.tanggalKirim)}</span>
                    <span className={`${s.statusBadge} ${deliveryStatusBg(delivery.status)}`}>
                      <span className={`${s.statusDot} ${deliveryStatusColor(delivery.status)}`} />
                      {DELIVERY_STATUS_LABELS[delivery.status] ?? delivery.status}
                    </span>
                    <span className={`font-bold ${pod.complete ? "text-success" : "text-orange-400"}`}>POD: {pod.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredDeliveries.length > DELIVERY_VISIBLE && (
          <p className="mt-4 text-xs text-on-surface-variant">
            Menampilkan {DELIVERY_VISIBLE} dari {filteredDeliveries.length} surat jalan — buka modul Pengiriman untuk melihat semua.
          </p>
        )}
      </section>

      <PesananDetailModal
        isOpen={showDetail}
        order={selectedOrder}
        onClose={() => { setShowDetail(false); setSelectedOrder(null); }}
      />

      <TolakModal
        isOpen={showRejected}
        order={selectedOrder}
        onClose={() => { setShowRejected(false); setSelectedOrder(null); }}
      />
    </div>
  );
}
