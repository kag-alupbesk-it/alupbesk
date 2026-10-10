"use client";

import { useFinance } from "../FinanceStore/FinanceStore";
import { FeedbackToast } from "../ui/FeedbackToast/FeedbackToast";
import { formatRp, formatTanggal, formatTanggalPanjang } from "../format/format";
import { hitungGaji, type Karyawan } from "../types/types";
import * as s from "../style/style";

export function SlipGajiModal({ karyawan, onTutup }: { karyawan: Karyawan; onTutup: () => void }) {
  const { state, clearToast } = useFinance();
  const sudahBayar = karyawan.statusBayar === "terbayar";
  const { pendapatan, potongan, netto } = hitungGaji(karyawan);

  const baris = [
    { label: "Gaji Pokok", nilai: karyawan.gajiPokok, tanda: "+" as const },
    { label: "Tunjangan", nilai: karyawan.tunjangan, tanda: "+" as const },
    { label: "Lembur", nilai: karyawan.lembur, tanda: "+" as const },
    { label: "Potongan Kasbon/Bon", nilai: karyawan.potongan, tanda: "-" as const },
  ];

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section role="dialog" aria-modal="true" aria-labelledby="slip-judul" className={`${s.modalPanel} max-w-2xl`}>
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Slip Gaji · Gajian {formatTanggal(karyawan.periode)}</p>
            <h3 id="slip-judul" className={s.modalTitle}>
              {karyawan.nama}
            </h3>
            <p className={`${s.metaText} mt-1`}>
              {karyawan.jabatan} · {karyawan.lokasi} · {karyawan.id}
            </p>
          </div>
          <button type="button" onClick={onTutup} aria-label="Tutup slip gaji" className={s.modalClose}>
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          <div className={s.summaryStrip}>
            <span className={s.fieldLabel}>
              Gaji diterima (netto)
            </span>
            <span className={`${s.modalTitle} text-lg text-secondary`}>{formatRp(netto)}</span>
          </div>

          <div className={s.tableWrapModal}>
            <table className={`${s.table} min-w-[520px]`}>
              <thead className={s.tableHead}>
                <tr>
                  <th scope="col" className={s.th}>
                    Komponen
                  </th>
                  <th scope="col" className={`${s.th} text-right`}>
                    Nominal
                  </th>
                </tr>
              </thead>
              <tbody>
                {baris.map((item) => (
                  <tr key={item.label} className={s.tr}>
                    <td className={s.tdMuted}>{item.label}</td>
                    <td
                      className={`${s.td} text-right font-semibold ${
                        item.tanda === "+" ? "text-success" : "text-error"
                      }`}
                    >
                      {item.tanda}
                      {formatRp(item.nilai)}
                    </td>
                  </tr>
                ))}
                <tr className={s.tr}>
                  <td className={s.tdStrong}>Total pendapatan</td>
                  <td className={`${s.td} ${s.amountStrong} text-success`}>{formatRp(pendapatan)}</td>
                </tr>
                <tr className={s.tr}>
                  <td className={s.tdStrong}>Total potongan</td>
                  <td className={`${s.td} ${s.amountStrong} text-error`}>{formatRp(potongan)}</td>
                </tr>
                <tr className={`${s.tr} border-t-2 border-secondary/40`}>
                  <td className={`${s.tdStrong} text-secondary`}>Gaji diterima (netto)</td>
                  <td className={`${s.td} ${s.amountStrong} text-secondary`}>{formatRp(netto)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            <div className={s.cardCompact}>
              <dt className={s.detailLabel}>Status pembayaran</dt>
              <dd className={s.detailValue}>
                {sudahBayar ? `Terbayar ${formatTanggalPanjang(karyawan.tanggalBayar)}` : "Belum dibayar"}
              </dd>
            </div>
            <div className={s.cardCompact}>
              <dt className={s.detailLabel}>Metode pembayaran</dt>
              <dd className={s.detailValue}>{karyawan.metodeBayar}</dd>
            </div>
            <div className={s.cardCompact}>
              <dt className={s.detailLabel}>Potongan kasbon/bon</dt>
              <dd className={`${s.detailValue} text-error`}>{formatRp(potongan)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                clearToast();
                onTutup();
              }}
              className={s.secondaryButton}
            >
              <span aria-hidden="true" className={s.iconSm}>
                print
              </span>
              Cetak Slip
            </button>
          </div>
        </div>
      </section>
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}