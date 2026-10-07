import { enqueueUpsert } from "@/services/supabase";
import type { SiteContent } from "../types";
import { siteContent } from "./store";

export function persistSiteContent(content: SiteContent): void {
  siteContent.set(content.key, content);
  enqueueUpsert(
    "site_content",
    {
      key: content.key,
      value: content.value,
      updated_at: content.updatedAt,
    },
    "key",
  );
}
