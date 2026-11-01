"use client";

import ResponsiveRoleNavigation from "@/frontend/shared/navigation/ResponsiveRoleNavigation";
import { useRoleNavigationItems } from "@/frontend/shared/navigation/roleNavigation";
import { useSidebar } from "../SidebarProvider/SidebarProvider";

export default function Sidebar() {
  const { desktopOpen } = useSidebar();
  const items = useRoleNavigationItems("drafter");
  return (
    <ResponsiveRoleNavigation
      role="drafter"
      items={items}
      desktopOpen={desktopOpen}
    />
  );
}
