"use client";

import { ProductDetailProvider } from "@/frontend/(pelanggan)/hooks/useProductDetail";
import { ThemeProvider } from "@/app/ThemeContext";
import { LanguageProvider } from "@/frontend/shared/i18n/LanguageProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ProductDetailProvider>{children}</ProductDetailProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
