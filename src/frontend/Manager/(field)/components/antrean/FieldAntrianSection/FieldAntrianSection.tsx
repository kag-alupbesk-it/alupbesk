"use client";

import { useMemo, useState } from "react";
import type { FieldDelivery } from "../../types";
import { useFieldDeliveries } from "../../../hooks/useFieldDeliveries";
import { STATUS_FILTER_LABELS, totalKuantitas, totalTerkirim } from "../shared/helpers";
import type { FieldFilter } from "../shared/types";
import * as s from "../shared/style";
import { FieldAntrianTable } from "../FieldAntrianTable/FieldAntrianTable";
import { FieldDeliveryDetailModal } from "../FieldDeliveryDetailModal/FieldDeliveryDetailModal";

const PAGE_SIZE = 6;

export function FieldAntrianSection() {
  const { deliveries, loading } = useFieldDeliveries();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FieldFilter>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<FieldDelivery | null>(null);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return deliveries.filter((delivery) => {
      if (filter !== "ALL" && delivery.status !== filter) return false;
      if (!needle) return true;
      return (
        delivery.id.toLowerCase().includes(needle) ||
        delivery.kodeProduksi.toLowerCase().includes(needle) ||
        delivery.namaKontraktor.toLowerCase().includes(needle) ||
        delivery.alamatProyek.toLowerCase().includes(needle)
      );
    });
  }, [deliveries, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage],
  );

  const metrics = useMemo(() => {
    const siap = deliveries.filter((d) => d.status === "siap-kirim").length;
    const jalan = deliveries.filter((d) => d.status === "dalam-pengiriman").length;
    const selesai = deliveries.filter((d) => d.status === "selesai-kirim").length;
    const totalAntrean = deliveries.reduce((sum, d) => sum + totalKuantitas(d), 0);
    const totalKirim = deliveries.reduce((sum, d) => sum + totalTerkirim(d), 0);
    return { siap, jalan, selesai, totalAntrean, totalKirim };
  }, [deliveries]);

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <div className={s.header}>
          <div>
            <div className={s.headerLeft}>
              <h1 className={s.headerTitle}>Daftar Pengiriman</h1>
              <span className={s.badge}>Operasional Lapangan</span>
            </div>
            <p className={s.headerSubtitle}>
              Daftar pesanan siap kirim ke lokasi proyek kontraktor — pantau status sampai bukti terima lengkap.
            </p>
          </div>
        </div>

        <div className={s.metricGrid}>
          <div className={s.metricCard}>
            <div className={s.metricLabel}>Siap Kirim</div>
            <div className={`${s.metricValue} text-blue-400`}>{metrics.siap}</div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricLabel}>Dalam Pengiriman</div>
            <div className={`${s.metricValue} text-yellow-400`}>{metrics.jalan}</div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricLabel}>Selesai Kirim</div>
            <div className={`${s.metricValue} text-success`}>{metrics.selesai}</div>
          </div>
        </div>

        <div className={s.filterBar}>
          <div className={s.searchWrapper}>
            <span className={s.searchIcon}>search</span>
            <input
              className={s.searchInput}
              placeholder="Cari kode produksi, kontraktor, atau alamat..."
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
                {(Object.keys(STATUS_FILTER_LABELS) as FieldFilter[]).map((option) => (
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
          <div className={`${s.tableCard} ${s.emptyCell}`}>Memuat pengiriman...</div>
        ) : (
          <FieldAntrianTable deliveries={pageItems} onOpenDetail={setDetail} />
        )}

        <div className={s.pagination}>
          <span className={s.paginationText}>
            Menampilkan{" "}
            <span className={s.paginationHighlight}>
              {filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
            </span>{" "}
            dari {filtered.length} pesanan
          </span>
          <div className={s.paginationButtons}>
            <button
              className={s.paginationNav}
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
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
            <button
              className={s.paginationNav}
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      <FieldDeliveryDetailModal delivery={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
