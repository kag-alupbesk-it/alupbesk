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

async function update() {
  // Rename Desain Rangka to Desain Gambar
  const { error: updateError } = await db.from("custom_services")
    .update({ title: "Desain Gambar" })
    .eq("id", "a5000000-0000-4000-8000-000000000002");
  if (updateError) console.error("Update error:", updateError);
  else console.log("Service renamed.");

  // Delete Finishing Custom
  const { error: deleteError } = await db.from("custom_services")
    .delete()
    .eq("id", "a5000000-0000-4000-8000-000000000003");
  if (deleteError) console.error("Delete error:", deleteError);
  else console.log("Service deleted.");
}
update();
