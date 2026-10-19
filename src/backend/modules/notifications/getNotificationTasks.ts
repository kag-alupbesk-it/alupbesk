import type { AppRole } from "@/backend/auth/roles";
import { db } from "@/services/supabase";
import { getRoleRequests } from "@/backend/modules/roleRequests/getRoleRequests";

export interface NotificationTask {
  id: string;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
}

function hasAnyRole(role: AppRole, ...allowed: AppRole[]) {
  return role === "owner" || allowed.includes(role);
}

export async function getNotificationTasks(role: AppRole): Promise<NotificationTask[]> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const tasks: NotificationTask[] = [];

  if (hasAnyRole(role, "manager")) {
    const roleRequests = await getRoleRequests();
    for (const request of roleRequests) {
      tasks.push({ id: `role:${request.id}`, title: "Permintaan akses role", detail: `${request.name} · ${request.requestedRole}`, href: "/admin/owner/users", createdAt: request.createdAt });
    }
  }

  if (hasAnyRole(role, "manager")) {
    const statuses = ["pending", "rejected_by_manager"];
    const { data, error } = await db.from("orders").select("id, customer_name, status, created_at").in("status", statuses).order("created_at", { ascending: false }).limit(25);
    if (error) throw error;
    for (const row of data ?? []) tasks.push({ id: `order:${row.id}`, title: "Pesanan perlu ditindaklanjuti", detail: `${row.customer_name} · ${row.status}`, href: role === "owner" ? "/admin/owner/pesanan" : "/admin/manager", createdAt: row.created_at });
  }

  if (hasAnyRole(role, "manager")) {
    const { data, error } = await db.from("orders").select("id, customer_name, status, created_at").eq("status", "submitted_to_manager").order("created_at", { ascending: false }).limit(25);
    if (error) throw error;
    for (const row of data ?? []) tasks.push({ id: `manager-order:${row.id}`, title: "Pesanan menunggu keputusan Manager", detail: `${row.customer_name} · ${row.id}`, href: role === "owner" ? "/admin/owner/pesanan" : "/admin/manager", createdAt: row.created_at });
  }

  if (hasAnyRole(role, "marketing", "proyek")) {
    const { data, error } = await db.from("custom_requests").select("id, nama, layanan, created_at").eq("status", "submitted").order("created_at", { ascending: false }).limit(25);
    if (error) throw error;
    for (const row of data ?? []) tasks.push({ id: `custom:${row.id}`, title: "Permintaan jasa custom baru", detail: `${row.nama} · ${row.layanan}`, href: `${role === "owner" ? "/admin/owner/pesanan" : "/admin/marketing/pesanan"}?requestId=${row.id}`, createdAt: row.created_at });
  }

  if (role === "gudang") {
    const { data, error } = await db.from("gudang_production_requests").select("id, spk_label, requester_name, created_at").eq("status", "diajukan").order("created_at", { ascending: false }).limit(25);
    if (error) throw error;
    for (const row of data ?? []) tasks.push({ id: `production-request:${row.id}`, title: "Permintaan material menunggu ACC", detail: `${row.spk_label || row.id} · ${row.requester_name}`, href: "/admin/gudang", createdAt: row.created_at });
  }

  if (hasAnyRole(role, "proyek", "produksi")) {
    let query = db.from("pm_orders").select("id, contractor_name, project_status, drawing_status, created_at").order("created_at", { ascending: false }).limit(50);
    if (role === "proyek") query = query.or("project_status.eq.menunggu_acc,drawing_status.eq.menunggu_acc");
    if (role === "produksi") query = query.in("project_status", ["siap_produksi", "produksi"]);
    if (role === "owner") query = query.or("project_status.eq.menunggu_acc,drawing_status.eq.menunggu_acc,project_status.eq.siap_produksi,project_status.eq.produksi");
    const { data, error } = await query;
    if (error) throw error;
    for (const row of data ?? []) tasks.push({ id: `pm-order:${row.id}`, title: "Tugas proyek menunggu tindak lanjut", detail: `${row.contractor_name} · ${row.project_status}`, href: role === "owner" ? "/admin/owner/proyek" : role === "produksi" ? "/admin/produksi" : "/admin/pm/approval", createdAt: row.created_at });
  }

  if (hasAnyRole(role, "field", "manager")) {
    const { data, error } = await db.from("field_deliveries").select("id, contractor_name, status, created_at").in("status", ["siap-kirim", "dalam-pengiriman"]).order("created_at", { ascending: false }).limit(25);
    if (error) throw error;
    for (const row of data ?? []) tasks.push({ id: `delivery:${row.id}`, title: "Tugas pengiriman aktif", detail: `${row.contractor_name} · ${row.status}`, href: role === "owner" ? "/admin/owner/field" : role === "manager" ? "/admin/manager" : "/admin/field", createdAt: row.created_at });
  }

  if (hasAnyRole(role, "gudang", "manager")) {
    const { data, error } = await db.from("gudang_inventory_items").select("id, item_name, current_stock, updated_at").lte("current_stock", 15).order("current_stock", { ascending: true }).limit(25);
    if (error) throw error;
    for (const row of data ?? []) {
      const stock = row.current_stock ?? 0;
      tasks.push({ id: `low-stock:${row.id}`, title: stock <= 0 ? "Stok barang habis" : "Stok barang menipis", detail: `${row.item_name} · sisa ${Math.max(0, stock)}`, href: "/admin/gudang", createdAt: row.updated_at });
    }
  }

  return tasks.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 50);
}
