"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CartBar() {
  const { itemCount, total } = useCart();
  const { t } = useLanguage();
  const router = useRouter();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-paper border-t border-ink/15 px-5 py-3.5 flex items-center gap-4">
      <div className="flex-1">
        <p className="font-body text-[10px] tracking-[0.14em] uppercase text-ink/50">{t.cart}</p>
        <p className="font-display text-[19px] tabular-nums">
          {itemCount} · {total} ₺
        </p>
      </div>
      <button
        onClick={() => router.push("/checkout")}
        className="font-display text-[15px] tracking-[0.1em] uppercase text-gold border border-gold rounded px-6 py-3"
      >
        {t.viewCart}
      </button>
    </div>
  );
}
