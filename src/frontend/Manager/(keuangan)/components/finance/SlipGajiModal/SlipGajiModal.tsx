"use client";

import { useFinance } from "../FinanceStore/FinanceStore";
import { FeedbackToast } from "../ui/FeedbackToast/FeedbackToast";
import { formatBulan, formatRp, formatTanggalPanjang } from "../format/format";
import { hitungGaji, type Penggajian } from "../types/types";
import * as s from "../style/style";

export function SlipGajiModal({ slip, onTutup }: { slip: Penggajian; onTutup: () => void }) {
  const { state, clearToast } = useFinance();
  const sudahBayar = slip.statusBayar === "terbayar";
  const { pendapatan, potongan, netto } = hitungGaji(slip);

  const baris = [
    { label: "Gaji Pokok", nilai: slip.gajiPokok, tanda: "+" as const },
    { label: "Tunjangan", nilai: slip.tunjangan, tanda: "+" as const },
    { label: "Potongan Kasbon/Bon", nilai: slip.potongan, tanda: "-" as const },
  ];

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section role="dialog" aria-modal="true" aria-labelledby="slip-judul" className={`${s.modalPanel} max-w-2xl`}>
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Slip Gaji · {formatBulan(slip.periode)}</p>
            <h3 id="slip-judul" className={s.modalTitle}>
              {slip.nama}
            </h3>
            <p className={`${s.metaText} mt-1`}>
              {slip.jabatan} · {slip.lokasi} · {slip.id}
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
                {sudahBayar ? `Terbayar ${formatTanggalPanjang(slip.tanggalBayar)}` : "Belum dibayar"}
              </dd>
            </div>
            <div className={s.cardCompact}>
              <dt className={s.detailLabel}>Metode pembayaran</dt>
              <dd className={s.detailValue}>{slip.metodeBayar}</dd>
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