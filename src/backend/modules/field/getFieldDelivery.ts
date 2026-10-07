import { db } from "@/services/supabase";
import type { FieldDelivery } from "@/services/field/types";
import { mapFieldDelivery } from "./mapFieldDelivery";

export async function getFieldDelivery(id: string): Promise<FieldDelivery | null> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { data, error } = await db
    .from("field_deliveries")
    .select("*, field_delivery_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapFieldDelivery(data) : null;
}
