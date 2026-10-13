import { db } from "@/services/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AppRole } from "./roles";
export { roleCanAccess } from "./roles";

export interface AuthenticatedProfile {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  active: boolean;
}

export class UnverifiedEmailError extends Error {
  constructor() {
    super("EMAIL_UNVERIFIED");
    this.name = "UnverifiedEmailError";
  }
}

export async function getAuthenticatedProfile(): Promise<AuthenticatedProfile | null> {
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
          // Server components cannot write cookies; proxy refreshes the session.
        }
      },
    },
  });
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user?.email) return null;
  if (!user.email_confirmed_at) throw new UnverifiedEmailError();

  const { data, error } = await db
    .from("users")
    .select("id, name, email, role, active")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (error || !data || !data.active) return null;

  return data as AuthenticatedProfile;
}

