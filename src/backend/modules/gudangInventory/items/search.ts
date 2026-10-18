import { getInventoryItems } from "./getItems";
import type { GudangInventoryItem } from "../types";

export function searchInventoryItems(query: string): GudangInventoryItem[] {
  const lowerQuery = query.toLowerCase();
  return getInventoryItems().filter(
    (item) =>
      item.itemName.toLowerCase().includes(lowerQuery) ||
      item.brand.toLowerCase().includes(lowerQuery) ||
      item.modelNo.toLowerCase().includes(lowerQuery)
  );
}
