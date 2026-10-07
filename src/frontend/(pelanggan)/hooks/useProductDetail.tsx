"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "@/services/catalog";

interface ProductDetailContextValue {
  detailProduct: Product | null;
  setDetailProduct: (product: Product | null) => void;
}

const ProductDetailContext = createContext<ProductDetailContextValue | null>(null);

export function ProductDetailProvider({ children }: { children: ReactNode }) {
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  return (
    <ProductDetailContext.Provider value={{ detailProduct, setDetailProduct }}>
      {children}
    </ProductDetailContext.Provider>
  );
}

export function useProductDetail() {
  const context = useContext(ProductDetailContext);
  if (!context) throw new Error("useProductDetail must be used within ProductDetailProvider");
  return context;
}
