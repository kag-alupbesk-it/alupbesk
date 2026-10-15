import { getAuthenticatedProfile, UnverifiedEmailError } from "@/backend/auth/getAuthenticatedProfile";
import { getAccountApprovalStatus } from "@/backend/auth/getAccountApprovalStatus";
import { z } from "zod";
import { db } from "@/services/supabase";
import { logAuditAction } from "@/backend/modules/audit/auditStore";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).optional().or(z.literal("")),
});

export async function GET() {
  try {
    const profile = await getAuthenticatedProfile();
    if (!profile) {
      const status = await getAccountApprovalStatus();
      if (status === "EMAIL_UNVERIFIED") {
        return Response.json(
          { success: false, error: { code: "EMAIL_UNVERIFIED", message: "Verifikasi email sebelum melanjutkan." } },
          { status: 403 },
        );
      }
      if (status === "PENDING") {
        return Response.json(
          { success: false, error: { code: "ACCOUNT_PENDING", message: "Akun menunggu persetujuan role dari Owner." } },
          { status: 403 },
        );
      }
      if (status === "SUSPENDED") {
        return Response.json(
          { success: false, error: { code: "ACCOUNT_SUSPENDED", message: "Akun tidak aktif. Hubungi Owner." } },
          { status: 403 },
        );
      }
      return Response.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Sesi login tidak aktif." } },
        { status: 401 },
      );
    }
    return Response.json(
      { success: true, data: profile },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (reason) {
    if (reason instanceof UnverifiedEmailError) {
      return Response.json(
        { success: false, error: { code: "EMAIL_UNVERIFIED", message: "Verifikasi email sebelum melanjutkan." } },
        { status: 403 },
      );
    }
    return Response.json(
      { success: false, error: { code: "AUTH_ERROR", message: "Profil akun gagal dimuat." } },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const profile = await getAuthenticatedProfile();
  if (!profile || !db) {
    return Response.json({ success: false, error: { code: "AUTH_REQUIRED", message: "Unauthorized" } }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Data tidak valid" } }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const { error: updateDbError } = await db
    .from("users")
    .update({ name, email: email.toLowerCase() })
    .eq("id", profile.id);

  if (updateDbError) {
    return Response.json({ success: false, error: { code: "DATABASE_ERROR", message: updateDbError.message } }, { status: 500 });
  }

  const authUpdate: { email?: string; password?: string } = {};
  if (email.toLowerCase() !== profile.email.toLowerCase()) {
    authUpdate.email = email.toLowerCase();
  }
  if (password && password.length >= 8) {
    authUpdate.password = password;
  }

  if (Object.keys(authUpdate).length > 0) {
    const { error: authError } = await db.auth.admin.updateUserById(profile.id, authUpdate);
    if (authError) {
      return Response.json({ success: false, error: { code: "AUTH_ERROR", message: authError.message } }, { status: 500 });
    }
  }

  logAuditAction({
    profile,
    action: "EDIT",
    target: "Profil Akun",
    details: `Memperbarui profil akun: ${name} (${email})`,
  });

  return Response.json({ success: true, data: { ...profile, name, email } });
}
