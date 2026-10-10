import { z } from "zod";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { deletePushSubscription } from "@/services/push/subscriptions";

export const dynamic = "force-dynamic";

const unsubscribeSchema = z.object({
  endpoint: z.string().url().max(2048),
});

export async function POST(request: Request) {
  const access = await authorizeCurrentUser("/api/push/unsubscribe", "POST");
  if (!access.profile) {
    return Response.json(
      { success: false, error: { code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN", message: "Silakan login untuk menonaktifkan notifikasi." } },
      { status: access.status },
    );
  }
  const parsed = unsubscribeSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_SUBSCRIPTION", message: "Data langganan notifikasi tidak valid." } },
      { status: 400 },
    );
  }
  await deletePushSubscription(parsed.data.endpoint);
  return Response.json({ success: true, data: null });
}