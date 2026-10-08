"use client";

import { useMemo, useState } from "react";
import type { GudangItem, GudangMovement } from "../shared/types";
import { computeMovementMetrics, formatTanggal, formatWaktu } from "../shared/helpers";
import * as s from "../shared/style";

interface MovementHistorySectionProps {
  movements: GudangMovement[];
  items: GudangItem[];
}

export function MovementHistorySection({ movements, items }: MovementHistorySectionProps) {
  const [filterTujuan, setFilterTujuan] = useState("ALL");
  const itemById = new Map(items.map((item) => [item.id, item]));

  const daftarTujuan = useMemo(
    () => Array.from(new Set(movements.filter((m) => m.tipe === "keluar" && m.tujuan).map((m) => m.tujuan as string))).sort(),
    [movements]
  );

  const filteredMovements = useMemo(() => {
    if (filterTujuan === "ALL") return movements;
    return movements.filter((m) => m.tipe === "keluar" && m.tujuan === filterTujuan);
  }, [movements, filterTujuan]);

  const { totalMasuk, totalKeluar } = computeMovementMetrics(filteredMovements);

  return (
    <div className={`${s.tableCard} mt-6`}>
      <div className={s.movementHeader}>
        <div>
          <h2 className={s.movementTitle}>Riwayat Pergerakan Barang</h2>
          <p className={s.movementSubtitle}>Catatan lengkap barang masuk dan keluar beserta waktunya</p>
        </div>
        <div className={s.movementMetrics}>
          {daftarTujuan.length > 0 && (
            <select value={filterTujuan} onChange={(e) => setFilterTujuan(e.target.value)} className={s.filterSelect}>
              <option value="ALL">Semua Tujuan</option>
              {daftarTujuan.map((tujuan) => (<option key={tujuan} value={tujuan}>{tujuan}</option>))}
            </select>
          )}
          <div className={s.movementMetricCard}>
            <span className={`${s.movementDot} bg-success`} />
            <div>
              <p className={s.movementMetricLabel}>Total Masuk</p>
              <p className={s.movementMetricValue}>{totalMasuk.toLocaleString("id-ID")} unit</p>
            </div>
          </div>
          <div className={s.movementMetricCard}>
            <span className={`${s.movementDot} bg-error`} />
            <div>
              <p className={s.movementMetricLabel}>Total Keluar</p>
              <p className={s.movementMetricValue}>{totalKeluar.toLocaleString("id-ID")} unit</p>
            </div>
          </div>
        </div>
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th scope="col" className={s.th}>Tanggal</th>
              <th scope="col" className={s.th}>Tipe</th>
              <th scope="col" className={s.th}>Item</th>
              <th scope="col" className={s.thRight}>Jumlah</th>
              <th scope="col" className={s.thHiddenSm}>Sumber / Tujuan</th>
              <th scope="col" className={s.thHiddenSm}>Penerima</th>
              <th scope="col" className={s.thHiddenMd}>Bukti Nota</th>
              <th scope="col" className={s.thHiddenMd}>Dicatat</th>
              <th scope="col" className={s.thRight}>Stok Akhir</th>
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan={9} className={s.emptyCell}>
                  {filterTujuan === "ALL"
                    ? "Belum ada pergerakan barang. Catat barang masuk atau keluar untuk melihat riwayatnya."
                    : "Tidak ada pergerakan barang keluar untuk tujuan tersebut."}
                </td>
              </tr>
            ) : (
              filteredMovements.map((movement) => {
                const item = itemById.get(movement.itemId);
                const isMasuk = movement.tipe === "masuk";
                return (
                  <tr key={movement.id} className={s.row}>
                    <td className={s.td}>
                      <span className={s.tanggalText}>{formatTanggal(movement.tanggal)}</span>
                    </td>
                    <td className={s.td}>
                      <span className={isMasuk ? s.tipeMasukBadge : s.tipeKeluarBadge}>
                        {isMasuk ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className={s.td}>
                      <span className={s.skuText}>{item?.sku ?? movement.itemId}</span>
                    </td>
                    <td className={s.tdRight}>
                      <span className={isMasuk ? s.jumlahMasukText : s.jumlahKeluarText}>
                        {isMasuk ? "+" : "-"}{movement.jumlah.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className={s.tdHiddenSm}>
                      <span className={s.movementDetail}>
                        {isMasuk ? movement.sumber : movement.tujuan}
                      </span>
                    </td>
                    <td className={s.tdHiddenSm}>
                      <span className={s.movementDetail}>{isMasuk ? "\u2014" : movement.penerima}</span>
                    </td>
                    <td className={s.tdHiddenMd}>
                      <span className={s.movementDetail}>{movement.buktiNota ?? "\u2014"}</span>
                    </td>
                    <td className={s.tdHiddenMd}>
                      <span className={s.movementDetail}>{formatWaktu(movement.createdAt)}</span>
                    </td>
                    <td className={s.tdRight}>
                      <span className={s.stokValue}>{movement.stokSesudah.toLocaleString("id-ID")}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
