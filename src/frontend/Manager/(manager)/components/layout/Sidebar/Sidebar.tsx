"use client";

import ResponsiveRoleNavigation from "@/frontend/shared/navigation/ResponsiveRoleNavigation";
import { getRoleNavigationItems } from "@/frontend/shared/navigation/roleNavigation";
import { useSidebar } from "../SidebarProvider/SidebarProvider";

export default function Sidebar() {
  const { desktopOpen } = useSidebar();

  return (
    <ResponsiveRoleNavigation
      role="manager"
      items={getRoleNavigationItems("manager")}
      desktopOpen={desktopOpen}
    />
  );
}
