import { inventoryItems } from "../../../data/ownerData";

export type InventoryItem = typeof inventoryItems[0] & { statusColor: string; barColor: string };
