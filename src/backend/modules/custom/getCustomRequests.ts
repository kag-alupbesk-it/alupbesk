import { customRequests } from "./store";
import type { CustomRequest } from "./types";
export function getCustomRequests(): CustomRequest[] { return [...customRequests.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
