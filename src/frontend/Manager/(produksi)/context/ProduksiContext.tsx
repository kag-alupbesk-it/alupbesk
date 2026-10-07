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
  updateProductionStage,
} from "@/services/api/pm";
import type { PMOrder } from "@/services/pm/types";
import type { KirimGambarInput, SPK, TahapanProduksi } from "../types";
import { mapPMOrderToSPK } from "../services/mapPMOrderToSPK";

interface ProduksiContextValue {
  spk: SPK[];
  spkPerluGambar: SPK[];
  loading: boolean;
  error: string;
  clearError: () => void;
  getSPK: (nomor: string) => SPK | undefined;
  kirimGambar: (input: KirimGambarInput) => Promise<boolean>;
  ubahTahapan: (nomor: string, tahapan: TahapanProduksi) => Promise<boolean>;
}

const ProduksiContext = createContext<ProduksiContextValue | undefined>(undefined);

function replaceOrder(orders: PMOrder[], updated: PMOrder): PMOrder[] {
  return orders.map((order) => (order.id === updated.id ? updated : order));
}

export function ProduksiProvider({ children }: { children: ReactNode }) {
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
              : "Order produksi gagal dimuat.",
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

  const ubahTahapan = useCallback(
    async (nomor: string, tahapan: TahapanProduksi) => {
      try {
        const updated = await updateProductionStage(nomor, tahapan);
        setOrders((current) => replaceOrder(current, updated));
        setError("");
        return true;
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "Tahap produksi gagal diperbarui.",
        );
        return false;
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      spk,
      spkPerluGambar,
      loading,
      error,
      clearError,
      getSPK,
      kirimGambar,
      ubahTahapan,
    }),
    [spk, spkPerluGambar, loading, error, clearError, getSPK, kirimGambar, ubahTahapan],
  );

  return <ProduksiContext.Provider value={value}>{children}</ProduksiContext.Provider>;
}

export function useProduksi() {
  const context = useContext(ProduksiContext);
  if (!context) throw new Error("useProduksi must be used within ProduksiProvider");
  return context;
}
