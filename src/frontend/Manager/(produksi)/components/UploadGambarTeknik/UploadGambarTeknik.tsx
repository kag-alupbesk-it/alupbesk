"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileUp,
  Info,
  PencilLine,
  Send,
  UploadCloud,
  X,
} from "lucide-react";
import { useProduksi } from "../../context/ProduksiContext/ProduksiContext";
import { FileCard, PreviewGambar } from "../shared/BerkasPreview/BerkasPreview";
import { StatusBadge, StatusGambarBadge } from "../shared/StatusBadge/StatusBadge";
import type { BerkasGambar } from "../../types/types";
import { formatTanggal, getInisial } from "../../utils/format/format";

const TIPE_DITERIMA = [".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".webp"];

function formatByteDariFile(file: File): number {
  return file.size;
}

export function UploadGambarTeknik() {
  const router = useRouter();
  const { spkPerluGambar, kirimGambar } = useProduksi();

  const [nomorSPK, setNomorSPK] = useState("");
  const [berkas, setBerkas] = useState<BerkasGambar | null>(null);
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const spkTerpilih = useMemo(() => spkPerluGambar.find((item) => item.nomor === nomorSPK), [spkPerluGambar, nomorSPK]);

  // object URL dibuat manual supaya harus dilepas. Tanpa ini, tiap pemilihan
  // berkas membocorkan blob URL sampai tab ditutup.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const terimaBerkas = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    const ekstensi = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!TIPE_DITERIMA.includes(ekstensi)) {
      setError(`Format berkas tidak didukung. Gunakan PDF, CAD (DWG/DXF), atau gambar (PNG/JPG/WEBP).`);
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setBerkas({ nama: file.name, ukuran: formatByteDariFile(file), tipe: file.type, url });
  };

  const kirim = () => {
    if (!nomorSPK) {
      setError("Pilih order/SPK yang membutuhkan gambar teknik terlebih dahulu.");
      return;
    }
    if (!berkas) {
      setError("Lampirkan berkas gambar teknik (PDF atau CAD) sebelum mengirim ke PM.");
      return;
    }
    kirimGambar({ spkNomor: nomorSPK, berkas, catatanTeknis: catatan });
    setSukses(true);
    // Beri jeda singkat supaya pesan berhasil terbaca sebelum pindah halaman.
    setTimeout(() => router.push("/produksi"), 900);
  };

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
        <h2 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Upload Gambar Teknik<span className="text-secondary">.</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          Unggah gambar teknik dari tim teknis untuk di-ACC PM, lengkap dengan catatan teknis produksi.
        </p>
      </section>

      {sukses && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.08] px-5 py-4">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
          <p className="text-xs text-emerald-200">
            Gambar teknik berhasil dikirim ke PM. Status SPK <span className="font-bold">{nomorSPK}</span> kini{" "}
            <span className="font-bold">Menunggu Review PM</span>. Mengalihkan ke dashboard...
          </p>
        </div>
      )}

      {spkPerluGambar.length === 0 ? (
        <section className="rounded-2xl border border-outline/30 bg-surface-container-low px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 size={22} />
          </div>
          <p className="mt-4 text-sm font-bold text-on-surface">Semua SPK sudah punya gambar teknik</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-on-surface-variant">
            Tidak ada order yang menunggu gambar teknik saat ini. Order yang sudah di-ACC PM tidak perlu diunggah ulang.
          </p>
          <Link
            href="/produksi"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-outline/40 px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary"
          >
            <ArrowLeft size={14} />
            Kembali ke Antrean
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <FileUp size={16} />
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-on-surface">Pilih Order</h3>
                  <p className="mt-0.5 text-[10px] text-on-surface-variant">
                    Hanya SPK yang belum punya gambar teknik atau perlu revisi
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="pilih-spk" className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                  Order / Nomor SPK
                </label>
                <div className="relative mt-2">
                  <select
                    id="pilih-spk"
                    value={nomorSPK}
                    onChange={(event) => setNomorSPK(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-outline/30 bg-surface py-2 pl-3 pr-9 text-xs font-semibold text-on-surface outline-none transition-colors focus:border-secondary/60"
                  >
                    <option value="">— Pilih SPK —</option>
                    {spkPerluGambar.map((item) => (
                      <option key={item.nomor} value={item.nomor}>
                        {item.nomor} • {item.namaKontraktor}
                        {item.kodeProduksi ? ` (${item.kodeProduksi})` : " (tanpa kode)"}
                        {item.statusGambar === "revisi" ? " — perlu revisi" : " — belum ada gambar"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                </div>
              </div>

              {spkTerpilih && (
                <div className="mt-5 rounded-xl border border-outline/25 bg-surface-variant/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-[10px] font-extrabold text-secondary">
                        {getInisial(spkTerpilih.namaKontraktor)}
                      </span>
                      <div>
                        <p className="font-mono text-xs font-bold text-on-surface">{spkTerpilih.nomor}</p>
                        <p className="mt-0.5 text-[11px] text-on-surface-variant">{spkTerpilih.namaKontraktor}</p>
                      </div>
                    </div>
                    <StatusGambarBadge status={spkTerpilih.statusGambar} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-outline/20 pt-4 text-[10px] sm:grid-cols-3">
                    <div>
                      <dt className="text-on-surface-variant/70">Kode Produksi</dt>
                      <dd className="mt-0.5 font-mono font-bold text-on-surface">
                        {spkTerpilih.kodeProduksi ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-on-surface-variant/70">Target Deadline</dt>
                      <dd className="mt-0.5 font-bold text-on-surface">{formatTanggal(spkTerpilih.targetDeadline)}</dd>
                    </div>
                    <div>
                      <dt className="text-on-surface-variant/70">Item</dt>
                      <dd className="mt-0.5 font-bold text-on-surface">{spkTerpilih.item.length} barang</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <UploadCloud size={16} />
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-on-surface">Berkas Gambar Teknik</h3>
                  <p className="mt-0.5 text-[10px] text-on-surface-variant">PDF, CAD (DWG/DXF), atau gambar teknik</p>
                </div>
              </div>

              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  terimaBerkas(event.dataTransfer.files?.[0]);
                }}
                className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-outline/35 bg-surface-variant/20 px-6 py-10 text-center transition-colors hover:border-secondary/50"
              >
                {berkas ? (
                  <div className="w-full max-w-md space-y-3">
                    <FileCard nama={berkas.nama} ukuran={berkas.ukuran} />
                    <button
                      type="button"
                      onClick={() => {
                        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
                        objectUrlRef.current = null;
                        setBerkas(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red-300 transition-colors hover:text-red-200"
                    >
                      <X size={13} />
                      Hapus Berkas
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant/70">
                      <UploadCloud size={22} />
                    </span>
                    <p className="mt-3 text-xs font-bold text-on-surface">Tarik berkas ke sini</p>
                    <p className="mt-1 text-[10px] text-on-surface-variant">atau pilih berkas dari komputer</p>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="mt-4 rounded-xl border border-outline/40 bg-surface-container px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary"
                    >
                      Pilih Berkas
                    </button>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept={TIPE_DITERIMA.join(",")}
                  className="sr-only"
                  onChange={(event) => terimaBerkas(event.target.files?.[0])}
                  aria-label="Pilih berkas gambar teknik"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="catatan-teknis" className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                  Catatan Teknis Produksi
                </label>
                <textarea
                  id="catatan-teknis"
                  value={catatan}
                  onChange={(event) => setCatatan(event.target.value)}
                  rows={4}
                  placeholder="cth. Potongan profil 4 inch mengikuti gambar revisi 02. Joinery bawah memakai bracket SS304."
                  className="mt-2 w-full resize-y rounded-xl border border-outline/30 bg-surface px-3.5 py-3 text-xs leading-relaxed text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45 focus:border-secondary/60"
                />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
              <div className="flex items-start gap-2.5">
                <PencilLine size={16} className="mt-0.5 shrink-0 text-secondary" />
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-secondary">Acuan Kontraktor</h3>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-on-surface-variant">
                    Sketsa mentah dari kontraktor sebagai acuan tim teknis
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {spkTerpilih ? (
                  spkTerpilih.gambarAcuan ? (
                    <PreviewGambar
                      nama={spkTerpilih.gambarAcuan.nama}
                      url={spkTerpilih.gambarAcuan.url}
                      caption="Sketsa kontraktor"
                      emptyText="Kontraktor tidak mengirim sketsa."
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-outline/30 bg-surface-variant/20 p-5 text-center text-[10px] text-on-surface-variant">
                      Kontraktor tidak mengirim sketsa untuk SPK ini.
                    </div>
                  )
                ) : (
                  <div className="rounded-xl border border-dashed border-outline/30 bg-surface-variant/20 p-6 text-center">
                    <p className="text-[10px] text-on-surface-variant">Pilih order dulu untuk melihat acuan gambar.</p>
                  </div>
                )}
              </div>

              {spkTerpilih?.gambarAcuan?.catatan && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-outline/25 bg-surface-variant/30 p-3.5 text-[10px] leading-relaxed text-on-surface-variant">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  {spkTerpilih.gambarAcuan.catatan}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-on-surface">Item SPK</h3>
              <ul className="mt-4 space-y-2.5">
                {(spkTerpilih?.item ?? []).map((barang) => (
                  <li key={barang.kode} className="rounded-xl border border-outline/20 bg-surface-variant/25 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-secondary">{barang.kode}</span>
                      <span className="text-[10px] font-bold text-on-surface">
                        {barang.kuantitas} {barang.satuan}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-on-surface">{barang.nama}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-on-surface-variant/75">{barang.catatanSpesifikasi}</p>
                  </li>
                ))}
                {!spkTerpilih && <li className="text-[10px] text-on-surface-variant">Pilih order untuk melihat rincian barang.</li>}
              </ul>
            </section>
          </aside>

          <div className="xl:col-span-2">
            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-300" />
                <p className="text-[11px] text-red-200">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline/30 bg-surface-container-low px-5 py-4">
              <div className="flex items-center gap-2">
                <StatusBadge tone={berkas ? "green" : "slate"} dot>
                  {berkas ? "Siap kirim" : "Belum ada berkas"}
                </StatusBadge>
                <span className="text-[10px] text-on-surface-variant">
                  Status SPK akan berubah menjadi <span className="font-bold text-secondary">Menunggu Review PM</span> setelah dikirim
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/produksi"
                  className="rounded-xl border border-outline/40 px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary"
                >
                  Batal
                </Link>
                <button
                  type="button"
                  onClick={kirim}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-all hover:-translate-y-0.5 hover:brightness-105"
                >
                  <Send size={15} strokeWidth={2.5} />
                  Kirim ke PM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
