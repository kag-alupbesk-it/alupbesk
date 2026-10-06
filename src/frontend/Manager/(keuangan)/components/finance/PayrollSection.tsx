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
          icon="payments"
          trend={`${state.karyawan.length} karyawan · periode ${state.karyawan[0]?.periode ?? "-"}`}
          tone="gold"
        />
        <FinancialStatCard
          label="Belum Dibayar"
          value={formatRp(gajiBelumDibayar)}
          icon="schedule"
          trend={`${state.karyawan.length - sudahBayar} karyawan menunggu`}
          tone="error"
        />
        <FinancialStatCard
          label="Tunjangan + Lembur"
          value={formatRp(totalTunjangan)}
          icon="add_circle"
          trend="Komponen tambahan payroll"
          tone="success"
        />
        <FinancialStatCard
          label="Potongan Bon + Kasbon"
          value={formatRp(totalPotongan)}
          icon="remove_circle"
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
                      <p className={`${s.metaText} mt-0.5`}>{item.lokasi}</p>
                    </td>
                    <td className={s.tdMuted}>{item.jabatan}</td>
                    <td className={`${s.td} text-right text-on-surface`}>{formatRp(item.gajiPokok)}</td>
                    <td className={`${s.td} text-right text-success`}>
                      +{formatRp(item.tunjangan + item.lembur)}
                      <span className={`${s.metaText} block`}>
                        {formatRp(item.tunjangan)} tunj · {formatRp(item.lembur)} lembur
                      </span>
                    </td>
                    <td className={`${s.td} text-right text-error`}>
                      -{formatRp(item.potonganBon + item.potonganKasbon)}
                      <span className={`${s.metaText} block`}>
                        {formatRp(item.potonganBon)} bon · {formatRp(item.potonganKasbon)} kasbon
                      </span>
                    </td>
                    <td className={`${s.td} ${s.amountStrong} text-secondary`}>{formatRp(netto)}</td>
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
                          <span aria-hidden="true" className={s.iconSm}>
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
                          <span aria-hidden="true" className={s.iconSm}>
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

        <div className={`mt-4 ${s.cardListWrap}`}>
          {daftar.length === 0 && (
            <p className={s.emptyRow}>Tidak ada data payroll yang cocok dengan filter.</p>
          )}
          {daftar.map((item) => {
            const { netto } = hitungGaji(item);
            return (
              <article key={item.id} className={s.cardListItem}>
                <div className={s.cardListHead}>
                  <div className="min-w-0">
                    <p className={`${s.cardListTitle} break-words`}>{item.nama}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {item.jabatan} · {item.lokasi}
                    </p>
                  </div>
                  {item.statusBayar === "terbayar" ? (
                    <StatusBadge tone="approved" label={`Terbayar ${formatTanggal(item.tanggalBayar)}`} icon="check" />
                  ) : (
                    <StatusBadge tone="pending" label="Belum dibayar" icon="schedule" />
                  )}
                </div>

                <div className={s.cardListGrid}>
                  <div>
                    <p className={s.cardListLabel}>Gaji Pokok</p>
                    <p className={s.cardListValue}>{formatRp(item.gajiPokok)}</p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Netto</p>
                    <p className={`${s.cardListValue} font-bold text-secondary`}>{formatRp(netto)}</p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Tunjangan + Lembur</p>
                    <p className={`${s.cardListValue} text-success`}>+{formatRp(item.tunjangan + item.lembur)}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {formatRp(item.tunjangan)} tunj · {formatRp(item.lembur)} lembur
                    </p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Potongan Bon/Kasbon</p>
                    <p className={`${s.cardListValue} text-error`}>-{formatRp(item.potonganBon + item.potonganKasbon)}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {formatRp(item.potonganBon)} bon · {formatRp(item.potonganKasbon)} kasbon
                    </p>
                  </div>
                </div>

                <div className={s.cardListActions}>
                  <button
                    type="button"
                    onClick={() => setSlip(item)}
                    aria-label={`Buka slip gaji ${item.nama}`}
                    className={s.ghostButton}
                  >
                    <span aria-hidden="true" className={s.iconSm}>
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
                    <span aria-hidden="true" className={s.iconSm}>
                      paid
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {slip && <SlipGajiModal karyawan={slip} onTutup={() => setSlip(null)} />}
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}