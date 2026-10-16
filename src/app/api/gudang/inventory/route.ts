import { getCategories } from "@/backend/modules/gudangInventory/categories";
import { getInventoryItems } from "@/backend/modules/gudangInventory/items";
import {
  getInTransactions,
  getOutTransactions,
} from "@/backend/modules/gudangInventory/transactions";
import { getProductionRequests } from "@/backend/modules/gudangInventory/productionRequests";
import { getMaterialLotViews } from "@/backend/modules/gudangInventory/lots";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET() {
  await ensureHydrated();
  return Response.json({
    success: true,
    data: {
      categories: getCategories(),
      items: getInventoryItems(),
      inTransactions: getInTransactions(),
      outTransactions: getOutTransactions(),
      productionRequests: getProductionRequests(),
      materialLots: getMaterialLotViews(),
    },
  });
}
