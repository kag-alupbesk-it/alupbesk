import { roleCanAccess, type AppRole } from "@/backend/auth/roles";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import { translate, type Language, type MessageKey } from "@/frontend/shared/i18n/translations";

export type NavigationRole = Exclude<AppRole, "pelanggan">;

export interface RoleNavigationItem {
  key: string;
  href?: string;
  permissionPath: string;
  label: string;
  labelKey?: MessageKey;
  icon: string;
}

export const financeNavigationItems = [
  { key: "kas", permissionPath: "/keuangan", label: "Kas", labelKey: "cash", icon: "payments" },
  { key: "grafik", permissionPath: "/keuangan", label: "Grafik", labelKey: "charts", icon: "show_chart" },
  { key: "termin", permissionPath: "/keuangan", label: "Termin", labelKey: "terms", icon: "receipt_long" },
  { key: "audit", permissionPath: "/keuangan", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
] as const satisfies readonly RoleNavigationItem[];

export type FinanceTabKey = (typeof financeNavigationItems)[number]["key"];

const navigationByRole = {
  owner: [
    { key: "overview", href: "/owner", permissionPath: "/owner", label: "Overview", labelKey: "overview", icon: "dashboard" },
    { key: "users", href: "/owner/users", permissionPath: "/owner/users", label: "User Management", labelKey: "userManagement", icon: "group" },
    { key: "reports", href: "/owner/reports", permissionPath: "/owner/reports", label: "Reports", labelKey: "reports", icon: "assessment" },
    { key: "audit", href: "/owner/audit", permissionPath: "/owner/audit", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
  ],
  manager: [
    { key: "overview", href: "/manager", permissionPath: "/manager", label: "Overview", labelKey: "overview", icon: "dashboard" },
    { key: "financials", href: "/manager/financials", permissionPath: "/manager/financials", label: "Keuangan", labelKey: "financials", icon: "payments" },
    { key: "inventory", href: "/manager/inventory", permissionPath: "/manager/inventory", label: "Inventory", labelKey: "inventory", icon: "inventory_2" },
    { key: "projects", href: "/owner/proyek", permissionPath: "/owner/proyek", label: "Proyek", labelKey: "projects", icon: "apartment" },
    { key: "production", href: "/owner/produksi", permissionPath: "/owner/produksi", label: "Produksi", labelKey: "production", icon: "precision_manufacturing" },
    { key: "field", href: "/owner/field", permissionPath: "/owner/field", label: "Pengiriman", labelKey: "shipping", icon: "local_shipping" },
    { key: "orders", href: "/owner/pesanan", permissionPath: "/owner/pesanan", label: "Pesanan Masuk", labelKey: "incomingOrders", icon: "receipt_long" },
    { key: "users", href: "/manager/users", permissionPath: "/manager/users", label: "User Management", labelKey: "userManagement", icon: "group" },
    { key: "reports", href: "/manager/reports", permissionPath: "/manager/reports", label: "Reports", labelKey: "reports", icon: "assessment" },
    { key: "audit", href: "/manager/audit", permissionPath: "/manager/audit", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
  ],
  marketing: [
    { key: "overview", href: "/marketing", permissionPath: "/marketing", label: "Promosi", labelKey: "promotion", icon: "campaign" },
    { key: "portfolio", href: "/marketing/konten", permissionPath: "/marketing/konten", label: "Portofolio", labelKey: "portfolioContent", icon: "folder_special" },
    { key: "orders", href: "/marketing/pesanan", permissionPath: "/marketing/pesanan", label: "Pesanan", labelKey: "incomingOrders", icon: "receipt_long" },
    { key: "content", href: "/marketing/konten", permissionPath: "/marketing/konten", label: "Konten Website", labelKey: "websiteContent", icon: "edit_note" },
    { key: "reports", href: "/marketing/laporan", permissionPath: "/marketing/laporan", label: "Laporan", labelKey: "reports", icon: "bar_chart" },
    { key: "audit", href: "/marketing/audit", permissionPath: "/marketing/audit", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
    { key: "catalog", href: "/catalog", permissionPath: "/catalog", label: "Kembali ke Website", labelKey: "backToWebsite", icon: "storefront" },
  ],
  gudang: [
    { key: "master", permissionPath: "/gudang", label: "Master Stok", labelKey: "masterStock", icon: "inventory_2" },
    { key: "bahan", permissionPath: "/gudang", label: "Bahan Baku & Lot", labelKey: "rawMaterials", icon: "view_in_ar" },
    { key: "masuk", permissionPath: "/gudang", label: "Barang Masuk", labelKey: "incomingGoods", icon: "move_to_inbox" },
    { key: "keluar", permissionPath: "/gudang", label: "Barang Keluar", labelKey: "outgoingGoods", icon: "outbox" },
    { key: "permintaan", permissionPath: "/gudang", label: "Permintaan Produksi", labelKey: "materialRequest", icon: "assignment" },
    { key: "audit", permissionPath: "/gudang", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
  ],
  keuangan: [...financeNavigationItems],
  proyek: [
    { key: "overview", href: "/pm", permissionPath: "/pm", label: "Overview", labelKey: "overview", icon: "space_dashboard" },
    { key: "orders", href: "/pm/pesanan", permissionPath: "/pm/pesanan", label: "Pesanan Masuk", labelKey: "incomingOrders", icon: "inbox" },
    { key: "approval", href: "/pm/approval", permissionPath: "/pm/approval", label: "Approval Gambar", labelKey: "drawingApproval", icon: "fact_check" },
    { key: "create-order", href: "/pm/orders/create", permissionPath: "/pm/orders/create", label: "Tambah Order Baru", labelKey: "addNewOrder", icon: "add_circle" },
    { key: "audit", href: "/pm/audit", permissionPath: "/pm/audit", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
  ],
  drafter: [
    { key: "overview", href: "/drafter", permissionPath: "/drafter", label: "Dashboard", labelKey: "dashboard", icon: "design_services" },
    { key: "drawings", href: "/drafter/upload", permissionPath: "/drafter", label: "Upload Gambar Teknik", labelKey: "uploadTechnicalDrawing", icon: "upload_file" },
    { key: "audit", href: "/drafter/audit", permissionPath: "/drafter/audit", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
  ],
  produksi: [
    { key: "queue", href: "/produksi", permissionPath: "/produksi", label: "Antrean Produksi", labelKey: "productionQueue", icon: "precision_manufacturing" },
    { key: "material", href: "/produksi/permintaan", permissionPath: "/produksi/permintaan", label: "Permintaan Material", labelKey: "materialRequest", icon: "package_2" },
    { key: "cutting", href: "/produksi/cutting-list", permissionPath: "/produksi/cutting-list", label: "Cutting List", labelKey: "cuttingList", icon: "content_cut" },
    { key: "audit", href: "/produksi/audit", permissionPath: "/produksi/audit", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
  ],
  field: [
    { key: "deliveries", href: "/field", permissionPath: "/field", label: "Daftar Pengiriman", labelKey: "deliveryList", icon: "local_shipping" },
    { key: "waybills", href: "/field/surat-jalan", permissionPath: "/field/surat-jalan", label: "Surat Jalan", labelKey: "waybill", icon: "description" },
    { key: "proof-of-delivery", href: "/field/pod", permissionPath: "/field/pod", label: "Bukti Terima", labelKey: "proofOfDelivery", icon: "document_scanner" },
    { key: "audit", href: "/field/audit", permissionPath: "/field/audit", label: "Riwayat Aktivitas", labelKey: "activityHistory", icon: "history" },
  ],
} satisfies Record<NavigationRole, RoleNavigationItem[]>;

export function getRoleNavigationItems(role: NavigationRole, language: Language = "id"): RoleNavigationItem[] {
  const rawItems = navigationByRole[role].filter((item) => roleCanAccess(role, item.permissionPath, "GET"));
  return rawItems.map((item: RoleNavigationItem) => ({
    ...item,
    label: item.labelKey ? translate(language, item.labelKey) : item.label,
  }));
}

export function useRoleNavigationItems(role: NavigationRole): RoleNavigationItem[] {
  const { language } = useLanguage();
  return getRoleNavigationItems(role, language);
}
