"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/lib/actions/updateOrderStatus";
import { OrderStatus } from "@/lib/types";

interface OrderRow {
  id: string;
  public_order_number: number;
  customer_first_name: string;
  customer_last_name: string;
  status: OrderStatus;
  total: number;
  note: string | null;
  created_at: string;
  location_number: string | null;
  locations: { name_tr: string } | null;
  order_items: { name_tr: string; quantity: number; unit_price: number; line_note: string | null }[];
}

const GROUPS: { status: OrderStatus; label: string }[] = [
  { status: "received", label: "YENİ" },
  { status: "accepted", label: "KABUL EDİLDİ" },
  { status: "preparing", label: "HAZIRLANIYOR" },
  { status: "on_the_way", label: "YOLDA" }
];

const NEXT_ACTION: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  received: { next: "accepted", label: "Kabul Et" },
  accepted: { next: "preparing", label: "Hazırlanıyor" },
  preparing: { next: "on_the_way", label: "Yola Çıktı" },
  on_the_way: { next: "delivered", label: "Teslim Edildi" }
};

export default function OrdersBoard() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchOrders() {
      const { data } = await supabase
        .from("orders")
        .select(
          "id, public_order_number, customer_first_name, customer_last_name, status, total, note, created_at, location_number, locations(name_tr), order_items(name_tr, quantity, unit_price, line_note)"
        )
        .in("status", ["received", "accepted", "preparing", "on_the_way"])
        .order("created_at", { ascending: true });

      if (data) {
        const incoming = data as unknown as OrderRow[];
        const newOnes = incoming.filter((o) => !knownIds.current.has(o.id));
        if (newOnes.length > 0 && knownIds.current.size > 0) {
          audioRef.current?.play().catch(() => {
            // browser blocked autoplay until first user interaction - expected
          });
        }
        incoming.forEach((o) => knownIds.current.add(o.id));
        setOrders(incoming);
      }
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleAdvance(order: OrderRow) {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: action.next } : o)));
    await updateOrderStatus(order.id, action.next);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* silent beep sound, base64 tiny wav - replace with your own audio file if you like */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" />

      {GROUPS.map((group) => {
        const groupOrders = orders.filter((o) => o.status === group.status);
        if (groupOrders.length === 0) return null;
        return (
          <section key={group.status}>
            <h2 className="font-bold text-sm text-charcoal/60 mb-2">{group.label}</h2>
            <div className="flex flex-col gap-2">
              {groupOrders.map((order) => {
                const isOpen = expanded === order.id;
                const action = NEXT_ACTION[order.status];
                return (
                  <div key={order.id} className="bg-white rounded-xl p-3 shadow-sm">
                    <button
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="font-semibold text-sm">
                        #{order.public_order_number} — {order.locations?.name_tr ?? "—"}
                        {order.location_number ? ` ${order.location_number}` : ""} — {order.total} TL
                      </span>
                      <span className="text-xs text-charcoal/40">
                        {new Date(order.created_at).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="mt-3 border-t border-black/5 pt-3">
                        <p className="text-sm font-semibold mb-1">
                          {order.customer_first_name} {order.customer_last_name}
                        </p>
                        <ul className="text-sm text-charcoal/70 mb-2">
                          {order.order_items.map((item, idx) => (
                            <li key={idx}>
                              {item.quantity}× {item.name_tr}
                              {item.line_note ? ` (${item.line_note})` : ""}
                            </li>
                          ))}
                        </ul>
                        {order.note && (
                          <p className="text-sm text-terracotta mb-2">Not: {order.note}</p>
                        )}
                      </div>
                    )}

                    {action && (
                      <button
                        onClick={() => handleAdvance(order)}
                        className="mt-3 w-full bg-deepsea text-white rounded-xl py-2.5 font-semibold text-sm"
                      >
                        {action.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {orders.length === 0 && (
        <p className="text-center text-charcoal/40 py-12">Şu anda aktif sipariş yok</p>
      )}
    </div>
  );
}
