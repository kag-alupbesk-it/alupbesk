import { pmCutLists } from "./store";
import type { PMCutList } from "./types";

export function listCutLists(orderId?: string): PMCutList[] {
  const lists = [...pmCutLists.values()].filter(
    (list) => !orderId || list.orderId === orderId,
  );
  return lists.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function getCutListById(id: string): PMCutList | undefined {
  return pmCutLists.get(id);
}
