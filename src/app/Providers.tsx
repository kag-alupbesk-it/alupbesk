"use client";

import { CartProvider } from "@/frontend/(pelanggan)/hooks/useCart/useCart";
import { ThemeProvider } from "@/app/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
