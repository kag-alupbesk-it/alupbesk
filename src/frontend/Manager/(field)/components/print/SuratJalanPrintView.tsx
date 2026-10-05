"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fieldStore } from "../store";
import type { FieldDelivery } from "../types";
import { formatTanggal } from "../antrean/helpers";
import * as s from "./style";

const COMPOSER_TTJ = [
  "Barang sudah diterima dalam keadaan baik di lokasi proyek terkait.",
  "Surat ini berlaku sebagai tanda terima antara CV ALUPBESK dan kontraktor.",
];

function KopSurat() {
  return (
    <div className={s.kopWrap}>
      <div className={s.kopCompany}>CV ALUPBESK</div>
      <div className={s.kopAddress}>
        Karang Tengah Sitimulyo, Kec. Piyungan, Kab. Bantul, Daerah Istimewa Yogyakarta 55791
        <br />
        Specialis Contractor Aluminium
      </div>
      <div className={s.kopLine} />
    </div>
  );
}

function TabelBarang({ delivery }: { delivery: FieldDelivery }) {
  const totalJumlah = delivery.items.reduce((sum, item) => sum + item.kuantitas, 0);
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th className={`${s.thCenter} w-8`}>No</th>
          <th className={`${s.thCenter} w-20`}>Kode</th>
          <th className={s.th}>Nama Barang</th>
          <th className={s.th}>Detail</th>
          <th className={`${s.thCenter} w-24`}>Jumlah</th>
        </tr>
      </thead>
      <tbody>
        {delivery.items.map((item, index) => (
          <tr key={item.id}>
            <td className={s.tdCenter}>{index + 1}</td>
            <td className={s.tdCenter}>{item.id}</td>
            <td className={s.td}>{item.namaBarang}</td>
            <td className={s.td}>{item.spesifikasi ?? "-"}</td>
            <td className={s.tdCenter}>{item.kuantitas}</td>
          </tr>
        ))}
        <tr>
          <td colSpan={4} className={`${s.td} font-bold`}>
            TOTAL
          </td>
          <td className={`${s.tdCenter} font-bold`}>{totalJumlah}</td>
        </tr>
      </tbody>
    </table>
  );
}

interface Props {
  deliveryId: string;
}

export function SuratJalanPrintView({ deliveryId }: Props) {
  const [delivery, setDelivery] = useState<FieldDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fieldStore
      .getDelivery(deliveryId)
      .then(setDelivery)
      .catch(() => setError("Surat jalan tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [deliveryId]);

  if (loading) return <div className="p-10 text-center text-xs text-on-surface-variant">Memuat surat jalan...</div>;
  if (error || !delivery)
    return (
      <div className="p-10 text-center">
        <div className="text-xs text-error mb-4">{error ?? "Data tidak ditemukan."}</div>
        <Link href="/field" className="text-xs font-bold text-secondary uppercase tracking-wide">
          ← Kembali ke Daftar Pengiriman
        </Link>
      </div>
    );

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
          href={`/field/pod`}
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
          <div className={s.title}>Surat Jalan</div>
          <div className={s.titleSub}>Terbit untuk pengiriman material lokasi proyek</div>
        </div>

        <div className={s.infoGrid}>
          <div>
            <div className={s.infoBlockTitle}>Kontraktor</div>
            <div className={s.infoValue}>{delivery.namaKontraktor}</div>
            <div className={s.infoPlain}>Telepon: {delivery.telepon ?? "-"}</div>
            <div className="mt-3">
              <div className={s.infoBlockTitle}>Alamat Proyek</div>
              <div className={s.infoPlain}>{delivery.alamatProyek}</div>
            </div>
          </div>
          <div>
            <div className={s.infoBlockTitle}>Nomor Surat Jalan</div>
            <div className={s.infoValue}>{delivery.id}</div>
            <div className="mt-3">
              <div className={s.infoBlockTitle}>Tanggal Kirim</div>
              <div className={s.infoValue}>{formatTanggal(delivery.tanggalKirim)}</div>
            </div>
            <div className="mt-3">
              <div className={s.infoBlockTitle}>Detail Kendaraan</div>
              <div className={s.infoPlain}>
                Sopir: {delivery.armada?.namaSopir ?? "-"}
                <br />
                Plat Nomor: {delivery.armada?.platNomor ?? "-"}
                <br />
                Jenis Kendaraan: {delivery.armada?.jenisArmada ?? "-"}
              </div>
            </div>
          </div>
        </div>

        <TabelBarang delivery={delivery} />

        <div className={s.ttd}>
          <div className={s.ttdCol}>
            <div className={s.ttdLabel}>Pengirim</div>
            <div className={s.ttdBlank} />
            <div className={s.ttdName}>CV ALUPBESK</div>
          </div>
          <div className={s.ttdCol}>
            <div className={s.ttdLabel}>Sopir</div>
            <div className={s.ttdBlank} />
            <div className={s.ttdName}>{delivery.armada?.namaSopir ?? "Nama Sopir"}</div>
          </div>
          <div className={s.ttdCol}>
            <div className={s.ttdLabel}>Penerima</div>
            <div className={s.ttdSig}>
              {delivery.signatureImagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={delivery.signatureImagePath}
                  alt="Foto tanda tangan penerima"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-400 italic">Belum ditandatangani</span>
              )}
            </div>
            <div className={s.ttdName}>Penerima / Kontraktor</div>
          </div>
        </div>

        <div className={s.note}>
          {COMPOSER_TTJ.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}