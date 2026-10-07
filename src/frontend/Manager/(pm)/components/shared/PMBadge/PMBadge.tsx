import type { DrawingStatus, ProjectStatus } from "../../../types/types";
import { drawingStatusLabels, projectStatusLabels } from "../../../types/types";

type BadgeTone = "amber" | "blue" | "green" | "red" | "slate" | "purple";

const toneClasses: Record<BadgeTone, string> = {
  amber: "border-secondary/25 bg-secondary/10 text-secondary",
  blue: "border-blue-400/25 bg-blue-400/10 text-blue-300",
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  red: "border-red-400/25 bg-red-400/10 text-red-300",
  slate: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  purple: "border-violet-400/25 bg-violet-400/10 text-violet-300",
};

const dotClasses: Record<BadgeTone, string> = {
  amber: "bg-secondary",
  blue: "bg-blue-400",
  green: "bg-emerald-400",
  red: "bg-red-400",
  slate: "bg-slate-400",
  purple: "bg-violet-400",
};

export function PMBadge({
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

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const tone: BadgeTone =
    status === "selesai"
      ? "green"
      : status === "produksi"
        ? "blue"
        : status === "siap_produksi"
          ? "amber"
          : status === "siap_kirim"
            ? "purple"
            : "red";

  return (
    <PMBadge tone={tone} dot>
      {projectStatusLabels[status]}
    </PMBadge>
  );
}

export function DrawingStatusBadge({ status }: { status: DrawingStatus }) {
  const tone: BadgeTone = status === "acc_gambar" ? "green" : status === "revisi" ? "red" : "amber";
  return (
    <PMBadge tone={tone} dot>
      {drawingStatusLabels[status]}
    </PMBadge>
  );
}
