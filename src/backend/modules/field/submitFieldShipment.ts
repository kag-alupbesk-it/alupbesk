import { db } from "@/services/supabase";
import type { FieldArmada, FieldDelivery } from "@/services/field/types";
import { mapFieldDelivery } from "./mapFieldDelivery";

interface Input {
  armada: FieldArmada;
  kirim: { itemId: string; kuantitas: number }[];
}

export async function submitFieldShipment(
  id: string,
  input: Input,
): Promise<FieldDelivery> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { data: delivery, error } = await db
    .from("field_deliveries")
    .select("*, field_delivery_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!delivery) throw new Error("DELIVERY_NOT_FOUND");
  if (delivery.status === "selesai-kirim") throw new Error("STATUS_INVALID");

  const quantities = new Map<string, number>();
  for (const entry of input.kirim) {
    if (quantities.has(entry.itemId)) throw new Error("INVALID_INPUT");
    quantities.set(entry.itemId, entry.kuantitas);
  }
  const itemIds = new Set<string>(
    (delivery.field_delivery_items ?? []).map((item: { id: string }) => item.id),
  );
  if (
    [...quantities.keys()].some((key) => !itemIds.has(key)) ||
    ![...quantities.values()].some((amount) => amount > 0)
  ) {
    throw new Error("INVALID_INPUT");
  }

  const { error: saveError } = await db.rpc("field_submit_shipment", {
    delivery_id_input: id,
    shipment_items: input.kirim.map(({ itemId, kuantitas }) => ({
      item_id: itemId,
      quantity: kuantitas,
    })),
    driver_name_input: input.armada.namaSopir,
    plate_number_input: input.armada.platNomor,
    vehicle_type_input: input.armada.jenisArmada,
    shipped_at_input: new Date().toISOString(),
  });
  if (saveError) {
    if (
      saveError.message.includes("QUANTITY_EXCEEDED") ||
      saveError.message.includes("CONCURRENT_UPDATE")
    ) throw new Error("QUANTITY_EXCEEDED");
    if (saveError.message.includes("STATUS_INVALID")) throw new Error("STATUS_INVALID");
    throw saveError;
  }

  const { data: updated, error: readError } = await db
    .from("field_deliveries")
    .select("*, field_delivery_items(*)")
    .eq("id", id)
    .single();
  if (readError) throw readError;
  return mapFieldDelivery(updated);
}
