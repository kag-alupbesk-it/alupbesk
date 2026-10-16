"use client";

import { ProductDetailProvider } from "@/frontend/(pelanggan)/hooks/useProductDetail";
import { ThemeProvider } from "@/app/ThemeContext";
import { LanguageProvider } from "@/frontend/shared/i18n/LanguageProvider";
import SessionKeepAlive from "@/app/SessionKeepAlive";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ProductDetailProvider>
          <SessionKeepAlive />
          {children}
        </ProductDetailProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
