"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";
import { request } from "@/services/api/request";
import type { AuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { roleCanAccess } from "@/backend/auth/roles";
import { LanguageSwitcher } from "@/frontend/shared/i18n/LanguageSwitcher";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import ThemeToggle from "@/app/ThemeToggle";
import { CaptchaChallenge } from "./CaptchaChallenge";
import { PasswordInput } from "./PasswordInput";
import { useLoginAttemptLimit } from "./useLoginAttemptLimit";
import { activatePushSubscription, requestNotificationPermission } from "./usePushNotification";

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

const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY);

export function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const attemptLimit = useLoginAttemptLimit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaVersion, setCaptchaVersion] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const attemptStatus = attemptLimit.getStatus(email);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t("email"));
      return;
    }
    if (attemptStatus.blockedUntil > Date.now()) {
      setError(t("loginLocked"));
      return;
    }
    if (captchaEnabled && !captchaToken) {
      setError(t("captchaRequired"));
      return;
    }

    setPending(true);
    let credentialsRejected = false;
    // Prompt izin notifikasi dalam user gesture (tombol Submit diklik).
    void requestNotificationPermission();
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });
      if (signInError) {
        credentialsRejected = true;
        const nextStatus = attemptLimit.recordFailure(email);
        setError(nextStatus.blockedUntil > Date.now() ? t("loginLocked") : t("invalidLogin"));
        return;
      }
      attemptLimit.clear(email);

      const profile = await request<AuthenticatedProfile>("/auth/profile");
      void activatePushSubscription();
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const safeNext = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "";
      const destination = safeNext && roleCanAccess(profile.role, safeNext)
        ? safeNext
        : roleHome[profile.role];
      router.replace(destination);
      router.refresh();
    } catch (reason) {
      if (!credentialsRejected) {
        try {
          await getSupabaseBrowserClient().auth.signOut();
        } catch {
          // Keep the original auth/profile error visible.
        }
        setError(reason instanceof Error ? reason.message : "Sign-in failed.");
      }
    } finally {
      setPending(false);
      if (captchaEnabled) {
        setCaptchaToken("");
        setCaptchaVersion((version) => version + 1);
      }
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
        <label className="block text-xs font-semibold">
          {t("email")}
          <input className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-3 outline-none focus:border-secondary" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block text-xs font-semibold">
          {t("password")}
          <PasswordInput className="mt-2" inputClassName="min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-3 outline-none focus:border-secondary" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <p className="text-xs text-on-surface-variant">
          {t("remainingLoginAttempts")} <span className="font-bold text-on-surface">{attemptStatus.remaining}/3</span>
        </p>
        <CaptchaChallenge key={captchaVersion} onVerify={setCaptchaToken} onReset={() => setCaptchaToken("")} />
        {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={pending} className="min-h-11 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary disabled:opacity-60">
          {pending ? t("checkingAccount") : t("login")}
        </button>
        <p className="text-center text-xs text-on-surface-variant">
          {t("noAccount")} <Link className="font-bold text-secondary" href="/admin/register">{t("register")}</Link>
        </p>
      </form>
    </main>
  );
}
