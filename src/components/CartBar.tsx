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
    <button
      onClick={() => router.push("/checkout")}
      className="fixed bottom-4 left-4 right-4 z-30 bg-deepsea text-white rounded-2xl py-4 px-5 shadow-lg flex items-center justify-between active:scale-[0.98] transition"
    >
      <span className="font-semibold">
        {t.cart} · {itemCount} {t.items}
      </span>
      <span className="font-bold">{total} TL</span>
    </button>
  );
}
