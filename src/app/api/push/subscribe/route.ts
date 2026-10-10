import { z } from "zod";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { savePushSubscription } from "@/services/push/subscriptions";

export const dynamic = "force-dynamic";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    auth: z.string().min(1).max(2048),
    p256dh: z.string().min(1).max(2048),
  }),
  userAgent: z.string().max(512).optional(),
});

export async function POST(request: Request) {
  const access = await authorizeCurrentUser("/api/push/subscribe", "POST");
  if (!access.profile) {
    return Response.json(
      { success: false, error: { code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN", message: "Silakan login untuk mengaktifkan notifikasi." } },
      { status: access.status },
    );
  }
  const parsed = subscriptionSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_SUBSCRIPTION", message: "Data langganan notifikasi tidak valid." } },
      { status: 400 },
    );
  }
  try {
    await savePushSubscription(access.profile.id, parsed.data, parsed.data.userAgent);
    return Response.json({ success: true, data: null });
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json(
      { success: false, error: { code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR", message: "Langganan notifikasi gagal disimpan." } },
      { status: unavailable ? 503 : 500 },
    );
  }
}