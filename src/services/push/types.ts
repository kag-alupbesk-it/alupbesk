export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
}