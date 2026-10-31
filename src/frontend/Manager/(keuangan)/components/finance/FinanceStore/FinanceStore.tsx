"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { request } from "@/services/api/request";
import { isReadOnlyMode } from "@/frontend/shared/access/accessMode";

import {
  KATEGORI_BIAYA,
  POS_PROYEK,
  JABATAN_AWAL,
  REKAP_TRANSAKSI,
  hitungGaji,
  hitungInvoice,
  type FieldOpsi,
  type Invoice,
  type Karyawan,
  type KategoriBiaya,
  type Penggajian,
  type PosProyek,
  type TransaksiKas,
} from "../types/types";
import { formatBulan } from "../format/format";

export type InvoiceRingkas = ReturnType<typeof hitungInvoice> & { invoice: Invoice };

export type FinanceState = {
  transaksi: TransaksiKas[];
  invoice: Invoice[];
  karyawan: Karyawan[];
  penggajian: Penggajian[];
  opsiJabatan: string[];
  opsiPerson: string[];
  opsiKategori: KategoriBiaya[];
  opsiPos: PosProyek[];
  toast: string;
  seq: number;
  seqKaryawan: number;
  seqInvoice: number;
  seqPenggajian: number;
};

type FinanceAction =
  | { type: "tambah-transaksi"; payload: Omit<TransaksiKas, "id"> }
  | { type: "hapus-transaksi"; id: string }
  | { type: "tambah-invoice"; payload: Omit<Invoice, "id"> }
  | { type: "ubah-invoice"; payload: Invoice }
  | { type: "hapus-invoice"; id: string }
  | { type: "tambah-bukti"; id: string; bukti: string }
  | { type: "tambah-opsi"; field: FieldOpsi; nilai: string }
  | { type: "tambah-opsi-jabatan"; nilai: string }
  | { type: "lunas-termin"; invoiceId: string; terminId: string }
  | { type: "buat-penggajian"; karyawanId: string; periode: string }
  | { type: "buat-penggajian-bulan"; periode: string }
  | { type: "ubah-penggajian"; id: string; tunjangan: number; potongan: number; metodeBayar?: string }
  | { type: "bayar-gaji"; id: string; tanggal: string }
  | { type: "bayar-langsung"; karyawanId: string; periode: string; tanggal: string }
  | { type: "batalkan-bayar"; id: string }
  | { type: "hapus-penggajian"; id: string }
  | { type: "tambah-karyawan"; payload: Omit<Karyawan, "id"> }
  | { type: "ubah-karyawan"; payload: Karyawan }
  | { type: "hapus-karyawan"; id: string }
  | { type: "toast"; message: string }
  | { type: "bersihkan-toast" }
  | { type: "hydrate"; payload: Omit<FinanceState, "toast"> };

const gabungOpsi = <T extends string>(dasar: readonly T[], kustom: T[]): T[] => {
  const lihat = new Set(dasar.map((item) => item.toLowerCase()));
  return [...dasar, ...kustom.filter((item) => !lihat.has(item.toLowerCase()))];
};

const initialState: FinanceState = {
  transaksi: [],
  invoice: [],
  karyawan: [],
  penggajian: [],
  opsiJabatan: [],
  opsiPerson: [],
  opsiKategori: [],
  opsiPos: [],
  toast: "",
  seq: 1,
  seqKaryawan: 1,
  seqInvoice: 1,
  seqPenggajian: 1,
};

function buatTransaksi(payload: Omit<TransaksiKas, "id">, urut: number): TransaksiKas {
  return { ...payload, id: `TRX-${String(urut).padStart(4, "0")}` };
}

function buatInvoice(payload: Omit<Invoice, "id">, urut: number): Invoice {
  return { ...payload, id: `INV-${String(urut).padStart(4, "0")}` };
}

function urutInvoiceBerikutnya(invoice: Invoice[], fallback: number): number {
  const maks = invoice.reduce((max, item) => {
    const angka = Number(item.id.match(/(\d+)\s*$/)?.[1] ?? 0);
    return Number.isFinite(angka) ? Math.max(max, angka) : max;
  }, 0);
  return Math.max(maks + 1, fallback);
}

type KaryawanLama = {
  id: string;
  nama: string;
  jabatan: string;
  lokasi: PosProyek;
  gajiPokok: number;
  tunjangan?: number;
  metodeBayar?: string;
  potongan?: number;
  potonganBon?: number;
  potonganKasbon?: number;
  statusBayar?: "belum" | "terbayar";
  tanggalBayar?: string;
  periode?: string;
};

function parseAngka(nilai: unknown): number | null {
  if (nilai === null || nilai === undefined) return null;
  if (typeof nilai === "string") {
    const bersih = nilai.trim().replace(/[^\d.-]/g, "");
    if (!bersih) return null;
    const n = Number(/^\d{1,3}(\.\d{3})+$/.test(bersih) ? bersih.replace(/\./g, "") : bersih);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(nilai);
  return Number.isFinite(n) ? n : null;
}

function normalisasiKaryawan(data: KaryawanLama): Karyawan {
  return {
    id: data.id,
    nama: data.nama,
    jabatan: data.jabatan,
    lokasi: data.lokasi,
    gajiPokok: parseAngka(data.gajiPokok) ?? 0,
    tunjangan: parseAngka(data.tunjangan) ?? 0,
    metodeBayar: data.metodeBayar || "Transfer BCA",
  };
}

function normalisasiPenggajian(data: Penggajian): Penggajian {
  return {
    ...data,
    gajiPokok: parseAngka(data.gajiPokok) ?? 0,
    tunjangan: parseAngka(data.tunjangan) ?? 0,
    potongan: parseAngka(data.potongan) ?? 0,
    statusBayar: data.statusBayar === "terbayar" ? "terbayar" : "belum",
    tanggalBayar: data.tanggalBayar ?? "",
    transaksiId: data.transaksiId ?? "",
  };
}

function buatSlip(karyawan: Karyawan, periode: string, urut: number): Penggajian {
  return {
    id: `GJI-${String(urut).padStart(4, "0")}`,
    karyawanId: karyawan.id,
    periode,
    nama: karyawan.nama,
    jabatan: karyawan.jabatan,
    lokasi: karyawan.lokasi,
    gajiPokok: karyawan.gajiPokok,
    tunjangan: karyawan.tunjangan,
    potongan: 0,
    metodeBayar: karyawan.metodeBayar,
    statusBayar: "belum",
    tanggalBayar: "",
    transaksiId: "",
  };
}

function buatTransaksiGaji(slip: Penggajian, tanggal: string, urut: number): TransaksiKas {
  const { netto } = hitungGaji(slip);
  return buatTransaksi(
    {
      tanggal,
      jenis: "kas_keluar",
      uraian: `Pencairan gaji ${slip.nama} · ${formatBulan(slip.periode)}`,
      kategori: "Dll",
      posProyek: slip.lokasi,
      person: slip.nama,
      nominal: netto,
      noNota: `SLIP/${slip.periode}/${slip.id}`,
      bukti: `slip_gaji_${slip.id}.pdf`,
      sumber: "payroll",
      refId: slip.karyawanId,
    },
    urut,
  );
}

function migrasiPenggajian(
  karyawanLama: KaryawanLama[],
  transaksi: TransaksiKas[],
  mulaiSeq: number,
): Penggajian[] {
  let seq = mulaiSeq;
  return karyawanLama
    .filter((item) => item.statusBayar === "terbayar" && Boolean(item.tanggalBayar))
    .map((item) => {
      const transaksiLama = transaksi.find(
        (row) => row.refId === item.id && row.sumber === "payroll",
      );
      const slip: Penggajian = {
        id: `GJI-${String(seq).padStart(4, "0")}`,
        karyawanId: item.id,
        periode: (item.tanggalBayar ?? "").slice(0, 7),
        nama: item.nama,
        jabatan: item.jabatan,
        lokasi: item.lokasi,
        gajiPokok: parseAngka(item.gajiPokok) ?? 0,
        tunjangan: parseAngka(item.tunjangan) ?? 0,
        potongan:
          parseAngka(item.potongan) ??
          (parseAngka(item.potonganBon) ?? 0) + (parseAngka(item.potonganKasbon) ?? 0),
        metodeBayar: item.metodeBayar || "Transfer BCA",
        statusBayar: "terbayar",
        tanggalBayar: item.tanggalBayar ?? "",
        transaksiId: transaksiLama?.id ?? "",
      };
      seq += 1;
      return slip;
    });
}

function reducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case "hydrate": {
      const karyawanLama = action.payload.karyawan as unknown as KaryawanLama[];
      const penggajianTersimpan = (action.payload.penggajian ?? []) as Penggajian[];
      const transaksiTersimpan = action.payload.transaksi ?? [];
      const perluMigrasi =
        penggajianTersimpan.length === 0 &&
        karyawanLama.some((item) => item.statusBayar === "terbayar");
      const penggajian = perluMigrasi
        ? migrasiPenggajian(karyawanLama, transaksiTersimpan, action.payload.seqPenggajian ?? 1)
        : penggajianTersimpan.map(normalisasiPenggajian);
      const seqPenggajian = penggajian.reduce((maks, item) => {
        const angka = Number(item.id.match(/(\d+)\s*$/)?.[1] ?? 0);
        return Number.isFinite(angka) ? Math.max(maks, angka + 1) : maks;
      }, action.payload.seqPenggajian ?? 1);

      return {
        ...state,
        ...action.payload,
        transaksi: transaksiTersimpan,
        karyawan: karyawanLama.map(normalisasiKaryawan),
        penggajian,
        seq: action.payload.seq ?? state.seq,
        seqKaryawan: action.payload.seqKaryawan ?? state.seqKaryawan,
        seqInvoice: action.payload.seqInvoice ?? state.seqInvoice,
        seqPenggajian,
      };
    }
    case "tambah-transaksi": {
      const transaksi = buatTransaksi(action.payload, state.seq);
      return {
        ...state,
        seq: state.seq + 1,
        transaksi: [transaksi, ...state.transaksi],
        toast: `${transaksi.jenis === "kas_masuk" ? "Kas masuk" : transaksi.jenis === "kas_keluar" ? "Kas keluar" : "Kas beredar"} ${transaksi.noNota || transaksi.id} dicatat.`,
      };
    }
    case "hapus-transaksi":
      return {
        ...state,
        transaksi: state.transaksi.filter((item) => item.id !== action.id),
        toast: `Transaksi ${action.id} dihapus dari buku kas.`,
      };
    case "tambah-invoice": {
      const urut = urutInvoiceBerikutnya(state.invoice, state.seqInvoice);
      const invoice = buatInvoice(action.payload, urut);
      return {
        ...state,
        seqInvoice: urut + 1,
        invoice: [invoice, ...state.invoice],
        toast: `Invoice ${invoice.nomor} ditambahkan.`,
      };
    }
    case "ubah-invoice": {
      const ada = state.invoice.some((item) => item.id === action.payload.id);
      if (!ada) return state;
      return {
        ...state,
        invoice: state.invoice.map((item) => (item.id === action.payload.id ? action.payload : item)),
        toast: `Invoice ${action.payload.nomor} diperbarui.`,
      };
    }
    case "hapus-invoice": {
      const invoice = state.invoice.find((item) => item.id === action.id);
      if (!invoice) return state;
      const adaTransaksi = state.transaksi.some((item) => item.refId === action.id);
      return {
        ...state,
        invoice: state.invoice.filter((item) => item.id !== action.id),
        toast: adaTransaksi
          ? `Invoice ${invoice.nomor} dihapus. Transaksi kas terkait tetap tersimpan.`
          : `Invoice ${invoice.nomor} dihapus.`,
      };
    }
    case "tambah-bukti":
      return {
        ...state,
        transaksi: state.transaksi.map((item) =>
          item.id === action.id ? { ...item, bukti: action.bukti } : item,
        ),
        toast: `Bukti nota ${action.id} tersimpan.`,
      };
    case "tambah-opsi": {
      const nilai = action.nilai.trim();
      if (!nilai) return state;
      const sumber = action.field === "person"
        ? state.opsiPerson
        : action.field === "kategori"
          ? state.opsiKategori
          : state.opsiPos;
      if (sumber.some((item) => item.toLowerCase() === nilai.toLowerCase())) return state;

      const label = action.field === "person" ? "person" : action.field === "kategori" ? "kategori" : "pos/proyek";
      if (action.field === "person") {
        return { ...state, opsiPerson: [...state.opsiPerson, nilai], toast: `"${nilai}" ditambahkan ke daftar ${label}.` };
      }
      if (action.field === "kategori") {
        return { ...state, opsiKategori: [...state.opsiKategori, nilai], toast: `"${nilai}" ditambahkan ke daftar ${label}.` };
      }
      return { ...state, opsiPos: [...state.opsiPos, nilai], toast: `"${nilai}" ditambahkan ke daftar ${label}.` };
    }
    case "lunas-termin": {
      const invoice = state.invoice.find((item) => item.id === action.invoiceId);
      const termin = invoice?.termin.find((item) => item.id === action.terminId);
      if (!invoice || !termin || termin.lunas) return state;

      const tanggal = new Date().toISOString().slice(0, 10);
      return {
        ...state,
        seq: state.seq + 1,
        invoice: state.invoice.map((item) =>
          item.id === action.invoiceId
            ? {
                ...item,
                termin: item.termin.map((row) =>
                  row.id === action.terminId ? { ...row, lunas: true, tanggal } : row,
                ),
              }
            : item,
        ),
        transaksi: [
          buatTransaksi(
            {
              tanggal,
              jenis: "kas_masuk",
              uraian: `${invoice.nama} · ${termin.label} · ${invoice.proyek}`,
              kategori: "Dll",
              posProyek: invoice.posProyek,
              person: invoice.nama,
              nominal: termin.nominal,
              noNota: invoice.nomor,
              bukti: `kuitansi_${invoice.nomor.replaceAll("/", "-")}.png`,
              sumber: "termin",
              refId: invoice.id,
            },
            state.seq,
          ),
          ...state.transaksi,
        ],
        toast: `${termin.label} invoice ${invoice.nomor} lunas dan tercatat sebagai Kas Masuk.`,
      };
    }
    case "buat-penggajian": {
      const karyawan = state.karyawan.find((item) => item.id === action.karyawanId);
      if (!karyawan || !action.periode) return state;
      const sudahAda = state.penggajian.some(
        (item) => item.karyawanId === action.karyawanId && item.periode === action.periode,
      );
      if (sudahAda)
        return {
          ...state,
          toast: `Slip ${karyawan.nama} ${formatBulan(action.periode)} sudah ada.`,
        };
      const slip = buatSlip(karyawan, action.periode, state.seqPenggajian);
      return {
        ...state,
        seqPenggajian: state.seqPenggajian + 1,
        penggajian: [slip, ...state.penggajian],
        toast: `Slip gaji ${karyawan.nama} ${formatBulan(action.periode)} dibuat.`,
      };
    }
    case "buat-penggajian-bulan": {
      const periode = action.periode;
      if (!periode) return state;
      const sudah = new Set(
        state.penggajian
          .filter((item) => item.periode === periode)
          .map((item) => item.karyawanId),
      );
      const belum = state.karyawan.filter((item) => !sudah.has(item.id));
      if (belum.length === 0)
        return {
          ...state,
          toast: `Semua karyawan sudah punya slip ${formatBulan(periode)}.`,
        };
      let seq = state.seqPenggajian;
      const slipBaru = belum.map((karyawan) => {
        const slip = buatSlip(karyawan, periode, seq);
        seq += 1;
        return slip;
      });
      return {
        ...state,
        seqPenggajian: seq,
        penggajian: [...slipBaru, ...state.penggajian],
        toast: `${slipBaru.length} slip ${formatBulan(periode)} dibuat.`,
      };
    }
    case "ubah-penggajian": {
      const slip = state.penggajian.find((item) => item.id === action.id);
      if (!slip || slip.statusBayar === "terbayar") return state;
      return {
        ...state,
        penggajian: state.penggajian.map((item) =>
          item.id === action.id
            ? {
                ...item,
                tunjangan: Math.max(0, action.tunjangan),
                potongan: Math.max(0, action.potongan),
                metodeBayar: action.metodeBayar ?? item.metodeBayar,
              }
            : item,
        ),
        toast: `Komponen gaji ${slip.nama} ${formatBulan(slip.periode)} diperbarui.`,
      };
    }
    case "bayar-gaji": {
      const slip = state.penggajian.find((item) => item.id === action.id);
      if (!slip || slip.statusBayar === "terbayar") return state;
      const transaksi = buatTransaksiGaji(slip, action.tanggal, state.seq);
      return {
        ...state,
        seq: state.seq + 1,
        penggajian: state.penggajian.map((item) =>
          item.id === action.id
            ? {
                ...item,
                statusBayar: "terbayar",
                tanggalBayar: action.tanggal,
                transaksiId: transaksi.id,
              }
            : item,
        ),
        transaksi: [transaksi, ...state.transaksi],
        toast: `Gaji ${slip.nama} ${formatBulan(slip.periode)} dibayar dan tercatat di Kas Keluar.`,
      };
    }
    case "bayar-langsung": {
      const karyawan = state.karyawan.find((item) => item.id === action.karyawanId);
      if (!karyawan || !action.periode) return state;
      const ada = state.penggajian.find(
        (item) => item.karyawanId === action.karyawanId && item.periode === action.periode,
      );
      if (ada?.statusBayar === "terbayar") return state;
      const slip = ada ?? buatSlip(karyawan, action.periode, state.seqPenggajian);
      const transaksi = buatTransaksiGaji(slip, action.tanggal, state.seq);
      const slipTerbayar: Penggajian = {
        ...slip,
        statusBayar: "terbayar",
        tanggalBayar: action.tanggal,
        transaksiId: transaksi.id,
      };
      return {
        ...state,
        seq: state.seq + 1,
        seqPenggajian: ada ? state.seqPenggajian : state.seqPenggajian + 1,
        penggajian: ada
          ? state.penggajian.map((item) => (item.id === slip.id ? slipTerbayar : item))
          : [slipTerbayar, ...state.penggajian],
        transaksi: [transaksi, ...state.transaksi],
        toast: `Gaji ${slip.nama} ${formatBulan(slip.periode)} dibayar dan tercatat di Kas Keluar.`,
      };
    }
    case "batalkan-bayar": {
      const slip = state.penggajian.find((item) => item.id === action.id);
      if (!slip || slip.statusBayar !== "terbayar") return state;
      return {
        ...state,
        penggajian: state.penggajian.map((item) =>
          item.id === action.id
            ? { ...item, statusBayar: "belum", tanggalBayar: "", transaksiId: "" }
            : item,
        ),
        transaksi: state.transaksi.filter((item) => item.id !== slip.transaksiId),
        toast: `Pembayaran gaji ${slip.nama} ${formatBulan(slip.periode)} dibatalkan.`,
      };
    }
    case "hapus-penggajian": {
      const slip = state.penggajian.find((item) => item.id === action.id);
      if (!slip || slip.statusBayar === "terbayar") return state;
      return {
        ...state,
        penggajian: state.penggajian.filter((item) => item.id !== action.id),
        toast: `Slip ${slip.nama} ${formatBulan(slip.periode)} dihapus.`,
      };
    }
    case "tambah-karyawan": {
      const nama = action.payload.nama.trim();
      if (!nama) return state;
      const karyawan: Karyawan = {
        ...action.payload,
        nama,
        id: `PGW-${String(state.seqKaryawan).padStart(3, "0")}`,
      };

      return {
        ...state,
        seqKaryawan: state.seqKaryawan + 1,
        karyawan: [...state.karyawan, karyawan],
        toast: `${nama} ditambahkan ke daftar karyawan.`,
      };
    }
    case "ubah-karyawan": {
      const ada = state.karyawan.some((item) => item.id === action.payload.id);
      if (!ada) return state;
      const nama = action.payload.nama.trim();
      if (!nama) return state;

      const karyawan = state.karyawan.map((item) =>
        item.id === action.payload.id ? { ...action.payload, nama } : item,
      );
      const namaLama = state.karyawan.find((item) => item.id === action.payload.id)?.nama ?? nama;

      return {
        ...state,
        karyawan,
        toast: `Data ${nama} diperbarui${nama === namaLama ? "" : ` (sebelumnya ${namaLama})`}.`,
      };
    }
    case "hapus-karyawan": {
      const karyawan = state.karyawan.find((item) => item.id === action.id);
      if (!karyawan) return state;
      const adaRiwayat = state.penggajian.some((item) => item.karyawanId === action.id);

      return {
        ...state,
        karyawan: state.karyawan.filter((item) => item.id !== action.id),
        toast: adaRiwayat
          ? `${karyawan.nama} dihapus. Riwayat slip gajinya tetap tersimpan.`
          : `${karyawan.nama} dihapus dari daftar karyawan.`,
      };
    }
    case "tambah-opsi-jabatan": {
      const nilai = action.nilai.trim();
      if (!nilai) return state;
      if (state.opsiJabatan.some((item) => item.toLowerCase() === nilai.toLowerCase())) return state;

      return {
        ...state,
        opsiJabatan: [...state.opsiJabatan, nilai],
        toast: `"${nilai}" ditambahkan ke daftar jabatan.`,
      };
    }
    case "toast":
      return { ...state, toast: action.message };
    case "bersihkan-toast":
      return { ...state, toast: "" };
    default:
      return state;
  }
}

type FinanceContextValue = {
  loading: boolean;
  state: FinanceState;
  rekap: ReturnType<typeof REKAP_TRANSAKSI>;
  transaksiUrut: TransaksiKas[];
  invoiceRingkas: InvoiceRingkas[];
  opsiJabatan: string[];
  opsiPerson: string[];
  opsiKategori: KategoriBiaya[];
  opsiPos: PosProyek[];
  tambahOpsi: (field: FieldOpsi, nilai: string) => void;
  tambahTransaksi: (payload: Omit<TransaksiKas, "id">) => void;
  hapusTransaksi: (id: string) => void;
  tambahInvoice: (payload: Omit<Invoice, "id">) => void;
  ubahInvoice: (payload: Invoice) => void;
  hapusInvoice: (id: string) => void;
  tambahBukti: (id: string, bukti: string) => void;
  lunasTermin: (invoiceId: string, terminId: string) => void;
  buatPenggajian: (karyawanId: string, periode: string) => void;
  buatPenggajianBulan: (periode: string) => void;
  ubahPenggajian: (id: string, tunjangan: number, potongan: number, metodeBayar?: string) => void;
  bayarGaji: (id: string, tanggal: string) => void;
  bayarLangsung: (karyawanId: string, periode: string, tanggal: string) => void;
  batalkanBayar: (id: string) => void;
  hapusPenggajian: (id: string) => void;
  tambahKaryawan: (payload: Omit<Karyawan, "id">) => void;
  ubahKaryawan: (payload: Karyawan) => void;
  hapusKaryawan: (id: string) => void;
  tambahOpsiJabatan: (nilai: string) => void;
  setToast: (message: string) => void;
  clearToast: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loadedFromApi, setLoadedFromApi] = useState(false);
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    request<Omit<FinanceState, "toast">>("/keuangan/finance-store")
      .then((saved) => {
        if (active) {
          dispatch({ type: "hydrate", payload: saved });
          setLoadedFromApi(true);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          dispatch({
            type: "toast",
            message: error instanceof Error
              ? `Data belum tersambung ke database: ${error.message}`
              : "Data belum tersambung ke database.",
          });
        }
      });
    return () => { active = false; };
  }, []);

  const {
    transaksi,
    invoice,
    karyawan,
    penggajian,
    opsiJabatan,
    opsiPerson,
    opsiKategori,
    opsiPos,
    seq,
    seqKaryawan,
    seqInvoice,
    seqPenggajian,
  } = state;
  const persistedState = useMemo(() => ({
    transaksi,
    invoice,
    karyawan,
    penggajian,
    opsiJabatan,
    opsiPerson,
    opsiKategori,
    opsiPos,
    seq,
    seqKaryawan,
    seqInvoice,
    seqPenggajian,
  }), [transaksi, invoice, karyawan, penggajian, opsiJabatan, opsiPerson, opsiKategori, opsiPos, seq, seqKaryawan, seqInvoice, seqPenggajian]);

  useEffect(() => {
    if (!loadedFromApi) return;
    // Mode pantau (Owner membuka modul Keuangan): tidak ada yang berubah, jangan
    // kirim PUT yang otomatis ditolak server (403) memunculkan toast error.
    if (isReadOnlyMode()) return;
    saveQueue.current = saveQueue.current.catch(() => undefined).then(() =>
      request("/keuangan/finance-store", {
        method: "PUT",
        body: JSON.stringify(persistedState),
      }),
    ).catch((error: unknown) => {
      dispatch({
        type: "toast",
        message: error instanceof Error
          ? `Perubahan belum tersimpan: ${error.message}`
          : "Perubahan belum tersimpan ke database.",
      });
    });
  }, [loadedFromApi, persistedState]);

  const tambahTransaksi = useCallback(
    (payload: Omit<TransaksiKas, "id">) => dispatch({ type: "tambah-transaksi", payload }),
    [],
  );
  const hapusTransaksi = useCallback((id: string) => dispatch({ type: "hapus-transaksi", id }), []);
  const tambahInvoice = useCallback(
    (payload: Omit<Invoice, "id">) => dispatch({ type: "tambah-invoice", payload }),
    [],
  );
  const ubahInvoice = useCallback(
    (payload: Invoice) => dispatch({ type: "ubah-invoice", payload }),
    [],
  );
  const hapusInvoice = useCallback((id: string) => dispatch({ type: "hapus-invoice", id }), []);
  const tambahBukti = useCallback(
    (id: string, bukti: string) => dispatch({ type: "tambah-bukti", id, bukti }),
    [],
  );
  const tambahOpsi = useCallback(
    (field: FieldOpsi, nilai: string) => dispatch({ type: "tambah-opsi", field, nilai }),
    [],
  );
  const lunasTermin = useCallback(
    (invoiceId: string, terminId: string) =>
      dispatch({ type: "lunas-termin", invoiceId, terminId }),
    [],
  );
  const buatPenggajian = useCallback(
    (karyawanId: string, periode: string) =>
      dispatch({ type: "buat-penggajian", karyawanId, periode }),
    [],
  );
  const buatPenggajianBulan = useCallback(
    (periode: string) => dispatch({ type: "buat-penggajian-bulan", periode }),
    [],
  );
  const ubahPenggajian = useCallback(
    (id: string, tunjangan: number, potongan: number, metodeBayar?: string) =>
      dispatch({ type: "ubah-penggajian", id, tunjangan, potongan, metodeBayar }),
    [],
  );
  const bayarGaji = useCallback(
    (id: string, tanggal: string) => dispatch({ type: "bayar-gaji", id, tanggal }),
    [],
  );
  const bayarLangsung = useCallback(
    (karyawanId: string, periode: string, tanggal: string) =>
      dispatch({ type: "bayar-langsung", karyawanId, periode, tanggal }),
    [],
  );
  const batalkanBayar = useCallback(
    (id: string) => dispatch({ type: "batalkan-bayar", id }),
    [],
  );
  const hapusPenggajian = useCallback(
    (id: string) => dispatch({ type: "hapus-penggajian", id }),
    [],
  );
  const tambahKaryawan = useCallback(
    (payload: Omit<Karyawan, "id">) =>
      dispatch({ type: "tambah-karyawan", payload }),
    [],
  );
  const ubahKaryawan = useCallback(
    (payload: Karyawan) => dispatch({ type: "ubah-karyawan", payload }),
    [],
  );
  const hapusKaryawan = useCallback(
    (id: string) => dispatch({ type: "hapus-karyawan", id }),
    [],
  );
  const tambahOpsiJabatan = useCallback(
    (nilai: string) => dispatch({ type: "tambah-opsi-jabatan", nilai }),
    [],
  );
  const setToast = useCallback((message: string) => dispatch({ type: "toast", message }), []);
  const clearToast = useCallback(() => dispatch({ type: "bersihkan-toast" }), []);

  const value = useMemo<FinanceContextValue>(() => {
    const transaksiUrut = [...state.transaksi].sort((left, right) =>
      right.tanggal.localeCompare(left.tanggal) || right.id.localeCompare(left.id),
    );
    const invoiceRingkas = state.invoice.map((invoice) => ({
      ...hitungInvoice(invoice),
      invoice,
    }));
    return {
      state,
      loading: !loadedFromApi,
      rekap: REKAP_TRANSAKSI(state.transaksi),
      transaksiUrut,
      invoiceRingkas,
      opsiPerson: state.opsiPerson,
      opsiKategori: gabungOpsi(KATEGORI_BIAYA, state.opsiKategori),
      opsiPos: gabungOpsi(POS_PROYEK, state.opsiPos),
      opsiJabatan: gabungOpsi(JABATAN_AWAL, state.opsiJabatan),
      tambahOpsi,
      tambahTransaksi,
      hapusTransaksi,
      tambahInvoice,
      ubahInvoice,
      hapusInvoice,
      tambahBukti,
      lunasTermin,
      buatPenggajian,
      buatPenggajianBulan,
      ubahPenggajian,
      bayarGaji,
      bayarLangsung,
      batalkanBayar,
      hapusPenggajian,
      tambahKaryawan,
      ubahKaryawan,
      hapusKaryawan,
      tambahOpsiJabatan,
      setToast,
      clearToast,
    };
  }, [
    state,
    loadedFromApi,
    tambahTransaksi,
    hapusTransaksi,
    tambahInvoice,
    ubahInvoice,
    hapusInvoice,
    tambahBukti,
    lunasTermin,
    buatPenggajian,
    buatPenggajianBulan,
    ubahPenggajian,
    bayarGaji,
    bayarLangsung,
    batalkanBayar,
    hapusPenggajian,
    tambahKaryawan,
    ubahKaryawan,
    hapusKaryawan,
    tambahOpsiJabatan,
    tambahOpsi,
    setToast,
    clearToast,
  ]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance harus dipakai di dalam FinanceProvider.");
  return context;
}
