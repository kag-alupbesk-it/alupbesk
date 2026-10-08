import type { SiteContent, SiteContentInput } from "../types";
import { persistSiteContent } from "./persistSiteContent";

export function upsertSiteContent(input: SiteContentInput): SiteContent {
  const content: SiteContent = {
    key: input.key,
    value: input.value,
    updatedAt: new Date().toISOString(),
  };
  persistSiteContent(content);
  return content;
}
