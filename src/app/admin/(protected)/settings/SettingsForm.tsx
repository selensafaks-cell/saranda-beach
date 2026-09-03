"use client";

import { useState } from "react";
import { toggleOrderingOpen, toggleWhatsappNotify } from "@/lib/actions/settings";
import NotificationOptIn from "@/components/NotificationOptIn";

export default function SettingsForm({
  settings
}: {
  settings: { ordering_open: boolean; whatsapp_notify_enabled: boolean; whatsapp_number: string } | null;
}) {
  const [open, setOpen] = useState(settings?.ordering_open ?? true);
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp_notify_enabled ?? false);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Sipariş Alımı</p>
          <p className="text-xs text-ink/50">{open ? "Açık" : "Kapalı"}</p>
        </div>
        <button
          onClick={async () => {
            const next = !open;
            setOpen(next);
            await toggleOrderingOpen(next);
          }}
          className={`w-14 h-8 rounded-full relative transition ${open ? "bg-wine" : "bg-ink/20"}`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white transition ${
              open ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">WhatsApp Bildirimi</p>
          <p className="text-xs text-ink/50">{settings?.whatsapp_number ?? "+90 551 553 09 02"}</p>
        </div>
        <button
          onClick={async () => {
            const next = !whatsapp;
            setWhatsapp(next);
            await toggleWhatsappNotify(next);
          }}
          className={`w-14 h-8 rounded-full relative transition ${
            whatsapp ? "bg-wine" : "bg-ink/20"
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white transition ${
              whatsapp ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="font-semibold text-sm mb-1">Sipariş Bildirimleri (Telefon)</p>
        <p className="text-xs text-ink/50 mb-3">
          Bu telefonda yeni sipariş geldiğinde bildirim almak için etkinleştir. iPhone'da önce siteyi Ana
          Ekrana eklemen gerekir (Safari → Paylaş → Ana Ekrana Ekle).
        </p>
        <NotificationOptIn />
      </div>

      <p className="text-xs text-ink/40 px-1">
        Kullanıcı yönetimi (Owner/Turan hesapları) Supabase panelinden yapılır.
      </p>
    </div>
  );
}
