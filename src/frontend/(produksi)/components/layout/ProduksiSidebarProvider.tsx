"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ProduksiSidebarContextValue {
  open: boolean;
  desktopOpen: boolean;
  setOpen: (value: boolean) => void;
  close: () => void;
  toggle: () => void;
  toggleDesktop: () => void;
}

const ProduksiSidebarContext = createContext<ProduksiSidebarContextValue | undefined>(undefined);

export function ProduksiSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const value = useMemo(
    () => ({
      open,
      desktopOpen,
      setOpen,
      close: () => setOpen(false),
      toggle: () => setOpen((current) => !current),
      toggleDesktop: () => setDesktopOpen((current) => !current),
    }),
    [open, desktopOpen],
  );

  return <ProduksiSidebarContext.Provider value={value}>{children}</ProduksiSidebarContext.Provider>;
}

export function useProduksiSidebar() {
  const context = useContext(ProduksiSidebarContext);
  if (!context) throw new Error("useProduksiSidebar must be used within ProduksiSidebarProvider");
  return context;
}
