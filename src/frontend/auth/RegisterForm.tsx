"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";
import { LanguageSwitcher } from "@/frontend/shared/i18n/LanguageSwitcher";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import ThemeToggle from "@/app/ThemeToggle";
import { PasswordInput } from "./PasswordInput";
import { getAuthOtpErrorMessage } from "./getAuthOtpErrorMessage";

const requestedRoles = [
  { value: "keuangan", label: "Finance", labelId: "Keuangan" },
  { value: "proyek", label: "Projects", labelId: "Proyek" },
  { value: "field", label: "Field Operations", labelId: "Field" },
  { value: "produksi", label: "Production", labelId: "Produksi" },
  { value: "gudang", label: "Warehouse", labelId: "Gudang" },
  { value: "marketing", label: "Marketing", labelId: "Marketing" },
] as const;

export function RegisterForm() {
  const { language, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof requestedRoles)[number]["value"]>("gudang");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingAction, setPendingAction] = useState<"send" | "resend" | "verify" | null>(null);
  const pending = pendingAction !== null;
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  async function resendVerificationCode() {
    if (resendCooldown > 0 || pending) return;
    setPendingAction("resend");
    setError("");
    setNotice("");
    try {
      const { error: resendError } = await getSupabaseBrowserClient().auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });
      if (resendError) throw resendError;
      setResendCooldown(5);
      setNotice(language === "en" ? "A new verification code has been sent." : "Kode verifikasi baru sudah dikirim.");
    } catch (reason) {
      setError(getAuthOtpErrorMessage(reason, language, "verification"));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction(otpSent ? "verify" : "send");
    setError("");
    setNotice("");

    if (otpSent) {
      const code = verificationCode.replace(/\s/g, "");
      if (!/^\d{4,6}$/.test(code)) {
        setError(language === "en" ? "Enter the 4–6 digit code sent to your email." : "Masukkan kode 4–6 angka yang dikirim ke email Anda.");
        setPendingAction(null);
        return;
      }
      try {
        const supabase = getSupabaseBrowserClient();
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code,
          type: "signup",
        });
        if (verifyError) throw verifyError;
        const response = await fetch("/api/auth/email-verified", { method: "POST" });
        if (!response.ok) throw new Error(language === "en" ? "Email verification could not be completed. Try requesting a new code." : "Verifikasi email gagal. Minta kode baru lalu coba lagi.");
        await supabase.auth.signOut();
        setSuccess(true);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Kode verifikasi tidak valid atau sudah kedaluwarsa.");
      } finally {
        setPendingAction(null);
      }
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const dept = requestedRoles.find((item) => item.value === role)?.labelId ?? role;

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: trimmedName,
            role,
            dept,
            requested_role: role,
            department: dept,
          },
        },
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Your account could not be created. Please try again.");

      if (data.session) {
        await supabase.auth.signOut();
        throw new Error(language === "en"
          ? "Email verification is disabled in Supabase. Enable email confirmations and use the {{ .Token }} email template before registering."
          : "Verifikasi email belum aktif di Supabase. Aktifkan konfirmasi email dan template kode {{ .Token }} sebelum mendaftar.");
      }

      // Simpan role & dept pilihan pemohon ke public.users agar tidak jatuh ke
      // nilai default (pelanggan) yang ditulis trigger/auth.
      const profileResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          name: trimmedName,
          email: normalizedEmail,
          role,
          dept,
        }),
      });
      if (!profileResponse.ok) {
        const payload = (await profileResponse.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(
          payload?.error?.message ??
            "Your registration could not be saved. Please try again.",
        );
      }

      setOtpSent(true);
      setResendCooldown(5);
      setVerificationCode("");
    } catch (reason) {
      setError(getAuthOtpErrorMessage(reason, language, "verification"));
    } finally {
      setPendingAction(null);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8 text-on-surface sm:py-10">
        <div className="mb-4 flex w-full max-w-md justify-end gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <section className="w-full max-w-md space-y-4 rounded-2xl border border-outline/30 bg-surface-container-low p-5 shadow-2xl sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">ALUPBESK</p>
          <h1 className="font-headline text-2xl font-extrabold">{t("requestSent")}</h1>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {language === "en"
              ? `Your ${requestedRoles.find((item) => item.value === role)?.label ?? role} role request is email-verified and waiting for Owner approval.`
              : `Email terverifikasi. Permintaan role ${requestedRoles.find((item) => item.value === role)?.labelId ?? role} menunggu persetujuan Owner.`}
          </p>
          <Link className="inline-flex min-h-11 items-center text-sm font-bold text-secondary" href="/admin/login">
            {t("backToLogin")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8 text-on-surface sm:py-10">
      <div className="mb-4 flex w-full max-w-md justify-end gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-outline/30 bg-surface-container-low p-5 shadow-2xl sm:space-y-5 sm:p-8"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">ALUPBESK</p>
          <h1 className="mt-3 font-headline text-2xl font-extrabold">{t("registerTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{t("registerDescription")}</p>
        </div>

        <label className="block text-xs font-semibold">
          {t("fullName")}
          <input className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-2.5 outline-none focus:border-secondary disabled:opacity-60" autoComplete="name" maxLength={160} required disabled={otpSent || pending} value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className="block text-xs font-semibold">
          {t("requestedRole")}
          <select className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-2.5 outline-none focus:border-secondary disabled:opacity-60" disabled={otpSent || pending} value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
            {requestedRoles.map((item) => (
              <option key={item.value} value={item.value}>{language === "en" ? item.label : item.labelId}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold">
          {t("email")}
          <input className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-2.5 outline-none focus:border-secondary disabled:opacity-60" type="email" autoComplete="email" maxLength={255} required disabled={otpSent || pending} value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className="block text-xs font-semibold">
          {t("passwordLength")}
          <PasswordInput className="mt-2" inputClassName="min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-2.5 outline-none focus:border-secondary disabled:opacity-60" autoComplete="new-password" minLength={8} required disabled={otpSent || pending} value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>

        <label className="block text-xs font-semibold">
          {language === "en" ? "Email verification code" : "Kode verifikasi email"}
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
            aria-describedby="register-otp-help"
          />
          <span id="register-otp-help" className="mt-1 block font-normal text-on-surface-variant">
            {otpSent
              ? (language === "en" ? `Enter the one-time code sent to ${email}.` : `Masukkan kode sekali pakai yang dikirim ke ${email}.`)
              : (language === "en" ? "Create your account first; the code will be emailed to you." : "Kirim kode untuk membuat akun; kode akan dikirim ke email Anda.")}
          </span>
        </label>
        {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-500">{error}</p>}
        {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}

        <button
          type={otpSent ? "button" : "submit"}
          disabled={pending || (otpSent && resendCooldown > 0)}
          onClick={otpSent ? () => void resendVerificationCode() : undefined}
          className="min-h-11 w-full rounded-xl border border-secondary px-4 py-3 text-sm font-bold text-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "send"
            ? (language === "en" ? "Sending verification email..." : "Mengirim kode verifikasi...")
            : pendingAction === "resend"
              ? (language === "en" ? "Resending verification email..." : "Mengirim ulang kode verifikasi...")
            : otpSent
              ? (resendCooldown > 0
                ? (language === "en" ? `Resend code in ${resendCooldown}s` : `Kirim ulang kode dalam ${resendCooldown} dtk`)
                : (language === "en" ? "Resend verification code" : "Kirim ulang kode verifikasi"))
              : (language === "en" ? "Send verification code by email" : "Kirim kode verifikasi lewat email")}
        </button>
        <button type="submit" disabled={pending || !otpSent} className="min-h-11 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50">
          {pendingAction === "verify"
            ? (language === "en" ? "Verifying email..." : "Memverifikasi email...")
            : (language === "en" ? "Verify email and request approval" : "Verifikasi email & minta persetujuan")}
        </button>

        <p className="text-center text-xs text-on-surface-variant">
          {t("hasAccount")} <Link className="font-bold text-secondary" href="/admin/login">{t("login")}</Link>
        </p>
      </form>
    </main>
  );
}
