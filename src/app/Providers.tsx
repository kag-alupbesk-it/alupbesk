"use client";

import { ThemeProvider } from "@/app/ThemeContext";
import { LanguageProvider } from "@/frontend/shared/i18n/LanguageProvider";
import SessionKeepAlive from "@/app/SessionKeepAlive";
import GlobalBusyProvider from "@/frontend/shared/busy/GlobalBusyProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <GlobalBusyProvider>
          <SessionKeepAlive />
          {children}
        </GlobalBusyProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
