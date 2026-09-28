import Image from "next/image";
import type { PMOrder } from "../../types";
import { TechnicalDrawing } from "./TechnicalDrawing";

export function DrawingPreview({
  order,
  kind,
  className = "",
}: {
  order: PMOrder;
  kind: "raw" | "production";
  className?: string;
}) {
  const source = kind === "raw" ? order.rawImage : order.productionImage;
  const name = kind === "raw" ? order.rawImageName : order.productionImageName;
  const alt = kind === "raw" ? "Gambar mentah dari kontraktor" : "Gambar produksi tim teknis";

  if (source) {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-slate-100 ${className}`}>
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

  return <TechnicalDrawing variant={order.drawingVariant} mode={kind} revision={kind === "raw" ? 1 : order.revisionCount + 1} className={className} />;
}
