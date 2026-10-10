"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Apple,
  ArrowDownToLine,
  Laptop,
  MonitorDown,
  Smartphone,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { LanguageSwitcher } from "@/frontend/shared/i18n/LanguageSwitcher";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import ThemeToggle from "@/app/ThemeToggle";
import "./style.css";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const installTargets = [
  { id: "windows", label: "Windows", Icon: MonitorDown },
  { id: "mac", label: "macOS", Icon: Laptop },
  { id: "linux", label: "Linux", Icon: Terminal },
  { id: "android", label: "Android", Icon: Smartphone },
  { id: "ios", label: "iOS", Icon: Apple },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  Icon: LucideIcon;
}>;

type InstallTarget = (typeof installTargets)[number]["id"];

const manualSteps: Record<InstallTarget, { en: string[]; id: string[] }> = {
  windows: {
    en: [
      "Open Chrome or Edge.",
      'Click the install icon in the address bar, or open menu "⋮" and choose "Install alupbesk".',
    ],
    id: [
      "Buka Chrome atau Edge.",
      'Klik ikon Install di address bar, atau buka menu "⋮" lalu pilih "Install alupbesk".',
    ],
  },
  mac: {
    en: [
      'Chrome: open menu "⋮" and choose "Install alupbesk".',
      'Safari: open the "File" menu and choose "Add to Dock".',
    ],
    id: [
      'Chrome: buka menu "⋮" lalu pilih "Install alupbesk".',
      'Safari: buka menu "File" lalu pilih "Add to Dock".',
    ],
  },
  linux: {
    en: [
      "Open Chrome, Chromium, or Edge.",
      'Click the install icon in the address bar, or open menu "⋮" and choose "Install alupbesk".',
    ],
    id: [
      "Buka Chrome, Chromium, atau Edge.",
      'Klik ikon Install di address bar, atau buka menu "⋮" lalu pilih "Install alupbesk".',
    ],
  },
  android: {
    en: ["Open Chrome.", 'Open menu "⋮" and choose "Install app" or "Add to Home screen".'],
    id: ['Buka Chrome.', 'Buka menu "⋮" lalu pilih "Install app" atau "Add to Home screen".'],
  },
  ios: {
    en: ["Open Safari.", "Tap the Share button.", 'Choose "Add to Home Screen".'],
    id: ["Buka Safari.", "Tap tombol Share.", 'Pilih "Add to Home Screen".'],
  },
};

function detectPlatform(): InstallTarget | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const platform = (uaData?.platform || navigator.platform || "").toLowerCase();
  const isTouchMac = /mac/.test(platform) && "ontouchend" in document;
  if (/iphone|ipad|ipod/.test(ua) || /iphone|ipad|ipod/.test(platform) || isTouchMac) return "ios";
  if (/android/.test(ua) || /android/.test(platform)) return "android";
  if (/win/.test(platform) || /win/.test(ua)) return "windows";
  if (/mac/.test(platform)) return "mac";
  if (/linux|x11|cros/.test(platform) || /linux/.test(ua)) return "linux";
  return null;
}

export function AdminPortal() {
  const { language, t } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [notice, setNotice] = useState<{
    target: InstallTarget;
    message?: string;
    steps?: string[];
  } | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<InstallTarget | null>(null);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  useEffect(() => {
    // Platform detection needs browser APIs, so it runs after mount to keep SSR output stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPlatform(detectPlatform());
  }, []);

  useEffect(() => {
    const handleInstalled = () => {
      setNotice({
        target: currentPlatform ?? "windows",
        message:
          language === "en"
            ? "alupbesk has been installed on this device."
            : "alupbesk telah terpasang di perangkat ini.",
      });
    };

    window.addEventListener("appinstalled", handleInstalled);
    return () => window.removeEventListener("appinstalled", handleInstalled);
  }, [currentPlatform, language]);

  async function installApp(target: InstallTarget) {
    setNotice(null);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    if (isStandalone) {
      setNotice({
        target,
        message:
          language === "en"
            ? "alupbesk is already installed on this device."
            : "alupbesk sudah terpasang di perangkat ini.",
      });
      return;
    }

    const onOtherDevice = currentPlatform !== null && target !== currentPlatform;

    if (installPrompt && !onOtherDevice) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        setNotice({
          target,
          message:
            choice.outcome === "accepted"
              ? language === "en"
                ? "Installation started."
                : "Proses pemasangan dimulai."
              : language === "en"
                ? "Installation was canceled."
                : "Pemasangan dibatalkan.",
        });
      } catch {
        setNotice({
          target,
          message:
            language === "en"
              ? "Installation is unavailable in this browser."
              : "Instalasi tidak tersedia di browser ini.",
        });
      } finally {
        setInstallPrompt(null);
      }
      return;
    }

    const targetLabel =
      installTargets.find((entry) => entry.id === target)?.label ?? target;
    const currentLabel = currentPlatform
      ? installTargets.find((entry) => entry.id === currentPlatform)?.label ?? currentPlatform
      : "";

    setNotice({
      target,
      message: onOtherDevice
        ? language === "en"
          ? `This card is for ${targetLabel}. Your device is detected as ${currentLabel}. Choose the card matching your device to install it here.`
          : `Kartu ini untuk perangkat ${targetLabel}. Perangkat Anda terdeteksi ${currentLabel}. Pilih kartu yang sesuai perangkat Anda untuk memasang di sini.`
        : undefined,
      steps: manualSteps[target][language],
    });
  }

  const noticeTitle = installTargets.find((target) => target.id === notice?.target)?.label;

  return (
    <main className="portal">
      <div className="portalInner">
        <div className="portalToolbar">
          <span className="portalEyebrow">{t("appPortal")}</span>
          <div className="portalPreferences">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        <header className="portalHeader">
          <h1 className="portalTitle">
            {language === "en" ? "alupbesk on every device." : "alupbesk di semua perangkat."}
          </h1>
          <p className="portalDescription">
            {language === "en"
              ? "Install the app or continue in your browser."
              : "Pasang aplikasi atau lanjutkan melalui browser."}
          </p>
        </header>

        <div className="portalSections">
          <section className="portalSection" aria-labelledby="install-title">
            <div className="portalSectionHeading">
              <h2 id="install-title" className="portalSectionTitle">
                {t("installApp")}
              </h2>
              <p className="portalSectionDescription">
                {language === "en" ? "Choose your device." : "Pilih perangkat Anda."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {installTargets.map(({ id, label, Icon }) => (
                <article
                  className={`relative flex h-14 items-center justify-between gap-3 rounded-xl border bg-zinc-900/50 p-3 ${
                    currentPlatform === id ? "border-amber-500/60" : "border-zinc-800"
                  }`}
                  key={id}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="portalPlatformIcon" aria-hidden="true">
                      <Icon size={19} strokeWidth={1.8} />
                    </span>
                    <h3 className="truncate text-sm font-bold">{label}</h3>
                  </div>
                  <button
                    className="portalInstallButton shrink-0"
                    type="button"
                    onClick={() => void installApp(id)}
                    aria-label={`${t("installApp")} ${label}`}
                  >
                    <span>{language === "en" ? "Install" : "Pasang"}</span>
                    <ArrowDownToLine size={15} aria-hidden="true" />
                  </button>
                  {currentPlatform === id && (
                    <span className="absolute -bottom-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      {language === "en" ? "This device" : "Perangkat ini"}
                    </span>
                  )}
                </article>
              ))}
            </div>

            <p className="portalFinePrint">
              {language === "en"
                ? "This is a browser app shortcut. Its storage is managed by your browser; native installers with a folder picker are not available yet."
                : "Ini shortcut aplikasi dari browser. Penyimpanannya diatur browser; installer native dengan pilihan folder belum tersedia."}
            </p>

            {notice && (
              <div className="portalInstallNote" role="status" aria-live="polite">
                <p className="mb-1 font-bold">{noticeTitle}</p>
                {notice.message && <p>{notice.message}</p>}
                {notice.steps && notice.steps.length > 0 && (
                  <ol className="portalInstallSteps">
                    {notice.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </section>

          <section className="portalSection portalAccountSection" aria-labelledby="account-title">
            <h2 id="account-title" className="portalSectionTitle">
              {t("continueAccount")}
            </h2>
            <p className="portalSectionDescription">
              {language === "en"
                ? "New role requests need approval from the Owner."
                : "Permintaan role baru perlu persetujuan Owner."}
            </p>
            <div className="portalActions">
              <Link className="portalButton portalButtonPrimary" href="/admin/login">
                <span>{language === "en" ? "Sign in" : "Login"}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link className="portalButton portalButtonSecondary" href="/admin/register">
                <span>{language === "en" ? "Register" : "Daftar"}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        </div>

        <footer className="portalFooter">
          {language === "en"
            ? "The installed app opens directly to sign in. Full offline work and automatic data synchronization are not available yet."
            : "Aplikasi yang terpasang langsung membuka halaman login. Kerja offline penuh dan sinkronisasi data otomatis belum tersedia."}
        </footer>
      </div>
    </main>
  );
}
