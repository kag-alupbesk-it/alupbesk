import { AccessModeProvider } from "@/frontend/shared/access/AccessModeProvider";

/**
 * Semua halaman drill-down divisi milik Owner berada di bawah route group ini
 * sehingga URL-nya tetap `/owner/<divisi>` tetapi seluruh isi divisi dibuka
 * dalam mode pantau (read-only).
 */
export default function OwnerDivisiLayout({ children }: { children: React.ReactNode }) {
  return <AccessModeProvider readOnly>{children}</AccessModeProvider>;
}
