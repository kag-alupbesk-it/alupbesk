import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/services/supabase";

export async function getAccountApprovalStatus(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !db) return null;

  const cookieStore = await cookies();
  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (entries) => {
        try {
          for (const { name, value, options } of entries) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Proxy owns session refresh when called from a Server Component.
        }
      },
    },
  });

  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user?.email) return null;

  const { data, error } = await db
    .from("users")
    .select("status, active")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (error || !data || data.active) return null;
  return data.status;
}
