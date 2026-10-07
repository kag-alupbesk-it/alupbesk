import type { DrawingVariant } from "../../../types/types";

interface TechnicalDrawingProps {
  variant: DrawingVariant;
  mode: "raw" | "production";
  zoom?: number;
  revision?: number;
  className?: string;
}

const gridPoints = Array.from({ length: 9 }, (_, index) => 30 + index * 55);

function RawFrame({ variant }: { variant: DrawingVariant }) {
  if (variant === "ventilation") {
    return (
      <g stroke="currentColor" strokeWidth="2" fill="none">
        <rect x="110" y="70" width="380" height="260" />
        {Array.from({ length: 7 }, (_, index) => (
          <path key={index} d={`M 128 ${94 + index * 32} H 472`} />
        ))}
        <path d="M 110 200 H 490 M 300 70 V 330" />
      </g>
    );
  }

  if (variant === "partition") {
    return (
      <g stroke="currentColor" strokeWidth="2" fill="none">
        <rect x="105" y="66" width="390" height="270" />
        <path d="M 205 66 V 336 M 305 66 V 336 M 405 66 V 336" />
        <path d="M 105 160 H 495 M 105 250 H 495" />
        <path d="M 150 66 V 336 M 350 66 V 336" strokeDasharray="5 6" />
      </g>
    );
  }

  if (variant === "window-frame") {
    return (
      <g stroke="currentColor" strokeWidth="2" fill="none">
        <rect x="120" y="64" width="360" height="276" />
        <rect x="145" y="89" width="310" height="226" />
        <path d="M 300 89 V 315 M 145 202 H 455" />
        <path d="M 180 120 H 260 M 340 120 H 420 M 180 254 H 260 M 340 254 H 420" strokeWidth="1.5" />
      </g>
    );
  }

  return (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <rect x="92" y="72" width="416" height="260" />
      {Array.from({ length: 5 }, (_, index) => (
        <path key={index} d={`M ${92 + index * 104} 72 V 332`} />
      ))}
      <path d="M 92 140 H 508 M 92 250 H 508" />
      <path d="M 135 95 H 185 M 239 95 H 289 M 343 95 H 393 M 447 95 H 497" strokeWidth="1.5" />
    </g>
  );
}

export function TechnicalDrawing({ variant, mode, zoom = 1, revision = mode === "production" ? 2 : 1, className = "" }: TechnicalDrawingProps) {
  const isProduction = mode === "production";
  const accent = isProduction ? "#d97706" : "#2563eb";
  const secondary = isProduction ? "#15803d" : "#64748b";
  const background = isProduction ? "#fffaf0" : "#f7faff";

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 600 400"
        role="img"
        aria-label={isProduction ? "Gambar produksi tim teknis" : "Gambar mentah kontraktor"}
        className="h-full w-full origin-center transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        <rect width="600" height="400" fill={background} />
        <g stroke="#dbe4ec" strokeWidth="1" opacity="0.9">
          {gridPoints.map((x) => <path key={`x-${x}`} d={`M ${x} 0 V 400`} />)}
          {gridPoints.map((y) => <path key={`y-${y}`} d={`M 0 ${y} H 600`} />)}
        </g>
        <rect x="18" y="18" width="564" height="364" rx="4" fill="none" stroke={accent} strokeWidth="1.5" />
        <g color={accent}>
          <RawFrame variant={variant} />
        </g>
        <g stroke={secondary} strokeWidth="1.5" fill="none">
          <path d="M 92 356 H 508" />
          <path d="M 92 350 V 362 M 508 350 V 362" />
          <path d="M 508 72 V 332" />
          <path d="M 502 72 H 514 M 502 332 H 514" />
        </g>
        <g fill={secondary} fontFamily="Arial, sans-serif" fontSize="11">
          <text x="278" y="374">4.200 mm</text>
          <text x="520" y="208" transform="rotate(90 520 208)">2.600 mm</text>
          <text x="30" y="42" fontSize="9" letterSpacing="1.4">{isProduction ? "PRODUCTION / TECHNICAL" : "RAW / CONTRACTOR"}</text>
          <text x="430" y="42" fontSize="9" letterSpacing="1.4">{variant.toUpperCase()}</text>
        </g>
        <g fill={accent} opacity="0.7">
          <circle cx="30" cy="370" r="3" />
          <circle cx="570" cy="370" r="3" />
        </g>
      </svg>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-900/10 bg-white/80 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-600 backdrop-blur-sm">
        {isProduction ? `REV ${String(revision).padStart(2, "0")} · TEAM TEKNIS` : `REV ${String(revision).padStart(2, "0")} · KONTRAKTOR`}
      </div>
    </div>
  );
}
