"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

function itemKey(productId: number, variants?: Record<string, string>): string {
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
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  detailProduct: Product | null;
  setDetailProduct: (product: Product | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const addToCart = useCallback((product: Product, quantity: number, selectedVariants?: Record<string, string>) => {
    const key = itemKey(product.id, selectedVariants);
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => itemKey(item.product.id, item.selectedVariants) === key
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity, selectedVariants }];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => itemKey(item.product.id, item.selectedVariants) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => itemKey(item.product.id, item.selectedVariants) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        itemKey(item.product.id, item.selectedVariants) === key
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setCartOpen,
        isCheckoutOpen,
        setCheckoutOpen,
        detailProduct,
        setDetailProduct,
      }}
    >
      {children}
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
