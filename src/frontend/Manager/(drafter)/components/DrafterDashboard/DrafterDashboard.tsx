"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDrafter } from "../../context/DrafterContext/DrafterContext";
import { StatusGambarBadge } from "../../../(produksi)/components/shared/StatusBadge/StatusBadge";
import { PreviewGambar } from "../../../(produksi)/components/shared/BerkasPreview/BerkasPreview";
import { DownloadDrawingButton } from "../../../(pm)/components/shared/DownloadDrawingButton/DownloadDrawingButton";
import { formatTanggal, getInisial } from "../../../(produksi)/utils/format/format";
import { Clock3, FileUp, Layers, CheckCircle2, AlertCircle, Building2, Ruler } from "lucide-react";

export function DrafterDashboard() {
  const { spk, spkPerluGambar, loading, error, clearError } = useDrafter();
  const [filter, setFilter] = useState<"all" | "perlu" | "menunggu" | "selesai">("all");
  const [search, setSearch] = useState("");

  const menungguAcc = useMemo(() => spk.filter((i) => i.statusGambar === "menunggu_acc"), [spk]);
  const selesaiAcc = useMemo(() => spk.filter((i) => i.statusGambar === "acc_pm"), [spk]);

  const filtered = useMemo(() => {
    let list = spk;
    if (filter === "perlu") list = spkPerluGambar;
    if (filter === "menunggu") list = menungguAcc;
    if (filter === "selesai") list = selesaiAcc;

    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (item) =>
        item.nomor.toLowerCase().includes(query) ||
        item.namaKontraktor.toLowerCase().includes(query) ||
        (item.kodeProduksi ?? "").toLowerCase().includes(query) ||
        (item.alamatProyek ?? "").toLowerCase().includes(query),
    );
  }, [spk, spkPerluGambar, menungguAcc, selesaiAcc, filter, search]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-xs text-red-200">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="font-bold hover:underline">Tutup</button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
            Dashboard Tugas Desain &amp; Gambar Teknik
          </h1>
          <p className="mt-1 text-xs text-on-surface-variant">
            Kelola pembuatan dan pengunggahan gambar kerja / teknik berdasarkan sketsa mentah dari pemohon.
          </p>
        </div>
        <Link
          href="/drafter/upload"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-all hover:brightness-105"
        >
          <FileUp size={16} strokeWidth={2.5} />
          Upload Gambar Teknik
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          onClick={() => setFilter("all")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${filter === "all" ? "border-secondary bg-secondary/10 shadow-lg" : "border-outline/30 bg-surface-container-low hover:border-secondary/40"}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">Total Tugas</p>
          <p className="mt-2 font-headline text-3xl font-extrabold text-on-surface">{spk.length}</p>
          <p className="mt-1 text-[10px] text-on-surface-variant">Semua SPK aktif</p>
        </div>
        <div
          onClick={() => setFilter("perlu")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${filter === "perlu" ? "border-amber-400 bg-amber-400/10 shadow-lg" : "border-outline/30 bg-surface-container-low hover:border-amber-400/40"}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">Belum / Revisi</p>
          <p className="mt-2 font-headline text-3xl font-extrabold text-amber-200">{spkPerluGambar.length}</p>
          <p className="mt-1 text-[10px] text-amber-300/80">Perlu diunggah drafter</p>
        </div>
        <div
          onClick={() => setFilter("menunggu")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${filter === "menunggu" ? "border-blue-400 bg-blue-400/10 shadow-lg" : "border-outline/30 bg-surface-container-low hover:border-blue-400/40"}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-300">Menunggu ACC PM</p>
          <p className="mt-2 font-headline text-3xl font-extrabold text-blue-200">{menungguAcc.length}</p>
          <p className="mt-1 text-[10px] text-blue-300/80">Sedang direview PM</p>
        </div>
        <div
          onClick={() => setFilter("selesai")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${filter === "selesai" ? "border-emerald-400 bg-emerald-400/10 shadow-lg" : "border-outline/30 bg-surface-container-low hover:border-emerald-400/40"}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">Disetujui PM</p>
          <p className="mt-2 font-headline text-3xl font-extrabold text-emerald-200">{selesaiAcc.length}</p>
          <p className="mt-1 text-[10px] text-emerald-300/80">Siap dikerjakan produksi</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor SPK, kontraktor, atau kode produksi..."
          className="w-full max-w-md rounded-xl border border-outline/30 bg-surface px-4 py-2.5 text-xs text-on-surface outline-none focus:border-secondary"
        />
        <p className="text-xs text-on-surface-variant">Menampilkan {filtered.length} dari {spk.length} order</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-outline/30 bg-surface-container-low p-16 text-center text-xs text-on-surface-variant">
          Memuat tugas desain...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.nomor} className="flex flex-col justify-between rounded-2xl border border-outline/30 bg-surface-container-low p-5 transition-all hover:border-secondary/40">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-xs font-bold text-secondary">{item.nomor}</span>
                  <StatusGambarBadge status={item.statusGambar} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm font-bold text-on-surface">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-[10px] font-extrabold text-secondary">
                    {getInisial(item.namaKontraktor)}
                  </span>
                  <span className="truncate">{item.namaKontraktor}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
                  <div className="rounded-lg border border-outline/20 bg-surface-variant/20 p-2.5">
                    <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/70">Kode Produksi</p>
                    <p className="mt-0.5 font-mono font-bold text-on-surface">{item.kodeProduksi ?? "—"}</p>
                  </div>
                  <div className="rounded-lg border border-outline/20 bg-surface-variant/20 p-2.5">
                    <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/70">Target Deadline</p>
                    <p className="mt-0.5 font-bold text-on-surface">{formatTanggal(item.targetDeadline)}</p>
                  </div>
                </div>
                {item.gambarAcuan?.url && (
                  <div className="mt-3 space-y-2 rounded-xl border border-outline/20 bg-surface-variant/20 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Sketsa / Gambar Acuan Pemohon</p>
                    <PreviewGambar
                      nama={item.gambarAcuan.nama}
                      url={item.gambarAcuan.url}
                      caption="Gambar Acuan"
                      emptyText="Tidak ada gambar."
                    />
                    <div className="flex justify-end pt-1">
                      <DownloadDrawingButton
                        scopeId={item.nomor}
                        fileName={item.gambarAcuan.nama || `sketsa-${item.nomor}`}
                        source={item.gambarAcuan.url}
                        label="Download"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-outline/20 pt-4">
                <span className="text-[10px] text-on-surface-variant">{item.item.length} item barang</span>
                <Link
                  href={`/drafter/upload?spk=${encodeURIComponent(item.nomor)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:border-secondary hover:bg-secondary hover:text-primary"
                >
                  <FileUp size={14} />
                  {item.statusGambar === "belum_diunggah" ? "Upload Gambar" : item.statusGambar === "revisi" ? "Upload Revisi" : "Detail / Ganti"}
                </Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-outline/30 bg-surface-container-low p-16 text-center text-xs text-on-surface-variant">
              Tidak ada tugas desain yang sesuai dengan filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
