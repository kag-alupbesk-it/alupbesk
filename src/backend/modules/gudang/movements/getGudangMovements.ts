import { gudangMovements } from "./store";
import type { GudangMovement } from "./types";

export function getGudangMovements(itemId?: string): GudangMovement[] {
  const movements = [...gudangMovements.values()];
  const filtered = itemId ? movements.filter((movement) => movement.itemId === itemId) : movements;
  return filtered.sort(
    (left, right) =>
      right.createdAt.localeCompare(left.createdAt) || right.tanggal.localeCompare(left.tanggal),
  );
}
