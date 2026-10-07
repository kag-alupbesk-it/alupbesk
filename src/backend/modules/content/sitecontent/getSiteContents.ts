import { siteContent } from "./store";
import type { SiteContent } from "../types";

export function getSiteContents(): SiteContent[] {
  return [...siteContent.values()];
}
