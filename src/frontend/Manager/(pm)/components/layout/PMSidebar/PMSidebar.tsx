"use client";

import ResponsiveRoleNavigation from "@/frontend/shared/navigation/ResponsiveRoleNavigation";
import { getRoleNavigationItems } from "@/frontend/shared/navigation/roleNavigation";
import { usePMOrders } from "../../../context/PMOrderContext/PMOrderContext";
import { needsDrawingApproval } from "../../../orderStatus/orderStatus";
import { useCustomRequests } from "@/frontend/shared/customRequests/useCustomRequests";
import { usePMSidebar } from "../PMSidebarProvider/PMSidebarProvider";

export function PMSidebar() {
  const { desktopOpen } = usePMSidebar();
  const { orders } = usePMOrders();
  const { data: customRequests } = useCustomRequests();

  return (
    <ResponsiveRoleNavigation
      role="proyek"
      items={getRoleNavigationItems("proyek")}
      desktopOpen={desktopOpen}
      badges={{
        orders: customRequests.filter((request) => request.status !== "accepted" && request.status !== "rejected").length,
        approval: orders.filter(needsDrawingApproval).length,
      }}
    />
  );
}
