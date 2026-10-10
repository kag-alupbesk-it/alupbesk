import { z } from "zod";
import { db } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { sendPushToRoles } from "@/services/push/send";

export const dynamic = "force-dynamic";

// Role yang boleh diminta lewat formulir publik. Owner dan Manager sengaja
// tidak disertakan agar endpoint ini tidak bisa dipakai menaikkan hak akses.
const requestableRoles = [
  "keuangan",
  "proyek",
  "field",
  "produksi",
  "gudang",
  "marketing",
] as const;

const registerSchema = z.object({
  userId: z.uuid(),
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(255),
  role: z.enum(requestableRoles),
  dept: z.string().trim().max(120),
});

function errorResponse(code: string, message: string, status: number) {
  return Response.json({ success: false, error: { code, message } }, { status });
}

function notifyOwner(name: string, role: string) {
  void sendPushToRoles(["owner"], {
    title: "Permintaan Role Baru",
    body: `${name} mengajukan role ${role} dan menunggu persetujuan.`,
    url: "/admin/owner",
  });
}

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return errorResponse("INVALID_REGISTRATION", "Data pendaftaran tidak valid.", 400);
  }
  if (!db) {
    return errorResponse("DATABASE_UNAVAILABLE", "Pendaftaran belum dapat diproses.", 503);
  }

  const email = parsed.data.email.toLowerCase();
  const profile = {
    name: parsed.data.name,
    email,
    dept: parsed.data.dept,
    role: parsed.data.role,
    status: "PENDING",
    active: false,
  };

  try {
    const { data: existing, error: lookupError } = await db
      .from("users")
      .select("id, active")
      .or(`id.eq.${parsed.data.userId},email.eq.${email}`)
      .maybeSingle();
    if (lookupError) throw lookupError;

    if (existing?.active) {
      return errorResponse("EMAIL_EXISTS", "Email sudah dipakai akun aktif.", 409);
    }

    if (existing) {
      const { error } = await db.from("users").update(profile).eq("id", existing.id);
      if (error) throw error;
      notifyOwner(parsed.data.name, parsed.data.role);
      return Response.json({ success: true, data: { id: existing.id, status: "PENDING" } });
    }

    const { data: created, error: insertError } = await db
      .from("users")
      .insert({ id: parsed.data.userId, ...profile })
      .select("id")
      .single();
    if (insertError) throw insertError;

    notifyOwner(parsed.data.name, parsed.data.role);

    return Response.json(
      { success: true, data: { id: created.id, status: "PENDING" } },
      { status: 201 },
    );
  } catch (reason) {
    const duplicate =
      reason && typeof reason === "object" && "code" in reason && reason.code === "23505";
    if (duplicate) {
      return errorResponse("EMAIL_EXISTS", "Email sudah dipakai akun lain.", 409);
    }
    return errorResponse("DATABASE_ERROR", "Profil pendaftaran gagal disimpan.", 500);
  }
}
