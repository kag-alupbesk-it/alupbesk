"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";

export function EmailConfirmation({ tokenHash, type }: { tokenHash: string; type: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState("Memverifikasi email...");

  useEffect(() => {
    let active = true;
    async function confirm() {
      if (started.current) return;
      started.current = true;
      if (!tokenHash || type !== "email") {
        if (active) setMessage("Tautan verifikasi tidak valid atau sudah kedaluwarsa.");
        return;
      }
      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
        if (error) throw error;
        const response = await fetch("/api/auth/email-verified", { method: "POST" });
        if (!response.ok) throw new Error("Email belum dapat diverifikasi. Silakan coba tautan dari email lagi.");
        await supabase.auth.signOut();
        router.replace("/admin/login?verified=1");
      } catch (reason) {
        if (active) setMessage(reason instanceof Error ? reason.message : "Verifikasi email gagal.");
      }
    }
    void confirm();
    return () => { active = false; };
  }, [router, tokenHash, type]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 text-on-surface">
      <section className="w-full max-w-md space-y-4 rounded-2xl border border-outline/30 bg-surface-container-low p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">ALUPBESK</p>
        <h1 className="text-2xl font-extrabold">Konfirmasi email</h1>
        <p role="status" className="text-sm text-on-surface-variant">{message}</p>
        {message !== "Memverifikasi email..." && <Link className="inline-flex min-h-11 items-center text-sm font-bold text-secondary" href="/admin/login">Kembali ke login</Link>}
      </section>
    </main>
  );
}
