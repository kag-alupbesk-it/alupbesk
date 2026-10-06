"use client";

import { useFinance } from "./FinanceStore";
import { StatusBadge } from "./ui/StatusBadge";
import { formatRp, formatTanggalPanjang } from "./format";
import type { InvoiceRingkas } from "./FinanceStore";
import * as s from "./style";

export function InvoicePreviewModal({
  data,
  onTutup,
}: {
  data: InvoiceRingkas;
  onTutup: () => void;
}) {
  const { lunasTermin, setToast } = useFinance();
  const { invoice, totalTagihan, terbayar, sisaTagihan, jatuhTempo } = data;

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-judul"
        className={`${s.modalPanel} max-w-4xl`}
      >
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Preview Invoice</p>
            <h3 id="invoice-judul" className="mt-1 text-base font-bold text-on-surface">
              {invoice.nama}
            </h3>
            <p className="mt-1 text-[10px] text-on-surface-variant">
              No. {invoice.nomor} · {formatTanggalPanjang(invoice.tanggal)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setToast(`Invoice ${invoice.nomor} dikirim ke printer.`);
                onTutup();
              }}
              className={s.secondaryButton}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] leading-none">
                print
              </span>
              Cetak
            </button>
            <button type="button" onClick={onTutup} aria-label="Tutup preview invoice" className={s.modalClose}>
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
                close
              </span>
            </button>
          </div>
        </header>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={s.cardCompact}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Penerima tagihan</p>
              <p className="mt-1 text-xs font-bold text-on-surface">{invoice.pihak}</p>
            </div>
            <div className={s.cardCompact}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Proyek</p>
              <p className="mt-1 text-xs font-bold text-on-surface">{invoice.proyek}</p>
            </div>
            <div className={s.cardCompact}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Pos/Proyek</p>
              <p className="mt-1 text-xs font-bold text-on-surface">{invoice.posProyek}</p>
            </div>
          </div>

          <div className="rounded-xl border border-outline/20 bg-surface-variant/30 p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Uraian pekerjaan</p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface">{invoice.uraian}</p>
          </div>

          <div className={s.tableWrap}>
            <table className={`${s.table} min-w-[720px]`}>
              <thead className={s.tableHead}>
                <tr>
                  <th scope="col" className={s.th}>
                    Termin
                  </th>
                  <th scope="col" className={s.th}>
                    Tanggal
                  </th>
                  <th scope="col" className={s.th}>
                    Jatuh Tempo
                  </th>
                  <th scope="col" className={`${s.th} text-right`}>
                    Nominal
                  </th>
                  <th scope="col" className={s.th}>
                    Status
                  </th>
                  <th scope="col" className={`${s.th} text-right`}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.termin.map((termin) => (
                  <tr key={termin.id} className={s.tr}>
                    <td className={s.tdStrong}>{termin.label}</td>
                    <td className={s.tdMuted}>{formatTanggalPanjang(termin.tanggal)}</td>
                    <td className={s.tdMuted}>{formatTanggalPanjang(termin.jatuhTempo)}</td>
                    <td className={`${s.td} text-right font-bold text-on-surface`}>{formatRp(termin.nominal)}</td>
                    <td className={s.td}>
                      {termin.lunas ? (
                        <StatusBadge tone="approved" label="Lunas" icon="check" />
                      ) : (
                        <StatusBadge tone="pending" label="Belum" icon="schedule" />
                      )}
                    </td>
                    <td className={`${s.td} text-right`}>
                      <button
                        type="button"
                        disabled={termin.lunas}
                        onClick={() => lunasTermin(invoice.id, termin.id)}
                        aria-label={`Tandai lunas ${termin.label} invoice ${invoice.nomor}`}
                        className={s.ghostButton}
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-[15px] leading-none">
                          {termin.lunas ? "task_alt" : "paid"}
                        </span>
                        {termin.lunas ? "Lunas" : "Tandai Lunas"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="grid gap-2 rounded-xl border border-secondary/30 bg-secondary/10 p-3 sm:grid-cols-4 sm:p-4">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Total tagihan</dt>
              <dd className="mt-1 text-xs font-bold text-on-surface">{formatRp(totalTagihan)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Terbayar</dt>
              <dd className="mt-1 text-xs font-bold text-success">{formatRp(terbayar)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Sisa tagihan</dt>
              <dd className="mt-1 text-xs font-bold text-error">{formatRp(sisaTagihan)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Jatuh tempo</dt>
              <dd className="mt-1 text-xs font-bold text-on-surface">{formatTanggalPanjang(jatuhTempo)}</dd>
            </div>
          </dl>

          <p className="text-[10px] leading-relaxed text-on-surface-variant">
            Mohon ditandatangani oleh {invoice.pihak} pada kolom tanda tangan, lalu konfirmasi oleh Finance,
            QA/QC, dan General Manager. Retensi 0,5% dari sisa tagihan:{" "}
            {formatRp(Math.round(sisaTagihan * 0.005))}.
          </p>
        </div>
      </section>
    </div>
  );
}