"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { OrderStatus } from "@/lib/types";
import { cancelOrder } from "@/lib/actions/orders";
import BeachMark from "@/components/BeachMark";

const STEPS: OrderStatus[] = ["received", "preparing", "delivered"];

export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const { lang, t } = useLanguage();
  const [order, setOrder] = useState<{
    public_order_number: number;
    status: OrderStatus;
    total: number;
  } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function fetchOrder() {
      const { data } = await supabase
        .from("orders")
        .select("public_order_number, status, total")
        .eq("id", params.id)
        .single();
      if (data) setOrder(data);
    }

    fetchOrder();
    const interval = setInterval(fetchOrder, 6000); // poll - reliable on weak beach wifi
    return () => clearInterval(interval);
  }, [params.id]);

  async function handleCancel() {
    const confirmed = window.confirm(
      lang === "tr" ? "Siparişi iptal etmek istediğine emin misin?" : "Cancel this order?"
    );
    if (!confirmed) return;
    setCancelling(true);
    const result = await cancelOrder(params.id);
    setCancelling(false);
    if (!("error" in result)) {
      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
    }
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center font-body italic text-ink/40">...</div>;
  }

  const stepIndex = order.status === "cancelled" ? -1 : STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen px-6 pt-6 flex flex-col items-center text-center">
      <div className="w-full max-w-sm text-left mb-6">
        <Link href="/" className="font-body text-[13px] text-deep underline">
          ← {lang === "tr" ? "Menüye Dön" : "Back to Menu"}
        </Link>
      </div>

      <BeachMark size={110} />
      <h1 className="font-display font-medium text-[26px] mt-4 mb-1">
        {order.status === "cancelled" ? (lang === "tr" ? "Sipariş İptal Edildi" : "Order Cancelled") : t.orderReceived}
      </h1>
      <p className="font-body text-[13px] italic text-ink/50 mb-8">#{order.public_order_number}</p>

      <div className="w-full max-w-sm">
        {STEPS.map((step, i) => {
          const reached = i <= stepIndex;
          return (
            <div
              key={step}
              className="flex items-center gap-3 py-3 border-b border-ink/12 last:border-0"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${reached ? "bg-wine" : "bg-ink/20"}`}
              />
              <span
                className={`font-display text-[16px] ${reached ? "text-ink" : "text-ink/35"}`}
              >
                {t.orderStatus[step]}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-8 font-display text-[18px] text-deep">
        {t.total}: {order.total} ₺
      </p>

      {order.status === "received" && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-6 font-body text-[13px] text-wine/80 underline disabled:opacity-50"
        >
          {cancelling ? "..." : lang === "tr" ? "Siparişi İptal Et" : "Cancel Order"}
        </button>
      )}
    </div>
  );
}
