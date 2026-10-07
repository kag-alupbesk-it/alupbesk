// Fungsi format tampilan. Sengaja tidak memakai `new Date()` di dalam render
// supaya hasil server dan client tidak berbeda (memicu hydration mismatch).

export function formatTanggal(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function getInisial(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatUkuranBerkas(byte: number) {
  if (!byte) return "0 KB";
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${(byte / 1024).toFixed(0)} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`;
}

export function getEkstensi(namaBerkas: string) {
  const bagian = namaBerkas.split(".");
  return bagian.length > 1 ? bagian[bagian.length - 1].toUpperCase() : "BERKAS";
}

export function formatTanggalPanjang(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(`${value}T00:00:00`));
}

// Format nominal ribuan untuk ringkasan total barang.
export function formatAngka(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}
