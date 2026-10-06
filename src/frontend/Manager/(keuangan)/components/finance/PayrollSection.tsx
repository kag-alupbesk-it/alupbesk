"use client";

import { useMemo, useState } from "react";
import { useFinance } from "./FinanceStore";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";
import { SlipGajiModal } from "./SlipGajiModal";
import { formatRp, formatTanggal } from "./format";
import { hitungGaji, type Karyawan } from "./types";
import * as s from "./style";

export function PayrollSection() {
  const { state, totalGaji, gajiBelumDibayar, opsiPos, bayarGaji, clearToast } = useFinance();
  const [filterStatus, setFilterStatus] = useState<"all" | "belum" | "terbayar">("all");
  const [filterLokasi, setFilterLokasi] = useState("all");
  const [cari, setCari] = useState("");
  const [slip, setSlip] = useState<Karyawan | null>(null);

  const daftar = useMemo(() => {
    const query = cari.trim().toLowerCase();
    return state.karyawan.filter((item) => {
      const cocokStatus = filterStatus === "all" || item.statusBayar === filterStatus;
      const cocokLokasi = filterLokasi === "all" || item.lokasi === filterLokasi;
      const cocokCari =
        !query || `${item.nama} ${item.jabatan} ${item.lokasi}`.toLowerCase().includes(query);
      return cocokStatus && cocokLokasi && cocokCari;
    });
  }, [state.karyawan, filterStatus, filterLokasi, cari]);

  const sudahBayar = state.karyawan.filter((item) => item.statusBayar === "terbayar").length;
  const totalTunjangan = state.karyawan.reduce((sum, item) => sum + item.tunjangan + item.lembur, 0);
  const totalPotongan = state.karyawan.reduce(
    (sum, item) => sum + item.potonganBon + item.potonganKasbon,
    0,
  );

  return (
    <div className="space-y-5">
      <div className={s.statGrid}>
        <FinancialStatCard
          label="Total Gaji Bulan Ini"
          value={formatRp(totalGaji)}
          icon={<span className="material-symbols-outlined text-[20px]">payments</span>}
          trend={`${state.karyawan.length} karyawan · periode ${state.karyawan[0]?.periode ?? "-"}`}
          tone="gold"
        />
        <FinancialStatCard
          label="Belum Dibayar"
          value={formatRp(gajiBelumDibayar)}
          icon={<span className="material-symbols-outlined text-[20px]">schedule</span>}
          trend={`${state.karyawan.length - sudahBayar} karyawan menunggu`}
          tone="error"
        />
        <FinancialStatCard
          label="Tunjangan + Lembur"
          value={formatRp(totalTunjangan)}
          icon={<span className="material-symbols-outlined text-[20px]">add_circle</span>}
          trend="Komponen tambahan payroll"
          tone="success"
        />
        <FinancialStatCard
          label="Potongan Bon + Kasbon"
          value={formatRp(totalPotongan)}
          icon={<span className="material-symbols-outlined text-[20px]">remove_circle</span>}
          trend="Potongan dari gaji karyawan"
          tone="neutral"
        />
      </div>

      <section className={s.card}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className={s.sectionTitle}>Daftar Gaji Karyawan</h2>
            <p className={s.sectionSubtitle}>
              Buka slip gaji untuk rincian pendapatan, potongan bon/kasbon, dan tandai pembayaran yang sudah cair.
            </p>
          </div>
          <span className={s.dataCounter}>
            {daftar.length} dari {state.karyawan.length} karyawan
          </span>
        </div>

        <div className={`mt-4 ${s.toolbarRow}`}>
          <label className="sr-only" htmlFor="payroll-cari">
            Cari karyawan
          </label>
          <input
            id="payroll-cari"
            type="search"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
            placeholder="Cari nama atau jabatan..."
            className={s.searchInput}
          />
          <label className="sr-only" htmlFor="payroll-filter-status">
            Filter status pembayaran
          </label>
          <select
            id="payroll-filter-status"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as "all" | "belum" | "terbayar")}
            className={s.filterSelect}
          >
            <option value="all">Semua status</option>
            <option value="belum">Belum dibayar</option>
            <option value="terbayar">Terbayar</option>
          </select>
          <label className="sr-only" htmlFor="payroll-filter-lokasi">
            Filter lokasi
          </label>
          <select
            id="payroll-filter-lokasi"
            value={filterLokasi}
            onChange={(event) => setFilterLokasi(event.target.value)}
            className={s.filterSelect}
          >
            <option value="all">Semua lokasi</option>
            {opsiPos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className={`mt-4 ${s.tableWrap}`}>
          <table className={`${s.table} min-w-[1120px]`}>
            <thead className={s.tableHead}>
              <tr>
                <th scope="col" className={s.th}>
                  Nama
                </th>
                <th scope="col" className={s.th}>
                  Jabatan
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Gaji Pokok
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Tunjangan / Lembur
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Potongan Bon/Kasbon
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Total Netto
                </th>
                <th scope="col" className={s.th}>
                  Status Pembayaran
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((item) => {
                const { netto } = hitungGaji(item);
                return (
                  <tr key={item.id} className={s.tr}>
                    <td className={s.tdStrong}>
                      <p>{item.nama}</p>
                      <p className="mt-0.5 text-[10px] font-normal text-on-surface-variant">{item.lokasi}</p>
                    </td>
                    <td className={s.tdMuted}>{item.jabatan}</td>
                    <td className={`${s.td} text-right text-on-surface`}>{formatRp(item.gajiPokok)}</td>
                    <td className={`${s.td} text-right text-success`}>
                      +{formatRp(item.tunjangan + item.lembur)}
                      <span className="block text-[10px] text-on-surface-variant">
                        {formatRp(item.tunjangan)} tunj · {formatRp(item.lembur)} lembur
                      </span>
                    </td>
                    <td className={`${s.td} text-right text-error`}>
                      -{formatRp(item.potonganBon + item.potonganKasbon)}
                      <span className="block text-[10px] text-on-surface-variant">
                        {formatRp(item.potonganBon)} bon · {formatRp(item.potonganKasbon)} kasbon
                      </span>
                    </td>
                    <td className={`${s.td} text-right font-black text-secondary`}>{formatRp(netto)}</td>
                    <td className={s.td}>
                      {item.statusBayar === "terbayar" ? (
                        <StatusBadge tone="approved" label={`Terbayar ${formatTanggal(item.tanggalBayar)}`} icon="check" />
                      ) : (
                        <StatusBadge tone="pending" label="Belum dibayar" icon="schedule" />
                      )}
                    </td>
                    <td className={`${s.td} text-right`}>
                      <div className={s.actionGroup}>
                        <button
                          type="button"
                          onClick={() => setSlip(item)}
                          aria-label={`Buka slip gaji ${item.nama}`}
                          className={s.ghostButton}
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-[15px] leading-none">
                            receipt_long
                          </span>
                          Slip Gaji
                        </button>
                        <button
                          type="button"
                          onClick={() => bayarGaji(item.id, new Date().toISOString().slice(0, 10))}
                          disabled={item.statusBayar === "terbayar"}
                          aria-label={`Tandai terbayar gaji ${item.nama}`}
                          title="Tandai terbayar"
                          className={s.actionButton}
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-[16px] leading-none">
                            paid
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {daftar.length === 0 && (
                <tr>
                  <td colSpan={8} className={s.emptyRow}>
                    Tidak ada data payroll yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {slip && <SlipGajiModal karyawan={slip} onTutup={() => setSlip(null)} />}
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}