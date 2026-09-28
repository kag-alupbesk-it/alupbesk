"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface PMSidebarContextValue {
  open: boolean;
  desktopOpen: boolean;
  setOpen: (value: boolean) => void;
  close: () => void;
  toggle: () => void;
  toggleDesktop: () => void;
}

const PMSidebarContext = createContext<PMSidebarContextValue | undefined>(undefined);

export function PMSidebarProvider({ children }: { children: ReactNode }) {
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

  return <PMSidebarContext.Provider value={value}>{children}</PMSidebarContext.Provider>;
}

export function usePMSidebar() {
  const context = useContext(PMSidebarContext);
  if (!context) throw new Error("usePMSidebar must be used within PMSidebarProvider");
  return context;
}
