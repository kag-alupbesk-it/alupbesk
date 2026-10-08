import { db } from "@/services/supabase";
import type { FieldDelivery } from "@/services/field/types";
import { mapFieldDelivery } from "./mapFieldDelivery";

interface Input {
  signatureImagePath: string;
  projectImagePath: string;
}

export async function submitFieldPod(
  id: string,
  input: Input,
): Promise<FieldDelivery> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { data: delivery, error: readError } = await db
    .from("field_deliveries")
    .select("*, field_delivery_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw readError;
  if (!delivery) throw new Error("DELIVERY_NOT_FOUND");

  const allSent = (delivery.field_delivery_items ?? []).every(
    (item: { quantity: number; quantity_shipped: number }) =>
      Number(item.quantity_shipped) >= Number(item.quantity),
  );
  const { data: updated, error } = await db
    .from("field_deliveries")
    .update({
      signature_image_url: input.signatureImagePath,
      project_image_url: input.projectImagePath,
      status: allSent ? "selesai-kirim" : "dalam-pengiriman",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, field_delivery_items(*)")
    .single();
  if (error) throw error;
  return mapFieldDelivery(updated);
}
