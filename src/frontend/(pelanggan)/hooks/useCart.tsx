"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { products, type Product } from "@/services/catalog";
import type { CartItem } from "@/frontend/(pelanggan)/types";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastId = 0;

function ToastContainer({ toasts }: { toasts: Toast[] }) {
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

export function itemKey(productId: number, _variants?: Record<string, string>): string {
  return String(productId);
}

function mergeVariants(current?: Record<string, string>, incoming?: Record<string, string>): Record<string, string> | undefined {
  if (!current && !incoming) return undefined;
  const merged: Record<string, string> = { ...current };
  Object.entries(incoming ?? {}).forEach(([name, value]) => {
    const choices = new Set((merged[name] ?? "").split(", ").filter(Boolean));
    choices.add(value);
    merged[name] = [...choices].join(", ");
  });
  return merged;
}

function normalizeCartItems(savedItems: CartItem[]): CartItem[] {
  const grouped = new Map<number, CartItem>();
  savedItems.forEach((item) => {
    const product = products.find((catalogProduct) => catalogProduct.id === item.product.id);
    if (!product || item.quantity <= 0) return;
    const existing = grouped.get(product.id);
    if (!existing) {
      grouped.set(product.id, {
        product,
        quantity: Math.min(item.quantity, product.stock),
        note: item.note ?? "",
        selectedVariants: item.selectedVariants,
      });
      return;
    }
    grouped.set(product.id, {
      ...existing,
      quantity: Math.min(existing.quantity + item.quantity, product.stock),
      note: [existing.note, item.note].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).join(" | "),
      selectedVariants: mergeVariants(existing.selectedVariants, item.selectedVariants),
    });
  });
  return [...grouped.values()];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedVariants?: Record<string, string>) => void;
  removeFromCart: (key: string) => void;
  restoreItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateNote: (key: string, note: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  detailProduct: Product | null;
  setDetailProduct: (product: Product | null) => void;
  showToast: (message: string, type?: "success" | "error") => void;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  isCheckoutOpen: boolean;
  setCheckoutOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        const validated = normalizeCartItems(parsed);
        setItems(validated);
      }
    } catch {
      // localStorage corrupt
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items, hydrated]);

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
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty, selectedVariants: mergeVariants(updated[existingIdx].selectedVariants, selectedVariants) };
        return updated;
      }
      return [...prev, { product, quantity, selectedVariants, note: "" }];
    });
    showToast(`${product.title} ditambahkan ke keranjang`);
  }, [showToast]);

  const removeFromCart = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => itemKey(item.product.id, item.selectedVariants) !== key));
  }, []);

  const restoreItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => itemKey(i.product.id, i.selectedVariants) === itemKey(item.product.id, item.selectedVariants));
      if (exists) return prev;
      return [...prev, item];
    });
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

  const totalItems = useMemo(() => items.length, [items]);
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
        restoreItem,
        updateQuantity,
        updateNote,
        clearCart,
        totalItems,
        totalPrice,
        detailProduct,
        setDetailProduct,
        showToast,
        isCartOpen,
        setCartOpen,
        isCheckoutOpen,
        setCheckoutOpen,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} />
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
