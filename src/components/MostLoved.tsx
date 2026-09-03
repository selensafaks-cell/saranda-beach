"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import HatMark from "@/components/HatMark";
import ScallopDivider from "@/components/ScallopDivider";

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
    <section className="pt-5">
      <div className="flex items-center gap-2 mb-2">
        <HatMark size={20} />
        <h2 className="font-display font-medium text-[18px] tracking-[0.04em]">{t.mostLoved}</h2>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-2 -mx-5 px-5">
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
            className="shrink-0 w-40 border border-ink/15 rounded p-3 text-left"
          >
            <p className="font-display text-[16px] font-semibold leading-snug">
              {lang === "tr" ? item.name_tr : item.name_en}
            </p>
            <p className="font-display text-[15px] text-deep tabular-nums mt-2">{item.price} ₺</p>
          </button>
        ))}
      </div>
      <div className="mt-4">
        <ScallopDivider />
      </div>
    </section>
  );
}
