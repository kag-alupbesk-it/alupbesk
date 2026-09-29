import type { StatusGambarTeknik, TahapanProduksi } from "../../types";
import { statusGambarLabels, tahapanLabels } from "../../types";
import { alurMeta, gambarTone, type AlurSPK } from "../../utils/alur";

type BadgeTone = "amber" | "blue" | "green" | "red" | "slate" | "purple" | "teal";

const toneClasses: Record<BadgeTone, string> = {
  amber: "border-secondary/25 bg-secondary/10 text-secondary",
  blue: "border-blue-400/25 bg-blue-400/10 text-blue-300",
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  red: "border-red-400/25 bg-red-400/10 text-red-300",
  slate: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  purple: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  teal: "border-teal-400/25 bg-teal-400/10 text-teal-300",
};

const dotClasses: Record<BadgeTone, string> = {
  amber: "bg-secondary",
  blue: "bg-blue-400",
  green: "bg-emerald-400",
  red: "bg-red-400",
  slate: "bg-slate-400",
  purple: "bg-violet-400",
  teal: "bg-teal-400",
};

export function StatusBadge({
  children,
  tone = "slate",
  dot = false,
  className = "",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${toneClasses[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />}
      {children}
    </span>
  );
}

// Badge alur (dulu disebut status pengerjaan). Menampilkan label + kalimat
// tindakan di bawahnya supaya pengguna langsung tahu harus melakukan apa,
// tanpa harus membuka detail SPK.
export function AlurBadge({ alur, className = "" }: { alur: AlurSPK; className?: string }) {
  const meta = alurMeta[alur];
  return (
    <div className={className}>
      <StatusBadge tone={meta.tone} dot>
        {meta.label}
      </StatusBadge>
      <p className="mt-1 max-w-[190px] text-[10px] leading-snug text-on-surface-variant/75">{meta.tindakan}</p>
    </div>
  );
}

export function StatusGambarBadge({ status }: { status: StatusGambarTeknik }) {
  return (
    <StatusBadge tone={gambarTone[status]} dot>
      {statusGambarLabels[status]}
    </StatusBadge>
  );
}

export function TahapanBadge({ tahapan }: { tahapan: TahapanProduksi }) {
  const tone: BadgeTone =
    tahapan === "siap_kirim" ? "green" : tahapan === "qc" ? "teal" : tahapan === "pemotongan" ? "amber" : "blue";
  return (
    <StatusBadge tone={tone} dot>
      {tahapanLabels[tahapan]}
    </StatusBadge>
  );
}
