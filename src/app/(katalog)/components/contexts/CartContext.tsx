"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from "react";
import { Product } from "@/data/products";

// ── Toast ──────────────────────────────────────────────
interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastId = 0;

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-[13px] font-semibold pointer-events-auto transition-all ${
            t.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {t.type === "success" ? "check_circle" : "error"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export interface CartItem {
  product: Product;
  quantity: number;
  note: string;
  selectedVariants?: Record<string, string>;
}

export function itemKey(productId: number, variants?: Record<string, string>): string {
  if (!variants) return String(productId);
  const sorted = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return `${productId}#${sorted}`;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedVariants?: Record<string, string>) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateNote: (key: string, note: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  detailProduct: Product | null;
  setDetailProduct: (product: Product | null) => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Rehidrasi dari localStorage setelah mount (cegah hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        import("@/data/products").then(({ products }) => {
          const validated = parsed
            .map((item) => {
              const fresh = products.find((p: Product) => p.id === item.product.id);
              if (!fresh) return null;
              const clampedQty = Math.min(item.quantity, fresh.stock);
              if (clampedQty <= 0) return null;
              return { ...item, product: fresh, quantity: clampedQty, note: item.note ?? "" };
            })
            .filter(Boolean) as CartItem[];
          setItems(validated);
        });
      }
    } catch {
      // localStorage corrupt, mulai bersih
    }
    setHydrated(true);
  }, []);

  // Sync ke localStorage setelah hydrated
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items, hydrated]);

  // Toast queue — deduplicate + max 3
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToasts((prev) => {
      if (prev.some((t) => t.message === message && t.type === type)) return prev;
      const trimmed = prev.length >= 3 ? prev.slice(-2) : prev;
      const id = ++toastId;
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
      return [...trimmed, { id, message, type }];
    });
  }, []);

  const addToCart = useCallback((product: Product, quantity: number, selectedVariants?: Record<string, string>) => {
    const key = itemKey(product.id, selectedVariants);
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => itemKey(item.product.id, item.selectedVariants) === key
      );
      const currentQty = existingIdx !== -1 ? prev[existingIdx].quantity : 0;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        showToast(`Stok tidak cukup. Tersedia: ${product.stock} pcs`, "error");
        return prev;
      }

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      }
      return [...prev, { product, quantity, selectedVariants, note: "" }];
    });
    showToast(`${product.title} ditambahkan ke keranjang`);
  }, [showToast]);

      const removeFromCart = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => itemKey(item.product.id, item.selectedVariants) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => itemKey(item.product.id, item.selectedVariants) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (itemKey(item.product.id, item.selectedVariants) !== key) return item;
        const maxQty = item.product.stock;
        const clampedQty = Math.min(quantity, maxQty);
        if (quantity > maxQty) showToast(`Maksimal stok: ${maxQty} pcs`, "error");
        return { ...item, quantity: clampedQty };
      })
    );
  }, [showToast]);

  const updateNote = useCallback((key: string, note: string) => {
    setItems((prev) =>
      prev.map((item) =>
        itemKey(item.product.id, item.selectedVariants) === key ? { ...item, note } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

    const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
            value={{
              items,
              addToCart,
              removeFromCart,
              updateQuantity,
              updateNote,
              clearCart,
              totalItems,
              totalPrice,
              detailProduct,
              setDetailProduct,
              showToast,
            }}
    >
            {children}
            <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function getItemKey(item: CartItem): string {
  return itemKey(item.product.id, item.selectedVariants);
}
