"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Apple,
  ArrowDownToLine,
  Laptop,
  MonitorDown,
  Smartphone,
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
  { id: "android", label: "Android", Icon: Smartphone },
  { id: "ios", label: "iOS", Icon: Apple },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  Icon: LucideIcon;
}>;

type InstallTarget = (typeof installTargets)[number]["id"];

export function AdminPortal() {
  const { language, t } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [notice, setNotice] = useState<{ target: InstallTarget; message: string } | null>(null);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

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

    if (installPrompt) {
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

    setNotice({
      target,
      message:
        language === "en"
          ? "Installation is not available on this browser or device yet."
          : "Instalasi belum tersedia di browser atau perangkat ini.",
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

            <div className="portalInstallGrid">
              {installTargets.map(({ id, label, Icon }) => (
                <article className="portalInstallCard" key={id}>
                  <div className="portalInstallCardTop">
                    <span className="portalPlatformIcon" aria-hidden="true">
                      <Icon size={19} strokeWidth={1.8} />
                    </span>
                    <h3>{label}</h3>
                  </div>
                  <button
                    className="portalInstallButton"
                    type="button"
                    onClick={() => void installApp(id)}
                    aria-label={`${t("installApp")} ${label}`}
                  >
                    <span>{language === "en" ? "Install" : "Pasang"}</span>
                    <ArrowDownToLine size={15} aria-hidden="true" />
                  </button>
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
                <p>{notice.message}</p>
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
