import { enqueueUpsert } from "@/services/supabase";
import type { MarketingBanner } from "../types";
export const marketingBanners = new Map<string, MarketingBanner>();

// Menyimpan banner ke memori sekaligus mengantrekan tulis ke Supabase.
export function persistMarketingBanner(banner: MarketingBanner): void {
  marketingBanners.set(banner.id, banner);
  enqueueUpsert(
    "marketing_banners",
    {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle ?? null,
      image_url: banner.imageUrl,
      link_url: banner.linkUrl ?? null,
      active: banner.active,
      sort_order: banner.order,
      start_date: banner.startDate ?? null,
      end_date: banner.endDate ?? null,
      created_at: banner.createdAt,
    },
    "id",
  );
}
