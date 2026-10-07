import { siteContent } from "./store";

export function getSiteContentByKey(key: string) {
  return siteContent.get(key);
}
