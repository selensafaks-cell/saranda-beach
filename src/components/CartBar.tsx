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
      className="fixed bottom-4 left-4 right-4 z-30 active:scale-[0.98] transition"
    >
      <svg width="100%" height="14" viewBox="0 0 400 14" preserveAspectRatio="none" className="block">
        <path
          d="M0,14 L0,4 Q25,-6 50,4 T100,4 T150,4 T200,4 T250,4 T300,4 T350,4 T400,4 L400,14 Z"
          fill="#0B3B4A"
        />
      </svg>
      <div className="bg-horizon text-white rounded-b-2xl py-4 px-5 shadow-lg flex items-center justify-between -mt-px">
        <span className="font-semibold">
          {t.cart} · {itemCount} {t.items}
        </span>
        <span className="font-bold text-coral">{total} TL</span>
      </div>
    </button>
  );
}
