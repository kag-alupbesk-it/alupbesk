"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

export type KeuanganEntry = {
  id: string;
  tipe: "masuk" | "keluar";
  sumber: string;
  deskripsi: string;
  jumlah: number;
  kategori: "eceran" | "proyek" | "operasional";
  tanggal: string;
  createdAt: string;
  relatedId?: string;
};

export type KeuanganSnapshot = {
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
  masuk: KeuanganEntry[];
  keluar: KeuanganEntry[];
};

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ExpenseApproval = {
  id: string;
  title: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  status: ApprovalStatus;
};

export type PayrollItem = {
  id: string;
  name: string;
  role: string;
  workers: number;
  days: number;
  rate: number;
  type: "harian" | "borongan";
  status: "paid" | "unpaid";
};

type State = {
  snapshot: KeuanganSnapshot | null;
  simulatedEntries: KeuanganEntry[];
  pendingApprovals: ExpenseApproval[];
  payrollItems: PayrollItem[];
};

type Action =
  | { type: "set-snapshot"; snapshot: KeuanganSnapshot }
  | { type: "update-simulated-entry"; entry: KeuanganEntry }
  | { type: "delete-simulated-entry"; id: string }
  | { type: "approve-expense"; id: string; entry: KeuanganEntry }
  | { type: "reject-expense"; id: string }
  | { type: "add-payroll"; item: PayrollItem }
  | { type: "disburse-payroll"; id: string; entry: KeuanganEntry };

const initialState: State = {
  snapshot: null,
  simulatedEntries: [],
  pendingApprovals: [
    { id: "EXP-1021", title: "Pembelian besi hollow", vendor: "CV Karya Baja", amount: 7500000, date: "2026-10-01", category: "Material", status: "pending" },
    { id: "EXP-2013", title: "Biaya transport proyek", vendor: "Mitra Logistik", amount: 6200000, date: "2026-10-01", category: "Operasional", status: "pending" },
    { id: "EXP-3441", title: "Sewa alat berat", vendor: "PT Armada Alat", amount: 18000000, date: "2026-09-30", category: "Sewa", status: "pending" },
    { id: "EXP-3825", title: "Pembelian cat anti karat", vendor: "Toko Bangunan Nusa", amount: 4300000, date: "2026-09-28", category: "Material", status: "rejected" },
    { id: "EXP-4716", title: "Pengadaan perlengkapan safety", vendor: "Safety Pro", amount: 9200000, date: "2026-09-27", category: "K3", status: "pending" },
  ],
  payrollItems: [
    { id: "P-01", name: "Tim Kuli Proyek A", role: "Pekerja Lapangan", workers: 12, days: 18, rate: 180000, type: "harian", status: "unpaid" },
    { id: "P-02", name: "Karyawan Gudang", role: "Staf Internal", workers: 4, days: 20, rate: 250000, type: "harian", status: "unpaid" },
    { id: "P-03", name: "Pekerjaan Borongan Proyek C", role: "Pekerja Borongan", workers: 7, days: 12, rate: 420000, type: "borongan", status: "unpaid" },
  ],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-snapshot":
      return { ...state, snapshot: action.snapshot };
    case "update-simulated-entry":
      return {
        ...state,
        simulatedEntries: state.simulatedEntries.map((entry) => entry.id === action.entry.id ? action.entry : entry),
      };
    case "delete-simulated-entry": {
      const deletedEntry = state.simulatedEntries.find((entry) => entry.id === action.id);
      if (!deletedEntry) return state;
      return {
        ...state,
        pendingApprovals: deletedEntry.sumber === "Simulasi approval"
          ? state.pendingApprovals.map((item) => item.id === deletedEntry.relatedId ? { ...item, status: "pending" } : item)
          : state.pendingApprovals,
        payrollItems: deletedEntry.sumber === "Simulasi payroll"
          ? state.payrollItems.map((item) => item.id === deletedEntry.relatedId ? { ...item, status: "unpaid" } : item)
          : state.payrollItems,
        simulatedEntries: state.simulatedEntries.filter((entry) => entry.id !== action.id),
      };
    }
    case "approve-expense": {
      const expense = state.pendingApprovals.find((item) => item.id === action.id);
      if (!expense || expense.status !== "pending") return state;
      return {
        ...state,
        pendingApprovals: state.pendingApprovals.map((item) => item.id === action.id ? { ...item, status: "approved" } : item),
        simulatedEntries: [...state.simulatedEntries, action.entry],
      };
    }
    case "reject-expense":
      return {
        ...state,
        pendingApprovals: state.pendingApprovals.map((item) => item.id === action.id && item.status === "pending" ? { ...item, status: "rejected" } : item),
      };
    case "add-payroll":
      return { ...state, payrollItems: [action.item, ...state.payrollItems] };
    case "disburse-payroll": {
      const payroll = state.payrollItems.find((item) => item.id === action.id);
      if (!payroll || payroll.status !== "unpaid") return state;
      return {
        ...state,
        payrollItems: state.payrollItems.map((item) => item.id === action.id ? { ...item, status: "paid" } : item),
        simulatedEntries: [...state.simulatedEntries, action.entry],
      };
    }
  }
}

type KeuanganContextValue = {
  globalSaldo: number;
  totalMasuk: number;
  totalKeluar: number;
  listKasEntries: KeuanganEntry[];
  pendingApprovals: ExpenseApproval[];
  payrollItems: PayrollItem[];
  setKasSnapshot: (snapshot: KeuanganSnapshot) => void;
  updateSimulatedEntry: (entry: KeuanganEntry) => void;
  deleteSimulatedEntry: (id: string) => void;
  approveExpense: (id: string, entry: KeuanganEntry) => void;
  rejectExpense: (id: string) => void;
  addPayroll: (item: PayrollItem) => void;
  disbursePayroll: (id: string, entry: KeuanganEntry) => void;
};

const KeuanganContext = createContext<KeuanganContextValue | null>(null);

export function KeuanganProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const setKasSnapshot = useCallback((snapshot: KeuanganSnapshot) => dispatch({ type: "set-snapshot", snapshot }), []);
  const updateSimulatedEntry = useCallback((entry: KeuanganEntry) => dispatch({ type: "update-simulated-entry", entry }), []);
  const deleteSimulatedEntry = useCallback((id: string) => dispatch({ type: "delete-simulated-entry", id }), []);
  const approveExpense = useCallback((id: string, entry: KeuanganEntry) => dispatch({ type: "approve-expense", id, entry }), []);
  const rejectExpense = useCallback((id: string) => dispatch({ type: "reject-expense", id }), []);
  const addPayroll = useCallback((item: PayrollItem) => dispatch({ type: "add-payroll", item }), []);
  const disbursePayroll = useCallback((id: string, entry: KeuanganEntry) => dispatch({ type: "disburse-payroll", id, entry }), []);

  const value = useMemo(() => {
    const simulatedMasuk = state.simulatedEntries.filter((entry) => entry.tipe === "masuk").reduce((sum, entry) => sum + entry.jumlah, 0);
    const simulatedKeluar = state.simulatedEntries.filter((entry) => entry.tipe === "keluar").reduce((sum, entry) => sum + entry.jumlah, 0);
    const base = state.snapshot;
    const listKasEntries = [...(base?.masuk ?? []), ...(base?.keluar ?? []), ...state.simulatedEntries]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return {
      globalSaldo: (base?.saldo ?? 0) + simulatedMasuk - simulatedKeluar,
      totalMasuk: (base?.totalMasuk ?? 0) + simulatedMasuk,
      totalKeluar: (base?.totalKeluar ?? 0) + simulatedKeluar,
      listKasEntries,
      pendingApprovals: state.pendingApprovals,
      payrollItems: state.payrollItems,
      setKasSnapshot,
      updateSimulatedEntry,
      deleteSimulatedEntry,
      approveExpense,
      rejectExpense,
      addPayroll,
      disbursePayroll,
    };
  }, [state, setKasSnapshot, updateSimulatedEntry, deleteSimulatedEntry, approveExpense, rejectExpense, addPayroll, disbursePayroll]);

  return <KeuanganContext.Provider value={value}>{children}</KeuanganContext.Provider>;
}

export function useKeuangan() {
  const context = useContext(KeuanganContext);
  if (!context) throw new Error("useKeuangan harus digunakan di dalam KeuanganProvider.");
  return context;
}