import { db } from "@/services/supabase";
import { EMPTY_FINANCE_STATE, type FinanceDashboardState } from "./types";

export async function getFinanceDashboard(): Promise<FinanceDashboardState> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { data, error } = await db
    .from("finance_dashboard")
    .select("state")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return (data?.state as FinanceDashboardState | undefined) ?? EMPTY_FINANCE_STATE;
}
