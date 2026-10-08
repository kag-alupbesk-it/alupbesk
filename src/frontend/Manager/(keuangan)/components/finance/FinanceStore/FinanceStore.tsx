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

import {
  KATEGORI_BIAYA,
  PIHAK,
  POS_PROYEK,
  JABATAN_AWAL,
  REKAP_TRANSAKSI,
  hitungGaji,
  hitungInvoice,
  type FieldOpsi,
  type Invoice,
  type Karyawan,
  type KategoriBiaya,
  type PosProyek,
  type TransaksiKas,
} from "../shared/types";

export type InvoiceRingkas = ReturnType<typeof hitungInvoice> & { invoice: Invoice };

export type FinanceState = {
  transaksi: TransaksiKas[];
  invoice: Invoice[];
  karyawan: Karyawan[];
  opsiJabatan: string[];
  opsiPerson: string[];
  opsiKategori: KategoriBiaya[];
  opsiPos: PosProyek[];
  toast: string;
  seq: number;
  seqKaryawan: number;
};

type FinanceAction =
  | { type: "tambah-transaksi"; payload: Omit<TransaksiKas, "id"> }
  | { type: "hapus-transaksi"; id: string }
  | { type: "tambah-bukti"; id: string; bukti: string }
  | { type: "tambah-opsi"; field: FieldOpsi; nilai: string }
  | { type: "tambah-opsi-jabatan"; nilai: string }
  | { type: "lunas-termin"; invoiceId: string; terminId: string }
  | { type: "bayar-gaji"; id: string; tanggal: string }
  | { type: "tambah-karyawan"; payload: Omit<Karyawan, "id" | "statusBayar" | "tanggalBayar"> }
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
  opsiJabatan: [],
  opsiPerson: [],
  opsiKategori: [],
  opsiPos: [],
  toast: "",
  seq: 1,
  seqKaryawan: 1,
};

function buatTransaksi(payload: Omit<TransaksiKas, "id">, urut: number): TransaksiKas {
  return { ...payload, id: `TRX-${String(urut).padStart(4, "0")}` };
}

function reducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.payload };
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
    case "tambah-karyawan": {
      const nama = action.payload.nama.trim();
      if (!nama) return state;
      const karyawan: Karyawan = {
        ...action.payload,
        nama,
        id: `PGW-${String(state.seqKaryawan).padStart(3, "0")}`,
        statusBayar: "belum",
        tanggalBayar: "",
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
      const adaTransaksi = state.transaksi.some((item) => item.refId === action.id);

      return {
        ...state,
        karyawan: state.karyawan.filter((item) => item.id !== action.id),
        toast: adaTransaksi
          ? `${karyawan.nama} dihapus. Transaksi Kas Keluar terkait tetap tersimpan.`
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
  state: FinanceState;
  rekap: ReturnType<typeof REKAP_TRANSAKSI>;
  transaksiUrut: TransaksiKas[];
  invoiceRingkas: InvoiceRingkas[];
  totalGaji: number;
  gajiBelumDibayar: number;
  opsiJabatan: string[];
  opsiPerson: string[];
  opsiKategori: KategoriBiaya[];
  opsiPos: PosProyek[];
  tambahOpsi: (field: FieldOpsi, nilai: string) => void;
  tambahTransaksi: (payload: Omit<TransaksiKas, "id">) => void;
  hapusTransaksi: (id: string) => void;
  tambahBukti: (id: string, bukti: string) => void;
  lunasTermin: (invoiceId: string, terminId: string) => void;
  bayarGaji: (id: string, tanggal: string) => void;
  tambahKaryawan: (payload: Omit<Karyawan, "id" | "statusBayar" | "tanggalBayar">) => void;
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
    opsiJabatan,
    opsiPerson,
    opsiKategori,
    opsiPos,
    seq,
    seqKaryawan,
  } = state;
  const persistedState = useMemo(() => ({
    transaksi,
    invoice,
    karyawan,
    opsiJabatan,
    opsiPerson,
    opsiKategori,
    opsiPos,
    seq,
    seqKaryawan,
  }), [transaksi, invoice, karyawan, opsiJabatan, opsiPerson, opsiKategori, opsiPos, seq, seqKaryawan]);

  useEffect(() => {
    if (!loadedFromApi) return;
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
  const tambahKaryawan = useCallback(
    (payload: Omit<Karyawan, "id" | "statusBayar" | "tanggalBayar">) =>
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
      opsiJabatan: gabungOpsi(JABATAN_AWAL, state.opsiJabatan),
      tambahOpsi,
      tambahTransaksi,
      hapusTransaksi,
      tambahBukti,
      lunasTermin,
      bayarGaji,
      tambahKaryawan,
      ubahKaryawan,
      hapusKaryawan,
      tambahOpsiJabatan,
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
