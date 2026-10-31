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
import {
  getPMOrders,
  submitProductionDrawing,
} from "@/services/api/pm/index";
import type { PMOrder } from "@/services/pm/types";
import type { KirimGambarInput, SPK } from "../../../(produksi)/types/types";
import { mapPMOrderToSPK } from "../../../(produksi)/services/mapPMOrderToSPK";

interface DrafterContextValue {
  spk: SPK[];
  spkPerluGambar: SPK[];
  loading: boolean;
  error: string;
  clearError: () => void;
  getSPK: (nomor: string) => SPK | undefined;
  kirimGambar: (input: KirimGambarInput) => Promise<boolean>;
}

const DrafterContext = createContext<DrafterContextValue | undefined>(undefined);

function replaceOrder(orders: PMOrder[], updated: PMOrder): PMOrder[] {
  return orders.map((order) => (order.id === updated.id ? updated : order));
}

export function DrafterProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PMOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const spk = useMemo(() => orders.map(mapPMOrderToSPK), [orders]);

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        const loaded = await getPMOrders();
        if (active) {
          setOrders(loaded);
          setError("");
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Order tugas desain gagal dimuat.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadOrders();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadOrders();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const clearError = useCallback(() => setError(""), []);
  const getSPK = useCallback(
    (nomor: string) => spk.find((item) => item.nomor === nomor),
    [spk],
  );
  const spkPerluGambar = useMemo(
    () =>
      spk.filter(
        (item) =>
          item.statusGambar === "belum_diunggah" || item.statusGambar === "revisi",
      ),
    [spk],
  );

  const kirimGambar = useCallback(async (input: KirimGambarInput) => {
    try {
      const updated = await submitProductionDrawing(
        input.spkNomor,
        input.file,
        input.catatanTeknis,
      );
      setOrders((current) => replaceOrder(current, updated));
      setError("");
      return true;
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Gambar teknik gagal diunggah.",
      );
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      spk,
      spkPerluGambar,
      loading,
      error,
      clearError,
      getSPK,
      kirimGambar,
    }),
    [spk, spkPerluGambar, loading, error, clearError, getSPK, kirimGambar],
  );

  return <DrafterContext.Provider value={value}>{children}</DrafterContext.Provider>;
}

export function useDrafter() {
  const context = useContext(DrafterContext);
  if (!context) throw new Error("useDrafter must be used within DrafterProvider");
  return context;
}
