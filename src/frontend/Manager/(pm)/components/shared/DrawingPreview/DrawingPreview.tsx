import Image from "next/image";
import { FileText, Ruler } from "lucide-react";
import type { PMOrder } from "../../../types";

export function DrawingPreview({
  order,
  kind,
  className = "",
  scopeId,
}: {
  order: PMOrder;
  kind: "raw" | "production";
  className?: string;
  // Dipakai fitur unduh untuk menemukan elemen gambar di dalam pratinjau ini.
  scopeId?: string;
}) {
  const source = kind === "raw" ? order.rawImage : order.productionImage;
  const name = kind === "raw" ? order.rawImageName : order.productionImageName;
  const alt = kind === "raw" ? "Gambar mentah dari kontraktor" : "Gambar produksi tim teknis";
  const extension = name?.split(".").pop()?.toLowerCase();
  const isCad = extension === "dwg" || extension === "dxf";
  const isDocument = extension === "pdf" || isCad;

  if (source) {
    if (isDocument) {
      const Icon = isCad ? Ruler : FileText;
      return (
        <div
          id={scopeId}
          className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-container-low p-6 text-center ${className}`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Icon size={22} />
          </span>
          <p className="max-w-full truncate text-xs font-bold text-on-surface">
            {name}
          </p>
          <a
            href={source}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-secondary/40 px-3 py-2 text-[10px] font-bold text-secondary hover:bg-secondary/10"
          >
            Buka {extension?.toUpperCase()}
          </a>
        </div>
      );
    }

    return (
      <div
        id={scopeId}
        className={`relative h-full w-full overflow-hidden bg-slate-100 ${className}`}
      >
        <Image
          src={source}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain"
        />
        {name && (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-900/10 bg-white/85 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600 backdrop-blur-sm">
            {name}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id={scopeId}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-container-low p-6 text-center text-xs text-on-surface-variant ${className}`}
    >
      <FileText size={24} />
      <p>{kind === "raw" ? "Belum ada gambar acuan." : "Belum ada gambar produksi."}</p>
    </div>
  );
}
