"use client";

import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { lang, t } = useLanguage();

  const name = lang === "tr" ? product.name_tr : product.name_en;
  const description = lang === "tr" ? product.description_tr : product.description_en;

  function handleAdd() {
    if (product.sold_out) return;
    addItem({
      product_id: product.id,
      name_tr: product.name_tr,
      name_en: product.name_en,
      unit_price: product.price
    });
  }

  return (
    <button
      onClick={handleAdd}
      disabled={product.sold_out}
      className="w-full flex items-start justify-between gap-4 py-4 border-b border-ink/12 text-left disabled:opacity-50"
    >
      <div className="flex-1 min-w-0">
        <p className="font-display text-[19px] font-semibold leading-snug">{name}</p>
        {description && (
          <p className="font-body text-[12px] italic text-ink/50 mt-0.5">{description}</p>
        )}
        {product.includes_fries && (
          <p className="font-body text-[11px] italic text-ink/40 mt-0.5">{t.friesIncluded}</p>
        )}
      </div>
      <div className="shrink-0 text-right pt-0.5 flex items-center gap-2">
        {product.sold_out ? (
          <span className="font-body text-[12px] italic text-ink/40">{t.soldOut}</span>
        ) : (
          <>
            <span className="font-display text-[18px] text-deep tabular-nums">{product.price} ₺</span>
            <span className="w-6 h-6 flex items-center justify-center border border-gold rounded-full text-gold text-[14px] leading-none">
              +
            </span>
          </>
        )}
      </div>
    </button>
  );
}
