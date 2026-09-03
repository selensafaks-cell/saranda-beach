"use server";

import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

export async function savePushSubscription(input: {
  staffUserId: string;
  endpoint: string;
  p256dh: string;
  authKey: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      staff_user_id: input.staffUserId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth_key: input.authKey
    },
    { onConflict: "endpoint" }
  );
  if (error) return { error: error.message };
  return { success: true };
}

export async function removePushSubscription(endpoint: string) {
  const supabase = createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) return { error: error.message };
  return { success: true };
}

export async function notifyStaffOfNewOrder(orderNumber: number, locationLabel: string) {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) return; // push not configured yet - silently skip

  webpush.setVapidDetails("mailto:admin@saranda-cafe.tr", vapidPublic, vapidPrivate);

  const supabase = createClient();
  const { data: subs } = await supabase.from("push_subscriptions").select("*");
  if (!subs || subs.length === 0) return;

  const payload = JSON.stringify({
    title: `Yeni Sipariş #${orderNumber}`,
    body: locationLabel || "Sipariş detayları için dokun"
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key }
          },
          payload
        );
      } catch (err: unknown) {
        // Subscription may be expired/revoked - remove it so we stop retrying it.
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    })
  );
}
