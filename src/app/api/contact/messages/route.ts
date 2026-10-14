import { z } from "zod";
import {
  createContactMessage,
  getContactMessages,
} from "@/backend/modules/contact/index";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { checkRateLimit } from "@/backend/http/rateLimit";
import { verifyHCaptchaToken } from "@/backend/http/verifyHCaptcha";

const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  category: z.string().trim().min(1).max(100),
  message: z.string().trim().min(5).max(5000),
  captchaToken: z.string().trim().min(1).max(4096),
});

export async function GET() {
  try {
    const messages = await getContactMessages();
    return Response.json(
      { success: true, data: messages },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : "CONTACT_MESSAGES_LOAD_FAILED",
          message: unavailable ? "Database belum dikonfigurasi." : "Pesan kontak gagal dimuat.",
        },
      },
      { status: unavailable ? 503 : 500 },
    );
  }
}

export async function POST(request: Request) {
  if (checkRateLimit(request, 5, 15 * 60_000).limited) {
    return Response.json({ success: false, error: { code: "RATE_LIMITED", message: "Terlalu banyak pesan. Coba lagi nanti." } }, { status: 429 });
  }

  const parsed = contactMessageSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_CONTACT_MESSAGE",
          message: parsed.error.issues[0]?.message ?? "Pesan kontak tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const captcha = await verifyHCaptchaToken(parsed.data.captchaToken);
  if (captcha !== "valid") {
    const unconfigured = captcha === "unconfigured";
    return Response.json(
      { success: false, error: { code: unconfigured ? "CAPTCHA_UNAVAILABLE" : "CAPTCHA_INVALID", message: unconfigured ? "Verifikasi bot belum dikonfigurasi." : "Verifikasi CAPTCHA gagal. Silakan coba lagi." } },
      { status: unconfigured ? 503 : 400 },
    );
  }

  const { captchaToken: _captchaToken, ...messageInput } = parsed.data;
  void _captchaToken;

  try {
    const message = await createContactMessage(messageInput);
    return Response.json(
      { success: true, data: { id: message.id, createdAt: message.createdAt } },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : "CONTACT_MESSAGE_SAVE_FAILED",
          message: unavailable ? "Database belum dikonfigurasi." : "Pesan kontak gagal disimpan.",
        },
      },
      { status: unavailable ? 503 : 500 },
    );
  }
}
