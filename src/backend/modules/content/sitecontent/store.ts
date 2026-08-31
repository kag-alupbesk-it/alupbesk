import { enqueueUpsert } from "@/services/supabase";
import type { SiteContent, SiteContentInput } from "../types";

export const siteContent = new Map<string, SiteContent>();

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

export function getSiteContentByKey(key: string): SiteContent | undefined {
  return siteContent.get(key);
}

export function upsertSiteContent(input: SiteContentInput): SiteContent {
  const content: SiteContent = {
    key: input.key,
    value: input.value,
    updatedAt: new Date().toISOString(),
  };
  persistSiteContent(content);
  return content;
}

export function getSiteContents(): SiteContent[] {
  return [...siteContent.values()];
}
