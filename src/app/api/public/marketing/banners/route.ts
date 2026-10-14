import { getMarketingBanners } from "@/backend/modules/marketing";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET() {
  await ensureHydrated();

  const today = new Date().toISOString().slice(0, 10);
  const banners = getMarketingBanners().filter((banner) => {
    if (!banner.active) return false;
    if (banner.startDate && banner.startDate > today) return false;
    if (banner.endDate && banner.endDate < today) return false;
    return true;
  });

  return Response.json(
    { success: true, data: banners },
    { headers: { "Cache-Control": "no-store" } },
  );
}
