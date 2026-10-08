"use client";

import { useMemo, useState } from "react";
import { useFinance } from "../FinanceStore/FinanceStore";
import { FinancialStatCard } from "../ui/FinancialStatCard/FinancialStatCard";
import { formatRp, formatRpCompact } from "../shared/format";
import type { TransaksiKas } from "../shared/types";
import * as s from "../shared/style";

type Rentang = "hari" | "minggu" | "bulan" | "tahun";
type Titik = { label: string; pemasukan: number; pengeluaran: number };

const RENTANG: { key: Rentang; label: string; jumlah: number; langkah: "hari" | "minggu" | "bulan" | "tahun" }[] = [
  { key: "hari", label: "7 hari", jumlah: 7, langkah: "hari" },
  { key: "minggu", label: "8 minggu", jumlah: 8, langkah: "minggu" },
  { key: "bulan", label: "6 bulan", jumlah: 6, langkah: "bulan" },
  { key: "tahun", label: "3 tahun", jumlah: 3, langkah: "tahun" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

const WARNA = {
  pemasukan: "var(--color-success)",
  pengeluaran: "var(--color-secondary)",
  netral: "var(--color-outline)",
};

function mulaiRentang(rentang: Rentang, sekarang: Date) {
  const hariIni = Date.UTC(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
  if (rentang === "hari") return new Date(hariIni - 6 * DAY_MS);
  if (rentang === "minggu") {
    const senin = (new Date(hariIni).getUTCDay() + 6) % 7;
    return new Date(hariIni - (7 + senin) * DAY_MS);
  }
  if (rentang === "bulan") return new Date(Date.UTC(sekarang.getFullYear(), sekarang.getMonth() - 5, 1));
  return new Date(Date.UTC(sekarang.getFullYear() - 2, 0, 1));
}

function bangunGrafik(transaksi: TransaksiKas[], rentang: Rentang, sekarang = new Date()): Titik[] {
  const konfigurasi = RENTANG.find((item) => item.key === rentang) ?? RENTANG[2];
  const mulai = mulaiRentang(rentang, sekarang);
  const akhir =
    Date.UTC(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate()) + DAY_MS;

  const ember = Array.from({ length: konfigurasi.jumlah }, (_, index) => {
    const tanggal = new Date(mulai);
    if (konfigurasi.langkah === "hari") tanggal.setUTCDate(tanggal.getUTCDate() + index);
    if (konfigurasi.langkah === "minggu") tanggal.setUTCDate(tanggal.getUTCDate() + index * 7);
    if (konfigurasi.langkah === "bulan") tanggal.setUTCMonth(tanggal.getUTCMonth() + index);
    if (konfigurasi.langkah === "tahun") tanggal.setUTCFullYear(tanggal.getUTCFullYear() + index);
    const label =
      konfigurasi.langkah === "tahun"
        ? String(tanggal.getUTCFullYear())
        : konfigurasi.langkah === "bulan"
          ? new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" }).format(tanggal)
          : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", timeZone: "UTC" }).format(tanggal);
    return { label, pemasukan: 0, pengeluaran: 0 };
  });

  for (const item of transaksi) {
    const waktu = Date.parse(`${item.tanggal}T00:00:00.000Z`);
    if (!Number.isFinite(waktu) || waktu < mulai.getTime() || waktu >= akhir) continue;
    const tanggal = new Date(waktu);
    let index = 0;
    if (konfigurasi.langkah === "hari") index = Math.round((waktu - mulai.getTime()) / DAY_MS);
    if (konfigurasi.langkah === "minggu") index = Math.round((waktu - mulai.getTime()) / (7 * DAY_MS));
    if (konfigurasi.langkah === "bulan")
      index =
        (tanggal.getUTCFullYear() - mulai.getUTCFullYear()) * 12 +
        (tanggal.getUTCMonth() - mulai.getUTCMonth());
    if (konfigurasi.langkah === "tahun") index = tanggal.getUTCFullYear() - mulai.getUTCFullYear();
    const titik = ember[index];
    if (!titik) continue;
    if (item.jenis === "kas_masuk") titik.pemasukan += item.nominal;
    else titik.pengeluaran += item.nominal;
  }

  return ember;
}

const koordinat = (index: number, total: number) => 86 + (index * 596) / Math.max(total - 1, 1);
const tinggi = (nilai: number, maksimal: number) => 224 - (nilai / maksimal) * 168;

function titikGrafik(titik: Titik[], ambil: (item: Titik) => number, maksimal: number) {
  return titik.map((item, index) => `${koordinat(index, titik.length)},${tinggi(ambil(item), maksimal)}`).join(" ");
}

function PanelRekap({
  judul,
  subjudul,
  baris,
  total,
}: {
  judul: string;
  subjudul: string;
  baris: { label: string; nilai: number }[];
  total: number;
}) {
  return (
    <section className={s.card}>
      <h2 className={s.sectionTitle}>{judul}</h2>
      <p className={s.sectionSubtitle}>{subjudul}</p>
      <div className="mt-4 space-y-3">
        {baris.map((item) => {
          const persen = total > 0 ? (item.nilai / total) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-on-surface-variant">{item.label}</span>
                <span className="shrink-0 font-semibold text-on-surface">
                  {formatRp(item.nilai)} <span className="text-on-surface-variant">({persen.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-variant">
                <div
                  className="h-full rounded-full bg-secondary transition-all"
                  style={{ width: `${Math.min(persen, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
        {total === 0 && <p className={`${s.emptyRow} px-0`}>Belum ada pengeluaran pada rentang ini.</p>}
      </div>
    </section>
  );
}

export function FinancialChartsSection() {
  const { transaksiUrut, opsiKategori, opsiPos } = useFinance();
  const [rentang, setRentang] = useState<Rentang>("bulan");
  const [hover, setHover] = useState<number | null>(null);
  const [pilih, setPilih] = useState<number | null>(null);

  const titik = useMemo(() => bangunGrafik(transaksiUrut, rentang), [transaksiUrut, rentang]);
  const rentangAwal = mulaiRentang(rentang, new Date());
  const rentangAkhir =
    Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) + DAY_MS;

  const transaksiRentang = transaksiUrut.filter((item) => {
    const waktu = Date.parse(`${item.tanggal}T00:00:00.000Z`);
    return Number.isFinite(waktu) && waktu >= rentangAwal.getTime() && waktu < rentangAkhir;
  });

  const keluar = transaksiRentang.filter((item) => item.jenis !== "kas_masuk");
  const totalKeluar = keluar.reduce((sum, item) => sum + item.nominal, 0);
  const totalMasuk = titik.reduce((sum, item) => sum + item.pemasukan, 0);
  const totalPengeluaran = titik.reduce((sum, item) => sum + item.pengeluaran, 0);
  const bersih = totalMasuk - totalPengeluaran;
  const maksimal = Math.max(...titik.flatMap((item) => [item.pemasukan, item.pengeluaran]), 1);

  const perKategori = useMemo(
    () =>
      opsiKategori.map((kategori) => ({
        label: kategori,
        nilai: keluar
          .filter((item) => item.kategori === kategori)
          .reduce((sum, item) => sum + item.nominal, 0),
      })).filter((item) => item.nilai > 0),
    [keluar, opsiKategori],
  );

  const perPos = useMemo(
    () =>
      opsiPos.map((pos) => ({
        label: pos,
        nilai: keluar
          .filter((item) => item.posProyek === pos)
          .reduce((sum, item) => sum + item.nominal, 0),
      })).filter((item) => item.nilai > 0),
    [keluar, opsiPos],
  );

  const kategoriTerbesar = perKategori[0];
  const posTerbesar = perPos[0];
  const periodeTerbaik = titik.reduce<Titik | null>(
    (terbaik, item) => (item.pemasukan - item.pengeluaran > (terbaik?.pemasukan ?? 0) - (terbaik?.pengeluaran ?? 0) ? item : terbaik),
    null,
  );
  const aktif = hover ?? pilih ?? titik.length - 1;
  const titikAktif = titik[aktif];

  return (
    <div className="space-y-5">
      <div className={s.statGrid}>
        <FinancialStatCard
          label="Pemasukan"
          value={formatRp(totalMasuk)}
          icon="south_west"
          trend="Kas masuk pada rentang terpilih"
          tone="success"
        />
        <FinancialStatCard
          label="Pengeluaran"
          value={formatRp(totalPengeluaran)}
          icon="north_east"
          trend={`${keluar.length} transaksi keluar`}
          tone="error"
        />
        <FinancialStatCard
          label="Arus Kas Bersih"
          value={formatRp(bersih)}
          icon="account_balance"
          trend={bersih >= 0 ? "Surplus pada rentang ini" : "Defisit pada rentang ini"}
          tone="gold"
        />
        <FinancialStatCard
          label="Rata-rata Bulanan"
          value={formatRp(Math.round(totalKeluar / Math.max(perPos.length, 1)))}
          icon="insights"
          trend="Rata-rata belanja per pos/proyek"
          tone="neutral"
        />
      </div>

      <section className={s.card}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className={s.sectionTitle}>Grafik Arus Kas</h2>
            <p className={s.sectionSubtitle}>
              Garis pemasukan dan pengeluaran kas. Arahkan kursor atau gunakan keyboard untuk melihat detail periode.
            </p>
          </div>
          <div role="group" aria-label="Pilih rentang grafik" className={s.segmentedTrack}>
            {RENTANG.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={rentang === item.key}
                onClick={() => {
                  setRentang(item.key);
                  setPilih(null);
                  setHover(null);
                }}
                className={`${s.segmentedItem} px-3 py-2 text-xs normal-case tracking-normal ${
                  rentang === item.key ? s.segmentedItemActive : s.segmentedItemIdle
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`${s.metaText} mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-semibold`}>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full" style={{ backgroundColor: WARNA.pemasukan }} />Pemasukan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full" style={{ backgroundColor: WARNA.pengeluaran }} />Pengeluaran
          </span>
        </div>

        <div className="mt-2 w-full overflow-x-auto">
          <svg
            viewBox="0 0 700 260"
            role="group"
            aria-label="Grafik pemasukan dan pengeluaran kas"
            className="h-auto w-full min-w-[440px] text-on-surface"
          >
            <title>Tren arus kas dari transaksi kas</title>
            {[0, 1, 2, 3, 4].map((tick) => {
              const y = 224 - tick * 42;
              return (
                <g key={tick}>
                  <line x1="80" y1={y} x2="690" y2={y} stroke="currentColor" strokeOpacity="0.12" />
                  <text x="4" y={y + 4} fill="currentColor" opacity="0.65" fontSize="9">
                    {formatRpCompact((maksimal * tick) / 4)}
                  </text>
                </g>
              );
            })}
            <polyline
              points={titikGrafik(titik, (item) => item.pemasukan, maksimal)}
              fill="none"
              stroke={WARNA.pemasukan}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={titikGrafik(titik, (item) => item.pengeluaran, maksimal)}
              fill="none"
              stroke={WARNA.pengeluaran}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {titikAktif && (
              <line
                x1={koordinat(aktif, titik.length)}
                y1="44"
                x2={koordinat(aktif, titik.length)}
                y2="230"
                stroke="currentColor"
                strokeOpacity="0.35"
                strokeDasharray="3 4"
              />
            )}
            {titik.map((item, index) => {
              const x = koordinat(index, titik.length);
              return (
                <g
                  key={`${item.label}-${index}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={pilih === index}
                  aria-label={`${item.label}: pemasukan ${formatRp(item.pemasukan)}, pengeluaran ${formatRp(item.pengeluaran)}`}
                  className="cursor-pointer outline-none"
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(index)}
                  onBlur={() => setHover(null)}
                  onClick={() => setPilih(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setPilih(index);
                    }
                  }}
                >
                  <title>{`${item.label} | Masuk ${formatRp(item.pemasukan)} | Keluar ${formatRp(item.pengeluaran)}`}</title>
                  <rect x={x - 24} y="34" width="48" height="200" fill="transparent" />
                  {aktif === index && (
                    <circle cx={x} cy={tinggi(item.pemasukan, maksimal)} r="7" fill="none" stroke={WARNA.pemasukan} strokeWidth="2" />
                  )}
                  {aktif === index && (
                    <circle cx={x} cy={tinggi(item.pengeluaran, maksimal)} r="7" fill="none" stroke={WARNA.pengeluaran} strokeWidth="2" />
                  )}
                  <circle cx={x} cy={tinggi(item.pemasukan, maksimal)} r="3.5" fill={WARNA.pemasukan} />
                  <circle cx={x} cy={tinggi(item.pengeluaran, maksimal)} r="3.5" fill={WARNA.pengeluaran} />
                  <text x={x} y="250" textAnchor="middle" fill="currentColor" opacity="0.7" fontSize="9">
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {titikAktif && (
          <dl
            aria-live="polite"
            className={`${s.panelMuted} mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4`}
          >
            <div className="col-span-2 sm:col-span-1">
              <dt className={s.metaText}>Detail {titikAktif.label}</dt>
              <dd className={s.detailValue}>
                Arus kas {titikAktif.pemasukan - titikAktif.pengeluaran >= 0 ? "surplus" : "defisit"}
              </dd>
            </div>
            <div>
              <dt className={s.metaText}>Pemasukan</dt>
              <dd className={`${s.detailValue} text-success`}>{formatRp(titikAktif.pemasukan)}</dd>
            </div>
            <div>
              <dt className={s.metaText}>Pengeluaran</dt>
              <dd className={`${s.detailValue} text-secondary`}>{formatRp(titikAktif.pengeluaran)}</dd>
            </div>
            <div>
              <dt className={s.metaText}>Selisih</dt>
              <dd className={s.detailValue}>
                {formatRp(titikAktif.pemasukan - titikAktif.pengeluaran)}
              </dd>
            </div>
          </dl>
        )}

        {transaksiRentang.length === 0 && (
          <p className="mt-2 text-center text-xs text-on-surface-variant">Belum ada transaksi pada rentang ini.</p>
        )}
      </section>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
        <PanelRekap
          judul="Rekap Pengeluaran per Kategori Biaya"
          subjudul="Dihitung otomatis dari transaksi kas keluar pada rentang terpilih."
          baris={perKategori}
          total={totalKeluar}
        />
        <PanelRekap
          judul="Rekap Pengeluaran per Pos/Proyek"
          subjudul="Distribusi belanja kas pada setiap lokasi kerja."
          baris={perPos}
          total={totalKeluar}
        />
      </div>

      <section className={s.card}>
        <h2 className={s.sectionTitle}>Temuan Periode</h2>
        <p className={s.sectionSubtitle}>Ringkasan otomatis dari transaksi dalam rentang terpilih.</p>
        <dl className="mt-4 divide-y divide-outline/20">
          <div className={`${s.findingRow}`}>
            <dt className={s.findingLabel}>Kategori pengeluaran terbesar</dt>
            <dd className={s.findingValue}>
              {kategoriTerbesar ? `${kategoriTerbesar.label} · ${formatRp(kategoriTerbesar.nilai)}` : "-"}
            </dd>
          </div>
          <div className={`${s.findingRow}`}>
            <dt className={s.findingLabel}>Pos/proyek paling besar</dt>
            <dd className={s.findingValue}>
              {posTerbesar ? `${posTerbesar.label} · ${formatRp(posTerbesar.nilai)}` : "-"}
            </dd>
          </div>
          <div className={`${s.findingRow}`}>
            <dt className={s.findingLabel}>Periode surplus terbaik</dt>
            <dd className={s.findingValue}>
              {periodeTerbaik
                ? `${periodeTerbaik.label} · ${formatRp(periodeTerbaik.pemasukan - periodeTerbaik.pengeluaran)}`
                : "-"}
            </dd>
          </div>
          <div className={`${s.findingRow} last:pb-0`}>
            <dt className={s.findingLabel}>Jumlah transaksi di rentang</dt>
            <dd className={s.findingValue}>
              {transaksiRentang.length} transaksi
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}