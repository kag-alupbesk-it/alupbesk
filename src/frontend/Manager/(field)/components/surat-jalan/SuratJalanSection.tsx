"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fieldStore } from "../store";
import type { FieldDelivery } from "../types";
import type { FieldFilter } from "../antrean/types";
import { STATUS_FILTER_LABELS } from "../antrean/helpers";
import { FieldDeliveryDetailModal } from "../antrean/FieldDeliveryDetailModal";
import * as s from "./style";
import { SuratJalanTable } from "./SuratJalanTable";
import { SuratJalanFormModal } from "./SuratJalanFormModal";

export function SuratJalanSection() {
  const [deliveries, setDeliveries] = useState<FieldDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FieldFilter>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<FieldDelivery | null>(null);
  const [detail, setDetail] = useState<FieldDelivery | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fieldStore.getDeliveries();
      setDeliveries(data);
      setNotice(null);
    } catch {
      setDeliveries([]);
      setNotice("Gagal memuat data surat jalan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fieldStore
      .getDeliveries()
      .then(setDeliveries)
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return deliveries.filter((delivery) => {
      if (filter !== "ALL" && delivery.status !== filter) return false;
      if (!needle) return true;
      return (
        delivery.id.toLowerCase().includes(needle) ||
        delivery.kodeProduksi.toLowerCase().includes(needle) ||
        delivery.namaKontraktor.toLowerCase().includes(needle)
      );
    });
  }, [deliveries, search, filter]);

  const handleSaved = async () => {
    setFormTarget(null);
    await load();
    setNotice("Surat jalan diterbitkan — kendaraan dicatat dan sisa jumlah barang dihitung ulang.");
  };

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <div className={s.header}>
          <div>
            <div className={s.headerLeft}>
              <h1 className={s.headerTitle}>Surat Jalan</h1>
              <span className={s.badge}>Dokumen Pengiriman</span>
            </div>
            <p className={s.headerSubtitle}>
              Terbitkan surat jalan untuk pengiriman ke proyek — isi data kendaraan dan sesuaikan jumlah barang bila dikirim bertahap.
            </p>
          </div>
        </div>

        {notice && (
          <div className="mb-6 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-xs text-secondary animate-fadeIn">
            {notice}
          </div>
        )}

        <div className={s.filterBar}>
          <div className={s.searchWrapper}>
            <span className={s.searchIcon}>search</span>
            <input
              className={s.searchInput}
              placeholder="Cari kode produksi, kontraktor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        <SuratJalanTable
          deliveries={filtered}
          loading={loading}
          onSelect={setFormTarget}
          onOpenDetail={setDetail}
        />
      </div>

      {formTarget && <SuratJalanFormModal delivery={formTarget} onClose={() => setFormTarget(null)} onSaved={() => void handleSaved()} />}
      <FieldDeliveryDetailModal delivery={detail} onClose={() => setDetail(null)} />
    </div>
  );
}