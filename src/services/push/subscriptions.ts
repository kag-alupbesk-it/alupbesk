import { db } from "@/services/supabase";
import type { PushSubscriptionPayload } from "./types";

export interface StoredSubscription {
  endpoint: string;
  auth: string;
  p256dh: string;
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionPayload,
  userAgent?: string,
): Promise<void> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { error } = await db.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
      user_agent: userAgent ?? null,
    },
    { onConflict: "endpoint" },
  );
  if (error) throw error;
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  if (!db) return;
  await db.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function getPushSubscriptionsByRoles(
  roles: string[],
): Promise<StoredSubscription[]> {
  if (!db || roles.length === 0) return [];
  const { data: users } = await db.from("users").select("id").in("role", roles);
  const userIds = (users ?? []).map((user) => user.id);
  if (userIds.length === 0) return [];
  const { data, error } = await db
    .from("push_subscriptions")
    .select("endpoint, auth, p256dh")
    .in("user_id", userIds);
  if (error) throw error;
  return (data ?? []) as StoredSubscription[];
}