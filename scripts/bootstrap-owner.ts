/**
 * Selaraskan profil Owner di public.users.
 *
 * Akun Owner (alupbesk96@gmail.com) hanya ada di Supabase Auth. Baris
 * public.users-nya dibutuhkan agar notifikasi push (getPushSubscriptionsByRoles)
 * dan daftar pengguna mengenali Owner. Jalankan sekali sekarang, dan otomatis
 * dibuat oleh trigger on_auth_owner_bootstrap untuk instalasi baru.
 *
 * Jalankan: npx tsx scripts/bootstrap-owner.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[line.slice(0, eq).trim()] = value;
  }
  return out;
}

const OWNER_EMAIL = "alupbesk96@gmail.com";

const env = loadEnv(".env");
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERROR: kredensial Supabase tidak ditemukan di .env");
  process.exit(1);
}
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data: authList, error } = await db.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  const owner = (authList?.users ?? []).find(
    (user) => (user.email ?? "").toLowerCase() === OWNER_EMAIL,
  );
  if (!owner) {
    console.error(`Akun auth ${OWNER_EMAIL} tidak ditemukan. Buat dulu di Supabase Auth.`);
    process.exit(1);
  }

  const { error: upsertError } = await db.from("users").upsert(
    {
      id: owner.id,
      name: "Owner",
      email: OWNER_EMAIL,
      role: "owner",
      status: "ACTIVE",
      active: true,
      email_confirmed_at: owner.email_confirmed_at ?? null,
    },
    { onConflict: "id" },
  );
  if (upsertError) throw upsertError;

  const { data: row } = await db
    .from("users")
    .select("id, email, role, status, active")
    .eq("id", owner.id)
    .maybeSingle();
  console.log("Profil Owner di public.users:", row);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
