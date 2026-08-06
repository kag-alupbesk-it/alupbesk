import { gudangItems } from "./store";
import type { GudangItem, GudangItemInput } from "./types";
export function updateGudangItem(id: string, input: GudangItemInput): GudangItem | undefined { if (!gudangItems.has(id)) return undefined; const sku = input.sku.trim().toUpperCase(); if ([...gudangItems.values()].some((item) => item.id !== id && item.sku === sku)) throw new Error("SKU sudah digunakan."); const item = { id, ...input, sku, merek: input.merek.trim().toUpperCase(), catatan: input.catatan?.trim() || undefined }; gudangItems.set(id, item); return item; }
