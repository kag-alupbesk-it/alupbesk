import { gudangItems } from "./store";
import type { GudangItem, GudangItemInput } from "./types";
export function createGudangItem(input: GudangItemInput): GudangItem { const sku = input.sku.trim().toUpperCase(); if ([...gudangItems.values()].some((item) => item.sku === sku)) throw new Error("SKU sudah digunakan."); const item = { id: crypto.randomUUID(), ...input, sku, merek: input.merek.trim().toUpperCase(), catatan: input.catatan?.trim() || undefined }; gudangItems.set(item.id, item); return item; }
