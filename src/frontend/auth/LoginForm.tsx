"use client";

import { useEffect, useSyncExternalStore, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";
import { request } from "@/services/api/request";
import type { AuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { roleCanAccess } from "@/backend/auth/roles";
import { LanguageSwitcher } from "@/frontend/shared/i18n/LanguageSwitcher";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import ThemeToggle from "@/app/ThemeToggle";
import { PasswordInput } from "./PasswordInput";
import { useLoginAttemptLimit } from "./useLoginAttemptLimit";
import { activatePushSubscription, requestNotificationPermission } from "./usePushNotification";
import { getAuthOtpErrorMessage } from "./getAuthOtpErrorMessage";

const roleHome: Record<AuthenticatedProfile["role"], string> = {
  pelanggan: "/catalog",
  marketing: "/admin/marketing",
  gudang: "/admin/gudang",
  keuangan: "/admin/keuangan",
  proyek: "/admin/pm",
  field: "/admin/field",
  produksi: "/admin/produksi",
  manager: "/admin/manager",
  owner: "/admin/owner",
};

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
  const router = useRouter();
  const { language, t } = useLanguage();
  const attemptLimit = useLoginAttemptLimit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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
    // Prompt izin notifikasi dalam user gesture (tombol Submit diklik).
    void requestNotificationPermission();
    try {
      const supabase = getSupabaseBrowserClient();
      if (otpSent) {
        const code = verificationCode.replace(/\s/g, "");
        if (!/^\d{4,6}$/.test(code)) {
          setError(language === "en" ? "Enter the 4–6 digit code sent to your email." : "Masukkan kode 4–6 angka yang dikirim ke email Anda.");
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
          return;
        }
        attemptLimit.clear(email);
        const profile = await request<AuthenticatedProfile>("/auth/profile");
        void activatePushSubscription();
        const requestedPath = new URLSearchParams(window.location.search).get("next");
        const safeNext = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "";
        const destination = safeNext && roleCanAccess(profile.role, safeNext) ? safeNext : roleHome[profile.role];
        router.replace(destination);
        router.refresh();
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
          // Keep the original auth/profile error visible.
        }
        setError(getAuthOtpErrorMessage(reason, language, "sign-in"));
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function resendVerificationCode() {
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
        <button
          type={otpSent ? "button" : "submit"}
          disabled={pending || (otpSent && resendCooldown > 0)}
          onClick={otpSent ? () => void resendVerificationCode() : undefined}
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
        <button type="submit" disabled={pending || !otpSent} className="min-h-11 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50">
          {pendingAction === "verify"
            ? (language === "en" ? "Verifying code and signing in..." : "Memverifikasi kode dan masuk...")
            : (language === "en" ? "Verify code and sign in" : "Verifikasi kode dan masuk")}
        </button>
        <p className="text-center text-xs text-on-surface-variant">
          {t("noAccount")} <Link className="font-bold text-secondary" href="/admin/register">{t("register")}</Link>
        </p>
      </form>
    </main>
  );
}
