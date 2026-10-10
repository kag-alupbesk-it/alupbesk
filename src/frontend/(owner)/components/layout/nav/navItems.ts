export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    items: [{ href: "/owner", label: "Overview", icon: "dashboard" }],
  },
  {
    title: "Divisi",
    items: [
      { href: "/owner/keuangan", label: "Keuangan", icon: "payments" },
      { href: "/owner/gudang", label: "Inventory", icon: "inventory_2" },
      { href: "/owner/proyek", label: "Proyek", icon: "apartment" },
      { href: "/owner/produksi", label: "Produksi", icon: "precision_manufacturing" },
      { href: "/owner/field", label: "Pengiriman", icon: "local_shipping" },
    ],
  },
  {
    title: "Governance",
    items: [
      { href: "/owner/pesanan", label: "Pesanan Masuk", icon: "receipt_long" },
      { href: "/owner/users", label: "User Management", icon: "group" },
      { href: "/owner/reports", label: "Reports", icon: "assessment" },
    ],
  },
];

export interface FlatNavItem extends NavItem {
  group: string;
}

export const flatNavItems: FlatNavItem[] = navGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.title ?? "Utama" })),
);
