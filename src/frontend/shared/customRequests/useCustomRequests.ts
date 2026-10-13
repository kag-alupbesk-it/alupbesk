"use client";

import { useCallback } from "react";
import { customApi } from "@/services/api/index";
import type { CustomRequest } from "@/backend/modules/custom";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

export function useCustomRequests() {
  const loadRequests = useCallback(() => customApi.getRequests(), []);
  return usePollingResource<CustomRequest[]>(loadRequests, []);
}