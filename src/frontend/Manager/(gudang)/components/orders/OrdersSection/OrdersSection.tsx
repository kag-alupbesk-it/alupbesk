"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gudangApi } from "@/services/api/gudang";
import type {
  GudangOrder,
  GudangProcessResult,
  OrderAction,
  SegmentFilter,
  StatusFilter,
} from "../types/types";
import { SEGMEN_FILTER_LABELS, STATUS_FILTER_LABELS } from "../helpers/helpers";
import * as s from "../style/style";
import { OrdersTable } from "../OrdersTable/OrdersTable";
import { OrderDetailModal } from "../OrderDetailModal/OrderDetailModal";
import { OrderActionModal } from "../OrderActionModal/OrderActionModal";

const PAGE_SIZE = 6;

export function GudangOrdersSection() {
  const [orders, setOrders] = useState<GudangOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [segFilter, setSegFilter] = useState<SegmentFilter>("ALL");
  const [segFilterOpen, setSegFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<GudangOrder | null>(null);
  const [actionOrder, setActionOrder] = useState<GudangOrder | null>(null);
  const [action, setAction] = useState<OrderAction | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await gudangApi.getOrders();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    gudangApi
      .getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const flash = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "ALL" && order.status !== filter) return false;
      if (segFilter !== "ALL" && order.segmen !== segFilter) return false;
      if (!needle) return true;
      return (
        order.id.toLowerCase().includes(needle) ||
        order.customer.name.toLowerCase().includes(needle)
      );
    });
  }, [orders, search, filter, segFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage],
  );

  const metrics = useMemo(() => {
    const confirmed = orders.filter((o) => o.status === "confirmed").length;
    const processing = orders.filter((o) => o.status === "processing").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    return { confirmed, processing, completed };
  }, [orders]);

  const closeAction = useCallback(() => {
    setActionOrder(null);
    setAction(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!actionOrder || !action) return;
    setPending(true);
    try {
      if (action === "process") {
        const result: GudangProcessResult = await gudangApi.processOrder(actionOrder.id);
        if (!result.ok) return;
        const failed = result.deductions.filter((d) => !d.ok);
        if (failed.length > 0) {
          flash(`Diproses. ${failed.length} item dilewati karena tidak terdaftar di gudang: ${failed.map((d) => d.title).join(", ")}`);
        } else {
          flash("Pesanan diproses, stok gudang telah dipotong.");
        }
      } else {
        await gudangApi.completeOrder(actionOrder.id);
        flash("Pesanan ditandai selesai dikirim.");
      }
      closeAction();
      await load();
    } catch (error) {
      flash(error instanceof Error ? error.message : "Gagal memproses pesanan.");
    } finally {
      setPending(false);
    }
  }, [actionOrder, action, flash, closeAction, load]);

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <div className={s.header}>
          <div>
            <div className={s.headerLeft}>
              <h1 className={s.headerTitle}>Pesanan Gudang</h1>
              <span className={s.badge}>Distribution</span>
            </div>
            <p className={s.headerSubtitle}>
              Kelola pesanan yang sudah disetujui manajer: proses pengambilan stok hingga pengiriman selesai.
            </p>
          </div>
        </div>

        {notice && (
          <div className="mb-6 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-xs text-secondary animate-fadeIn">
            {notice}
          </div>
        )}

        <div className={s.metricGrid}>
          <div className={s.metricCard}>
            <div className={s.metricLabel}>Menunggu Proses</div>
            <div className={`${s.metricValue} text-blue-400`}>{metrics.confirmed}</div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricLabel}>Dalam Proses</div>
            <div className={`${s.metricValue} text-yellow-400`}>{metrics.processing}</div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricLabel}>Selesai</div>
            <div className={`${s.metricValue} text-success`}>{metrics.completed}</div>
          </div>
        </div>

        <div className={s.filterBar}>
          <div className={s.searchWrapper}>
            <span className={s.searchIcon}>search</span>
            <input
              className={s.searchInput}
              placeholder="Cari ID order atau nama pelanggan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className={s.filterCard} onClick={() => setSegFilterOpen((open) => !open)}>
            <span className={s.filterCardLabel}>{SEGMEN_FILTER_LABELS[segFilter]}</span>
            <span className={s.expandIcon}>{segFilterOpen ? "expand_less" : "expand_more"}</span>
            {segFilterOpen && (
              <div className={s.dropdown}>
                {(Object.keys(SEGMEN_FILTER_LABELS) as SegmentFilter[]).map((option) => (
                  <button
                    key={option}
                    className={`${s.dropdownItem} ${segFilter === option ? s.dropdownActive : s.dropdownInactive}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSegFilter(option);
                      setPage(0);
                      setSegFilterOpen(false);
                    }}
                  >
                    {SEGMEN_FILTER_LABELS[option]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={s.filterCard} onClick={() => setFilterOpen((open) => !open)}>
            <span className={s.filterCardLabel}>{STATUS_FILTER_LABELS[filter]}</span>
            <span className={s.expandIcon}>{filterOpen ? "expand_less" : "expand_more"}</span>
            {filterOpen && (
              <div className={s.dropdown}>
                {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((option) => (
                  <button
                    key={option}
                    className={`${s.dropdownItem} ${filter === option ? s.dropdownActive : s.dropdownInactive}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilter(option);
                      setPage(0);
                      setFilterOpen(false);
                    }}
                  >
                    {STATUS_FILTER_LABELS[option]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className={`${s.tableCard} ${s.emptyCell}`}>Memuat pesanan...</div>
        ) : (
          <OrdersTable
            orders={pageItems}
            onOpenDetail={setDetail}
            onAction={(order, act) => {
              setActionOrder(order);
              setAction(act);
            }}
          />
        )}

        <div className={s.pagination}>
          <span className={s.paginationText}>
            Menampilkan{" "}
            <span className={s.paginationHighlight}>
              {filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
            </span>{" "}
            dari {filtered.length} pesanan
          </span>
          <div className={s.paginationButtons}>
            <button className={s.paginationNav} disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
              Sebelumnya
            </button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                className={`${s.pageButton} ${i === safePage ? s.activePage : s.inactivePage}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button className={s.paginationNav} disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      <OrderDetailModal order={detail} onClose={() => setDetail(null)} />
      <OrderActionModal
        order={actionOrder}
        action={action}
        pending={pending}
        onConfirm={handleConfirm}
        onClose={closeAction}
      />
    </div>
  );
}
