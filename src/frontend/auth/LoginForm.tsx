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
import { getAuthOtpErrorMessage } from "@/shared/auth/getAuthOtpErrorMessage";

const roleHome: Record<string, string> = {
  pelanggan: "/catalog",
  marketing: "/admin/marketing",
  gudang: "/admin/gudang",
  keuangan: "/admin/keuangan",
  pm: "/admin/pm",
  proyek: "/admin/pm",
  field: "/admin/field",
  produksi: "/admin/produksi",
  drafter: "/drafter",
  manager: "/admin/manager",
  owner: "/admin/owner",
};

function normalizeRole(rawRole: string | undefined): string {
  if (!rawRole) return "pelanggan";
  const lower = rawRole.toLowerCase().trim();
  if (lower === "proyek" || lower === "project") return "pm";
  return lower;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

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
    // sessionStorage bisa tidak tersedia
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
  const [lockRemaining, setLockRemaining] = useState(0);
  const clearLoginAttempts = attemptLimit.clear;

  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("reset");
      }
    });
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setView("reset");
    }
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const blockedUntil = attemptStatus.blockedUntil;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
      setLockRemaining(remaining);
      if (remaining <= 0 && blockedUntil > 0) clearLoginAttempts(email);
    };
    const initial = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [attemptStatus.blockedUntil, email, clearLoginAttempts]);

  useEffect(() => {
    if (initialOtp.otpSent || view !== "login") return;
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
        // Tidak ada sesi aktif
      }
    })();
    return () => {
      active = false;
    };
  }, [initialOtp.otpSent, view]);

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
        const canUseNext = safeNext ? roleCanAccess(profileRaw.role, safeNext) : false;
        const destination = canUseNext ? safeNext : roleHome[roleName] || "/catalog";

        window.sessionStorage.removeItem(OTP_STORAGE_KEY);
        window.location.href = destination;
        return;
      }

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
          // ignore
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

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError(t("email"));
      return;
    }
    setPendingAction("send");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      });
      if (resetError) throw resetError;
      setNotice(t("resetLinkSent"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal mengirim tautan pemulihan.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!newPassword || newPassword.length < 8) {
      setError(t("passwordLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }
    setPendingAction("verify");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setNotice(t("passwordUpdated"));
      setTimeout(() => {
        setView("login");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2500);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal memperbarui kata sandi.");
    } finally {
      setPendingAction(null);
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

      {view === "forgot" ? (
        <form onSubmit={handleForgotPassword} className="w-full max-w-md space-y-5 rounded-2xl border border-outline/30 bg-surface-container-low p-6 shadow-2xl sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">ALUPBESK</p>
            <h1 className="mt-3 font-headline text-2xl font-extrabold">{t("forgotPasswordTitle")}</h1>
            <p className="mt-2 text-sm text-on-surface-variant">{t("forgotPasswordDescription")}</p>
          </div>
          <label className="block text-xs font-semibold">
            {t("email")}
            <input className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-3 outline-none focus:border-secondary disabled:opacity-60" type="email" autoComplete="username" required disabled={pending} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-500">{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}
          <button type="submit" disabled={pending} className="min-h-11 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50">
            {pendingAction === "send" ? (language === "en" ? "Sending link..." : "Mengirim tautan...") : t("sendResetLink")}
          </button>
          <button type="button" onClick={() => { setView("login"); setError(""); setNotice(""); }} className="w-full text-center text-xs font-semibold text-on-surface-variant underline">
            {t("backToLogin")}
          </button>
        </form>
      ) : view === "reset" ? (
        <form onSubmit={handleUpdatePassword} className="w-full max-w-md space-y-5 rounded-2xl border border-outline/30 bg-surface-container-low p-6 shadow-2xl sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">ALUPBESK</p>
            <h1 className="mt-3 font-headline text-2xl font-extrabold">{t("updatePassword")}</h1>
            <p className="mt-2 text-sm text-on-surface-variant">{language === "en" ? "Enter your new password below." : "Masukkan kata sandi baru Anda di bawah."}</p>
          </div>
          <label className={`block text-xs font-semibold ${newPassword.length > 0 && newPassword.length < 8 ? "text-red-500" : ""}`}>
            {t("newPassword")}
            <PasswordInput className="mt-2" inputClassName="min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-3 outline-none focus:border-secondary disabled:opacity-60" autoComplete="new-password" required disabled={pending} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </label>
          <label className="block text-xs font-semibold">
            {t("confirmNewPassword")}
            <PasswordInput className="mt-2" inputClassName="min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-3 outline-none focus:border-secondary disabled:opacity-60" autoComplete="new-password" required disabled={pending} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
          {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-500">{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}
          <button type="submit" disabled={pending || newPassword.length < 8} className="min-h-11 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50">
            {t("updatePassword")}
          </button>
          <button type="button" onClick={() => { setView("login"); setError(""); setNotice(""); }} className="w-full text-center text-xs font-semibold text-on-surface-variant underline">
            {t("backToLogin")}
          </button>
        </form>
      ) : (
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
            <div className="flex justify-between items-center mb-1">
              <span>{t("password")}</span>
              <button
                type="button"
                onClick={() => { setView("forgot"); setError(""); setNotice(""); }}
                className="text-xs font-semibold text-secondary hover:underline"
              >
                {t("forgotPassword")}
              </button>
            </div>
            <PasswordInput className="" inputClassName="min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-3 outline-none focus:border-secondary disabled:opacity-60" autoComplete="current-password" required disabled={otpSent || pending} value={password} onChange={(event) => setPassword(event.target.value)} />
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
          {lockRemaining > 0 && (
            <p role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              {language === "en"
                ? `Too many failed attempts. Try again in ${formatCountdown(lockRemaining)}.`
                : `Terlalu banyak percobaan gagal. Coba lagi dalam ${formatCountdown(lockRemaining)}.`}
            </p>
          )}
          {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-500">{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}
          
          <button
            type={otpSent ? "button" : "submit"}
            disabled={pending || lockRemaining > 0 || (otpSent && resendCooldown > 0)}
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

          <button type="submit" disabled={pending || !otpSent || lockRemaining > 0} className="min-h-11 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50">
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
      )}
    </main>
  );
}
