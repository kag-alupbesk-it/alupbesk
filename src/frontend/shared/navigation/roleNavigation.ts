import { roleCanAccess, type AppRole } from "@/backend/auth/roles";

export type NavigationRole = Exclude<AppRole, "pelanggan">;

export interface RoleNavigationItem {
  key: string;
  href?: string;
  permissionPath: string;
  label: string;
  icon: string;
}

export const financeNavigationItems = [
  { key: "kas", permissionPath: "/keuangan", label: "Kas", icon: "payments" },
  { key: "grafik", permissionPath: "/keuangan", label: "Grafik", icon: "show_chart" },
  { key: "termin", permissionPath: "/keuangan", label: "Termin", icon: "receipt_long" },
  { key: "payroll", permissionPath: "/keuangan", label: "Payroll", icon: "badge" },
  { key: "audit", permissionPath: "/keuangan", label: "Riwayat Aktivitas", icon: "history" },
] as const satisfies readonly RoleNavigationItem[];

export type FinanceTabKey = (typeof financeNavigationItems)[number]["key"];

const navigationByRole = {
  owner: [
    { key: "overview", href: "/owner", permissionPath: "/owner", label: "Overview", icon: "dashboard" },
    { key: "users", href: "/owner/users", permissionPath: "/owner/users", label: "User Management", icon: "group" },
    { key: "reports", href: "/owner/reports", permissionPath: "/owner/reports", label: "Reports", icon: "assessment" },
    { key: "audit", href: "/owner/audit", permissionPath: "/owner/audit", label: "Riwayat Aktivitas", icon: "history" },
  ],
  manager: [
    { key: "overview", href: "/manager", permissionPath: "/manager", label: "Overview", icon: "dashboard" },
    { key: "financials", href: "/manager/financials", permissionPath: "/manager/financials", label: "Keuangan", icon: "payments" },
    { key: "inventory", href: "/manager/inventory", permissionPath: "/manager/inventory", label: "Inventory", icon: "inventory_2" },
    { key: "projects", href: "/owner/proyek", permissionPath: "/owner/proyek", label: "Proyek", icon: "apartment" },
    { key: "production", href: "/owner/produksi", permissionPath: "/owner/produksi", label: "Produksi", icon: "precision_manufacturing" },
    { key: "field", href: "/owner/field", permissionPath: "/owner/field", label: "Pengiriman", icon: "local_shipping" },
    { key: "orders", href: "/owner/pesanan", permissionPath: "/owner/pesanan", label: "Pesanan Masuk", icon: "receipt_long" },
    { key: "users", href: "/manager/users", permissionPath: "/manager/users", label: "User Management", icon: "group" },
    { key: "reports", href: "/manager/reports", permissionPath: "/manager/reports", label: "Reports", icon: "assessment" },
    { key: "audit", href: "/manager/audit", permissionPath: "/manager/audit", label: "Riwayat Aktivitas", icon: "history" },
  ],
  marketing: [
    { key: "overview", href: "/marketing", permissionPath: "/marketing", label: "Promosi", icon: "campaign" },
    { key: "portfolio", href: "/marketing/konten", permissionPath: "/marketing/konten", label: "Portofolio", icon: "folder_special" },
    { key: "orders", href: "/marketing/pesanan", permissionPath: "/marketing/pesanan", label: "Pesanan", icon: "receipt_long" },
    { key: "content", href: "/marketing/konten", permissionPath: "/marketing/konten", label: "Konten Website", icon: "edit_note" },
    { key: "reports", href: "/marketing/laporan", permissionPath: "/marketing/laporan", label: "Laporan", icon: "bar_chart" },
    { key: "audit", href: "/marketing/audit", permissionPath: "/marketing/audit", label: "Riwayat Aktivitas", icon: "history" },
    { key: "catalog", href: "/catalog", permissionPath: "/catalog", label: "Kembali ke Website", icon: "storefront" },
  ],
  gudang: [
    { key: "master", permissionPath: "/gudang", label: "Master Stok", icon: "inventory_2" },
    { key: "bahan", permissionPath: "/gudang", label: "Bahan Baku & Lot", icon: "view_in_ar" },
    { key: "masuk", permissionPath: "/gudang", label: "Barang Masuk", icon: "move_to_inbox" },
    { key: "keluar", permissionPath: "/gudang", label: "Barang Keluar", icon: "outbox" },
    { key: "permintaan", permissionPath: "/gudang", label: "Permintaan Produksi", icon: "assignment" },
    { key: "audit", permissionPath: "/gudang", label: "Riwayat Aktivitas", icon: "history" },
  ],
  keuangan: [...financeNavigationItems],
  proyek: [
    { key: "overview", href: "/pm", permissionPath: "/pm", label: "Overview", icon: "space_dashboard" },
    { key: "orders", href: "/pm/pesanan", permissionPath: "/pm/pesanan", label: "Pesanan Masuk", icon: "inbox" },
    { key: "approval", href: "/pm/approval", permissionPath: "/pm/approval", label: "Approval Gambar", icon: "fact_check" },
    { key: "create-order", href: "/pm/orders/create", permissionPath: "/pm/orders/create", label: "Tambah Order Baru", icon: "add_circle" },
    { key: "audit", href: "/pm/audit", permissionPath: "/pm/audit", label: "Riwayat Aktivitas", icon: "history" },
  ],
  drafter: [
    { key: "overview", href: "/drafter", permissionPath: "/drafter", label: "Dashboard", icon: "design_services" },
    { key: "tasks", href: "/drafter", permissionPath: "/drafter", label: "Tugas Desain", icon: "draw" },
    { key: "audit", href: "/drafter/audit", permissionPath: "/drafter/audit", label: "Riwayat Aktivitas", icon: "history" },
  ],
  produksi: [
    { key: "queue", href: "/produksi", permissionPath: "/produksi", label: "Antrean Produksi", icon: "precision_manufacturing" },
    { key: "drawings", href: "/produksi/drawings", permissionPath: "/produksi/drawings", label: "Upload Gambar Teknik", icon: "upload_file" },
    { key: "material", href: "/produksi/permintaan", permissionPath: "/produksi/permintaan", label: "Permintaan Material", icon: "package_2" },
    { key: "cutting", href: "/produksi/cutting-list", permissionPath: "/produksi/cutting-list", label: "Cutting List", icon: "content_cut" },
    { key: "audit", href: "/produksi/audit", permissionPath: "/produksi/audit", label: "Riwayat Aktivitas", icon: "history" },
  ],
  field: [
    { key: "deliveries", href: "/field", permissionPath: "/field", label: "Daftar Pengiriman", icon: "local_shipping" },
    { key: "waybills", href: "/field/surat-jalan", permissionPath: "/field/surat-jalan", label: "Surat Jalan", icon: "description" },
    { key: "proof-of-delivery", href: "/field/pod", permissionPath: "/field/pod", label: "Bukti Terima", icon: "document_scanner" },
    { key: "audit", href: "/field/audit", permissionPath: "/field/audit", label: "Riwayat Aktivitas", icon: "history" },
  ],
} satisfies Record<NavigationRole, RoleNavigationItem[]>;

export function getRoleNavigationItems(role: NavigationRole): RoleNavigationItem[] {
  return navigationByRole[role].filter((item) => roleCanAccess(role, item.permissionPath, "GET"));
}
