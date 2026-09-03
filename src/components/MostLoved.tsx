"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

interface MostLovedItem {
  product_id: string;
  name_tr: string;
  name_en: string;
  price: number;
  image_url: string | null;
}

export default function MostLoved({ items }: { items: MostLovedItem[] }) {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();

  if (items.length === 0) return null;

  return (
    <section className="mb-4">
      <h2 className="font-display font-semibold text-lg mb-2 px-0.5">🔥 {t.mostLoved}</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
        {items.map((item) => (
          <button
            key={item.product_id}
            onClick={() =>
              addItem({
                product_id: item.product_id,
                name_tr: item.name_tr,
                name_en: item.name_en,
                unit_price: item.price
              })
            }
            className="shrink-0 w-36 bg-white rounded-2xl p-3 shadow-sm text-left active:scale-95 transition"
          >
            <div className="w-full h-20 rounded-xl bg-sand mb-2" />
            <p className="text-sm font-semibold leading-tight line-clamp-2">
              {lang === "tr" ? item.name_tr : item.name_en}
            </p>
            <p className="text-coral text-sm font-semibold mt-1">{item.price} TL</p>
          </button>
        ))}
      </div>
    </section>
  );
}
