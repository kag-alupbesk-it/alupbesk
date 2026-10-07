"use client";

import { Check, CircleSlash, Lock } from "lucide-react";
import { tahapanOrder, tahapanLabels, tahapanDescriptions, type TahapanProduksi } from "../../types";

interface ProgressStepperProps {
  tahapan: TahapanProduksi;
  // Produksi hanya boleh berjalan setelah gambar teknik di-ACC PM. Saat masih
  // terkunci, seluruh tombol dinonaktifkan.
  terkunci: boolean;
  // Alasan terkunci, ditulis berbeda antara "gambar belum ada" (tugas=user) dan
  // "gambar sedang di PM" (tugas=user lain), supaya tidak membingungkan.
  pesanTerkunci: string;
  onPilih: (tahapan: TahapanProduksi) => void;
}

export function ProgressStepper({ tahapan, terkunci, pesanTerkunci, onPilih }: ProgressStepperProps) {
  const indeksSekarang = tahapanOrder.indexOf(tahapan);
  const persen = ((indeksSekarang + 1) / tahapanOrder.length) * 100;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-headline text-base font-bold text-on-surface">Progress Tracker Pengerjaan</h3>
          <p className="mt-0.5 text-[10px] text-on-surface-variant">
            Klik tahapan untuk memperbarui progres pengerjaan di workshop
          </p>
        </div>
        <div className="text-right">
          <p className="font-headline text-2xl font-extrabold tracking-tight text-secondary">{Math.round(persen)}%</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/60">
            Tahap {indeksSekarang + 1} dari {tahapanOrder.length}
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
        <div
          className="h-full rounded-full bg-secondary transition-[width] duration-500 ease-out"
          style={{ width: `${persen}%` }}
        />
      </div>

      {terkunci && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3.5">
          <Lock size={15} className="mt-0.5 shrink-0 text-amber-300" />
          <p className="text-[11px] leading-relaxed text-amber-200">{pesanTerkunci}</p>
        </div>
      )}

      <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tahapanOrder.map((tahapan, index) => {
          const selesai = index < indeksSekarang;
          const sekarang = index === indeksSekarang;
          const bisaDipilih = !terkunci && index === indeksSekarang + 1;

          return (
            <li key={tahapan}>
              <button
                type="button"
                disabled={!bisaDipilih}
                aria-current={sekarang ? "step" : undefined}
                onClick={() => onPilih(tahapan)}
                className={[
                  "group flex h-full w-full flex-col rounded-xl border p-4 text-left transition-all",
                  terkunci
                    ? "cursor-not-allowed border-outline/20 bg-surface-variant/20 opacity-60"
                    : sekarang
                      ? "border-secondary/50 bg-secondary/10 shadow-lg shadow-secondary/10"
                      : selesai
                        ? "cursor-not-allowed border-emerald-400/25 bg-emerald-400/[0.06] opacity-60"
                        : bisaDipilih
                          ? "border-outline/25 bg-surface hover:border-secondary/40"
                          : "cursor-not-allowed border-outline/20 bg-surface-variant/20 opacity-60",
                ].join(" ")}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold",
                      terkunci
                        ? "bg-surface-variant text-on-surface-variant"
                        : selesai
                          ? "bg-emerald-400/20 text-emerald-300"
                          : sekarang
                            ? "bg-secondary text-primary"
                            : bisaDipilih
                              ? "bg-surface-variant text-on-surface-variant"
                              : "bg-surface-variant text-on-surface-variant/60",
                    ].join(" ")}
                  >
                    {terkunci ? <CircleSlash size={13} /> : selesai ? <Check size={14} strokeWidth={3} /> : index + 1}
                  </span>
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-[0.06em] ${
                      terkunci || (!bisaDipilih && !sekarang && !selesai)
                        ? "text-on-surface-variant"
                        : sekarang
                          ? "text-secondary"
                          : "text-on-surface"
                    }`}
                  >
                    {tahapanLabels[tahapan]}
                  </span>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-on-surface-variant">
                  {tahapanDescriptions[tahapan]}
                </p>
                {!terkunci && (
                  <span
                    className={`mt-2 text-[9px] font-bold uppercase tracking-[0.12em] ${
                      selesai ? "text-emerald-300" : sekarang ? "text-secondary" : "text-on-surface-variant/55"
                    }`}
                  >
                    {selesai ? "Selesai" : sekarang ? "Sedang berjalan" : "Belum mulai"}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <p className="sr-only" role="status">
        Tahap aktif: {tahapanLabels[tahapan]}.
      </p>
    </div>
  );
}
