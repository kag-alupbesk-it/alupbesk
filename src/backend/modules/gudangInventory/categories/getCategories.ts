import { gudangCategories, seedDefaultCategories } from "./store";
import type { GudangCategory } from "../types";
import { supabaseEnabled } from "@/services/supabase";

export function getCategories(): GudangCategory[] {
  if (gudangCategories.size === 0 && !supabaseEnabled) seedDefaultCategories();
  return [...gudangCategories.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "id"),
  );
}

export function getCategoryById(id: string): GudangCategory | undefined {
  return gudangCategories.get(id);
}
