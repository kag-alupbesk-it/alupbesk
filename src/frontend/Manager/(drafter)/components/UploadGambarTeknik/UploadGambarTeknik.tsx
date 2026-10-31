"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileUp,
  Info,
  Send,
  UploadCloud,
  X,
} from "lucide-react";
import { useDrafter } from "../../context/DrafterContext/DrafterContext";
import { FileCard, PreviewGambar } from "../../../(produksi)/components/shared/BerkasPreview/BerkasPreview";
import { StatusGambarBadge } from "../../../(produksi)/components/shared/StatusBadge/StatusBadge";
import type { BerkasGambar } from "../../../(produksi)/types/types";
import { formatTanggal, getInisial } from "../../../(produksi)/utils/format/format";

const TIPE_DITERIMA = [".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".webp"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function DrafterUploadGambarTeknik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spkParam = searchParams.get("spk");

  const { spk, kirimGambar, error: contextError } = useDrafter();

  const [nomorSPK, setNomorSPK] = useState(spkParam ?? "");
  const [berkas, setBerkas] = useState<BerkasGambar | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const spkTerpilih = useMemo(() => spk.find((item) => item.nomor === nomorSPK), [spk, nomorSPK]);

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
      setFile(null);
      setBerkas(null);
      setError("Format berkas tidak didukung. Gunakan PDF, CAD (DWG/DXF), atau gambar (PNG/JPG/WEBP).");
      return;
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      setFile(null);
      setBerkas(null);
      setError("Ukuran gambar teknik maksimal 50 MB.");
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setFile(file);
    setBerkas({ nama: file.name, ukuran: file.size, tipe: file.type, url });
  };

  const kirim = async () => {
    if (isUploading) return;
    if (!nomorSPK) {
      setError("Pilih order/SPK terlebih dahulu.");
      return;
    }
    if (!berkas || !file) {
      setError("Lampirkan berkas gambar teknik sebelum mengirim ke PM.");
      return;
    }
    setIsUploading(true);
    try {
      const berhasil = await kirimGambar({
        spkNomor: nomorSPK,
        file,
        catatanTeknis: catatan,
      });
      if (!berhasil) {
        setError("Gambar teknik gagal diunggah.");
        setIsUploading(false);
        return;
      }
      setSukses(true);
      setTimeout(() => {
        router.push("/drafter");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah.");
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Link
          href="/drafter"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-secondary"
        >
          <ArrowLeft size={14} />
          Kembali ke Dashboard Drafter
        </Link>
        <h1 className="mt-3 font-headline text-2xl font-extrabold text-on-surface sm:text-3xl">
          Upload Gambar Teknik / Kerja
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant">
          Kirimkan berkas gambar teknik ke PM untuk proses persetujuan (ACC).
        </p>
      </div>

      {(error || contextError) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-xs text-red-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <span>{error || contextError}</span>
        </div>
      )}

      {sukses && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-xs text-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>Gambar teknik berhasil diunggah dan dikirim ke PM untuk ditinjau. Mengalihkan...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6 space-y-4">
            <h2 className="font-headline text-base font-bold text-on-surface">1. Pilih Nomor SPK / Order</h2>
            <select
              value={nomorSPK}
              onChange={(e) => setNomorSPK(e.target.value)}
              className="w-full rounded-xl border border-outline/30 bg-surface px-4 py-3 text-xs text-on-surface outline-none focus:border-secondary"
            >
              <option value="">-- Pilih SPK --</option>
              {spk.map((item) => (
                <option key={item.nomor} value={item.nomor}>
                  {item.nomor} — {item.namaKontraktor} ({item.kodeProduksi ?? "Tanpa Kode"})
                </option>
              ))}
            </select>

            {spkTerpilih && (
              <div className="rounded-xl border border-outline/20 bg-surface-variant/20 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">{spkTerpilih.namaKontraktor}</span>
                  <StatusGambarBadge status={spkTerpilih.statusGambar} />
                </div>
                <p className="text-on-surface-variant">Deadline: {formatTanggal(spkTerpilih.targetDeadline)} · {spkTerpilih.item.length} item</p>
                {spkTerpilih.gambarAcuan?.url && (
                  <div className="pt-2">
                    <a
                      href={spkTerpilih.gambarAcuan.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-secondary hover:underline"
                    >
                      Lihat Sketsa / Gambar Acuan Pemohon
                    </a>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6 space-y-4">
            <h2 className="font-headline text-base font-bold text-on-surface">2. Unggah Berkas Gambar Teknik</h2>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                terimaBerkas(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline/40 bg-surface-variant/20 p-8 text-center transition-all hover:border-secondary hover:bg-secondary/5"
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => terimaBerkas(e.target.files?.[0])}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110">
                <UploadCloud size={24} />
              </div>
              <p className="mt-3 text-xs font-bold text-on-surface">Klik atau seret file gambar teknik ke sini</p>
              <p className="mt-1 text-[10px] text-on-surface-variant">PDF, CAD (DWG/DXF), atau Gambar (PNG/JPG/WEBP) hingga 50 MB</p>
            </div>

            {berkas && (
              <div className="relative mt-4">
                <FileCard nama={berkas.nama} ukuran={berkas.ukuran} />
                <button
                  type="button"
                  onClick={() => {
                    setBerkas(null);
                    setFile(null);
                  }}
                  className="absolute right-3 top-3 rounded-lg bg-surface p-1 text-on-surface-variant hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <label className="block space-y-2 pt-2">
              <span className="text-xs font-bold text-on-surface">Catatan Teknis untuk PM (Opsional)</span>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tambahkan catatan khusus mengenai spesifikasi gambar..."
                rows={3}
                className="w-full rounded-xl border border-outline/30 bg-surface p-3 text-xs text-on-surface outline-none focus:border-secondary"
              />
            </label>

            <button
              type="button"
              disabled={isUploading || !nomorSPK || !berkas || sukses}
              onClick={kirim}
              className="mt-4 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-xs font-extrabold text-primary shadow-lg shadow-secondary/20 transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={15} strokeWidth={2.5} />
              {isUploading ? "Mengunggah..." : "Kirim Gambar Teknik ke PM"}
            </button>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
            <h3 className="font-headline text-xs font-extrabold uppercase tracking-[0.12em] text-on-surface">Panduan Drafter</h3>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-on-surface-variant">
              <li>• Periksa gambar acuan / sketsa mentah dari pemohon pada detail SPK yang dipilih.</li>
              <li>• Buat gambar kerja atau teknik sesuai standar fabrikasi aluminium/kaca.</li>
              <li>• Unggah file kerja berformat PDF atau CAD.</li>
              <li>• Setelah dikirim, status akan berubah menjadi <strong>Menunggu ACC PM</strong>.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
