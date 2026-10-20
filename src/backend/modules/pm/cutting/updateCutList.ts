import { pmCutLists, persistCutList } from "./store";
import type {
  PMCutList,
  PMCutListItem,
  PMCutResult,
  UpdateCutListInput,
} from "./types";

function buildItems(
  cutListId: string,
  inputs: UpdateCutListInput["items"],
): PMCutListItem[] {
  return (inputs ?? []).map((input, index) => ({
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

export function updateCutList(
  id: string,
  input: UpdateCutListInput,
): PMCutResult<PMCutList> {
  const existing = pmCutLists.get(id);
  if (!existing) {
    return {
      ok: false,
      code: "CUT_LIST_NOT_FOUND",
      message: "Daftar potong tidak ditemukan.",
    };
  }
  if (input.items && existing.status !== "draft") {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Daftar potong yang sudah diproses tidak dapat diubah susunannya.",
    };
  }

  const updated: PMCutList = {
    ...existing,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    note: input.note !== undefined ? input.note.trim() : existing.note,
    items: input.items ? buildItems(id, input.items) : existing.items,
    updatedAt: new Date().toISOString(),
  };
  persistCutList(updated);
  return { ok: true, data: updated };
}
