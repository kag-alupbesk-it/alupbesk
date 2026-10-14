import type { Language } from "@/frontend/shared/i18n/translations";

type OtpAction = "verification" | "sign-in";

function extractErrorCode(reason: unknown): string {
  if (!reason || typeof reason !== "object") return "";
  const record = reason as { code?: unknown; error_code?: unknown };
  const value = record.code ?? record.error_code;
  return typeof value === "string" ? value.toLowerCase() : "";
}

export function getAuthOtpErrorMessage(reason: unknown, language: Language, action: OtpAction) {
  const message = reason instanceof Error ? reason.message.trim() : "";
  const normalized = message.toLowerCase();
  const code = extractErrorCode(reason);
  const isEnglish = language === "en";

  if (code === "email_address_not_authorized" || normalized.includes("email address not authorized") || normalized.includes("email not authorized") || normalized.includes("not authorized")) {
    return isEnglish
      ? "Supabase's default mailer cannot send to this address. Configure custom SMTP in Supabase Dashboard → Authentication → SMTP Settings."
      : "Pengirim email bawaan Supabase tidak dapat mengirim ke alamat ini. Atur SMTP khusus di Supabase Dashboard → Authentication → SMTP Settings.";
  }

  if (code === "over_email_send_rate_limit" || normalized.includes("rate limit") || normalized.includes("too many") || normalized.includes("after ")) {
    return isEnglish
      ? "Too many code requests. Wait a few minutes, then try again."
      : "Permintaan kode terlalu sering. Tunggu beberapa menit lalu coba lagi.";
  }

  if (code === "user_already_exists" || code === "email_exists" || normalized.includes("already registered") || normalized.includes("already exists") || normalized.includes("sudah terdaftar")) {
    return isEnglish
      ? "This email is already registered. Please sign in instead, or wait for Owner approval."
      : "Email ini sudah terdaftar. Silakan login, atau tunggu persetujuan Owner.";
  }

  if (code === "unexpected_failure" || normalized.includes("profile_already_active") || normalized.includes("database error saving new user")) {
    return isEnglish
      ? "This email is already linked to another account. Please sign in or contact the Owner."
      : "Email ini sudah terhubung ke akun lain. Silakan login atau hubungi Owner.";
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
