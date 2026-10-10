"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { setReadOnlyMode } from "./accessMode";

interface AccessModeValue {
  readOnly: boolean;
}

const AccessModeContext = createContext<AccessModeValue>({ readOnly: false });

export function AccessModeProvider({
  readOnly = false,
  children,
}: {
  readOnly?: boolean;
  children: React.ReactNode;
}) {
  const value = useMemo<AccessModeValue>(() => ({ readOnly }), [readOnly]);

  // Flag module-level juga di-set saat render (bukan hanya effect) agar gerbang
  // request()/efek persist pertama kali sudah melihat mode pantau, dan
  // dibersihkan saat unmount agar tidak bocor ke rute lain.
  setReadOnlyMode(readOnly);
  useEffect(() => {
    setReadOnlyMode(readOnly);
    return () => setReadOnlyMode(false);
  }, [readOnly]);

  return (
    <AccessModeContext.Provider value={value}>{children}</AccessModeContext.Provider>
  );
}

export function useAccessMode(): AccessModeValue {
  return useContext(AccessModeContext);
}

/** True saat konten sedang dibuka Owner dalam mode pantau (read-only). */
export function useReadOnly(): boolean {
  return useContext(AccessModeContext).readOnly;
}

/** Sembunyikan blok tombol/aksi saat Owner membuka modul divisi (mode pantau). */
export function UnlessReadOnly({ children }: { children: React.ReactNode }) {
  return useReadOnly() ? null : <>{children}</>;
}
