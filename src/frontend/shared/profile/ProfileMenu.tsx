"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/services/api/request";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";
import type { AuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";

export default function ProfileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<AuthenticatedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Settings form state
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const p = await request<AuthenticatedProfile>("/auth/profile");
      setProfile(p);
      if (p) {
        setNameInput(p.name);
        setEmailInput(p.email);
      }
    } catch {
      // ignore
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

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsError("");
    setSettingsSuccess("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          email: emailInput,
          password: passwordInput || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setSettingsSuccess("Profil berhasil diperbarui.");
        setPasswordInput("");
        setTimeout(() => {
          setShowSettingsModal(false);
          setSettingsSuccess("");
        }, 1500);
      } else {
        setSettingsError(json.error?.message ?? "Gagal menyimpan perubahan.");
      }
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function confirmLogout() {
    setPending(true);
    const { error } = await getSupabaseBrowserClient().auth.signOut();
    if (error) {
      setPending(false);
      setShowLogoutModal(false);
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
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-outline/40 bg-surface-container shadow-2xl z-[60] p-4 text-left">
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
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowSettingsModal(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Setting Profile
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowLogoutModal(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-error transition-colors hover:bg-error/10"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline/25 rounded-2xl w-full max-w-md p-6 shadow-2xl text-on-surface">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Setting Profile</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-on-surface/50 hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {settingsError && <p className="text-xs text-red-400 mb-3">{settingsError}</p>}
            {settingsSuccess && <p className="text-xs text-emerald-400 mb-3">{settingsSuccess}</p>}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface/70 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl border border-outline/30 bg-primary-container px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface/70 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-outline/30 bg-primary-container px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface/70 mb-1">
                  Kata Sandi Baru (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 karakter jika ingin diubah"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-outline/30 bg-primary-container px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline/30 text-xs font-bold text-on-surface hover:bg-surface-variant"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 rounded-xl bg-secondary text-primary text-xs font-bold hover:brightness-110 disabled:opacity-50"
                >
                  {savingSettings ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline/25 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center text-on-surface">
            <span className="material-symbols-outlined text-[48px] text-amber-400 mb-3">
              warning
            </span>
            <h3 className="text-lg font-bold mb-2">Konfirmasi Keluar</h3>
            <p className="text-sm text-on-surface/60 mb-6">
              Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses halaman admin.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2.5 rounded-xl border border-outline/30 text-xs font-bold text-on-surface hover:bg-surface-variant"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => void confirmLogout()}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {pending && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                {pending ? "Keluar..." : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
