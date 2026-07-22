"use client";

import { CartProvider } from "./components/contexts/CartContext";

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
