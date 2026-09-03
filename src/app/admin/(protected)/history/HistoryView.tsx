"use client";

import { useState } from "react";
import { OrderStatus } from "@/lib/types";
import { deleteOrder } from "@/lib/actions/orders";

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

export default function HistoryView({ orders: initialOrders }: { orders: OrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState(false);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalSum = filtered.reduce((sum, o) => sum + o.total, 0);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDeleteOne(order: OrderRow) {
    const confirmed = window.confirm(
      `#${order.public_order_number} numaralı siparişi tamamen silmek istediğine emin misin? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    await deleteOrder(order.id);
  }

  async function handleDeleteSelected() {
    const confirmed = window.confirm(
      `${selected.size} siparişi tamamen silmek istediğine emin misin? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;
    const ids = Array.from(selected);
    setOrders((prev) => prev.filter((o) => !selected.has(o.id)));
    setSelected(new Set());
    setSelecting(false);
    await Promise.all(ids.map((id) => deleteOrder(id)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-display font-semibold text-lg">Sipariş Geçmişi</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelecting((v) => !v);
              setSelected(new Set());
            }}
            className="bg-white border border-ink/20 text-ink/70 text-sm font-semibold rounded-lg px-3 py-2"
          >
            {selecting ? "İptal" : "Seç"}
          </button>
          <button
            onClick={() => downloadCsv(filtered)}
            className="bg-wine text-white text-sm font-semibold rounded-lg px-3 py-2"
          >
            CSV İndir
          </button>
        </div>
      </div>

      {selecting && selected.size > 0 && (
        <button
          onClick={handleDeleteSelected}
          className="w-full mb-3 bg-wine text-white text-sm font-semibold rounded-lg py-2.5"
        >
          {selected.size} Siparişi Sil
        </button>
      )}

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
          <div
            key={order.id}
            className={`bg-white rounded-xl p-3 shadow-sm ${selecting ? "flex items-start gap-2" : ""}`}
          >
            {selecting && (
              <input
                type="checkbox"
                checked={selected.has(order.id)}
                onChange={() => toggleSelected(order.id)}
                className="mt-1 w-4 h-4 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">
                  #{order.public_order_number} — {order.customer_first_name} {order.customer_last_name}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-semibold text-deep">{order.total} TL</p>
                  {!selecting && (
                    <button
                      onClick={() => handleDeleteOne(order)}
                      className="text-xs font-semibold text-wine/70 underline"
                    >
                      Sil
                    </button>
                  )}
                </div>
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
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-ink/40 py-12">Bu filtrede sipariş yok</p>
        )}
      </div>
    </div>
  );
}
