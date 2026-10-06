const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const angkaFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

const compactFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const tanggalPanjangFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const formatRp = (value: number) => rupiahFormatter.format(value);

export const formatAngka = (value: number) => angkaFormatter.format(value);

export const formatRpCompact = (value: number) => compactFormatter.format(value);

export const formatTanggal = (value: string) => {
  if (!value) return "-";
  const waktu = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(waktu)) return value;
  return tanggalFormatter.format(new Date(waktu));
};

export const formatTanggalPanjang = (value: string) => {
  if (!value) return "-";
  const waktu = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(waktu)) return value;
  return tanggalPanjangFormatter.format(new Date(waktu));
};

export const formatTanggalSingkat = (value: string) => {
  if (!value) return "-";
  const waktu = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(waktu)) return value;
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", timeZone: "UTC" }).format(
    new Date(waktu),
  );
};

export const tanggalHariIni = () => new Date().toISOString().slice(0, 10);

export const formatPercent = (value: number, digit = 0) => `${value.toFixed(digit)}%`;

export const denganPrefix = (value: number, prefix: "+" | "-" = "+") =>
  `${prefix}${formatRp(Math.abs(value))}`;