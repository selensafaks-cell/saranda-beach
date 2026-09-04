"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
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

function downloadExcel(orders: OrderRow[]) {
  // Sheet 1: grouped by person - so a repeat customer's total is visible
  // at a glance instead of scrolling through scattered rows.
  const byPerson = new Map<string, { count: number; total: number }>();
  for (const o of orders) {
    const name = `${o.customer_first_name} ${o.customer_last_name}`.trim() || "İsimsiz";
    const existing = byPerson.get(name) ?? { count: 0, total: 0 };
    existing.count += 1;
    existing.total += o.total;
    byPerson.set(name, existing);
  }
  const summaryRows = Array.from(byPerson.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, { count, total }]) => ({
      "Ad Soyad": name,
      "Sipariş Sayısı": count,
      "Toplam TL": total
    }));

  // Sheet 2: full detail, sorted by person so the same customer's orders
  // sit together (segmented) instead of pure chronological order.
  const sorted = [...orders].sort((a, b) => {
    const nameA = `${a.customer_first_name} ${a.customer_last_name}`;
    const nameB = `${b.customer_first_name} ${b.customer_last_name}`;
    if (nameA !== nameB) return nameA.localeCompare(nameB, "tr");
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  const detailRows = sorted.map((o) => {
    const date = new Date(o.created_at);
    const items = o.order_items.map((i) => `${i.quantity}x ${i.name_tr}`).join(", ");
    const location = [o.locations?.[0]?.name_tr, o.location_number].filter(Boolean).join(" ");
    return {
      "Sipariş No": o.public_order_number,
      "Ad Soyad": `${o.customer_first_name} ${o.customer_last_name}`,
      Tarih: date.toLocaleDateString("tr-TR"),
      Saat: date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      Telefon: o.customer_phone ?? "",
      Konum: location,
      Ürünler: items,
      Not: o.note ?? "",
      Durum: STATUS_LABEL[o.status],
      "Toplam TL": o.total
    };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Özet");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(detailRows), "Tüm Siparişler");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `siparisler-${today}.xlsx`);
}

function computeBestsellers(orders: OrderRow[], days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const counts = new Map<string, number>();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    if (new Date(order.created_at).getTime() < cutoff) continue;
    for (const item of order.order_items) {
      counts.set(item.name_tr, (counts.get(item.name_tr) ?? 0) + item.quantity);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

export default function HistoryView({ orders: initialOrders }: { orders: OrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState(false);

  const bestsellers = computeBestsellers(orders, 7);

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
            onClick={() => downloadExcel(filtered)}
            className="bg-wine text-white text-sm font-semibold rounded-lg px-3 py-2"
          >
            Excel İndir
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

      {bestsellers.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <p className="font-display font-semibold text-[16px] mb-2">🔥 Bu Hafta En Çok Satılanlar</p>
          <div className="flex flex-col gap-1.5">
            {bestsellers.map(([name, qty], i) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">
                  {i + 1}. {name}
                </span>
                <span className="font-semibold text-deep">{qty} adet</span>
              </div>
            ))}
          </div>
        </div>
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
