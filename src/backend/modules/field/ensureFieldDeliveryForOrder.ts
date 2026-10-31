import { db } from "@/services/supabase";

interface OrderItemRow {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  technical_note: string | null;
}

interface OrderRow {
  id: string;
  contractor_name: string;
  contractor_code: string;
  project_address: string | null;
  contractor_phone: string | null;
  pm_order_items?: OrderItemRow[] | null;
}

export async function ensureFieldDeliveryForOrder(order: OrderRow): Promise<void> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

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
  if (!delivery) return;

  const items = (order.pm_order_items ?? []).map((item, index) => ({
    id: item.id,
    delivery_id: delivery.id,
    name: item.name,
    category: "Material",
    specification: item.technical_note ?? "",
    unit: item.unit,
    quantity: Number(item.quantity),
    sort_order: index,
  }));
  if (items.length) {
    const { error: itemError } = await db
      .from("field_delivery_items")
      .upsert(items, { onConflict: "id", ignoreDuplicates: true });
    if (itemError) throw itemError;
  }
}
