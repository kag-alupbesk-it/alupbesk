"use client";

import { useState } from "react";
import { useKeuangan, type KeuanganEntry } from "../keuangan/KeuanganContext";
import { FinancialStatCard } from "./ui/FinancialStatCard";

type Range = "hari" | "minggu" | "bulan" | "tahun";
type CashFlowPoint = { label: string; income: number; expense: number };

const ranges: { key: Range; label: string }[] = [
  { key: "hari", label: "7 hari" },
  { key: "minggu", label: "8 minggu" },
  { key: "bulan", label: "12 bulan" },
  { key: "tahun", label: "5 tahun" },
];

const categories = [
  { key: "eceran", label: "Eceran", color: "#0f766e" },
  { key: "proyek", label: "Proyek", color: "#4b83c3" },
  { key: "operasional", label: "Operasional", color: "#e28a32" },
] as const;

const dayInMs = 24 * 60 * 60 * 1000;
const formatRp = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const formatCompactRp = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 }).format(value);

function getRangeStart(range: Range, now: Date) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "hari") return new Date(today - 6 * dayInMs);
  if (range === "minggu") {
    const mondayOffset = (new Date(today).getUTCDay() + 6) % 7;
    return new Date(today - (7 + mondayOffset) * dayInMs);
  }
  if (range === "bulan") return new Date(Date.UTC(now.getFullYear(), now.getMonth() - 11, 1));
  return new Date(Date.UTC(now.getFullYear() - 4, 0, 1));
}

function buildCashFlow(entries: KeuanganEntry[], range: Range, now = new Date()): CashFlowPoint[] {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const start = getRangeStart(range, now);
  const end = today + dayInMs;
  let count: number;
  let step: "day" | "week" | "month" | "year";

  if (range === "hari") {
    count = 7;
    step = "day";
  } else if (range === "minggu") {
    count = 8;
    step = "week";
  } else if (range === "bulan") {
    count = 12;
    step = "month";
  } else {
    count = 5;
    step = "year";
  }

  const buckets = Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    if (step === "day") date.setUTCDate(date.getUTCDate() + index);
    if (step === "week") date.setUTCDate(date.getUTCDate() + index * 7);
    if (step === "month") date.setUTCMonth(date.getUTCMonth() + index);
    if (step === "year") date.setUTCFullYear(date.getUTCFullYear() + index);
    const label = step === "year"
      ? new Intl.DateTimeFormat("id-ID", { year: "numeric", timeZone: "UTC" }).format(date)
      : step === "month"
        ? new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" }).format(date)
        : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", timeZone: "UTC" }).format(date);
    return { label, income: 0, expense: 0 };
  });

  for (const entry of entries) {
    const timestamp = Date.parse(`${entry.tanggal}T00:00:00.000Z`);
    if (!Number.isFinite(timestamp) || timestamp < start.getTime() || timestamp >= end) continue;
    const date = new Date(timestamp);
    let index: number;
    if (step === "day") index = Math.floor((timestamp - start.getTime()) / dayInMs);
    else if (step === "week") index = Math.floor((timestamp - start.getTime()) / (7 * dayInMs));
    else if (step === "month") index = (date.getUTCFullYear() - start.getUTCFullYear()) * 12 + date.getUTCMonth() - start.getUTCMonth();
    else index = date.getUTCFullYear() - start.getUTCFullYear();

    const bucket = buckets[index];
    if (!bucket) continue;
    if (entry.tipe === "masuk") bucket.income += entry.jumlah;
    else bucket.expense += entry.jumlah;
  }

  return buckets;
}

function getChartPoints(points: CashFlowPoint[], key: "income" | "expense", maximum: number) {
  return points.map((point, index) => {
    const x = 78 + (index * 610) / Math.max(points.length - 1, 1);
    const y = 222 - (point[key] / maximum) * 164;
    return `${x},${y}`;
  }).join(" ");
}

export function FinancialChartsSection() {
  const { listKasEntries: entries } = useKeuangan();
  const [range, setRange] = useState<Range>("bulan");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const points = buildCashFlow(entries, range);
  const rangeStart = getRangeStart(range, new Date());
  const rangeEnd = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) + dayInMs;
  const rangeEntries = entries.filter((entry) => {
    const timestamp = Date.parse(`${entry.tanggal}T00:00:00.000Z`);
    return Number.isFinite(timestamp) && timestamp >= rangeStart.getTime() && timestamp < rangeEnd;
  });
  const incomeTotal = points.reduce((sum, point) => sum + point.income, 0);
  const expenseTotal = points.reduce((sum, point) => sum + point.expense, 0);
  const netTotal = incomeTotal - expenseTotal;
  const maximum = Math.max(...points.flatMap((point) => [point.income, point.expense]), 1);
  const categoryTotals = categories.map((category) => ({
    ...category,
    amount: rangeEntries.filter((entry) => entry.tipe === "keluar" && entry.kategori === category.key).reduce((sum, entry) => sum + entry.jumlah, 0),
  }));
  const topCategory = categoryTotals.reduce<(typeof categoryTotals)[number] | null>((top, category) => category.amount > (top?.amount ?? 0) ? category : top, null);
  const bestPeriod = points.reduce<(CashFlowPoint & { net: number }) | null>((best, point) => {
    const candidate = { ...point, net: point.income - point.expense };
    return candidate.net > (best?.net ?? Number.NEGATIVE_INFINITY) ? candidate : best;
  }, null);
  const previousPoint = rangeEntries.length ? points.at(-2) : undefined;
  const latestPoint = rangeEntries.length ? points.at(-1) : undefined;
  const previousNet = (previousPoint?.income ?? 0) - (previousPoint?.expense ?? 0);
  const latestNet = (latestPoint?.income ?? 0) - (latestPoint?.expense ?? 0);
  const netDirection = latestNet >= previousNet ? "membaik" : "menurun";
  const netChange = Math.abs(latestNet - previousNet);
  const rangeDescription = ranges.find((item) => item.key === range)?.label.toLowerCase();
  const activeIndex = hoveredIndex ?? selectedIndex ?? points.length - 1;
  const activePoint = points[activeIndex];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <FinancialStatCard label="Pemasukan" value={formatRp(incomeTotal)} icon="↗" trend={`Total ${rangeDescription}`} tone="emerald" />
        <FinancialStatCard label="Pengeluaran" value={formatRp(expenseTotal)} icon="↘" trend={`Total ${rangeDescription}`} tone="amber" />
        <FinancialStatCard label="Arus kas bersih" value={formatRp(netTotal)} icon="＋" trend="Pemasukan dikurangi pengeluaran" tone="blue" />
      </div>

      <section className="rounded-xl border border-outline/30 bg-primary-container p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Analisis arus kas</h2>
            <p className="mt-1 text-[11px] text-on-surface-variant">Pemasukan dan pengeluaran berdasarkan transaksi kas aktual</p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-surface-variant p-1" aria-label="Pilih rentang grafik">
            {ranges.map((item) => (
              <button key={item.key} type="button" aria-pressed={range === item.key} onClick={() => { setRange(item.key); setSelectedIndex(null); setHoveredIndex(null); }} className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${range === item.key ? "bg-secondary text-on-secondary" : "text-on-surface-variant hover:text-on-surface"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-teal-700" />Pemasukan</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-orange-500" />Pengeluaran</span>
        </div>
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 700 270" role="group" aria-label={`Grafik pemasukan dan pengeluaran untuk ${rangeDescription} terakhir`} className="h-auto min-w-[560px] w-full text-on-surface">
            <title>Tren arus kas berdasarkan transaksi kas</title>
            {[0, 1, 2, 3, 4].map((tick) => {
              const y = 222 - tick * 41;
              return (
                <g key={tick}>
                  <line x1="72" y1={y} x2="692" y2={y} stroke="currentColor" strokeOpacity="0.12" />
                  <text x="4" y={y + 4} fill="currentColor" opacity="0.65" fontSize="9">{formatCompactRp((maximum * tick) / 4)}</text>
                </g>
              );
            })}
            <polyline points={getChartPoints(points, "income", maximum)} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={getChartPoints(points, "expense", maximum)} fill="none" stroke="#e28a32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {activePoint && <line x1={78 + (activeIndex * 610) / Math.max(points.length - 1, 1)} y1="42" x2={78 + (activeIndex * 610) / Math.max(points.length - 1, 1)} y2="228" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="3 4" />}
            {points.map((point, index) => {
              const x = 78 + (index * 610) / Math.max(points.length - 1, 1);
              const net = point.income - point.expense;
              return (
                <g
                  key={`${point.label}-${index}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedIndex === index}
                  aria-label={`${point.label}: pemasukan ${formatRp(point.income)}, pengeluaran ${formatRp(point.expense)}, bersih ${formatRp(net)}`}
                  className="cursor-pointer outline-none"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  onClick={() => setSelectedIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedIndex(index);
                    }
                  }}
                >
                  <title>{`${point.label} | Masuk ${formatRp(point.income)} | Keluar ${formatRp(point.expense)}`}</title>
                  <rect x={x - 22} y="32" width="44" height="202" fill="transparent" />
                  {activeIndex === index && <circle cx={x} cy={222 - (point.income / maximum) * 164} r="7" fill="none" stroke="#0f766e" strokeWidth="2" />}
                  {activeIndex === index && <circle cx={x} cy={222 - (point.expense / maximum) * 164} r="7" fill="none" stroke="#e28a32" strokeWidth="2" />}
                  <circle cx={x} cy={222 - (point.income / maximum) * 164} r="3.5" fill="#0f766e" />
                  <circle cx={x} cy={222 - (point.expense / maximum) * 164} r="3.5" fill="#e28a32" />
                  <text x={x} y="250" textAnchor="middle" fill="currentColor" opacity="0.7" fontSize="9">{point.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        {activePoint && (
          <div aria-live="polite" className="mt-3 grid grid-cols-2 gap-3 rounded-lg border border-outline/20 bg-surface-variant/50 p-3 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] text-on-surface-variant">Detail {activePoint.label}</p>
              <p className="mt-1 text-xs font-bold text-on-surface">Arus kas {activePoint.income - activePoint.expense >= 0 ? "surplus" : "defisit"}</p>
            </div>
            <div><p className="text-[10px] text-on-surface-variant">Pemasukan</p><p className="mt-1 text-xs font-bold text-teal-700">{formatRp(activePoint.income)}</p></div>
            <div><p className="text-[10px] text-on-surface-variant">Pengeluaran</p><p className="mt-1 text-xs font-bold text-orange-600">{formatRp(activePoint.expense)}</p></div>
            <div><p className="text-[10px] text-on-surface-variant">Selisih</p><p className="mt-1 text-xs font-bold text-on-surface">{formatRp(activePoint.income - activePoint.expense)}</p></div>
          </div>
        )}
        {rangeEntries.length === 0 && <p className="mt-2 text-center text-xs text-on-surface-variant">Belum ada transaksi untuk dianalisis.</p>}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-xl border border-outline/30 bg-primary-container p-4 sm:p-5">
          <h2 className="text-sm font-bold text-on-surface">Pengeluaran per kategori</h2>
          <p className="mt-1 text-[11px] text-on-surface-variant">Rincian transaksi keluar pada {rangeDescription} terpilih</p>
          <div className="mt-5 space-y-4">
            {categoryTotals.map((category) => {
              const percent = expenseTotal ? (category.amount / expenseTotal) * 100 : 0;
              return (
                <div key={category.key}>
                  <div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="text-on-surface-variant">{category.label} · {percent.toFixed(0)}%</span><span className="font-semibold text-on-surface">{formatRp(category.amount)}</span></div>
                  <div className="h-2 overflow-hidden rounded-sm bg-surface-variant"><div className="h-full rounded-sm" style={{ width: `${percent}%`, backgroundColor: category.color }} /></div>
                </div>
              );
            })}
            {expenseTotal === 0 && <p className="text-xs text-on-surface-variant">Belum ada pengeluaran pada rentang ini.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-outline/30 bg-primary-container p-4 sm:p-5">
          <h2 className="text-sm font-bold text-on-surface">Temuan periode</h2>
          <p className="mt-1 text-[11px] text-on-surface-variant">Ringkasan otomatis dari transaksi dalam rentang terpilih</p>
          <dl className="mt-5 divide-y divide-outline/20">
            <div className="flex items-start justify-between gap-4 py-3 first:pt-0">
              <dt className="text-xs text-on-surface-variant">Perubahan arus kas terbaru</dt>
              <dd className="max-w-[60%] text-right text-xs font-semibold text-on-surface">{latestPoint ? `Arus kas ${netDirection} ${formatRp(netChange)} dibanding periode sebelumnya` : "Belum ada data"}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="text-xs text-on-surface-variant">Periode bersih terbaik</dt>
              <dd className="max-w-[60%] text-right text-xs font-semibold text-on-surface">{bestPeriod && bestPeriod.net > 0 ? `${bestPeriod.label} · ${formatRp(bestPeriod.net)}` : "Belum ada periode surplus"}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3 last:pb-0">
              <dt className="text-xs text-on-surface-variant">Kategori pengeluaran terbesar</dt>
              <dd className="max-w-[60%] text-right text-xs font-semibold text-on-surface">{topCategory && topCategory.amount > 0 ? `${topCategory.label} · ${formatRp(topCategory.amount)}` : "Belum ada pengeluaran"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}