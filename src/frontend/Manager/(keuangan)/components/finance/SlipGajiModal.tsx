"use client";

import { useFinance } from "./FinanceStore";
import { FeedbackToast } from "./ui/FeedbackToast";
import { formatRp, formatTanggalPanjang, tanggalHariIni } from "./format";
import { hitungGaji, type Karyawan } from "./types";
import * as s from "./style";

export function SlipGajiModal({ karyawan, onTutup }: { karyawan: Karyawan; onTutup: () => void }) {
  const { bayarGaji, state, clearToast } = useFinance();
  const sudahBayar = karyawan.statusBayar === "terbayar";
  const { pendapatan, potongan, netto } = hitungGaji(karyawan);

  const baris = [
    { label: "Gaji Pokok", nilai: karyawan.gajiPokok, tanda: "+" as const },
    { label: "Tunjangan", nilai: karyawan.tunjangan, tanda: "+" as const },
    { label: "Lembur", nilai: karyawan.lembur, tanda: "+" as const },
    { label: "Potongan Bon", nilai: karyawan.potonganBon, tanda: "-" as const },
    { label: "Potongan Kasbon", nilai: karyawan.potonganKasbon, tanda: "-" as const },
  ];

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section role="dialog" aria-modal="true" aria-labelledby="slip-judul" className={`${s.modalPanel} max-w-2xl`}>
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Slip Gaji · Periode {karyawan.periode}</p>
            <h3 id="slip-judul" className="mt-1 text-base font-bold text-on-surface">
              {karyawan.nama}
            </h3>
            <p className="mt-1 text-[10px] text-on-surface-variant">
              {karyawan.jabatan} · {karyawan.lokasi} · {karyawan.id}
            </p>
          </div>
          <button type="button" onClick={onTutup} aria-label="Tutup slip gaji" className={s.modalClose}>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
              close
            </span>
          </button>
        </header>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              Gaji diterima (netto)
            </span>
            <span className="text-lg font-black text-secondary">{formatRp(netto)}</span>
          </div>

          <div className={s.tableWrap}>
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
                  <td className={`${s.td} text-right font-bold text-success`}>{formatRp(pendapatan)}</td>
                </tr>
                <tr className={s.tr}>
                  <td className={s.tdStrong}>Total potongan</td>
                  <td className={`${s.td} text-right font-bold text-error`}>{formatRp(potongan)}</td>
                </tr>
                <tr className={`${s.tr} border-t-2 border-secondary/40`}>
                  <td className={`${s.tdStrong} text-secondary`}>Gaji diterima (netto)</td>
                  <td className={`${s.td} text-right font-black text-secondary`}>{formatRp(netto)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            <div className={s.cardCompact}>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Status pembayaran</dt>
              <dd className="mt-1 text-xs font-bold text-on-surface">
                {sudahBayar ? `Terbayar ${formatTanggalPanjang(karyawan.tanggalBayar)}` : "Belum dibayar"}
              </dd>
            </div>
            <div className={s.cardCompact}>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Metode pembayaran</dt>
              <dd className="mt-1 text-xs font-bold text-on-surface">{karyawan.metodeBayar}</dd>
            </div>
            <div className={s.cardCompact}>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Potongan bon + kasbon</dt>
              <dd className="mt-1 text-xs font-bold text-error">{formatRp(potongan)}</dd>
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
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] leading-none">
                print
              </span>
              Cetak Slip
            </button>
            <button
              type="button"
              disabled={sudahBayar}
              onClick={() => {
                bayarGaji(karyawan.id, tanggalHariIni());
                onTutup();
              }}
              className={s.primaryButton}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] leading-none">
                {sudahBayar ? "task_alt" : "paid"}
              </span>
              {sudahBayar ? "Sudah Terbayar" : "Tandai Terbayar"}
            </button>
          </div>
        </div>
      </section>
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}