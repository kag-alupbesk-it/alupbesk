export function namaJenis(jenisBarang: string): string {
  if (jenisBarang === "handle") return "Handle";
  if (jenisBarang === "mortise") return "Mortise Lock";
  return jenisBarang.charAt(0).toUpperCase() + jenisBarang.slice(1);
}
