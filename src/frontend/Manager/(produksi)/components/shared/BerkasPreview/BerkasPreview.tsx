import { FileBox, FileImage, FileText, Info, Ruler } from "lucide-react";
import { formatUkuranBerkas, getEkstensi } from "../../../utils/format";

interface FileCardProps {
  nama: string;
  ukuran?: number;
  catatan?: string;
  className?: string;
}

// Kartu berkas untuk PDF / CAD. Berkas gambar dan PDF tidak bisa dirender
// tanpa viewer, jadi yang ditampilkan adalah identitas berkasnya.
export function FileCard({ nama, ukuran, catatan, className = "" }: FileCardProps) {
  const ekstensi = getEkstensi(nama);
  const Icon = ekstensi === "PDF" ? FileText : ekstensi === "DWG" || ekstensi === "DXF" ? Ruler : FileBox;

  return (
    <div className={`flex items-start gap-3 rounded-xl border border-outline/25 bg-surface-variant/30 p-4 ${className}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-on-surface">{nama}</p>
        <p className="mt-1 text-[10px] text-on-surface-variant">
          {ekstensi}
          {ukuran ? ` • ${formatUkuranBerkas(ukuran)}` : ""}
        </p>
        {catatan && <p className="mt-2 text-[10px] leading-relaxed text-on-surface-variant/80">{catatan}</p>}
      </div>
    </div>
  );
}

// Panel pratinjau gambar teknik. Kalau berkas uploaded berupa gambar, gambarnya
// ditampilkan langsung; PDF / CAD memakai FileCard.
export function PreviewGambar({
  nama,
  url,
  ukuran,
  caption,
  emptyText = "Belum ada gambar teknik.",
  className = "",
}: {
  nama?: string;
  url?: string;
  ukuran?: number;
  caption?: string;
  emptyText?: string;
  className?: string;
}) {
  if (!nama) {
    return (
      <div
        className={`flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-outline/30 bg-surface-variant/20 p-6 text-center ${className}`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-variant text-on-surface-variant/70">
          <FileImage size={22} />
        </span>
        <p className="mt-3 text-xs font-bold text-on-surface-variant">{emptyText}</p>
      </div>
    );
  }

  const bisaTampil = Boolean(url) && !getEkstensi(nama).match(/PDF|DWG|DXF/);

  return (
    <div className={`space-y-3 ${className}`}>
      {bisaTampil ? (
        <div className="relative min-h-[240px] overflow-hidden rounded-xl border border-outline/25 bg-slate-100">
          {/* Blob URL dibuat di browser dari File yang dipilih, bukan aset statis. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={caption ?? nama} className="h-full max-h-[420px] w-full object-contain" />
          {caption && (
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-900/10 bg-white/85 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600 backdrop-blur-sm">
              {caption}
            </div>
          )}
        </div>
      ) : (
        <FileCard nama={nama} ukuran={ukuran} />
      )}

      {url && getEkstensi(nama).match(/PDF|DWG|DXF/) && (
        <p className="flex items-start gap-2 text-[10px] leading-relaxed text-on-surface-variant/80">
          <Info size={13} className="mt-0.5 shrink-0" />
          Pratinjau inline untuk {getEkstensi(nama)} belum tersedia. Unduh atau buka berkasnya dari aplikasi CAD Anda.
        </p>
      )}
    </div>
  );
}
