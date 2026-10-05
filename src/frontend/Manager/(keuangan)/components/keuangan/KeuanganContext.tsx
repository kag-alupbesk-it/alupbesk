"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type KeuanganEntry = {
  id: string;
  tipe: "masuk" | "keluar";
  sumber: string;
  deskripsi: string;
  jumlah: number;
  kategori: "eceran" | "proyek" | "operasional";
  tanggal: string;
  createdAt: string;
};

export type KeuanganSnapshot = {
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
  masuk: KeuanganEntry[];
  keluar: KeuanganEntry[];
};

type KeuanganContextValue = {
  globalSaldo: number;
  totalMasuk: number;
  totalKeluar: number;
  listKasEntries: KeuanganEntry[];
  setKasSnapshot: (snapshot: KeuanganSnapshot) => void;
};

const KeuanganContext = createContext<KeuanganContextValue | null>(null);

export function KeuanganProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<KeuanganSnapshot | null>(null);

  const value = useMemo(() => {
    const base = snapshot;
    const listKasEntries = [...(base?.masuk ?? []), ...(base?.keluar ?? [])]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return {
      globalSaldo: base?.saldo ?? 0,
      totalMasuk: base?.totalMasuk ?? 0,
      totalKeluar: base?.totalKeluar ?? 0,
      listKasEntries,
      setKasSnapshot: setSnapshot,
    };
  }, [snapshot]);

  return <KeuanganContext.Provider value={value}>{children}</KeuanganContext.Provider>;
}

export function useKeuangan() {
  const context = useContext(KeuanganContext);
  if (!context) throw new Error("useKeuangan harus digunakan di dalam KeuanganProvider.");
  return context;
}