"use client";

import { CartProvider } from "@/app/(katalog)/components/contexts/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
