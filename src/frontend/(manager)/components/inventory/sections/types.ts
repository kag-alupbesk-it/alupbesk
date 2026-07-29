import { inventoryItems } from "../../../data/managerData";

export type InventoryItem = typeof inventoryItems[0] & { statusColor: string; barColor: string };
