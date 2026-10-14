import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notifyVerifiedRoleRequest } from "@/backend/modules/roleRequests";

export const dynamic = "force-dynamic";

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return Response.json({ success: false, error: { code: "AUTH_UNAVAILABLE" } }, { status: 503 });
  }
  const cookieStore = await cookies();
  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (entries) => {
        for (const { name, value, options } of entries) cookieStore.set(name, value, options);
      },
    },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at) {
    return Response.json({ success: false, error: { code: "EMAIL_UNVERIFIED" } }, { status: 403 });
  }
  await notifyVerifiedRoleRequest(user.id);
  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
