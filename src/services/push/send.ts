import webpush from "web-push";
import { deletePushSubscription, getPushSubscriptionsByRoles, type StoredSubscription } from "./subscriptions";
import type { PushNotificationPayload } from "./types";

const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@alupbesk.id";
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

let vapidConfigured = Boolean(publicKey && privateKey);

function ensureVapid(): void {
  if (vapidConfigured || !publicKey || !privateKey) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export async function sendPushToSubscriptions(
  subscriptions: StoredSubscription[],
  payload: PushNotificationPayload,
): Promise<void> {
  ensureVapid();
  if (!vapidConfigured || subscriptions.length === 0) return;
  const serialized = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { auth: subscription.auth, p256dh: subscription.p256dh },
          },
          serialized,
        );
      } catch (reason) {
        const statusCode = (reason as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscription(subscription.endpoint);
        }
      }
    }),
  );
}

export async function sendPushToRoles(
  roles: string[],
  payload: PushNotificationPayload,
): Promise<void> {
  try {
    const subscriptions = await getPushSubscriptionsByRoles(roles);
    await sendPushToSubscriptions(subscriptions, payload);
  } catch {
    // Notifikasi bersifat best-effort: kegagalan menyimpan/membaca subscription
    // tidak boleh menggagalkan mutasi pesanan yang sedang berjalan.
  }
}