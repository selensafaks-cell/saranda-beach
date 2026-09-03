"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = ["received", "accepted", "preparing", "on_the_way", "delivered"];

export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const [order, setOrder] = useState<{
    public_order_number: number;
    status: OrderStatus;
    total: number;
  } | null>(null);

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

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">...</div>;
  }

  const stepIndex = order.status === "cancelled" ? -1 : STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen px-6 pt-16 flex flex-col items-center text-center">
      <div className="text-4xl mb-2">✓</div>
      <h1 className="font-display font-bold text-xl mb-1">{t.orderReceived}</h1>
      <p className="text-charcoal/60 mb-8">#{order.public_order_number}</p>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
              i <= stepIndex ? "bg-deepsea text-white" : "bg-white text-charcoal/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current shrink-0" />
            <span className="font-medium text-sm">{t.orderStatus[step]}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 font-semibold text-terracotta">{t.total}: {order.total} TL</p>
    </div>
  );
}
