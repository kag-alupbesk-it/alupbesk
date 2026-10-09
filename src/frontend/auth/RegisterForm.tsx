"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";
import { LanguageSwitcher } from "@/frontend/shared/i18n/LanguageSwitcher";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import ThemeToggle from "@/app/ThemeToggle";
import { CaptchaChallenge } from "./CaptchaChallenge";
import { PasswordInput } from "./PasswordInput";

const requestedRoles = [
  { value: "keuangan", label: "Finance", labelId: "Keuangan" },
  { value: "proyek", label: "Projects", labelId: "Proyek" },
  { value: "field", label: "Field Operations", labelId: "Field" },
  { value: "produksi", label: "Production", labelId: "Produksi" },
  { value: "gudang", label: "Warehouse", labelId: "Gudang" },
  { value: "marketing", label: "Marketing", labelId: "Marketing" },
] as const;

const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY);

export function RegisterForm() {
  const { language, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof requestedRoles)[number]["value"]>("gudang");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaVersion, setCaptchaVersion] = useState(0);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    if (captchaEnabled && !captchaToken) {
      setError(t("captchaRequired"));
      setPending(false);
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const dept = requestedRoles.find((item) => item.value === role)?.labelId ?? role;

    try {
      const { data, error: signUpError } = await getSupabaseBrowserClient().auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          captchaToken: captchaToken || undefined,
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

      if (data.session) {
        try {
          await getSupabaseBrowserClient().auth.signOut();
        } catch {
          // The role still requires Owner approval before the account can access staff pages.
        }
      }
      setSuccess(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Registration failed.");
    } finally {
      setPending(false);
      if (captchaEnabled) {
        setCaptchaToken("");
        setCaptchaVersion((version) => version + 1);
      }
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
              ? `Your ${requestedRoles.find((item) => item.value === role)?.label ?? role} role request is waiting for Owner approval. Please verify your email if email confirmation is enabled.`
              : `Permintaan role ${requestedRoles.find((item) => item.value === role)?.labelId ?? role} menunggu persetujuan Owner. Jika konfirmasi email aktif, silakan verifikasi email Anda.`}
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
          <input className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-2.5 outline-none focus:border-secondary" autoComplete="name" maxLength={160} required value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className="block text-xs font-semibold">
          {t("requestedRole")}
          <select className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-2.5 outline-none focus:border-secondary" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
            {requestedRoles.map((item) => (
              <option key={item.value} value={item.value}>{language === "en" ? item.label : item.labelId}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold">
          {t("email")}
          <input className="mt-2 min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-2.5 outline-none focus:border-secondary" type="email" autoComplete="email" maxLength={255} required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className="block text-xs font-semibold">
          {t("passwordLength")}
          <PasswordInput className="mt-2" inputClassName="min-h-11 w-full rounded-xl border border-outline/40 bg-surface px-3 py-2.5 outline-none focus:border-secondary" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>

        <CaptchaChallenge key={captchaVersion} onVerify={setCaptchaToken} onReset={() => setCaptchaToken("")} />
        {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-500">{error}</p>}

        <button type="submit" disabled={pending} className="min-h-11 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary disabled:opacity-60">
          {pending ? t("submitting") : t("submitRegistration")}
        </button>

        <p className="text-center text-xs text-on-surface-variant">
          {t("hasAccount")} <Link className="font-bold text-secondary" href="/admin/login">{t("login")}</Link>
        </p>
      </form>
    </main>
  );
}
