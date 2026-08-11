import { enqueueDelete } from "@/services/supabase";
import { marketingBanners } from "./store";
export function deleteMarketingBanner(id: string): boolean {
  const deleted = marketingBanners.delete(id);
  if (deleted) enqueueDelete("marketing_banners", "id", id);
  return deleted;
}
