"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mockOrders } from "../../data/mockData/mockData";
import type { NewPMOrderInput, PMOrder, ProjectStatus } from "../../types/types";

interface PMOrderContextValue {
  orders: PMOrder[];
  addOrder: (input: NewPMOrderInput) => PMOrder;
  approveOrder: (id: string) => void;
  requestRevision: (id: string, note: string) => void;
  advanceOrder: (id: string) => void;
}

const PMOrderContext = createContext<PMOrderContextValue | undefined>(undefined);

function createOrder(input: NewPMOrderInput, existingOrders: PMOrder[]): PMOrder {
  const now = new Date();
  // Format order id mengikuti data yang sudah ada: PM-YYMM-NNN.
  const prefix = `PM-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  // Urutan hanya dihitung dari order pada seri bulan yang sama agar penomoran tidak melompat
  // saat bucket bulan berubah (mis. PM-2406-018 -> PM-2609-001).
  const highestSequence = existingOrders.reduce((highest, order) => {
    if (!order.id.startsWith(`${prefix}-`)) return highest;
    return Math.max(highest, Number(order.id.slice(prefix.length + 1)) || 0);
  }, 0);
  const id = `${prefix}-${String(highestSequence + 1).padStart(3, "0")}`;

  return {
    id,
    contractorName: input.contractorName.trim(),
    contractorCode: input.contractorCode.trim().toUpperCase(),
    enteredAt: new Date().toISOString().slice(0, 10),
    targetDate: input.targetDate,
    projectStatus: "menunggu_acc",
    drawingStatus: "menunggu_acc",
    stage: 1,
    drawingVariant: "window-frame",
    items: input.items.map((item, index) => ({ ...item, id: `${id}-item-${index + 1}` })),
    rawImage: input.rawImage,
    rawImageName: input.rawImageName,
    hasProductionDrawing: false,
    revisionCount: 0,
    lastActivity: "Order baru dibuat dan menunggu gambar produksi",
  };
}

function nextStatus(status: ProjectStatus): ProjectStatus {
  if (status === "siap_produksi") return "produksi";
  if (status === "produksi") return "siap_kirim";
  if (status === "siap_kirim") return "selesai";
  return status;
}

export function PMOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PMOrder[]>(mockOrders);

  const addOrder = useCallback((input: NewPMOrderInput) => {
    const newOrder = createOrder(input, orders);
    setOrders((currentOrders) => [newOrder, ...currentOrders]);
    return newOrder;
  }, [orders]);

  const approveOrder = useCallback((id: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== id) return order;
        return {
          ...order,
          drawingStatus: "acc_gambar",
          projectStatus: "siap_produksi",
          stage: 2,
          revisionNote: undefined,
          lastActivity: "ACC gambar diberikan, order siap produksi",
        };
      }),
    );
  }, []);

  const requestRevision = useCallback((id: string, note: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== id) return order;
        return {
          ...order,
          drawingStatus: "revisi",
          projectStatus: "menunggu_acc",
          stage: 1,
          revisionNote: note.trim(),
          revisionCount: order.revisionCount + 1,
          lastActivity: "Permintaan revisi dikirim ke kontraktor",
        };
      }),
    );
  }, []);

  const advanceOrder = useCallback((id: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== id) return order;
        const status = nextStatus(order.projectStatus);
        if (status === order.projectStatus) return order;
        return {
          ...order,
          projectStatus: status,
          stage: status === "produksi" ? 2 : 3,
          lastActivity:
            status === "produksi"
              ? "Produksi dimulai"
              : status === "siap_kirim"
                ? "Produksi selesai, order siap kirim"
                : "Proyek ditandai selesai",
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({ orders, addOrder, approveOrder, requestRevision, advanceOrder }),
    [orders, addOrder, approveOrder, requestRevision, advanceOrder],
  );

  return <PMOrderContext.Provider value={value}>{children}</PMOrderContext.Provider>;
}

export function usePMOrders() {
  const context = useContext(PMOrderContext);
  if (!context) throw new Error("usePMOrders must be used within PMOrderProvider");
  return context;
}
