import { db } from "@/services/supabase";
import type { FieldDelivery } from "@/services/field/types";
import { ensureFieldDeliveryForOrder } from "./ensureFieldDeliveryForOrder";
import { mapFieldDelivery } from "./mapFieldDelivery";

export async function getFieldDeliveries(): Promise<FieldDelivery[]> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { data: orders, error } = await db
    .from("pm_orders")
    .select("*, pm_order_items(*)")
    .eq("project_status", "siap_kirim")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  for (const order of orders ?? []) {
    await ensureFieldDeliveryForOrder(order);
  }

  const { data: rows, error: listError } = await db
    .from("field_deliveries")
    .select("*, field_delivery_items(*)")
    .order("updated_at", { ascending: false });
  if (listError) throw listError;
  return (rows ?? []).map(mapFieldDelivery);
}
