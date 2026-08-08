import { kasEntries, seedKasEntries } from "./store";
import { syncKasDariPesanan } from "./sync";
import type { KasData } from "../types";

export function getKasData(): KasData {
  seedKasEntries();
  syncKasDariPesanan();

  const sorted = [...kasEntries.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const masuk = sorted.filter((entry) => entry.tipe === "masuk");
  const keluar = sorted.filter((entry) => entry.tipe === "keluar");
  const totalMasuk = masuk.reduce((sum, entry) => sum + entry.jumlah, 0);
  const totalKeluar = keluar.reduce((sum, entry) => sum + entry.jumlah, 0);
  return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar, masuk, keluar };
}
