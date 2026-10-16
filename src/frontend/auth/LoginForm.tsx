"use client";

import { useEffect, useSyncExternalStore, useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";
import type { AuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { roleCanAccess } from "@/backend/auth/roles";
import { LanguageSwitcher } from "@/frontend/shared/i18n/LanguageSwitcher";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import ThemeToggle from "@/app/ThemeToggle";
import { PasswordInput } from "./PasswordInput";
import { useLoginAttemptLimit } from "./useLoginAttemptLimit";
import { activatePushSubscription, requestNotificationPermission } from "./usePushNotification";
import { request } from "@/services/api/request";
import { getAuthOtpErrorMessage } from "./getAuthOtpErrorMessage";

const roleHome: Record<string, string> = {
  pelanggan: "/catalog",
  marketing: "/admin/marketing",
  gudang: "/admin/gudang",
  keuangan: "/admin/keuangan",
  pm: "/admin/pm",
  proyek: "/admin/pm",
  field: "/admin/field",
  produksi: "/admin/produksi",
  manager: "/admin/manager",
  owner: "/admin/owner",
};

function normalizeRole(rawRole: string | undefined): string {
  if (!rawRole) return "pelanggan";
  const lower = rawRole.toLowerCase().trim();
  if (lower === "proyek" || lower === "project") return "pm";
  return lower;
}

// Simpan status OTP di sessionStorage agar pengguna tidak perlu mengulang alur
// login (isi email + kata sandi) setelah berpindah tab, mis. membuka email.
const OTP_STORAGE_KEY = "alupbesk-login-otp";

function readStoredOtp(): { email: string; otpSent: boolean } {
  if (typeof window === "undefined") return { email: "", otpSent: false };
  try {
    const raw = window.sessionStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return { email: "", otpSent: false };
    const parsed = JSON.parse(raw) as { email?: unknown; otpSent?: unknown };
    if (typeof parsed.email === "string" && parsed.otpSent === true) {
      return { email: parsed.email, otpSent: true };
    }
  } catch {
    // sessionStorage bisa tidak tersedia (mode privat); abaikan.
  }
  return { email: "", otpSent: false };
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

function useQueryFlag(key: string, expectedValue: string) {
  return useSyncExternalStore(
    subscribeToLocation,
    () => new URLSearchParams(window.location.search).get(key) === expectedValue,
    () => false,
  );
}

export function LoginForm() {
  const { language, t } = useLanguage();
  const attemptLimit = useLoginAttemptLimit();
  const [initialOtp] = useState(readStoredOtp);
  const [email, setEmail] = useState(initialOtp.email);
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(initialOtp.otpSent);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingAction, setPendingAction] = useState<"send" | "resend" | "verify" | null>(null);
  const pending = pendingAction !== null;
  const verifiedBanner = useQueryFlag("verified", "1");
  const emailUnverifiedBanner = useQueryFlag("error", "email_unverified");
  const attemptStatus = attemptLimit.getStatus(email);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-masuk: bila device ini sudah punya sesi login yang masih berlaku,
  // langsung arahkan ke beranda sesuai role tanpa meminta isi form lagi.
  useEffect(() => {
    if (initialOtp.otpSent) return;
    let active = true;
    void (async () => {
      try {
        const profile = await request<AuthenticatedProfile>("/auth/profile");
        if (!active) return;
        const roleName =
          profile.email.toLowerCase() === "alupbesk96@gmail.com"
            ? "owner"
            : normalizeRole(profile.role);
        const requestedPath = new URLSearchParams(window.location.search).get("next");
        const safeNext =
          requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "";
        const canUseNext = safeNext ? roleCanAccess(profile.role, safeNext) : false;
        window.location.replace(canUseNext ? safeNext : roleHome[roleName] || "/catalog");
      } catch {
        // Tidak ada sesi aktif (atau akun belum disetujui); tampilkan form login.
      }
    })();
    return () => {
      active = false;
    };
  }, [initialOtp.otpSent]);

  // Simpan / bersihkan langkah OTP di sessionStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (otpSent) {
      window.sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({ email, otpSent: true }));
    } else {
      window.sessionStorage.removeItem(OTP_STORAGE_KEY);
    }
  }, [otpSent, email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError(t("email"));
      return;
    }
    if (attemptStatus.blockedUntil > Date.now()) {
      setError(t("loginLocked"));
      return;
    }

    setPendingAction(otpSent ? "verify" : "send");
    let credentialsRejected = false;
    void requestNotificationPermission();

    try {
      const supabase = getSupabaseBrowserClient();
      
      if (otpSent) {
        const code = verificationCode.replace(/\s/g, "");
        if (!/^\d{4,6}$/.test(code)) {
          setError(language === "en" ? "Enter the 4–6 digit code sent to your email." : "Masukkan kode 4–6 angka yang dikirim ke email Anda.");
          setPendingAction(null);
          return;
        }
        
        // 1. Verifikasi OTP 6 digit
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code,
          type: "email",
        });
        
        if (verifyError) {
          credentialsRejected = true;
          const nextStatus = attemptLimit.recordFailure(email);
          setError(nextStatus.blockedUntil > Date.now() ? t("loginLocked") : (language === "en" ? "The code is invalid or expired." : "Kode salah atau sudah kedaluwarsa."));
          setPendingAction(null);
          return;
        }
        attemptLimit.clear(email);

        // Ambil profil melalui API (server-side). Ulangi sebentar untuk menunggu
        // cookie sesi buatan verifyOtp tersedia di server, dan pastikan profil
        // yang kembali memang milik email yang baru login (hindari sesi basi).
        const trimmedEmail = email.trim().toLowerCase();
        let profileRaw: AuthenticatedProfile | null = null;
        let lastProfileError: unknown = null;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          try {
            const candidate = await request<AuthenticatedProfile>("/auth/profile");
            if (candidate.email.toLowerCase() === trimmedEmail) {
              profileRaw = candidate;
              break;
            }
            lastProfileError = new Error(
              language === "en"
                ? "Login session did not match this account. Please try again."
                : "Sesi login tidak cocok dengan akun ini. Silakan coba lagi.",
            );
          } catch (profileError) {
            lastProfileError = profileError;
          }
          await new Promise((resolve) => setTimeout(resolve, 350));
        }

        if (!profileRaw) {
          throw lastProfileError ?? new Error("Sesi login tidak aktif.");
        }

        const roleName =
          trimmedEmail === "alupbesk96@gmail.com"
            ? "owner"
            : normalizeRole(profileRaw.role);

        void activatePushSubscription();
        const requestedPath = new URLSearchParams(window.location.search).get("next");
        const safeNext = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "";
        // Validasi `next` memakai role mentah (AppRole memakai "proyek", bukan "pm").
        const canUseNext = safeNext ? roleCanAccess(profileRaw.role, safeNext) : false;
        const destination = canUseNext ? safeNext : roleHome[roleName] || "/catalog";

        window.sessionStorage.removeItem(OTP_STORAGE_KEY);
        window.location.href = destination;
        return;
      }

      // Alur awal: Cek Password lalu Kirim OTP
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) {
        credentialsRejected = true;
        const nextStatus = attemptLimit.recordFailure(email);
        setError(nextStatus.blockedUntil > Date.now() ? t("loginLocked") : t("invalidLogin"));
        setPendingAction(null);
        return;
      }
      await supabase.auth.signOut();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });
      if (otpError) throw otpError;
      
      setVerificationCode("");
      setOtpSent(true);
      setResendCooldown(5);
    } catch (reason) {
      if (!credentialsRejected) {
        try {
          await getSupabaseBrowserClient().auth.signOut();
        } catch {
          // Keep original error visible
        }
        setError(getAuthOtpErrorMessage(reason, language, "sign-in"));
      }
      setPendingAction(null);
      setOtpSent(false);
      setVerificationCode("");
    } finally {
      if (!otpSent) {
        setPendingAction(null);
      }
    }
  }

  function resetToForm() {
    if (pending) return;
    setOtpSent(false);
    setVerificationCode("");
    setPassword("");
    setError("");
    setNotice("");
    setResendCooldown(0);
  }

  async function resendVerificationCode(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (resendCooldown > 0 || pending) return;
    setPendingAction("resend");
    setError("");
    setNotice("");
    try {
      const { error: resendError } = await getSupabaseBrowserClient().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });
      if (resendError) throw resendError;
      setResendCooldown(5);
      setNotice(language === "en" ? "A new sign-in code has been sent." : "Kode masuk baru sudah dikirim.");
    } catch (reason) {
      setError(getAuthOtpErrorMessage(reason, language, "sign-in"));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8 text-on-surface sm:py-10">
      <div className="mb-4 flex w-full max-w-md justify-end gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-outline/30 bg-surface-container-low p-6 shadow-2xl sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">ALUPBESK</p>
          <h1 className="mt-3 font-headline text-2xl font-extrabold">{t("loginTitle")}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">{t("loginDescription")}</p>
        </div>
        {verifiedBanner && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600">Email berhasil diverifikasi. Silakan login untuk melanjutkan.</p>}
        {emailUnverifiedBanner && <p role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Verifikasi email dengan kode yang dikirim saat daftar sebelum login.</p>}
        <label className="block text-xs font-semibold">
          {t("email")}
          <input className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-3 outline-none focus:border-secondary disabled:opacity-60" type="email" autoComplete="username" required disabled={otpSent || pending} value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block text-xs font-semibold">
          {t("password")}
          <PasswordInput className="mt-2" inputClassName="min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-3 outline-none focus:border-secondary disabled:opacity-60" autoComplete="current-password" required disabled={otpSent || pending} value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <label className="block text-xs font-semibold">
          {language === "en" ? "Email sign-in code" : "Kode masuk email"}
          <input
            className="mt-2 min-h-12 w-full rounded-xl border border-outline/40 bg-surface px-4 text-center font-mono text-xl font-bold tracking-[0.45em] text-on-surface outline-none focus:border-secondary disabled:cursor-not-allowed disabled:opacity-60"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{4,6}"
            minLength={4}
            maxLength={6}
            required={otpSent}
            disabled={!otpSent || pending}
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <span className="mt-1 block font-normal text-on-surface-variant">
            {otpSent
              ? (language === "en" ? `Enter the one-time sign-in code sent to ${email}.` : `Masukkan kode sekali pakai untuk masuk yang dikirim ke ${email}.`)
              : (language === "en" ? "Enter your password and request a sign-in code." : "Masukkan kata sandi, lalu minta kode untuk masuk.")}
          </span>
        </label>
        <p className="text-xs text-on-surface-variant">
          {t("remainingLoginAttempts")} <span className="font-bold text-on-surface">{attemptStatus.remaining}/3</span>
        </p>
        {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-500">{error}</p>}
        {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}
        
        {/* Tombol Kirim / Resend Kode */}
        <button
          type={otpSent ? "button" : "submit"}
          disabled={pending || (otpSent && resendCooldown > 0)}
          onClick={otpSent ? resendVerificationCode : undefined}
          className="min-h-11 w-full rounded-xl border border-secondary px-4 py-3 text-sm font-bold text-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "send"
            ? (language === "en" ? "Checking password and sending sign-in code..." : "Memeriksa kata sandi dan mengirim kode masuk...")
            : pendingAction === "resend"
              ? (language === "en" ? "Resending sign-in code..." : "Mengirim ulang kode masuk...")
            : otpSent
              ? (resendCooldown > 0
                ? (language === "en" ? `Resend code in ${resendCooldown}s` : `Kirim ulang kode dalam ${resendCooldown} dtk`)
                : (language === "en" ? "Resend sign-in code" : "Kirim ulang kode masuk"))
              : (language === "en" ? "Send sign-in code by email" : "Kirim kode masuk lewat email")}
        </button>

        {/* Tombol Verifikasi & Masuk */}
        <button type="submit" disabled={pending || !otpSent} className="min-h-11 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50">
          {pendingAction === "verify"
            ? (language === "en" ? "Verifying code and signing in..." : "Memverifikasi kode dan masuk...")
            : (language === "en" ? "Verify code and sign in" : "Verifikasi kode dan masuk")}
        </button>

        {otpSent && (
          <button
            type="button"
            onClick={resetToForm}
            disabled={pending}
            className="w-full text-center text-xs font-semibold text-on-surface-variant underline disabled:opacity-50"
          >
            {language === "en" ? "Use a different email" : "Gunakan email lain"}
          </button>
        )}

        <p className="text-center text-xs text-on-surface-variant">
          {t("noAccount")} <Link className="font-bold text-secondary" href="/admin/register">{t("register")}</Link>
        </p>
      </form>
    </main>
  );
}