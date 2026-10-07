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
import type {
  NewPMOrderInput,
  PMOrder,
  PMOrderMutation,
} from "@/services/pm/types";
import {
  createPMOrder as savePMOrder,
  getPMOrders,
  updatePMOrder as savePMOrderUpdate,
} from "@/services/api/pm";

interface PMOrderContextValue {
  orders: PMOrder[];
  loading: boolean;
  error: string;
  clearError: () => void;
  addOrder: (input: NewPMOrderInput) => Promise<PMOrder | null>;
  approveOrder: (id: string) => Promise<boolean>;
  requestRevision: (id: string, note: string) => Promise<boolean>;
  advanceOrder: (id: string) => Promise<boolean>;
}

const PMOrderContext = createContext<PMOrderContextValue | undefined>(undefined);

export function PMOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PMOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        const loadedOrders = await getPMOrders();
        if (active) {
          setOrders(loadedOrders);
          setError("");
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Order PM gagal dimuat.",
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

  const addOrder = useCallback(async (input: NewPMOrderInput) => {
    try {
      const order = await savePMOrder(input);
      setOrders((current) => [order, ...current]);
      setError("");
      return order;
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Order gagal disimpan.",
      );
      return null;
    }
  }, []);

  const applyMutation = useCallback(
    async (id: string, mutation: PMOrderMutation): Promise<boolean> => {
      try {
        const updatedOrder = await savePMOrderUpdate(id, mutation);
        setOrders((current) =>
          current.map((order) => (order.id === id ? updatedOrder : order)),
        );
        setError("");
        return true;
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Perubahan order gagal disimpan.",
        );
        return false;
      }
    },
    [],
  );

  const approveOrder = useCallback(
    (id: string) => applyMutation(id, { action: "approve" }),
    [applyMutation],
  );
  const requestRevision = useCallback(
    (id: string, note: string) =>
      applyMutation(id, { action: "revision", note }),
    [applyMutation],
  );
  const advanceOrder = useCallback(
    (id: string) => applyMutation(id, { action: "advance" }),
    [applyMutation],
  );

  const value = useMemo(
    () => ({
      orders,
      loading,
      error,
      clearError,
      addOrder,
      approveOrder,
      requestRevision,
      advanceOrder,
    }),
    [
      orders,
      loading,
      error,
      clearError,
      addOrder,
      approveOrder,
      requestRevision,
      advanceOrder,
    ],
  );

  return <PMOrderContext.Provider value={value}>{children}</PMOrderContext.Provider>;
}

export function usePMOrders() {
  const context = useContext(PMOrderContext);
  if (!context) throw new Error("usePMOrders must be used within PMOrderProvider");
  return context;
}
