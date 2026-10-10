"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFinance } from "../FinanceStore/FinanceStore";
import type { Invoice } from "../types/types";
import { formatRp, formatTanggalPanjang } from "../format/format";
import * as s from "./style/style";

const COMPOSER_TTJ = [
  "Mohon ditandatangani oleh pihak yang menerima tagihan.",
  "Konfirmasi oleh Finance, QA/QC, dan General Manager.",
];

function KopSurat() {
  return (
    <div className={s.kopWrap}>
      <div className={s.kopCompany}>CV ALUPBESK</div>
      <div className={s.kopAddress}>
        Karang Tengah Sitimulyo, Kec. Piyungan, Kab. Bantul, Daerah Istimewa Yogyakarta 55791
        <br />
        Specialist Contractor Aluminium
      </div>
      <div className={s.kopLine} />
    </div>
  );
}

function TabelTermin({ invoice }: { invoice: Invoice }) {
  const total = invoice.termin.reduce((sum, item) => sum + item.nominal, 0);
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th className={`${s.thCenter} w-8`}>No</th>
          <th className={s.th}>Termin</th>
          <th className={s.thCenter}>Tanggal</th>
          <th className={s.thCenter}>Jatuh Tempo</th>
          <th className={`${s.thRight}`}>Nominal</th>
          <th className={s.thCenter}>Status</th>
        </tr>
      </thead>
      <tbody>
        {invoice.termin.map((termin, index) => (
          <tr key={termin.id}>
            <td className={s.tdCenter}>{index + 1}</td>
            <td className={s.td}>{termin.label}</td>
            <td className={s.tdCenter}>{formatTanggalPanjang(termin.tanggal)}</td>
            <td className={s.tdCenter}>{formatTanggalPanjang(termin.jatuhTempo)}</td>
            <td className={s.tdRight}>{formatRp(termin.nominal)}</td>
            <td className={s.tdCenter}>{termin.lunas ? "Lunas" : "Belum"}</td>
          </tr>
        ))}
        <tr>
          <td colSpan={4} className={`${s.td} font-bold`}>
            TOTAL
          </td>
          <td className={`${s.tdRight} font-bold`}>{formatRp(total)}</td>
          <td className={s.td} />
        </tr>
      </tbody>
    </table>
  );
}

interface Props {
  invoiceId: string;
}

export function InvoicePrintView({ invoiceId }: Props) {
  const { invoiceRingkas } = useFinance();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceRingkas.length === 0) return;
    const found = invoiceRingkas.find((item) => item.invoice.id === invoiceId);
    if (found) {
      setInvoice(found.invoice);
      setError(null);
    } else {
      setInvoice(null);
      setError("Invoice tidak ditemukan.");
    }
    setLoading(false);
  }, [invoiceId, invoiceRingkas]);

  if (loading) return <div className="p-10 text-center text-xs text-on-surface-variant">Memuat invoice...</div>;
  if (error || !invoice)
    return (
      <div className="p-10 text-center">
        <div className="text-xs text-error mb-4">{error ?? "Data tidak ditemukan."}</div>
        <Link href="/keuangan" className="text-xs font-bold text-secondary uppercase tracking-wide">
          ← Kembali ke Keuangan
        </Link>
      </div>
    );

  const totalTagihan = invoice.termin.reduce((sum, item) => sum + item.nominal, 0);
  const terbayar = invoice.termin.filter((item) => item.lunas).reduce((sum, item) => sum + item.nominal, 0);
  const sisaTagihan = totalTagihan - terbayar;

  return (
    <div className="p-4 sm:p-6">
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background: #fff !important; }
          .print-no-print { display: none !important; }
          .print-sheet { margin: 0 !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="print-no-print mb-6 max-w-[794px] mx-auto flex items-center justify-between gap-3">
        <Link
          href="/keuangan"
          className="inline-flex items-center gap-2 border border-outline/30 rounded-pill px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant hover:bg-surface-variant transition-colors"
        >
          ← Kembali
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-bold rounded-pill px-5 py-2.5 text-[11px] uppercase tracking-wide hover:brightness-110 shadow-lg shadow-secondary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      <div className={`print-sheet shadow-2xl ${s.sheet}`}>
        <KopSurat />

        <div className={`${s.titleBar} ${s.kopDivider}`}>
          <div className={s.title}>INVOICE</div>
          <div className={s.titleSub}>Tagihan Pekerjaan</div>
        </div>

        <div className={s.infoGrid}>
          <div>
            <div className={s.infoBlockTitle}>Penerima Tagihan</div>
            <div className={s.infoValue}>{invoice.pihak}</div>
            <div className={s.infoPlain}>{invoice.nama}</div>
            <div className="mt-3">
              <div className={s.infoBlockTitle}>Proyek</div>
              <div className={s.infoPlain}>{invoice.proyek}</div>
            </div>
            <div className="mt-3">
              <div className={s.infoBlockTitle}>Pos / Lokasi Proyek</div>
              <div className={s.infoPlain}>{invoice.posProyek}</div>
            </div>
          </div>
          <div>
            <div className={s.infoBlockTitle}>Nomor Invoice</div>
            <div className={s.infoValue}>{invoice.nomor}</div>
            <div className="mt-3">
              <div className={s.infoBlockTitle}>Tanggal Invoice</div>
              <div className={s.infoPlain}>{formatTanggalPanjang(invoice.tanggal)}</div>
            </div>
            <div className="mt-3">
              <div className={s.infoBlockTitle}>Uraian Pekerjaan</div>
              <div className={s.infoPlain}>{invoice.uraian}</div>
            </div>
          </div>
        </div>

        <TabelTermin invoice={invoice} />

        <div className="mt-6 grid grid-cols-4 gap-4 text-[12px]">
          <div className={s.summaryBox}>
            <div className={s.summaryLabel}>Total Tagihan</div>
            <div className={s.summaryValue}>{formatRp(totalTagihan)}</div>
          </div>
          <div className={s.summaryBox}>
            <div className={s.summaryLabel}>Terbayar</div>
            <div className={s.summaryValueSuccess}>{formatRp(terbayar)}</div>
          </div>
          <div className={s.summaryBox}>
            <div className={s.summaryLabel}>Sisa Tagihan</div>
            <div className={s.summaryValueDanger}>{formatRp(sisaTagihan)}</div>
          </div>
          <div className={s.summaryBox}>
            <div className={s.summaryLabel}>Retensi (0,5% dari sisa)</div>
            <div className={s.summaryValue}>{formatRp(Math.round(sisaTagihan * 0.005))}</div>
          </div>
        </div>

        <div className={s.note}>
          {COMPOSER_TTJ.map((text, index) => (
            <div key={index}>• {text}</div>
          ))}
        </div>

        <div className={s.ttd}>
          <div className={s.ttdCol}>
            <div className={s.ttdLabel}>Penerima</div>
            <div className={s.ttdName}>{invoice.pihak}</div>
            <div className={s.ttdBlank} />
            <div className="text-[13px] text-slate-900 mt-1">(Tanda Tangan & Stempel)</div>
          </div>
          <div className={s.ttdCol}>
            <div className={s.ttdLabel}>Finance</div>
            <div className={s.ttdName}>CV ALUPBESK</div>
            <div className={s.ttdBlank} />
            <div className="text-[13px] text-slate-900 mt-1">(Tanda Tangan & Nama)</div>
          </div>
          <div className={s.ttdCol}>
            <div className={s.ttdLabel}>QA/QC</div>
            <div className={s.ttdBlank} />
            <div className="text-[13px] text-slate-900 mt-1">(Tanda Tangan & Nama)</div>
          </div>
          <div className={s.ttdCol}>
            <div className={s.ttdLabel}>General Manager</div>
            <div className={s.ttdBlank} />
            <div className="text-[13px] text-slate-900 mt-1">(Tanda Tangan & Nama)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
