import type { Language } from "@/frontend/shared/i18n/translations";

type OtpAction = "verification" | "sign-in";

export function getAuthOtpErrorMessage(reason: unknown, language: Language, action: OtpAction) {
  const message = reason instanceof Error ? reason.message.trim() : "";
  const normalized = message.toLowerCase();
  const isEnglish = language === "en";

  if (normalized.includes("email address not authorized") || normalized.includes("email not authorized")) {
    return isEnglish
      ? "Supabase's default mailer cannot send to this address. Configure custom SMTP in Supabase Dashboard → Authentication → SMTP Settings."
      : "Pengirim email bawaan Supabase tidak dapat mengirim ke alamat ini. Atur SMTP khusus di Supabase Dashboard → Authentication → SMTP Settings.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many") || normalized.includes("after ")) {
    return isEnglish
      ? "Too many code requests. Wait a few minutes, then try again."
      : "Permintaan kode terlalu sering. Tunggu beberapa menit lalu coba lagi.";
  }

  if (normalized.includes("email not confirmed") || normalized.includes("email_not_confirmed")) {
    return isEnglish
      ? "This email has not been verified yet. Complete the sign-up email verification first."
      : "Email ini belum diverifikasi. Selesaikan verifikasi email pendaftaran terlebih dahulu.";
  }

  if (normalized.includes("failed to fetch") || normalized.includes("network") || normalized.includes("fetch failed")) {
    return isEnglish
      ? "Could not connect to the authentication service. Check your connection and try again."
      : "Tidak dapat terhubung ke layanan autentikasi. Periksa koneksi lalu coba lagi.";
  }

  const opaqueMessage = /^(?:[\[\]{}()"']+|undefined|null|unknown)$/i.test(message);
  if (message && !opaqueMessage) return message;
  return action === "verification"
    ? (isEnglish ? "The verification code could not be sent. Check Supabase email settings and try again." : "Kode verifikasi gagal dikirim. Periksa pengaturan email Supabase lalu coba lagi.")
    : (isEnglish ? "The sign-in code could not be sent. Check Supabase email settings and try again." : "Kode masuk gagal dikirim. Periksa pengaturan email Supabase lalu coba lagi.");
}
