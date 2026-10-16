import { pmCutLists, removeCutList } from "./store";
import type { PMCutResult } from "./types";

export function deleteCutList(id: string): PMCutResult<{ id: string }> {
  if (!pmCutLists.has(id)) {
    return {
      ok: false,
      code: "CUT_LIST_NOT_FOUND",
      message: "Daftar potong tidak ditemukan.",
    };
  }
  removeCutList(id);
  return { ok: true, data: { id } };
}
