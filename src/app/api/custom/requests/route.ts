import { z } from "zod";
import { createCustomRequest, getCustomRequests } from "@/backend/modules/custom/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { isAllowedRawImage } from "@/backend/modules/custom/requests/validation";
import { checkRateLimit } from "@/backend/http/rateLimit";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { verifyHCaptchaToken } from "@/backend/http/verifyHCaptcha";

const customRequestItemSchema = z.object({
  name: z.string().trim().min(1, "Nama item wajib diisi."),
  quantity: z.number().int().min(1, "Kuantitas item harus lebih besar dari nol."),
  unit: z.string().trim().optional(),
  technicalNote: z.string().trim().optional(),
});

const requestSchema = z
  .object({
    nama: z.string().trim().min(1, "Nama wajib diisi."),
    kode: z.string().trim().min(1, "Kode produksi wajib diisi.").max(60),
    perusahaan: z.string().trim().min(1, "Nama perusahaan wajib diisi.").max(120),
    email: z.string().trim().email("Email tidak valid.").max(160).optional().or(z.literal("")),
    telp: z.string().trim().min(1, "Nomor WhatsApp wajib diisi.").max(24),
    projectAddress: z.string().trim().min(1, "Alamat proyek wajib diisi.").max(200),
    layanan: z.string().trim().min(1, "Layanan wajib dipilih."),
    deskripsi: z.string().trim().min(1, "Deskripsi kebutuhan wajib diisi.").max(4000),
    deadline: z.string().trim().min(1, "Target deadline wajib diisi."),
    items: z.array(customRequestItemSchema).min(1, "Tambahkan minimal satu item spesifikasi."),
    rawImage: z.string().trim().min(1, "Gambar referensi wajib diunggah."),
    rawImageName: z.string().trim().min(1, "Nama file gambar wajib diisi.").max(255),
    captchaToken: z.string().trim().min(1).max(4096),
  })
  .refine((data) => isAllowedRawImage(data.rawImage), {
    message: "URL gambar harus milik storage ALUPBESK.",
  });

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: getCustomRequests() });
}

export async function POST(request: Request) {
  if (checkRateLimit(request, 30, 60_000).limited) {
    return Response.json({ success: false, error: { code: "RATE_LIMITED", message: "Terlalu banyak request. Coba lagi sebentar lagi." } }, { status: 429 });
  }
  await ensureHydrated();
  const parsed = requestSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_CUSTOM_REQUEST", message: parsed.error.issues[0]?.message ?? "Data request tidak valid." } }, { status: 400 });
  }
  const captcha = await verifyHCaptchaToken(parsed.data.captchaToken);
  if (captcha !== "valid") {
    const unconfigured = captcha === "unconfigured";
    return Response.json({ success: false, error: { code: unconfigured ? "CAPTCHA_UNAVAILABLE" : "CAPTCHA_INVALID", message: unconfigured ? "Verifikasi bot belum dikonfigurasi." : "Verifikasi CAPTCHA gagal. Silakan coba lagi." } }, { status: unconfigured ? 503 : 400 });
  }
  const { captchaToken: _captchaToken, ...requestInput } = parsed.data;
  void _captchaToken;
  const created = createCustomRequest(requestInput);
  await flushWrites();
  return Response.json({ success: true, data: created }, { status: 201 });
}
