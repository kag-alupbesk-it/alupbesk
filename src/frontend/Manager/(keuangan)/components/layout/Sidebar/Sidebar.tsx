"use client";

import ResponsiveRoleNavigation from "@/frontend/shared/navigation/ResponsiveRoleNavigation";
import { getRoleNavigationItems, type FinanceTabKey } from "@/frontend/shared/navigation/roleNavigation";

type Props = {
  activeTab: FinanceTabKey;
  onTabChange: (tab: FinanceTabKey) => void;
};

export default function Sidebar({ activeTab, onTabChange }: Props) {
  const isTabKey = (key: string): key is FinanceTabKey =>
    getRoleNavigationItems("keuangan").some((item) => item.key === key);

  return (
    <ResponsiveRoleNavigation
      role="keuangan"
      items={getRoleNavigationItems("keuangan")}
      selectedKey={activeTab}
      onSelect={(key) => {
        if (isTabKey(key)) onTabChange(key);
      }}
    />
  );
}
