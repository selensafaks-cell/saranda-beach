"use client";

import { useState } from "react";
import { OrderStatus } from "@/lib/types";

interface OrderRow {
  id: string;
  public_order_number: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string | null;
  status: OrderStatus;
  total: number;
  note: string | null;
  created_at: string;
  location_number: string | null;
  locations: { name_tr: string }[] | null;
  order_items: { name_tr: string; quantity: number; unit_price: number }[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Alındı",
  accepted: "Kabul Edildi",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi"
};

function toCsv(orders: OrderRow[]): string {
  const header = ["Sipariş No", "Tarih", "Saat", "Ad Soyad", "Telefon", "Konum", "Ürünler", "Not", "Durum", "Toplam TL"];
  const rows = orders.map((o) => {
    const date = new Date(o.created_at);
    const items = o.order_items.map((i) => `${i.quantity}x ${i.name_tr}`).join(" | ");
    const location = [o.locations?.[0]?.name_tr, o.location_number].filter(Boolean).join(" ");
    return [
      o.public_order_number,
      date.toLocaleDateString("tr-TR"),
      date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      `${o.customer_first_name} ${o.customer_last_name}`,
      o.customer_phone ?? "",
      location,
      items,
      o.note ?? "",
      STATUS_LABEL[o.status],
      o.total
    ]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

function downloadCsv(orders: OrderRow[]) {
  const csv = toCsv(orders);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `siparisler-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryView({ orders }: { orders: OrderRow[] }) {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalSum = filtered.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-display font-semibold text-lg">Sipariş Geçmişi</h1>
        <button
          onClick={() => downloadCsv(filtered)}
          className="bg-wine text-white text-sm font-semibold rounded-lg px-3 py-2"
        >
          CSV İndir
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
        {(["all", "delivered", "cancelled", "received", "accepted", "preparing", "on_the_way"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                filter === s ? "bg-deep text-white" : "bg-white text-ink/70"
              }`}
            >
              {s === "all" ? "Hepsi" : STATUS_LABEL[s]}
            </button>
          )
        )}
      </div>

      <p className="text-sm text-ink/50 mb-3">
        {filtered.length} sipariş · Toplam {totalSum.toLocaleString("tr-TR")} TL
      </p>

      <div className="flex flex-col gap-2">
        {filtered.map((order) => (
          <div key={order.id} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">
                #{order.public_order_number} — {order.customer_first_name} {order.customer_last_name}
              </p>
              <p className="text-sm font-semibold text-deep">{order.total} TL</p>
            </div>
            <p className="text-xs text-ink/50 mt-0.5">
              {new Date(order.created_at).toLocaleString("tr-TR")} · {STATUS_LABEL[order.status]}
              {order.locations?.[0]?.name_tr ? ` · ${order.locations[0].name_tr}` : ""}
              {order.location_number ? ` ${order.location_number}` : ""}
            </p>
            <p className="text-xs text-ink/60 mt-1">
              {order.order_items.map((i) => `${i.quantity}× ${i.name_tr}`).join(", ")}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-ink/40 py-12">Bu filtrede sipariş yok</p>
        )}
      </div>
    </div>
  );
}
