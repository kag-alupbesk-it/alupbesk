import { db } from "@/services/supabase";
import type { FieldDelivery } from "@/services/field/types";
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
    const deliveryId = `SJ-${order.id}`;
    const { error: syncError } = await db.from("field_deliveries").upsert(
      {
        id: deliveryId,
        pm_order_id: order.id,
        contractor_name: order.contractor_name,
        contractor_code: order.contractor_code,
        project_address: order.project_address ?? "",
        phone: order.contractor_phone ?? null,
        status: "siap-kirim",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (syncError) throw syncError;

    const { data: delivery, error: deliveryError } = await db
      .from("field_deliveries")
      .select("id")
      .eq("id", deliveryId)
      .maybeSingle();
    if (deliveryError) throw deliveryError;
    if (!delivery) continue;

    const items = (order.pm_order_items ?? []).map((item: {
      id: string;
      name: string;
      quantity: number;
      unit: string;
      technical_note: string | null;
    }, index: number) => ({
      id: item.id,
      delivery_id: delivery.id,
      name: item.name,
      category: "Material",
      specification: item.technical_note ?? "",
      unit: item.unit,
      quantity: item.quantity,
      sort_order: index,
    }));
    if (items.length) {
      const { error: itemError } = await db
        .from("field_delivery_items")
        .upsert(items, { onConflict: "id", ignoreDuplicates: true });
      if (itemError) throw itemError;
    }
  }

  const { data: rows, error: listError } = await db
    .from("field_deliveries")
    .select("*, field_delivery_items(*)")
    .order("updated_at", { ascending: false });
  if (listError) throw listError;
  return (rows ?? []).map(mapFieldDelivery);
}
