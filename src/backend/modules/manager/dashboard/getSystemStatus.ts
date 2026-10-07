import { db } from "@/services/supabase";
import type { SystemStatus } from "../types";

export async function getSystemStatus(): Promise<SystemStatus> {
  if (!db) {
    return {
      serverGudang: "Database belum dikonfigurasi",
      dbLatency: "Tidak tersedia",
    };
  }

  const startedAt = Date.now();
  try {
    const { error } = await db
      .from("gudang_items")
      .select("id", { head: true, count: "exact" });

    if (error) {
      return {
        serverGudang: "Database tidak terhubung",
        dbLatency: "Tidak tersedia",
      };
    }

    return {
      serverGudang: "Online",
      dbLatency: `${Date.now() - startedAt} ms`,
    };
  } catch {
    return {
      serverGudang: "Database tidak terhubung",
      dbLatency: "Tidak tersedia",
    };
  }
}
