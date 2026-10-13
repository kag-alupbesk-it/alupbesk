import { enqueueUpsert } from "@/services/supabase";
import type { GudangCategory } from "../types";

// Kategori default dipakai ketika Supabase belum dikonfigurasi. Hydrate akan
// menggantinya dengan data dari database bila tabel tersedia.
export const gudangCategories = new Map<string, GudangCategory>();

const DEFAULT_CATEGORIES: GudangCategory[] = [
  { id: "cat-aksesoris", name: "Aksesoris", createdAt: "" },
  { id: "cat-handle-lock", name: "Handle & Lock", createdAt: "" },
  { id: "cat-alumunium", name: "Alumunium", createdAt: "" },
  { id: "cat-fastener", name: "Fastener/Baut", createdAt: "" },
];

export function seedDefaultCategories(): void {
  for (const category of DEFAULT_CATEGORIES) {
    if (!gudangCategories.has(category.id)) gudangCategories.set(category.id, category);
  }
}

export function persistCategory(category: GudangCategory): void {
  gudangCategories.set(category.id, category);
  enqueueUpsert(
    "gudang_categories",
    {
      id: category.id,
      name: category.name,
      created_at: category.createdAt,
    },
    "id",
  );
}
