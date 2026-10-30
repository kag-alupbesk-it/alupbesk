export const JENIS_TRANSAKSI = ["kas_masuk", "kas_keluar", "kas_beredar"] as const;
export type JenisTransaksi = (typeof JENIS_TRANSAKSI)[number];

export const LABEL_JENIS_TRANSAKSI: Record<JenisTransaksi, string> = {
  kas_masuk: "Kas Masuk",
  kas_keluar: "Kas Keluar",
  kas_beredar: "Kas Beredar (Bon)",
};

export const LABEL_JENIS_SINGKAT: Record<JenisTransaksi, string> = {
  kas_masuk: "Masuk",
  kas_keluar: "Keluar",
  kas_beredar: "Bon",
};

export const KATEGORI_BIAYA = [] as const;
export type KategoriBiaya = (typeof KATEGORI_BIAYA)[number] | (string & {});

export const POS_PROYEK = [] as const;
export type PosProyek = (typeof POS_PROYEK)[number] | (string & {});

export const PIHAK = [] as const;

export type FieldOpsi = "person" | "kategori" | "pos";

export const SUMBER_TRANSAKSI = ["manual", "termin", "payroll"] as const;
export type SumberTransaksi = (typeof SUMBER_TRANSAKSI)[number];

export const LABEL_SUMBER_TRANSAKSI: Record<SumberTransaksi, string> = {
  manual: "Input manual",
  termin: "Penerimaan termin",
  payroll: "Pencairan gaji",
};

export type TransaksiKas = {
  id: string;
  tanggal: string;
  jenis: JenisTransaksi;
  uraian: string;
  kategori: KategoriBiaya;
  posProyek: PosProyek;
  person: string;
  nominal: number;
  noNota: string;
  bukti: string;
  sumber: SumberTransaksi;
  refId: string;
};

export type TerminPembayaran = {
  id: string;
  label: string;
  tanggal: string;
  jatuhTempo: string;
  nominal: number;
  lunas: boolean;
};

export type StatusInvoice = "dp" | "lunas" | "overdue";

export type Invoice = {
  id: string;
  nomor: string;
  tanggal: string;
  pihak?: string;
  nama: string;
  proyek: string;
  posProyek: string;
  uraian: string;
  termin: TerminPembayaran[];
};

export type Karyawan = {
  id: string;
  nama: string;
  jabatan: string;
  lokasi: PosProyek;
  gajiPokok: number;
  tunjangan: number;
  lembur: number;
  potongan: number;
  periode: string;
  statusBayar: "belum" | "terbayar";
  tanggalBayar: string;
  metodeBayar: string;
};

export const JABATAN_AWAL = [
  "Mandor Proyek",
  "Staff Keuangan",
  "Admin Proyek",
  "Operator Alat Berat",
  "Tukang Bangunan",
  "Driver",
  "Surveyor",
] as const;

export type PeriodeGaji = string;

export const REKAP_TRANSAKSI = (transaksi: TransaksiKas[]) => {
  const totalMasuk = transaksi
    .filter((item) => item.jenis === "kas_masuk")
    .reduce((sum, item) => sum + item.nominal, 0);
  const totalKeluar = transaksi
    .filter((item) => item.jenis === "kas_keluar")
    .reduce((sum, item) => sum + item.nominal, 0);
  const totalBeredar = transaksi
    .filter((item) => item.jenis === "kas_beredar")
    .reduce((sum, item) => sum + item.nominal, 0);

  return {
    totalMasuk,
    totalKeluar,
    totalBeredar,
    saldo: totalMasuk - totalKeluar,
  };
};

export type BarisLedger = TransaksiKas & { saldo: number };

export type LedgerKas = {
  bulan: string;
  saldoAwal: number;
  totalMasuk: number;
  totalKeluar: number;
  totalBeredar: number;
  saldoAkhir: number;
  baris: BarisLedger[];
};

const deltaKas = (item: TransaksiKas) =>
  item.jenis === "kas_masuk" ? item.nominal : item.jenis === "kas_keluar" ? -item.nominal : 0;

// Membangun buku kas bulanan: saldo awal (saldo bulan lalu) dihitung dari semua
// transaksi sebelum awal bulan, lalu saldo berjalan dihitung urut kronologis.
export const BANGUN_LEDGER = (transaksi: TransaksiKas[], bulan: string): LedgerKas => {
  if (!bulan) {
    return { bulan, saldoAwal: 0, totalMasuk: 0, totalKeluar: 0, totalBeredar: 0, saldoAkhir: 0, baris: [] };
  }

  const awalBulan = `${bulan}-01`;
  const saldoAwal = transaksi
    .filter((item) => item.tanggal < awalBulan)
    .reduce((sum, item) => sum + deltaKas(item), 0);

  const bulanIni = transaksi
    .filter((item) => item.tanggal.slice(0, 7) === bulan)
    .sort((left, right) => left.tanggal.localeCompare(right.tanggal) || left.id.localeCompare(right.id));

  let saldo = saldoAwal;
  const baris: BarisLedger[] = bulanIni.map((item) => {
    saldo += deltaKas(item);
    return { ...item, saldo };
  });

  const totalMasuk = bulanIni
    .filter((item) => item.jenis === "kas_masuk")
    .reduce((sum, item) => sum + item.nominal, 0);
  const totalKeluar = bulanIni
    .filter((item) => item.jenis === "kas_keluar")
    .reduce((sum, item) => sum + item.nominal, 0);
  const totalBeredar = bulanIni
    .filter((item) => item.jenis === "kas_beredar")
    .reduce((sum, item) => sum + item.nominal, 0);

  return {
    bulan,
    saldoAwal,
    totalMasuk,
    totalKeluar,
    totalBeredar,
    saldoAkhir: saldoAwal + totalMasuk - totalKeluar,
    baris,
  };
};

export const hitungInvoice = (invoice: Invoice) => {
  const totalTagihan = invoice.termin.reduce((sum, item) => sum + item.nominal, 0);
  const terbayar = invoice.termin
    .filter((item) => item.lunas)
    .reduce((sum, item) => sum + item.nominal, 0);
  const sisaTagihan = totalTagihan - terbayar;
  const terminBelumLunas = invoice.termin.filter((item) => !item.lunas);
  const berikutnya = terminBelumLunas[0] ?? null;
  const jatuhTempo = berikutnya ? berikutnya.jatuhTempo : invoice.termin[invoice.termin.length - 1]?.jatuhTempo ?? invoice.tanggal;
  const terminDp = invoice.termin[0];
  const sudahAdaDp = Boolean(terminDp?.lunas);
  const adaBelumLunas = terminBelumLunas.length > 0;
  const lewatJatuhTempo = adaBelumLunas && jatuhTempo < new Date().toISOString().slice(0, 10);

  let status: StatusInvoice = "lunas";
  if (adaBelumLunas && lewatJatuhTempo) status = "overdue";
  else if (adaBelumLunas) status = "dp";

  return {
    totalTagihan,
    terbayar,
    terbayarDp: sudahAdaDp && terminDp ? terminDp.nominal : 0,
    sisaTagihan,
    jatuhTempo,
    status,
    terminDp,
    terminBerikutnya: berikutnya,
    terminLunasCount: invoice.termin.filter((item) => item.lunas).length,
  };
};

export const hitungGaji = (karyawan: Karyawan) => {
  const pendapatan = karyawan.gajiPokok + karyawan.tunjangan + karyawan.lembur;
  const potongan = karyawan.potongan;
  return {
    pendapatan,
    potongan,
    netto: pendapatan - potongan,
  };
};