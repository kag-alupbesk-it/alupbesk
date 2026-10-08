"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

interface HCaptchaApi {
  render: (container: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    hcaptcha?: HCaptchaApi;
  }
}

interface CaptchaChallengeProps {
  onVerify: (token: string) => void;
  onReset: () => void;
}

export function CaptchaChallenge({ onVerify, onReset }: CaptchaChallengeProps) {
  const { t } = useLanguage();
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onVerify, onReset });
  const [scriptReady, setScriptReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    callbacksRef.current = { onVerify, onReset };
  }, [onReset, onVerify]);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || !window.hcaptcha) return;
    const widgetId = window.hcaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => callbacksRef.current.onVerify(token),
      "expired-callback": () => callbacksRef.current.onReset(),
      "error-callback": () => {
        callbacksRef.current.onReset();
        setLoadError(true);
      },
    });
    return () => window.hcaptcha?.remove(widgetId);
  }, [scriptReady, siteKey]);

  if (!siteKey) {
    return (
      <p className="text-xs leading-relaxed text-on-surface-variant">
        {t("captchaMissing")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setLoadError(true)}
      />
      <div ref={containerRef} />
      {loadError && (
        <p role="alert" className="text-xs text-red-500">
          {t("captchaLoadError")}
        </p>
      )}
    </div>
  );
}
