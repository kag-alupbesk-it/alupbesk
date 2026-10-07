import { db } from "@/services/supabase";
import type { FinanceDashboardState } from "./types";

export async function saveFinanceDashboard(
  state: FinanceDashboardState,
): Promise<FinanceDashboardState> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { data, error } = await db
    .from("finance_dashboard")
    .upsert({ id: 1, state, updated_at: new Date().toISOString() })
    .select("state")
    .single();
  if (error) throw error;
  return data.state as FinanceDashboardState;
}
