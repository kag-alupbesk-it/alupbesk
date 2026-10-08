"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gudangApi } from "@/services/api/gudang";
import type {
  ProjectOrder,
  ProjectOrderAction,
  ProjectProcessResult,
  StatusFilter,
} from "../shared/types";
import { STATUS_FILTER_LABELS } from "../shared/helpers";
import * as s from "../shared/style";
import { ProjectOrdersTable } from "../ProjectOrdersTable/ProjectOrdersTable";
import { ProjectOrderDetailModal } from "../ProjectOrderDetailModal/ProjectOrderDetailModal";
import { ProjectOrderActionModal } from "../ProjectOrderActionModal/ProjectOrderActionModal";

const PAGE_SIZE = 6;

export function ProjectOrdersSection() {
  const [orders, setOrders] = useState<ProjectOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<ProjectOrder | null>(null);
  const [actionOrder, setActionOrder] = useState<ProjectOrder | null>(null);
  const [action, setAction] = useState<ProjectOrderAction | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<ProjectOrder | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await gudangApi.getProjectOrders();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    gudangApi
      .getProjectOrders()
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
      if (!needle) return true;
      return (
        order.id.toLowerCase().includes(needle) ||
        order.namaProyek.toLowerCase().includes(needle) ||
        order.pelanggan.toLowerCase().includes(needle)
      );
    });
  }, [orders, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage],
  );

  const metrics = useMemo(() => {
    const diajukan = orders.filter((o) => o.status === "diajukan").length;
    const diproses = orders.filter((o) => o.status === "diproses").length;
    const selesai = orders.filter((o) => o.status === "selesai").length;
    return { diajukan, diproses, selesai };
  }, [orders]);

  const closeAction = useCallback(() => {
    setActionOrder(null);
    setAction(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!actionOrder || !action) return;
    setPending(true);
    try {
      if (action === "proses") {
        const result: ProjectProcessResult = await gudangApi.prosesProjectOrder(actionOrder.id);
        if (!result.ok) return;
        const failed = result.failed ?? [];
        if (failed.length > 0) {
          flash(`Diproses. ${failed.length} item dilewati karena tidak terdaftar di gudang: ${failed.map((d) => d.nama).join(", ")}`);
        } else {
          flash("Pesanan proyek diproses, stok item proyek telah dipotong.");
        }
      } else {
        await gudangApi.selesaiProjectOrder(actionOrder.id);
        flash("Pesanan proyek ditandai selesai dikirim.");
      }
      closeAction();
      await load();
    } catch (error) {
      flash(error instanceof Error ? error.message : "Gagal memproses pesanan.");
    } finally {
      setPending(false);
    }
  }, [actionOrder, action, flash, closeAction, load]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteOrder) return;
    setPending(true);
    try {
      await gudangApi.deleteProjectOrder(deleteOrder.id);
      flash("Pesanan proyek dihapus.");
      setDeleteOrder(null);
      await load();
    } catch (error) {
      flash(error instanceof Error ? error.message : "Gagal menghapus pesanan.");
    } finally {
      setPending(false);
    }
  }, [deleteOrder, flash, load]);

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <div className={s.header}>
          <div>
            <div className={s.headerLeft}>
              <h1 className={s.headerTitle}>Pesanan Proyek</h1>
              <span className={s.badge}>Custom Order</span>
            </div>
            <p className={s.headerSubtitle}>
              Pesanan proyek yang dibuat manajer: proses pengambilan stok barang proyek hingga pengiriman selesai.
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
            <div className={s.metricLabel}>Diajukan</div>
            <div className={`${s.metricValue} text-blue-400`}>{metrics.diajukan}</div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricLabel}>Dalam Proses</div>
            <div className={`${s.metricValue} text-yellow-400`}>{metrics.diproses}</div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricLabel}>Selesai</div>
            <div className={`${s.metricValue} text-success`}>{metrics.selesai}</div>
          </div>
        </div>

        <div className={s.filterBar}>
          <div className={s.searchWrapper}>
            <span className={s.searchIcon}>search</span>
            <input
              className={s.searchInput}
              placeholder="Cari ID pesanan, proyek, atau pelanggan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
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
          <div className={`${s.tableCard} ${s.emptyCell}`}>Memuat pesanan proyek...</div>
        ) : (
          <ProjectOrdersTable
            orders={pageItems}
            onOpenDetail={setDetail}
            onAction={(order, act) => {
              setActionOrder(order);
              setAction(act);
            }}
            onDelete={setDeleteOrder}
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

      <ProjectOrderDetailModal order={detail} onClose={() => setDetail(null)} />
      <ProjectOrderActionModal
        order={actionOrder}
        action={action}
        pending={pending}
        onConfirm={handleConfirmAction}
        onClose={closeAction}
      />

      {deleteOrder && (
        <div className={s.modalOverlay} onClick={() => setDeleteOrder(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div>
                <div className={s.modalTitle}>Hapus Pesanan</div>
                <div className={s.modalSubtitle}>{deleteOrder.id}</div>
              </div>
              <button className={s.modalCloseButton} onClick={() => setDeleteOrder(null)}>
                <span className={s.closeIcon}>close</span>
              </button>
            </div>
            <div className={s.confirmIcon}>
              <span className="material-symbols-outlined text-error">delete</span>
            </div>
            <div className={s.confirmTitle}>Hapus Pesanan Ini?</div>
            <div className={s.confirmText}>
              Pesanan proyek {deleteOrder.id} untuk {deleteOrder.namaProyek} akan dihapus. Hanya pesanan yang masih diajukan yang dapat dihapus.
            </div>
            <div className={s.actionsWrapper}>
              <button className={s.secondaryButton} onClick={() => setDeleteOrder(null)} disabled={pending}>
                Batal
              </button>
              <button className={s.primaryButton} onClick={handleConfirmDelete} disabled={pending}>
                <span className="material-symbols-outlined text-[16px]">
                  {pending ? "progress_activity" : "delete"}
                </span>
                {pending ? "Menghapus..." : "Hapus Pesanan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
