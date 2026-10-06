"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  karyawanAwal,
  invoiceAwal,
  transaksiKasAwal,
} from "./mockData";
import {
  KATEGORI_BIAYA,
  PIHAK,
  POS_PROYEK,
  REKAP_TRANSAKSI,
  hitungGaji,
  hitungInvoice,
  type FieldOpsi,
  type Invoice,
  type Karyawan,
  type KategoriBiaya,
  type PosProyek,
  type TransaksiKas,
} from "./types";

export type InvoiceRingkas = ReturnType<typeof hitungInvoice> & { invoice: Invoice };

export type FinanceState = {
  transaksi: TransaksiKas[];
  invoice: Invoice[];
  karyawan: Karyawan[];
  opsiPerson: string[];
  opsiKategori: KategoriBiaya[];
  opsiPos: PosProyek[];
  toast: string;
  seq: number;
};

type FinanceAction =
  | { type: "tambah-transaksi"; payload: Omit<TransaksiKas, "id"> }
  | { type: "hapus-transaksi"; id: string }
  | { type: "tambah-bukti"; id: string; bukti: string }
  | { type: "tambah-opsi"; field: FieldOpsi; nilai: string }
  | { type: "lunas-termin"; invoiceId: string; terminId: string }
  | { type: "bayar-gaji"; id: string; tanggal: string }
  | { type: "toast"; message: string }
  | { type: "bersihkan-toast" };

const gabungOpsi = <T extends string>(dasar: readonly T[], kustom: T[]): T[] => {
  const lihat = new Set(dasar.map((item) => item.toLowerCase()));
  return [...dasar, ...kustom.filter((item) => !lihat.has(item.toLowerCase()))];
};

const initialState: FinanceState = {
  transaksi: transaksiKasAwal,
  invoice: invoiceAwal,
  karyawan: karyawanAwal,
  opsiPerson: [],
  opsiKategori: [],
  opsiPos: [],
  toast: "",
  seq: 1,
};

function buatTransaksi(payload: Omit<TransaksiKas, "id">, urut: number): TransaksiKas {
  return { ...payload, id: `TRX-${String(urut).padStart(4, "0")}` };
}

function reducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
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
    case "bayar-gaji": {
      const karyawan = state.karyawan.find((item) => item.id === action.id);
      if (!karyawan || karyawan.statusBayar === "terbayar") return state;
      const { netto } = hitungGaji(karyawan);

      return {
        ...state,
        seq: state.seq + 1,
        karyawan: state.karyawan.map((item) =>
          item.id === action.id
            ? { ...item, statusBayar: "terbayar", tanggalBayar: action.tanggal }
            : item,
        ),
        transaksi: [
          buatTransaksi(
            {
              tanggal: action.tanggal,
              jenis: "kas_keluar",
              uraian: `Pencairan gaji ${karyawan.nama} · periode ${karyawan.periode}`,
              kategori: "Dll",
              posProyek: karyawan.lokasi,
              person: karyawan.nama,
              nominal: netto,
              noNota: `SLIP/${karyawan.periode}/${karyawan.id}`,
              bukti: `slip_gaji_${karyawan.id}.pdf`,
              sumber: "payroll",
              refId: karyawan.id,
            },
            state.seq,
          ),
          ...state.transaksi,
        ],
        toast: `Gaji ${karyawan.nama} ditandai terbayar dan tercatat di Kas Keluar.`,
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
  state: FinanceState;
  rekap: ReturnType<typeof REKAP_TRANSAKSI>;
  transaksiUrut: TransaksiKas[];
  invoiceRingkas: InvoiceRingkas[];
  totalGaji: number;
  gajiBelumDibayar: number;
  opsiPerson: string[];
  opsiKategori: KategoriBiaya[];
  opsiPos: PosProyek[];
  tambahOpsi: (field: FieldOpsi, nilai: string) => void;
  tambahTransaksi: (payload: Omit<TransaksiKas, "id">) => void;
  hapusTransaksi: (id: string) => void;
  tambahBukti: (id: string, bukti: string) => void;
  lunasTermin: (invoiceId: string, terminId: string) => void;
  bayarGaji: (id: string, tanggal: string) => void;
  setToast: (message: string) => void;
  clearToast: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const tambahTransaksi = useCallback(
    (payload: Omit<TransaksiKas, "id">) => dispatch({ type: "tambah-transaksi", payload }),
    [],
  );
  const hapusTransaksi = useCallback((id: string) => dispatch({ type: "hapus-transaksi", id }), []);
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
  const bayarGaji = useCallback(
    (id: string, tanggal: string) => dispatch({ type: "bayar-gaji", id, tanggal }),
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
    const totalGaji = state.karyawan.reduce((sum, item) => sum + hitungGaji(item).netto, 0);
    const gajiBelumDibayar = state.karyawan
      .filter((item) => item.statusBayar === "belum")
      .reduce((sum, item) => sum + hitungGaji(item).netto, 0);

    return {
      state,
      rekap: REKAP_TRANSAKSI(state.transaksi),
      transaksiUrut,
      invoiceRingkas,
      totalGaji,
      gajiBelumDibayar,
      opsiPerson: gabungOpsi(PIHAK, state.opsiPerson),
      opsiKategori: gabungOpsi(KATEGORI_BIAYA, state.opsiKategori),
      opsiPos: gabungOpsi(POS_PROYEK, state.opsiPos),
      tambahOpsi,
      tambahTransaksi,
      hapusTransaksi,
      tambahBukti,
      lunasTermin,
      bayarGaji,
      setToast,
      clearToast,
    };
  }, [
    state,
    tambahTransaksi,
    hapusTransaksi,
    tambahBukti,
    lunasTermin,
    bayarGaji,
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