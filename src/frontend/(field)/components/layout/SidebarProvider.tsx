"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const SidebarContext = createContext({
  open: false,
  desktopOpen: true,
  toggle: () => {},
  toggleDesktop: () => {},
  close: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  return (
    <SidebarContext.Provider
      value={{
        open,
        desktopOpen,
        toggle: () => setOpen((v) => !v),
        toggleDesktop: () => setDesktopOpen((v) => !v),
        close: () => setOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}