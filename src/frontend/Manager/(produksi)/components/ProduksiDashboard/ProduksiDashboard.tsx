"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  Clock3,
  Factory,
  Filter,
  LayoutList,
  Search,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";
import { useProduksi } from "../../context/ProduksiContext";
import type { SPK } from "../../types";
import { AlurBadge, StatusBadge, StatusGambarBadge } from "../shared/StatusBadge/StatusBadge";
import { alurMeta, alurOrder, alurSPK, type AlurSPK } from "../../utils/alur";
import { formatTanggal, getInisial } from "../../utils/format";

type FilterStatus = AlurSPK | "all";

interface StatCardProps {
  alur: AlurSPK;
  value: number;
  icon: LucideIcon;
  // Kartu yang sedang aktif sebagai filter, supaya terlihat ter-highlight.
  aktif: boolean;
  onPilih: () => void;
}

const statToneClasses = {
  red: "bg-red-400/10 text-red-300",
  amber: "bg-secondary/12 text-secondary",
  blue: "bg-blue-400/10 text-blue-300",
  green: "bg-emerald-400/10 text-emerald-300",
};

// Keempat kartu sengaja bisa diklik: pengguna tidak perlu memakai dropdown
// filter, cukup klik kartu status yang sedang dicari.
function StatCard({ alur, value, icon: Icon, aktif, onPilih }: StatCardProps) {
  const meta = alurMeta[alur];
  return (
    <button
      type="button"
      onClick={onPilih}
      aria-pressed={aktif}
      className={[
        "flex items-center gap-4 rounded-2xl border p-5 text-left transition-all",
        aktif
          ? "border-secondary/60 bg-surface-container shadow-lg shadow-secondary/10"
          : "border-outline/30 bg-surface-container-low hover:border-secondary/40",
      ].join(" ")}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statToneClasses[meta.tone]}`}>
        <Icon size={19} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{meta.label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">{value}</p>
          <span className="truncate text-[10px] text-on-surface-variant/70">SPK</span>
        </div>
        <p className="mt-1 text-[10px] leading-snug text-on-surface-variant/80">{meta.tindakan}</p>
      </div>
      {aktif && <X size={14} className="shrink-0 text-secondary" aria-hidden />}
    </button>
  );
}

export function ProduksiDashboard() {
  const { spk, spkPerluGambar } = useProduksi();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  // Semua angka, filter, dan badge diturunkan dari alurSPK() supaya tidak
  // mungkin ada kartu yang bilang 3 sementara dropdown upload berisi 2.
  const hitungAlur = useMemo(() => {
    const jumlah: Record<AlurSPK, number> = { butuh_gambar: 0, menunggu_acc: 0, dalam_produksi: 0, siap_kirim: 0 };
    for (const item of spk) jumlah[alurSPK(item)] += 1;
    return jumlah;
  }, [spk]);

  const spkTersaring = useMemo(() => {
    const kata = search.trim().toLowerCase();
    return spk.filter((item) => {
      const cocokStatus = filter === "all" || alurSPK(item) === filter;
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
  const spkFokus = useMemo(() => spk.find((item) => alurSPK(item) === "dalam_produksi") ?? spk[0], [spk]);

  const terlewat = useMemo(() => {
    const sekarang = new Date().toISOString().slice(0, 10);
    return spk.filter((item) => item.targetDeadline < sekarang && alurSPK(item) !== "siap_kirim");
  }, [spk]);

  const renderBaris = (item: SPK) => {
    const alur = alurSPK(item);
    return (
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
            // Tanda hubung saja bisa membingungkan, jadi jelaskan artinya.
            <span className="text-[11px] italic text-on-surface-variant/60">Belum ada kode</span>
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
          <AlurBadge alur={alur} />
        </td>
        <td className="w-14 px-2 py-4 sm:pr-6">
          {/* Panah di ujung baris memberi petunjuk bahwa baris ini bisa dibuka,
              jadi pengguna tidak harus menebak dari teks link saja. */}
          <Link
            href={`/produksi/orders/${item.nomor}`}
            aria-label={`Buka detail ${item.nomor}`}
            className="-m-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant/40 transition-colors hover:bg-surface-variant/60 group-hover:text-secondary"
          >
            <ChevronRight size={16} />
          </Link>
        </td>
      </tr>
    );
  };

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
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-outline/40 bg-surface-container px-4 py-2.5 text-xs font-bold text-on-surface transition-all hover:border-secondary/50 hover:text-secondary md:min-h-0"
            >
              <ClipboardList size={15} />
              Detail SPK &amp; Progress
            </Link>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          alur="butuh_gambar"
          value={hitungAlur.butuh_gambar}
          icon={Send}
          aktif={filter === "butuh_gambar"}
          onPilih={() => setFilter(filter === "butuh_gambar" ? "all" : "butuh_gambar")}
        />
        <StatCard
          alur="menunggu_acc"
          value={hitungAlur.menunggu_acc}
          icon={Clock3}
          aktif={filter === "menunggu_acc"}
          onPilih={() => setFilter(filter === "menunggu_acc" ? "all" : "menunggu_acc")}
        />
        <StatCard
          alur="dalam_produksi"
          value={hitungAlur.dalam_produksi}
          icon={Factory}
          aktif={filter === "dalam_produksi"}
          onPilih={() => setFilter(filter === "dalam_produksi" ? "all" : "dalam_produksi")}
        />
        <StatCard
          alur="siap_kirim"
          value={hitungAlur.siap_kirim}
          icon={CheckCircle2}
          aktif={filter === "siap_kirim"}
          onPilih={() => setFilter(filter === "siap_kirim" ? "all" : "siap_kirim")}
        />
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
                className="inline-flex items-center rounded-lg border border-red-400/30 px-3 py-2.5 font-mono text-[10px] font-bold text-red-200 transition-colors hover:bg-red-400/15"
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
                Klik nomor SPK atau panah di ujung baris untuk membuka detail
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
              placeholder="Cari No. SPK, kode, atau kontraktor..."
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
                <option value="all">Semua Status Pengerjaan</option>
                {alurOrder.map((status) => (
                  <option key={status} value={status}>
                    {alurMeta[status].label}
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

        {/* Kartu untuk layar kecil (Android) menggantikan tabel yang perlu scroll horizontal. */}
        <div className="md:hidden space-y-3 p-4">
          {spkTersaring.length === 0 ? (
            <div className="rounded-xl border border-outline/30 bg-primary-container px-4 py-12 text-center shadow-lg">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant">
                <Search size={20} />
              </div>
              <p className="mt-4 text-sm font-bold text-on-surface">Tidak ada SPK yang cocok</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {filter === "all" && !search
                  ? "Belum ada data antrean produksi."
                  : "Coba hapus filter status atau kata kunci pencarian."}
              </p>
              {(search || filter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-outline/40 px-4 py-3 text-xs font-bold text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary md:min-h-0"
                >
                  Tampilkan Semua SPK
                </button>
              )}
            </div>
          ) : (
            spkTersaring.map((item) => {
              const alur = alurSPK(item);
              return (
                <div
                  key={item.nomor}
                  className="rounded-xl border border-outline/30 bg-primary-container p-4 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-secondary">{item.nomor}</p>
                      <p className="mt-1 truncate text-sm font-bold text-on-surface">{item.namaKontraktor}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <AlurBadge alur={alur} className="[&>p]:hidden" />
                      <StatusGambarBadge status={item.statusGambar} />
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-on-surface-variant">
                    <p className="truncate">Kode Produksi: {item.kodeProduksi ?? "Belum ada kode"}</p>
                    <p className="truncate">{item.item.length} item spesifikasi</p>
                    <p>Masuk {formatTanggal(item.tanggalMasuk)}</p>
                    <p>Target {formatTanggal(item.targetDeadline)}</p>
                    <p className="text-[10px] leading-snug text-on-surface-variant/75">{alurMeta[alur].tindakan}</p>
                  </div>

                  {terlewat.includes(item) && (
                    <p className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-red-300">
                      <AlertTriangle size={11} /> Lewat deadline
                    </p>
                  )}

                  <div className="mt-4 flex">
                    <Link
                      href={`/produksi/orders/${item.nomor}`}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-colors hover:brightness-105 md:min-h-0"
                    >
                      <ChevronRight size={15} />
                      Buka Detail SPK
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1040px] text-left">
            <thead className="bg-surface-variant/35 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
              <tr>
                <th className="px-5 py-4 font-bold sm:px-6">Nomor SPK</th>
                <th className="hidden px-5 py-4 font-bold lg:table-cell">Kode Produksi Kontraktor</th>
                <th className="px-5 py-4 font-bold">Nama Kontraktor</th>
                <th className="hidden px-5 py-4 font-bold xl:table-cell">Target Deadline</th>
                <th className="px-5 py-4 font-bold">Status Gambar Teknik</th>
                <th className="px-5 py-4 font-bold sm:px-6">Status Pengerjaan &amp; Tindakan</th>
                <th className="w-14 px-2 py-4 sm:pr-6">
                  <span className="sr-only">Buka detail</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/15">
              {spkTersaring.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant">
                      <Search size={20} />
                    </div>
                    <p className="mt-4 text-sm font-bold text-on-surface">Tidak ada SPK yang cocok</p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {filter === "all" && !search
                        ? "Belum ada data antrean produksi."
                        : "Coba hapus filter status atau kata kunci pencarian."}
                    </p>
                    {(search || filter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setFilter("all");
                        }}
                        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-outline/40 px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary md:min-h-0"
                      >
                        Tampilkan Semua SPK
                      </button>
                    )}
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
            <span className="font-bold text-on-surface">{spkPerluGambar.length} SPK</span> butuh gambar teknik (belum
            ada / perlu revisi). Buka <span className="font-bold text-on-surface">Upload Gambar Teknik</span> di menu
            sidebar untuk mengirim.
          </p>
        </section>
      )}
    </div>
  );
}
