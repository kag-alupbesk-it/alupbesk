"use client";

import { CartProvider } from "@/(katalog)/checkout/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
