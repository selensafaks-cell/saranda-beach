"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { customerSignOut, joinHousehold } from "@/lib/actions/customerAuth";
import { useCart } from "@/context/CartContext";
import { OrderStatus } from "@/lib/types";

interface OrderRow {
  id: string;
  public_order_number: number;
  status: OrderStatus;
  total: number;
  created_at: string;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Alındı",
  accepted: "Kabul Edildi",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi"
};

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ first_name: string; last_name: string } | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [daireInput, setDaireInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/account/login");
        return;
      }

      const [{ data: customer }, { data: orderRows }] = await Promise.all([
        supabase.from("customers").select("first_name, last_name").eq("id", user.id).single(),
        supabase
          .from("orders")
          .select("id, public_order_number, status, total, created_at")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      setProfile(customer);
      setOrders(orderRows ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleJoin() {
    setJoining(true);
    setJoinMessage(null);
    const result = await joinHousehold(daireInput);
    setJoining(false);
    if ("error" in result) {
      setJoinMessage("Bir sorun oluştu, tekrar dene.");
      return;
    }
    setJoinMessage("Daireye bağlandın ✓");
  }

  async function handleReorder() {
    const lastOrder = orders.find((o) => o.status !== "cancelled");
    if (!lastOrder) return;
    setReordering(true);
    setReorderMessage(null);

    const supabase = createClient();
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity, name_tr")
      .eq("order_id", lastOrder.id);

    if (!items || items.length === 0) {
      setReordering(false);
      setReorderMessage("Bu siparişin ürünleri bulunamadı.");
      return;
    }

    const productIds = items.map((i) => i.product_id).filter(Boolean);
    const { data: products } = await supabase
      .from("products")
      .select("id, name_tr, name_en, price, active, sold_out")
      .in("id", productIds);

    let addedCount = 0;
    let skippedCount = 0;
    for (const item of items) {
      const product = products?.find((p) => p.id === item.product_id);
      if (!product || !product.active || product.sold_out) {
        skippedCount++;
        continue;
      }
      addItem(
        {
          product_id: product.id,
          name_tr: product.name_tr,
          name_en: product.name_en,
          unit_price: product.price
        },
        item.quantity
      );
      addedCount++;
    }

    setReordering(false);
    if (addedCount === 0) {
      setReorderMessage("Bu siparişteki ürünlerin hiçbiri artık mevcut değil.");
      return;
    }
    if (skippedCount > 0) {
      setReorderMessage(`${skippedCount} ürün artık mevcut değil, sepete eklenmedi. Sepete yönlendiriliyorsun...`);
    }
    setTimeout(() => router.push("/checkout"), skippedCount > 0 ? 1400 : 300);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-body italic text-ink/40">...</div>;
  }

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen px-5 pt-8 pb-16 bg-paper">
      <Link href="/" className="font-body text-[13px] text-deep underline">
        ← Menüye Dön
      </Link>
      <div className="flex items-center justify-between mb-1 mt-3">
        <h1 className="font-display font-medium text-[24px]">
          {profile ? `${profile.first_name} ${profile.last_name}` : "Hesabım"}
        </h1>
        <button
          onClick={async () => {
            await customerSignOut();
            router.push("/");
          }}
          className="font-body text-[13px] text-wine underline"
        >
          Çıkış
        </button>
      </div>
      <p className="font-body text-[13px] italic text-ink/50 mb-6">
        Toplam harcama: <span className="text-deep not-italic font-semibold">{totalSpent} ₺</span>
      </p>

      <div className="border border-ink/15 rounded-lg p-4 mb-6">
        <p className="font-display text-[16px] mb-2">Daireni Ekle</p>
        <p className="font-body text-[12px] italic text-ink/50 mb-3">
          Siparişlerinin daireyle ilişkilendirilmesi için daire numaranı gir.
        </p>
        <div className="flex gap-2">
          <input
            className="flex-1 font-body border border-ink/20 rounded px-3 py-2 text-[14px] bg-transparent"
            placeholder="Örn: 14"
            value={daireInput}
            onChange={(e) => setDaireInput(e.target.value)}
          />
          <button
            onClick={handleJoin}
            disabled={joining || !daireInput.trim()}
            className="border border-wine text-wine text-[13px] font-semibold rounded px-4 disabled:opacity-50"
          >
            {joining ? "..." : "Ekle"}
          </button>
        </div>
        {joinMessage && <p className="font-body text-[12px] text-deep mt-2">{joinMessage}</p>}
      </div>

      {orders.some((o) => o.status !== "cancelled") && (
        <div className="mb-6">
          <button
            onClick={handleReorder}
            disabled={reordering}
            className="w-full border border-wine text-wine font-display text-[15px] tracking-[0.05em] uppercase rounded py-3 disabled:opacity-50"
          >
            {reordering ? "..." : "Son Siparişini Tekrarla"}
          </button>
          {reorderMessage && (
            <p className="font-body text-[12px] text-deep mt-2 text-center">{reorderMessage}</p>
          )}
        </div>
      )}

      <h2 className="font-display text-[18px] mb-2">Siparişlerim</h2>
      <div className="flex flex-col">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between py-3 border-b border-ink/12">
            <div>
              <p className="font-display text-[15px]">#{order.public_order_number}</p>
              <p className="font-body text-[11px] italic text-ink/45">
                {new Date(order.created_at).toLocaleString("tr-TR")} · {STATUS_LABEL[order.status]}
              </p>
            </div>
            <p className="font-display text-[15px] text-wine">{order.total} ₺</p>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="font-body italic text-ink/40 text-center py-8">Henüz siparişin yok</p>
        )}
      </div>
    </div>
  );
}
