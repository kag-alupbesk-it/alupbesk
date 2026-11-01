"use client";

import ResponsiveRoleNavigation from "@/frontend/shared/navigation/ResponsiveRoleNavigation";
import { useRoleNavigationItems, type FinanceTabKey } from "@/frontend/shared/navigation/roleNavigation";

type Props = {
  activeTab: FinanceTabKey;
  onTabChange: (tab: FinanceTabKey) => void;
};

export default function Sidebar({ activeTab, onTabChange }: Props) {
  const items = useRoleNavigationItems("keuangan");
  const isTabKey = (key: string): key is FinanceTabKey =>
    items.some((item) => item.key === key);

  return (
    <ResponsiveRoleNavigation
      role="keuangan"
      items={items}
      selectedKey={activeTab}
      onSelect={(key) => {
        if (isTabKey(key)) onTabChange(key);
      }}
    />
  );
}
