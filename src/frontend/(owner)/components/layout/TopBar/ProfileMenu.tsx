"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { request } from "@/services/api/request";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";
import type { AuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { usePopover } from "./usePopover";

const panelClass =
  "absolute right-0 top-full mt-2 w-64 rounded-xl border border-outline/40 bg-surface-container shadow-2xl z-[60] p-4 text-left";

export default function ProfileMenu() {
  const router = useRouter();
  const { open, setOpen, ref } = usePopover();
  const [profile, setProfile] = useState<AuthenticatedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  async function loadProfile() {
    setLoading(true);
    try {
      setProfile(await request<AuthenticatedProfile>("/auth/profile"));
    } catch {
      // Biarkan null: menu menampilkan pesan gagal memuat.
    } finally {
      setLoading(false);
    }
  }

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && !profile && !loading) void loadProfile();
  }

  const initial = profile?.name?.trim().charAt(0).toUpperCase() ?? "";

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
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Menu profil"
        aria-expanded={open}
        title="Profil"
        className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden border-2 border-outline hover:border-secondary transition-colors cursor-pointer relative z-[60]"
      >
        <div className="w-full h-full bg-surface-variant flex items-center justify-center">
          {initial ? (
            <span className="text-secondary text-xs lg:text-sm font-bold" suppressHydrationWarning>
              {initial}
            </span>
          ) : (
            <span className="material-symbols-outlined text-secondary text-xs lg:text-sm">
              person
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className={panelClass}>
          <div className="min-w-0">
            {loading && !profile ? (
              <p className="text-xs text-on-surface-variant">Memuat profil...</p>
            ) : profile ? (
              <>
                <p className="truncate text-sm font-bold text-on-surface">{profile.name}</p>
                <p className="truncate text-xs text-on-surface-variant">{profile.email}</p>
                <span className="mt-2 inline-flex rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary">
                  {profile.role}
                </span>
              </>
            ) : (
              <p className="text-xs text-on-surface-variant">Profil tidak dapat dimuat.</p>
            )}
          </div>

          <div className="mt-4 space-y-1 border-t border-outline/25 pt-3">
            <Link
              href="/owner/users"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Kelola User
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={pending}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {pending ? "progress_activity" : "logout"}
              </span>
              {pending ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
