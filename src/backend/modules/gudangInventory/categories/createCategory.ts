import { gudangCategories, persistCategory } from "./store";
import type { GudangCategory } from "../types";

export interface CreateCategoryInput {
  name: string;
}

// Menambah kategori baru. Nama duplikat (case-insensitive) mengembalikan
// kategori yang sudah ada supaya import/tipe data tidak membuat duplikat.
export function createCategory(input: CreateCategoryInput): GudangCategory {
  const name = input.name.trim();
  const existing = [...gudangCategories.values()].find(
    (category) => category.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;

  const category: GudangCategory = {
    id: `cat-${crypto.randomUUID()}`,
    name,
    createdAt: new Date().toISOString(),
  };
  persistCategory(category);
  return category;
}
