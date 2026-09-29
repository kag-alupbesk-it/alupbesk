import type {
  FieldDelivery,
  FieldDeliveryItem,
  FieldDeliveryResult,
  FieldGeotag,
  FieldDeliveryStatus,
  PodInput,
  SuratJalanInput,
} from "./types";

// Store lokal frontend untuk modul Manajer Lapangan. Seluruh data & mutasi
// (surat jalan, partial shipment, POD) disimpan di memori bundle — tidak ada
// panggilan ke backend. Data hilang saat halaman di-hard refresh.
const daysAgo = (days: number, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
};

const items = (list: Omit<FieldDeliveryItem, "kuantitasTerkirim">[]): FieldDeliveryItem[] =>
  list.map((item) => ({ ...item, kuantitasTerkirim: 0 }));

const seeds: FieldDelivery[] = [
  {
    id: "SJ-2026-001",
    kodeProduksi: "PC-ALT-BSG-01",
    namaKontraktor: "PT Bangun Sejahtera Guna",
    alamatProyek: "Jl. Raya Cikarang Baru Kav. 12, Cikarang Selatan, Kab. Bekasi",
    telepon: "0821-4433-2211",
    tanggalKirim: daysAgo(1),
    items: items([
      { id: "IT-001", namaBarang: "Framing Aluminium 4\" x 1\"", jenisBarang: "Aluminium", spesifikasi: "Anodized Silver, tebal 1.2mm, panjang 6m", satuan: "batang", kuantitas: 120 },
      { id: "IT-002", namaBarang: "Kaca Tempered 10mm", jenisBarang: "Kaca", spesifikasi: "Clear tempered, cutting size custom", satuan: "lembar", kuantitas: 48 },
      { id: "IT-003", namaBarang: "Aksesoris Kunci Pintu", jenisBarang: "Aksesoris", spesifikasi: "Set handle + lock SS304", satuan: "set", kuantitas: 96 },
    ]),
    status: "siap-kirim",
    cetakCount: 0,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: "SJ-2026-002",
    kodeProduksi: "PC-ALU-MBK-02",
    namaKontraktor: "CV Mitra Bangun Karya",
    alamatProyek: "Komp. Ruko Grand Boulevard Blok C 7, Tangerang Selatan, Banten",
    telepon: "0812-9988-7766",
    tanggalKirim: daysAgo(0, 7),
    items: [
      { id: "IT-004", namaBarang: "Curtain Wall Aluminium", jenisBarang: "Aluminium", spesifikasi: "Unitised 1500x3000mm, powder coating", satuan: "unit", kuantitas: 36, kuantitasTerkirim: 24 },
      { id: "IT-005", namaBarang: "Sealant Structural", jenisBarang: "Chemical", spesifikasi: "Silicone structural DC 995", satuan: "tube", kuantitas: 200, kuantitasTerkirim: 140 },
    ],
    status: "dalam-pengiriman",
    armada: { namaSopir: "Slamet Riyadi", platNomor: "B 9345 KPJ", jenisArmada: "Fuso Doble" },
    cetakCount: 1,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(0, 7),
  },
  {
    id: "SJ-2026-003",
    kodeProduksi: "PC-ALM-TMR-03",
    namaKontraktor: "PT Aditya Lestari Mandiri",
    alamatProyek: "Jl. Ahmad Yani No. 88, Kec. Lawang, Kab. Malang, Jawa Timur",
    telepon: "0857-3344-5566",
    tanggalKirim: daysAgo(4),
    items: [
      { id: "IT-006", namaBarang: "Full Frame & Swing Door", jenisBarang: "Aluminium", spesifikasi: "2 panel, 180x210cm, finishing bronze", satuan: "set", kuantitas: 60, kuantitasTerkirim: 60 },
      { id: "IT-007", namaBarang: "Aluminium Composite Panel", jenisBarang: "Komposit", spesifikasi: "4mm, warna duco cream", satuan: "lembar", kuantitas: 150, kuantitasTerkirim: 150 },
    ],
    status: "selesai-kirim",
    armada: { namaSopir: "Hendra Gunawan", platNomor: "N 1928 ABC", jenisArmada: "Pickup Engkel" },
    geotag: { latitude: -7.834461, longitude: 112.69088, timestamp: daysAgo(2, 10) },
    podPath: "/media/pod/SJ-2026-003.jpg",
    cetakCount: 2,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
  },
  {
    id: "SJ-2026-004",
    kodeProduksi: "PC-ALW-KRT-04",
    namaKontraktor: "PT Karya Rancang Tata",
    alamatProyek: "Jl. Soekarno Hatta Km. 21, Kec. Mijen, Kota Semarang, Jawa Tengah",
    telepon: "0819-2211-3344",
    tanggalKirim: daysAgo(0, 7),
    items: items([
      { id: "IT-008", namaBarang: "Aluminium Angle 2\"", jenisBarang: "Aluminium", spesifikasi: "Siku 2x2, mill finish", satuan: "batang", kuantitas: 240 },
      { id: "IT-009", namaBarang: "Plat Aluminium 3mm", jenisBarang: "Aluminium", spesifikasi: "1250x2500mm, seri 5052", satuan: "lembar", kuantitas: 80 },
    ]),
    status: "siap-kirim",
    cetakCount: 0,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0, 7),
  },
];

let store: Map<string, FieldDelivery> | null = null;

// Store di-seed sekali saat modul pertama kali dipakai, lalu mutasi (surat
// jalan / POD) ditulis langsung ke Map yang sama.
function ensureStore(): Map<string, FieldDelivery> {
  if (!store) {
    store = new Map<string, FieldDelivery>();
    for (const delivery of seeds) store.set(delivery.id, delivery);
  }
  return store;
}

function setFieldDelivery(delivery: FieldDelivery): void {
  ensureStore().set(delivery.id, delivery);
}

// Semua surat jalan yang sedang dikelola Manajer Lapangan, paling baru dulu.
function getDeliveriesList(): FieldDelivery[] {
  return Array.from(ensureStore().values()).sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

function isArmadaLengkap(armada: { namaSopir: string; platNomor: string; jenisArmada: string }): boolean {
  return Boolean(armada?.namaSopir.trim() && armada.platNomor.trim() && armada.jenisArmada.trim());
}

// Menerbitkan surat jalan untuk delivery: menyimpan data armada serta mencatat
// kuantitas yang dikirim pada keberangkatan ini. Mendukung partial shipment —
// sisa dihitung otomatis dari kuantitasTerkirim yang diakumulasi tiap surat jalan.
function saveSuratJalan(id: string, input: SuratJalanInput): FieldDeliveryResult {
  const current = ensureStore().get(id);
  if (!current)
    return { ok: false, code: "DELIVERY_NOT_FOUND", message: "Surat jalan tidak ditemukan." };
  if (current.status === "selesai-kirim")
    return { ok: false, code: "STATUS_INVALID", message: "Pengiriman ini sudah selesai, tidak bisa membuat surat jalan lagi." };

  if (!isArmadaLengkap(input.armada))
    return { ok: false, code: "STATUS_INVALID", message: "Data armada belum lengkap." };

  const kirimByItem = new Map(input.kirim.map((entry) => [entry.itemId, entry.kuantitas]));
  const sisaByItem = new Map(current.items.map((item) => [item.id, item.kuantitas - item.kuantitasTerkirim]));

  for (const entry of input.kirim) {
    const sisa = sisaByItem.get(entry.itemId) ?? 0;
    if (!Number.isInteger(entry.kuantitas) || entry.kuantitas < 0 || entry.kuantitas > sisa)
      return {
        ok: false,
        code: "STATUS_INVALID",
        message: `Kuantitas pengiriman tidak valid. Sisa terkirim hanya ${sisa} di salah satu item.`,
      };
  }

  const updatedItems = current.items.map((item) => {
    const dikirim = kirimByItem.get(item.id) ?? 0;
    if (dikirim === 0) return { ...item };
    return { ...item, kuantitasTerkirim: item.kuantitasTerkirim + dikirim };
  });

  const now = new Date().toISOString();
  const updated: FieldDelivery = {
    ...current,
    armada: { ...input.armada },
    items: updatedItems,
    status: "dalam-pengiriman",
    tanggalKirim: now,
    updatedAt: now,
  };
  setFieldDelivery(updated);
  return { ok: true, delivery: updated };
}

// Menyelesaikan POD (Proof of Delivery): menyimpan hasil geotagging, e-signature
// penerima, dan path foto bukti kirim. Status menjadi "selesai-kirim" hanya
// ketika seluruh kuantitas item sudah terkirim; jika masih ada sisa, status
// tetap "dalam-pengiriman" menunggu pengiriman berikutnya.
function submitPod(id: string, input: PodInput): FieldDeliveryResult {
  const current = ensureStore().get(id);
  if (!current)
    return { ok: false, code: "DELIVERY_NOT_FOUND", message: "Surat jalan tidak ditemukan." };

  const allTerkirim = current.items.every((item) => item.kuantitasTerkirim >= item.kuantitas);
  const now = new Date().toISOString();

  const updated: FieldDelivery = {
    ...current,
    geotag: input.geotag,
    signatureDataUrl: input.signatureDataUrl,
    podPath: input.podPath,
    status: (allTerkirim ? "selesai-kirim" : "dalam-pengiriman") as typeof current.status,
    updatedAt: now,
  };
  setFieldDelivery(updated);
  return { ok: true, delivery: updated };
}

function unwrap(result: FieldDeliveryResult): Promise<FieldDelivery> {
  if (result.ok) return Promise.resolve(result.delivery);
  return Promise.reject(new Error(result.message ?? "Operasi gagal."));
}

// Store lokal berwajah Promise agar sama dengan API dari backend, sehingga
// komponen frontend tidak perlu diubah logikanya ketika backend dilepas.
export const fieldStore = {
  getDeliveries: (): Promise<FieldDelivery[]> => Promise.resolve(getDeliveriesList()),
  getDelivery: (id: string): Promise<FieldDelivery> => {
    const delivery = ensureStore().get(id);
    return delivery
      ? Promise.resolve(delivery)
      : Promise.reject(new Error("Surat jalan tidak ditemukan."));
  },
  saveSuratJalan: (id: string, input: SuratJalanInput): Promise<FieldDelivery> =>
    unwrap(saveSuratJalan(id, input)),
  submitPod: (
    id: string,
    input: { geotag: FieldGeotag; signatureDataUrl: string; podPath: string },
  ): Promise<FieldDelivery> => unwrap(submitPod(id, input)),
};

export type { FieldDelivery, FieldGeotag, FieldDeliveryStatus };