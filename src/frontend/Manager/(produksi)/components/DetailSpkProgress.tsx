"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ClipboardList,
  FileUp,
  Info,
  Layers,
  MapPin,
  Phone,
  Ruler,
} from "lucide-react";
import { useProduksi } from "../context/ProduksiContext";
import { alurMeta, alurSPK } from "../utils/alur";
import { ProgressStepper } from "./shared/ProgressStepper";
import { PreviewGambar } from "./shared/BerkasPreview";
import { AlurBadge, StatusBadge, StatusGambarBadge, TahapanBadge } from "./shared/StatusBadge";
import { tahapanOrder } from "../types";
import { formatAngka, formatTanggal, getInisial } from "../utils/format";

export function DetailSpkProgress({ nomor }: { nomor: string }) {
  const { getSPK, ubahTahapan } = useProduksi();
  const spk = getSPK(nomor);

  const totalItem = useMemo(() => (spk ? spk.item.length : 0), [spk]);

  if (!spk) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <Link
          href="/produksi"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-secondary"
        >
          <ArrowLeft size={14} />
          Kembali ke Antrean Produksi
        </Link>
        <section className="mt-6 rounded-2xl border border-outline/30 bg-surface-container-low px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant">
            <ClipboardList size={22} />
          </div>
          <p className="mt-4 text-sm font-bold text-on-surface">SPK tidak ditemukan</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-on-surface-variant">
            Nomor SPK <span className="font-mono font-bold">{nomor}</span> tidak tersedia pada data antrean produksi.
          </p>
          <Link
            href="/produksi"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-outline/40 px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary"
          >
            <ArrowLeft size={14} />
            Kembali ke Antrean
          </Link>
        </section>
      </div>
    );
  }

  // Stepper hanya aktif setelah gambar teknik di-ACC PM.
  const terkunci = spk.statusGambar !== "acc_pm";
  const bisaUnggahUlang = spk.statusGambar === "belum_diunggah" || spk.statusGambar === "revisi";
  const alur = alurSPK(spk);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section>
        <Link
          href="/produksi"
          className="-ml-2.5 inline-flex items-center gap-2 rounded-lg py-2.5 pl-2.5 pr-3 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:bg-surface-variant/40 hover:text-secondary"
        >
          <ArrowLeft size={14} />
          Kembali ke Antrean Produksi
        </Link>
      </section>

      <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
                Nomor SPK
              </span>
              <span className="text-outline">•</span>
              <span className="text-[11px] text-on-surface-variant">{spk.item.length} item barang</span>
            </div>
            <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              {spk.nomor}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AlurBadge alur={alur} className="[&>p]:hidden" />
              <StatusGambarBadge status={spk.statusGambar} />
              <TahapanBadge tahapan={spk.tahapan} />
            </div>
            <p className="mt-2 text-[11px] text-on-surface-variant">{alurMeta[alur].tindakan}</p>
          </div>

          {bisaUnggahUlang && (
            <Link
              href="/produksi/drawings"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-all hover:-translate-y-0.5 hover:brightness-105"
            >
              <FileUp size={15} strokeWidth={2.5} />
              Upload Gambar Teknik
            </Link>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-outline/20 pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-outline/20 bg-surface-variant/25 p-4">
            <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
              <Ruler size={12} />
              Kode Produksi Kontraktor
            </dt>
            <dd className="mt-1.5 font-mono text-sm font-bold text-on-surface">{spk.kodeProduksi ?? "—"}</dd>
          </div>
          <div className="rounded-xl border border-outline/20 bg-surface-variant/25 p-4">
            <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
              <Building2 size={12} />
              Nama Kontraktor
            </dt>
            <dd className="mt-1.5 flex items-center gap-2 text-sm font-bold text-on-surface">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/10 text-[9px] font-extrabold text-secondary">
                {getInisial(spk.namaKontraktor)}
              </span>
              {spk.namaKontraktor}
            </dd>
          </div>
          <div className="rounded-xl border border-outline/20 bg-surface-variant/25 p-4">
            <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
              <CalendarClock size={12} />
              Target Selesai
            </dt>
            <dd className="mt-1.5 text-sm font-bold text-on-surface">{formatTanggal(spk.targetDeadline)}</dd>
          </div>
          <div className="rounded-xl border border-outline/20 bg-surface-variant/25 p-4">
            <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
              <Layers size={12} />
              Total Item
            </dt>
            <dd className="mt-1.5 text-sm font-bold text-on-surface">{formatAngka(totalItem)} item</dd>
          </div>
        </dl>

        {(spk.telepon || spk.alamatProyek) && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-outline/20 pt-4 text-[10px] text-on-surface-variant">
            {spk.telepon && (
              <span className="inline-flex items-center gap-1.5">
                <Phone size={12} />
                {spk.telepon}
              </span>
            )}
            {spk.alamatProyek && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} />
                {spk.alamatProyek}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-secondary">
              <Info size={12} />
              {spk.aktivitasTerakhir}
            </span>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
        <ProgressStepper
          tahapan={spk.tahapan}
          terkunci={terkunci}
          pesanTerkunci={
            bisaUnggahUlang
              ? "Gambar teknik belum di-ACC PM, jadi pengerjaan belum boleh dimulai. Unggah gambar tekniknya terlebih dahulu, lalu tunggu ACC PM."
              : "Gambar teknik sedang menunggu ACC PM. Tidak ada yang perlu dilakukan sekarang - progress akan bisa diubah setelah PM menyetujui gambar."
          }
          onPilih={(tahapan) => ubahTahapan(spk.nomor, tahapan)}
        />

        <p className="mt-4 text-[10px] text-on-surface-variant/70">
          Tahap aktif: <span className="font-bold text-secondary">{tahapanOrder.indexOf(spk.tahapan) + 1}</span> dari{" "}
          {tahapanOrder.length}. {spk.aktivitasTerakhir}.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 rounded-2xl border border-outline/30 bg-surface-container-low">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline/20 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">Rincian Barang</h3>
                <p className="mt-0.5 text-[10px] text-on-surface-variant">Barang yang harus diproduksi sesuai SPK</p>
              </div>
            </div>
            <StatusBadge tone="slate">{totalItem} item</StatusBadge>
          </div>

          <div className="space-y-3 p-4 lg:hidden">
            {spk.item.map((barang) => (
              <div key={barang.kode} className="rounded-2xl border border-outline/30 bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold text-secondary">{barang.kode}</p>
                    <p className="mt-1 text-sm font-bold text-on-surface">{barang.nama}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-surface-variant px-2.5 py-1 text-center">
                    <span className="font-headline text-sm font-extrabold text-on-surface">
                      {formatAngka(barang.kuantitas)}
                    </span>
                    <span className="ml-1 text-[10px] text-on-surface-variant">{barang.satuan}</span>
                  </span>
                </div>
                <p className="mt-2.5 border-t border-outline/20 pt-2.5 text-[11px] leading-relaxed text-on-surface-variant">
                  {barang.catatanSpesifikasi}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-surface-variant/35 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
                <tr>
                  <th className="px-5 py-4 font-bold sm:px-6">Kode Barang / SKU</th>
                  <th className="px-5 py-4 font-bold">Nama Item</th>
                  <th className="px-5 py-4 text-center font-bold">Kuantitas</th>
                  <th className="px-5 py-4 font-bold">Satuan</th>
                  <th className="px-5 py-4 font-bold sm:px-6">Catatan Spesifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/15">
                {spk.item.map((barang) => (
                  <tr key={barang.kode} className="transition-colors hover:bg-surface-variant/25">
                    <td className="px-5 py-4 sm:px-6">
                      <span className="font-mono text-[11px] font-bold text-secondary">{barang.kode}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-on-surface">{barang.nama}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-headline text-sm font-extrabold text-on-surface">
                        {formatAngka(barang.kuantitas)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-on-surface-variant">{barang.satuan}</span>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <p className="max-w-[320px] text-[11px] leading-relaxed text-on-surface-variant">
                        {barang.catatanSpesifikasi}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
            <div className="flex items-start gap-2.5">
              <FileUp size={16} className="mt-0.5 shrink-0 text-secondary" />
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-secondary">Preview Gambar Teknik</h3>
                <p className="mt-1.5 text-[10px] leading-relaxed text-on-surface-variant">
                  {terkunci
                    ? "Berkas gambar teknik dari tim produksi. Menunggu ACC PM."
                    : "Berkas gambar teknik yang sudah di-ACC PM."}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <PreviewGambar
                nama={spk.gambarTeknik?.nama}
                url={spk.gambarTeknik?.url}
                ukuran={spk.gambarTeknik?.ukuran}
                caption="Gambar Teknik"
                emptyText="Belum ada gambar teknik diunggah."
              />
            </div>

            {spk.tanggalAcc && (
              <p className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-300">
                <StatusBadge tone="green" dot>
                  Di-ACC PM
                </StatusBadge>
                {formatTanggal(spk.tanggalAcc)}
              </p>
            )}

            {spk.revisiCount > 0 && (
              <p className="mt-3 text-[10px] font-bold text-red-300">
                Sudah melalui {spk.revisiCount}x revisi dari PM
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-on-surface">Catatan Teknis Produksi</h3>
            <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant">
              {spk.catatanTeknis ?? "Belum ada catatan teknis untuk SPK ini."}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
