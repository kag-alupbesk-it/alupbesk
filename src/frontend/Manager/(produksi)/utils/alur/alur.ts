import type { SPK, StatusGambarTeknik } from "../../types/types";

// Alur kerja SPK tidak disimpan sebagai field, tapi diturunkan dari status gambar
// teknik + tahap produksi. Jadi dashboard, filter tabel, sidebar, dan form upload
// selalu menghitung dari sumber yang sama dan tidak mungkin angkanya berbeda.
//
// Urutan penilaian:
//   1. Gambar belum ada / perlu revisi -> tugas Manajer Produksi, harus unggah.
//   2. Gambar sudah dikirim            -> tugas PM, tinggal menunggu.
//   3. Gambar sudah di-ACC             -> tugas Manajer Produksi, jalankan produksi.
export type AlurSPK = "butuh_gambar" | "menunggu_acc" | "dalam_produksi" | "siap_kirim";

export function alurSPK(spk: SPK): AlurSPK {
  if (spk.statusGambar === "belum_diunggah" || spk.statusGambar === "revisi") return "butuh_gambar";
  if (spk.statusGambar === "menunggu_acc") return "menunggu_acc";
  return spk.tahapan === "siap_kirim" ? "siap_kirim" : "dalam_produksi";
}

export interface AlurMeta {
  // Nama status yang tampil di tabel dan kartu ringkasan.
  label: string;
  // Kalimat singkat: apa yang harus dilakukan berikutnya. Inilah yang membuat
  // pengguna tidak perlu menebak harus klik ke mana.
  tindakan: string;
  tone: "red" | "amber" | "blue" | "green";
}

export const alurMeta: Record<AlurSPK, AlurMeta> = {
  butuh_gambar: {
    label: "Butuh Gambar Teknik",
    tindakan: "Upload gambar kerja ke PM",
    tone: "red",
  },
  menunggu_acc: {
    label: "Menunggu ACC PM",
    tindakan: "Sudah dikirim, tunggu ACC PM",
    tone: "amber",
  },
  dalam_produksi: {
    label: "Dalam Proses Produksi",
    tindakan: "Lanjut pengerjaan di workshop",
    tone: "blue",
  },
  siap_kirim: {
    label: "Siap Kirim",
    tindakan: "Serahkan ke tim lapangan",
    tone: "green",
  },
};

// Warna badge status gambar teknik. Sengaja dipisah dari warna alur, supaya dua
// kolom di tabel tidak pernah tampil dengan warna dan teks yang sama padahal
// artinya berbeda.
export const gambarTone: Record<StatusGambarTeknik, "slate" | "amber" | "green" | "red"> = {
  belum_diunggah: "slate",
  menunggu_acc: "amber",
  acc_pm: "green",
  revisi: "red",
};

export const alurOrder: AlurSPK[] = ["butuh_gambar", "menunggu_acc", "dalam_produksi", "siap_kirim"];
