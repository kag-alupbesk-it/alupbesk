import { enqueueDelete } from "@/services/supabase";
import { kasEntries } from "./store";
import type { KasResult } from "../types";

export function deleteKasEntry(id: string): KasResult {
  const existing = kasEntries.get(id);
  if (!existing) return { ok: false, code: "KAS_ENTRY_NOT_FOUND" };
  kasEntries.delete(id);
  enqueueDelete("kas_entries", "id", id);
  return { ok: true, entry: existing };
}
