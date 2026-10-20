import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadEnv(path: string) {
  const out: Record<string, string> = {};
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const [key, ...value] = raw.split("=");
    if (key && value) out[key.trim()] = value.join("=").trim().replace(/^["\x27]|["\x27]$/g, "");
  }
  return out;
}

const env = loadEnv(".env");
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await db.from("custom_services").select("*");
  console.log(data);
}
check();
