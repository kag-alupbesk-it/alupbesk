"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Factory,
  FileUp,
  Filter,
  LayoutList,
  Search,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";
import { useProduksi } from "../context/ProduksiContext";
import { filterPengerjaanLabels } from "../types";
import type { SPK, StatusPengerjaan } from "../types";
import { StatusBadge, StatusGambarBadge, StatusPengerjaanBadge } from "./shared/StatusBadge";
import { formatTanggal, getInisial } from "../utils/format";

type FilterStatus = StatusPengerjaan | "all";

interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: "red" | "amber" | "blue" | "green";
}

const statToneClasses = {
  red: "bg-red-400/10 text-red-300",
  amber: "bg-secondary/12 text-secondary",
  blue: "bg-blue-400/10 text-blue-300",
  green: "bg-emerald-400/10 text-emerald-300",
};

function StatCard({ label, value, hint, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-outline/30 bg-surface-container-low p-5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statToneClasses[tone]}`}>
        <Icon size={19} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">{value}</p>
          <span className="truncate text-[10px] text-on-surface-variant/70">{hint}</span>
        </div>
      </div>
    </div>
  );
}

export function ProduksiDashboard() {
  const { spk, spkPerluGambar } = useProduksi();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const metrik = useMemo(
    () => ({
      butuhGambar: spk.filter((item) => item.statusPengerjaan === "butuh_gambar").length,
      menungguACC: spk.filter((item) => item.statusPengerjaan === "menunggu_acc").length,
      produksi: spk.filter((item) => item.statusPengerjaan === "dalam_produksi").length,
      siapKirim: spk.filter((item) => item.statusPengerjaan === "siap_kirim").length,
    }),
    [spk],
  );

  const spkTersaring = useMemo(() => {
    const kata = search.trim().toLowerCase();
    return spk.filter((item) => {
      const cocokStatus = filter === "all" || item.statusPengerjaan === filter;
      if (!cocokStatus) return false;
      if (!kata) return true;
      // Pencarian mencakup Nomor SPK, Kode Produksi Kontraktor, Kode Barang, dan
      // nama kontraktor sesuai kebutuhan filter di dashboard.
      const kodeBarang = item.item.map((barang) => barang.kode).join(" ");
      return (
        item.nomor.toLowerCase().includes(kata) ||
        (item.kodeProduksi?.toLowerCase().includes(kata) ?? false) ||
        item.namaKontraktor.toLowerCase().includes(kata) ||
        kodeBarang.toLowerCase().includes(kata)
      );
    });
  }, [spk, search, filter]);

  // Tombol cepat "Detail SPK & Progress" diarahkan ke SPK yang sedang dikerjakan
  // karena itu halaman yang paling sering dibuka.
  const spkFokus = useMemo(
    () => spk.find((item) => item.statusPengerjaan === "dalam_produksi") ?? spk[0],
    [spk],
  );

  const terlewat = useMemo(() => {
    const sekarang = new Date().toISOString().slice(0, 10);
    return spk.filter((item) => item.targetDeadline < sekarang && item.statusPengerjaan !== "siap_kirim");
  }, [spk]);

  const renderBaris = (item: SPK) => (
    <tr key={item.nomor} className="group transition-colors hover:bg-surface-variant/25">
      <td className="px-5 py-4 sm:px-6">
        <Link
          href={`/produksi/orders/${item.nomor}`}
          className="font-mono text-xs font-bold text-secondary hover:underline"
        >
          {item.nomor}
        </Link>
        <p className="mt-1 text-[9px] font-medium text-on-surface-variant/60">
          Masuk {formatTanggal(item.tanggalMasuk)}
        </p>
      </td>
      <td className="px-5 py-4">
        {item.kodeProduksi ? (
          <span className="font-mono text-[11px] font-bold text-on-surface">{item.kodeProduksi}</span>
        ) : (
          <span className="text-[11px] italic text-on-surface-variant/60">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-[10px] font-extrabold text-secondary">
            {getInisial(item.namaKontraktor)}
          </span>
          <div className="min-w-0">
            <p className="max-w-[170px] truncate text-xs font-bold text-on-surface">{item.namaKontraktor}</p>
            <p className="mt-0.5 text-[10px] text-on-surface-variant/70">{item.item.length} item spesifikasi</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <span className="text-xs text-on-surface-variant">{formatTanggal(item.targetDeadline)}</span>
        {terlewat.includes(item) && (
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.1em] text-red-300">Lewat deadline</span>
        )}
      </td>
      <td className="px-5 py-4">
        <StatusGambarBadge status={item.statusGambar} />
      </td>
      <td className="px-5 py-4 sm:px-6">
        <StatusPengerjaanBadge status={item.statusPengerjaan} />
      </td>
    </tr>
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
            <span className="inline-flex items-center gap-1.5 text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_0_4px_rgba(219,165,1,0.12)]" />
              Modul Produksi
            </span>
            <span className="text-outline">•</span>
            <span>Workshop &amp; Gambar Teknik</span>
          </div>
          <h2 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            Antrean Produksi<span className="text-secondary">.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Unggah gambar teknik untuk di-ACC PM dan pantau progres pengerjaan barang di workshop.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {spkFokus && (
            <Link
              href={`/produksi/orders/${spkFokus.nomor}`}
              className="inline-flex items-center gap-2 rounded-xl border border-outline/40 bg-surface-container px-4 py-2.5 text-xs font-bold text-on-surface transition-all hover:border-secondary/50 hover:text-secondary"
            >
              <ClipboardList size={15} />
              Detail SPK &amp; Progress
            </Link>
          )}
          <Link
            href="/produksi/drawings"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <FileUp size={15} strokeWidth={2.5} />
            Upload Gambar Teknik
            {spkPerluGambar.length > 0 && (
              <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px]">{spkPerluGambar.length}</span>
            )}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Butuh Gambar Teknik"
          value={metrik.butuhGambar}
          hint="menunggu gambar"
          icon={Send}
          tone="red"
        />
        <StatCard
          label="Menunggu ACC PM"
          value={metrik.menungguACC}
          hint="perlu keputusan"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Dalam Proses Produksi"
          value={metrik.produksi}
          hint="di workshop"
          icon={Factory}
          tone="blue"
        />
        <StatCard label="Siap Kirim" value={metrik.siapKirim} hint="menyerahkan" icon={CheckCircle2} tone="green" />
      </section>

      {terlewat.length > 0 && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.07] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
            <Clock3 size={17} />
          </span>
          <p className="text-xs text-red-200">
            <span className="font-extrabold">{terlewat.length} SPK</span> sudah melewati target deadline dan belum siap
            kirim.
          </p>
          <div className="ml-auto flex flex-wrap gap-2">
            {terlewat.map((item) => (
              <Link
                key={item.nomor}
                href={`/produksi/orders/${item.nomor}`}
                className="rounded-lg border border-red-400/30 px-2.5 py-1 font-mono text-[10px] font-bold text-red-200 transition-colors hover:bg-red-400/15"
              >
                {item.nomor}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="min-w-0 rounded-2xl border border-outline/30 bg-surface-container-low">
        <div className="flex flex-col gap-4 border-b border-outline/20 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <LayoutList size={16} />
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">Tabel Antrean SPK</h3>
              <p className="mt-0.5 text-[10px] text-on-surface-variant">
                Status gambar teknik dan status pengerjaan setiap order
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-outline/30 bg-surface-variant/50 px-3 py-1.5 text-[10px] font-bold text-on-surface-variant">
            {spkTersaring.length} dari {spk.length} SPK
          </span>
        </div>

        <div className="flex flex-col gap-3 border-b border-outline/20 bg-surface-variant/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="group flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-outline/30 bg-surface px-3 sm:max-w-sm focus-within:border-secondary/60">
            <Search size={15} className="shrink-0 text-on-surface-variant/60 transition-colors group-focus-within:text-secondary" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari SPK / Kode Barang / Kontraktor..."
              className="min-w-0 flex-1 bg-transparent text-xs text-on-surface outline-none placeholder:text-on-surface-variant/50"
            />
            {search && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => setSearch("")}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-on-surface-variant/60" />
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as FilterStatus)}
                className="h-10 w-full appearance-none rounded-xl border border-outline/30 bg-surface py-2 pl-3 pr-9 text-xs font-semibold text-on-surface outline-none transition-colors focus:border-secondary/60 sm:w-56"
                aria-label="Filter status pengerjaan"
              >
                {(Object.keys(filterPengerjaanLabels) as FilterStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {filterPengerjaanLabels[status]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left">
            <thead className="bg-surface-variant/35 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
              <tr>
                <th className="px-5 py-4 font-bold sm:px-6">Nomor SPK</th>
                <th className="px-5 py-4 font-bold">Kode Produksi Kontraktor</th>
                <th className="px-5 py-4 font-bold">Nama Kontraktor</th>
                <th className="px-5 py-4 font-bold">Target Deadline</th>
                <th className="px-5 py-4 font-bold">Status Gambar Teknik</th>
                <th className="px-5 py-4 font-bold sm:px-6">Status Pengerjaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/15">
              {spkTersaring.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant">
                      <Search size={20} />
                    </div>
                    <p className="mt-4 text-sm font-bold text-on-surface">SPK tidak ditemukan</p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Coba ubah kata kunci atau filter status pengerjaan.
                    </p>
                  </td>
                </tr>
              ) : (
                spkTersaring.map(renderBaris)
              )}
            </tbody>
          </table>
        </div>
      </section>

      {spkPerluGambar.length > 0 && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-outline/30 bg-surface-container-low px-5 py-4">
          <StatusBadge tone="red" dot>
            Perlu Gambar
          </StatusBadge>
          <p className="text-xs text-on-surface-variant">
            {spkPerluGambar.length} SPK belum punya gambar teknik yang di-ACC PM.
          </p>
          <Link
            href="/produksi/drawings"
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-outline/40 px-3.5 py-2 text-[10px] font-bold text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary"
          >
            <FileUp size={14} />
            Upload Sekarang
          </Link>
        </section>
      )}
    </div>
  );
}
