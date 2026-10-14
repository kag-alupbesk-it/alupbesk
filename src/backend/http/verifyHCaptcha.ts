interface HCaptchaSiteVerifyResponse {
  success?: boolean;
}

export type HCaptchaVerificationResult = "valid" | "invalid" | "unconfigured";

export async function verifyHCaptchaToken(token: string): Promise<HCaptchaVerificationResult> {
  const secret = process.env.HCAPTCHA_SECRET;
  const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  if (!secret || !sitekey) return "unconfigured";
  if (!token.trim()) return "invalid";

  try {
    const body = new URLSearchParams({ secret, sitekey, response: token });
    const response = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return "invalid";
    const result = (await response.json()) as HCaptchaSiteVerifyResponse;
    return result.success === true ? "valid" : "invalid";
  } catch {
    return "invalid";
  }
}
