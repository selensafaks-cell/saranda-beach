"use client";

import Image from "next/image";
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
    <div className="flex gap-3 items-center bg-white rounded-2xl p-3 shadow-sm border border-black/5">
      {product.image_url ? (
        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-sand">
          <Image src={product.image_url} alt={name} fill sizes="80px" className="object-cover" />
        </div>
      ) : (
        <div className="w-20 h-20 shrink-0 rounded-xl bg-sand" />
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-base leading-tight truncate">{name}</h3>
        {description && (
          <p className="text-sm text-charcoal/60 line-clamp-2 mt-0.5">{description}</p>
        )}
        {product.includes_fries && (
          <span className="inline-block text-[11px] uppercase tracking-wide text-seafoam font-semibold mt-1">
            {t.friesIncluded}
          </span>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-terracotta">{product.price} TL</span>
          {product.sold_out ? (
            <span className="text-sm font-semibold text-charcoal/40">{t.soldOut}</span>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-deepsea text-white text-sm font-semibold rounded-full px-4 py-2 min-h-[40px] active:scale-95 transition"
            >
              + {t.add}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
