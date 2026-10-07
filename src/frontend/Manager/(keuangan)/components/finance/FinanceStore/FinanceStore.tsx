"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { KasEntry, PenagihanItem } from "@/backend/modules/keuangan";
import { KATEGORI_KAS, keuanganApi } from "@/services/api/keuangan";

import {
  JABATAN_AWAL,
  PIHAK,
  POS_PROYEK,
  REKAP_TRANSAKSI,
  hitungGaji,
  hitungInvoice,
  type Invoice,
  type Karyawan,
  type PosProyek,
  type TransaksiKas,
} from "../types/types";

export type InvoiceRingkas = ReturnType<typeof hitungInvoice> & { invoice: Invoice };

export type FinanceState = {
  transaksi: TransaksiKas[];
  invoice: Invoice[];
  karyawan: Karyawan[];
  opsiJabatan: string[];
  opsiPerson: string[];
  opsiKategori: string[];
  opsiPos: PosProyek[];
  toast: string;
  seq: number;
  seqKaryawan: number;
};

// Pemetaan data dari endpoint backend ke bentuk yang dipakai UI.
// Transaksi kas dari BE hanya mengenal masuk/keluar; kas beredar (bon) dan
// rincian person/pos/nota belum tersedia di backend.
function dariKasEntry(entry: KasEntry): TransaksiKas {
  return {
    id: entry.id,
    tanggal: entry.tanggal,
    jenis: entry.tipe === "masuk" ? "kas_masuk" : "kas_keluar",
    uraian: entry.deskripsi,
    kategori: entry.kategori,
    posProyek: "",
    person: entry.sumber,
    nominal: entry.jumlah,
    noNota: "",
    bukti: "",
    sumber: "manual",
    refId: "",
  };
}

// Token penagihan dari BE tidak memuat rincian termin; setiap tagihan
// dipetakan sebagai satu "termin" utuh dengan status lunas/belum.
function dariPenagihan(item: PenagihanItem): Invoice {
  const tanggal = item.tanggal;
  return {
    id: item.id,
    nomor: item.id,
    tanggal,
    pihak: "Kontraktor",
    nama: item.pelanggan,
    proyek: item.sumber,
    posProyek: item.kategori,
    uraian: `${item.sumber} — ${item.pelanggan}`,
    termin: [
      {
        id: "T1",
        label: "Tagihan",
        tanggal,
        jatuhTempo: tanggal,
        nominal: item.nilai,
        lunas: item.status === "lunas",
      },
    ],
  };
}

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

type FinanceContextValue = {
  state: FinanceState;
  rekap: ReturnType<typeof REKAP_TRANSAKSI>;
  transaksiUrut: TransaksiKas[];
  invoiceRingkas: InvoiceRingkas[];
  totalGaji: number;
  gajiBelumDibayar: number;
  opsiJabatan: string[];
  opsiPerson: string[];
  opsiKategori: string[];
  opsiPos: PosProyek[];
  muat: () => Promise<void>;
  tambahOpsi: (field: "person" | "kategori" | "pos", nilai: string) => void;
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

const pesanGagal = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(initialState);

  const setToast = useCallback(
    (message: string) => setState((prev) => ({ ...prev, toast: message })),
    [],
  );
  const clearToast = useCallback(
    () => setState((prev) => ({ ...prev, toast: "" })),
    [],
  );

  const muat = useCallback(async () => {
    try {
      const [kas, penagihan] = await Promise.all([
        keuanganApi.getKas(),
        keuanganApi.getPenagihan(),
      ]);
      const transaksi = [...kas.masuk, ...kas.keluar].map(dariKasEntry);
      const invoice = penagihan.map(dariPenagihan);
      setState((prev) => ({ ...prev, transaksi, invoice }));
    } catch (error) {
      setToast(pesanGagal(error, "Gagal memuat data keuangan."));
    }
  }, [setToast]);

  useEffect(() => {
    // Muat data keuangan (kas & penagihan) sekali saat provider dipasang,
    // karena sumber datanya di luar React (API backend).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muat();
  }, [muat]);

  const tambahTransaksi = useCallback(
    (payload: Omit<TransaksiKas, "id">) => {
      const kategori = KATEGORI_KAS.includes(
        payload.kategori as (typeof KATEGORI_KAS)[number],
      )
        ? payload.kategori
        : "operasional";

      void (async () => {
        try {
          const entry = await keuanganApi.tambahKas({
            tipe: payload.jenis === "kas_masuk" ? "masuk" : "keluar",
            deskripsi: payload.uraian,
            jumlah: payload.nominal,
            kategori: kategori as (typeof KATEGORI_KAS)[number],
            tanggal: payload.tanggal || undefined,
          });
          const transaksi = dariKasEntry(entry);
          setState((prev) => ({
            ...prev,
            transaksi: [transaksi, ...prev.transaksi],
            toast: `${transaksi.uraian} dicatat sebagai ${
              entry.tipe === "masuk" ? "Kas Masuk" : "Kas Keluar"
            }.`,
          }));
        } catch (error) {
          setToast(pesanGagal(error, "Gagal menyimpan transaksi."));
        }
      })();
    },
    [setToast],
  );

  const hapusTransaksi = useCallback(
    (id: string) => {
      void (async () => {
        try {
          await keuanganApi.hapusKas(id);
          setState((prev) => ({
            ...prev,
            transaksi: prev.transaksi.filter((item) => item.id !== id),
            toast: `Transaksi ${id} dihapus dari buku kas.`,
          }));
        } catch (error) {
          setToast(pesanGagal(error, "Gagal menghapus transaksi."));
        }
      })();
    },
    [setToast],
  );

  const lunasTermin = useCallback(
    (invoiceId: string, terminId: string) => {
      void (async () => {
        try {
          await keuanganApi.setLunas(invoiceId);
          setState((prev) => ({
            ...prev,
            invoice: prev.invoice.map((invoice) =>
              invoice.id === invoiceId
                ? {
                    ...invoice,
                    termin: invoice.termin.map((termin) =>
                      termin.id === terminId
                        ? { ...termin, lunas: true, tanggal: new Date().toISOString().slice(0, 10) }
                        : termin,
                    ),
                  }
                : invoice,
            ),
            toast: `Tagihan ${invoiceId} ditandai lunas.`,
          }));
        } catch (error) {
          setToast(pesanGagal(error, "Gagal menandai tagihan lunas."));
        }
      })();
    },
    [setToast],
  );

  const belumDidukung = useCallback(
    (fitur: string) => setToast(`${fitur} belum tersedia di backend.`),
    [setToast],
  );

  const tambahOpsi = useCallback(
    (field: "person" | "kategori" | "pos") => {
      const label = field === "person" ? "Person" : field === "kategori" ? "Kategori" : "Pos/Proyek";
      belumDidukung(`Menambahkan ${label} baru`);
    },
    [belumDidukung],
  );
  const tambahOpsiJabatan = useCallback(
    () => belumDidukung("Menambahkan jabatan baru"),
    [belumDidukung],
  );
  const tambahBukti = useCallback(
    () => belumDidukung("Unggah bukti nota"),
    [belumDidukung],
  );
  const bayarGaji = useCallback(
    () => belumDidukung("Pencairan gaji"),
    [belumDidukung],
  );
  const tambahKaryawan = useCallback(
    () => belumDidukung("Tambah karyawan"),
    [belumDidukung],
  );
  const ubahKaryawan = useCallback(
    () => belumDidukung("Ubah data karyawan"),
    [belumDidukung],
  );
  const hapusKaryawan = useCallback(
    () => belumDidukung("Hapus karyawan"),
    [belumDidukung],
  );

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
      opsiPerson: [...PIHAK],
      opsiKategori: [...KATEGORI_KAS, ...state.opsiKategori],
      opsiPos: [...POS_PROYEK, ...state.opsiPos],
      opsiJabatan: [...JABATAN_AWAL, ...state.opsiJabatan],
      muat,
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
    muat,
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
  ]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance harus dipakai di dalam FinanceProvider.");
  return context;
}