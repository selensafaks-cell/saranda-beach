"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { savePushSubscription } from "@/lib/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function NotificationOptIn() {
  const [status, setStatus] = useState<"idle" | "unsupported" | "denied" | "subscribed" | "loading">(
    "idle"
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // registration failed - opt-in button will surface this on click instead
    });

    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      if (existing) setStatus("subscribed");
    });
  }, []);

  async function handleEnable() {
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setStatus("unsupported");
        return;
      }
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("idle");
        return;
      }

      const json = subscription.toJSON();
      await savePushSubscription({
        staffUserId: user.id,
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        authKey: json.keys?.auth ?? ""
      });
      setStatus("subscribed");
    } catch {
      setStatus("idle");
    }
  }

  if (status === "unsupported") {
    return (
      <p className="text-xs text-ink/50">
        Bildirimler bu tarayıcıda desteklenmiyor. iPhone'da: Safari ile bu siteyi aç, Paylaş → Ana Ekrana
        Ekle, sonra oradan tekrar aç ve dene.
      </p>
    );
  }

  if (status === "subscribed") {
    return <p className="text-xs text-ink/50">Bildirimler açık ✓</p>;
  }

  return (
    <div>
      <button
        onClick={handleEnable}
        disabled={status === "loading"}
        className="bg-wine text-white text-sm font-semibold rounded-lg px-4 py-2.5"
      >
        {status === "loading" ? "Açılıyor..." : "Bildirimleri Etkinleştir"}
      </button>
      {status === "denied" && (
        <p className="text-xs text-wine mt-1">
          İzin verilmedi. iPhone Ayarlar → Bildirimler → Safari'den izin verebilirsin.
        </p>
      )}
    </div>
  );
}
