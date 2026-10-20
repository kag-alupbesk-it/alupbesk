import { db } from "@/services/supabase";
import { persistCutList } from "./store";
import type {
  CreateCutListInput,
  PMCutList,
  PMCutListItem,
  PMCutResult,
} from "./types";

function buildItems(
  cutListId: string,
  inputs: CreateCutListInput["items"],
): PMCutListItem[] {
  return inputs.map((input, index) => ({
    id: `cli-${crypto.randomUUID()}`,
    cutListId,
    componentName: input.componentName.trim(),
    quantity: input.quantity,
    length: input.length ?? null,
    width: input.width ?? null,
    thickness: input.thickness ?? null,
    glassType: input.glassType ?? null,
    materialItemId: input.materialItemId ?? null,
    note: (input.note ?? "").trim(),
    sortOrder: index,
    allocations: [],
  }));
}

async function orderExists(orderId: string): Promise<boolean> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { data, error } = await db
    .from("pm_orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function createCutList(
  input: CreateCutListInput,
  createdBy: string,
): Promise<PMCutResult<PMCutList>> {
  if (!db) {
    return {
      ok: false,
      code: "DATABASE_UNAVAILABLE",
      message: "Database belum dikonfigurasi.",
    };
  }
  if (!(await orderExists(input.orderId))) {
    return {
      ok: false,
      code: "ORDER_NOT_FOUND",
      message: "SPK/order tidak ditemukan.",
    };
  }

  const now = new Date().toISOString();
  const id = `cut-${crypto.randomUUID()}`;
  const list: PMCutList = {
    id,
    orderId: input.orderId,
    title: (input.title ?? "").trim(),
    note: (input.note ?? "").trim(),
    status: "draft",
    createdBy,
    items: buildItems(id, input.items),
    createdAt: now,
    updatedAt: now,
  };
  persistCutList(list);
  return { ok: true, data: list };
}
