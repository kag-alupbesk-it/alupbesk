"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    const { error } = await getSupabaseBrowserClient().auth.signOut();
    if (error) {
      setPending(false);
      return;
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={pending}
      aria-label="Keluar dari akun"
      title="Keluar"
      className="inline-flex items-center justify-center rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-secondary disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[19px]">{pending ? "progress_activity" : "logout"}</span>
    </button>
  );
}
