import { request } from "@/services/api/request";
import type { PortalConfig } from "./types";

export function getPortalConfig(): Promise<PortalConfig> {
  return request<PortalConfig>("/portal");
}
