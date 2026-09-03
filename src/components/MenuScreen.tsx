"use client";

import { useState, useMemo, useEffect } from "react";
import { Category, Product } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitch from "@/components/LanguageSwitch";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import MostLoved from "@/components/MostLoved";
import CartBar from "@/components/CartBar";
import QrLocationCapture from "@/components/QrLocationCapture";
import HatMark from "@/components/HatMark";

interface MostLovedItem {
  product_id: string;
  name_tr: string;
  name_en: string;
  price: number;
  image_url: string | null;
}

export default function MenuScreen({
  categories,
  products,
  mostLoved,
  orderingOpen,
  closedMessageTr,
  closedMessageEn
}: {
  categories: Category[];
  products: Product[];
  mostLoved: MostLovedItem[];
  orderingOpen: boolean;
  closedMessageTr: string;
  closedMessageEn: string;
}) {
  const { lang, t } = useLanguage();
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");

  useEffect(() => {
    if (categories.length && !categories.find((c) => c.id === activeId)) {
      setActiveId(categories[0].id);
    }
  }, [categories, activeId]);

  const visibleProducts = useMemo(
    () => products.filter((p) => p.category_id === activeId && p.active),
    [products, activeId]
  );

  function handleSelect(id: string) {
    setActiveId(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen pb-32">
      <QrLocationCapture />

      <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur">
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-ink/15">
          <HatMark size={34} />
          <div className="flex-1">
            <h1 className="font-display font-medium text-2xl tracking-[0.14em] leading-none">S‑CAFE</h1>
            <p className="font-body text-[10px] tracking-[0.16em] uppercase text-ink/50 mt-1">{t.cta}</p>
          </div>
          <LanguageSwitch />
        </div>
        <CategoryNav categories={categories} activeId={activeId} onSelect={handleSelect} />
      </header>

      <main className="px-5">
        {!orderingOpen && (
          <div className="border border-gold/50 bg-gold/5 text-deep text-sm font-body italic px-4 py-3 mt-4">
            {lang === "tr" ? closedMessageTr : closedMessageEn}
          </div>
        )}

        <MostLoved items={mostLoved} />

        <div id={`cat-${activeId}`}>
          <h2 className="font-display font-normal text-[28px] pt-6 pb-1">
            {lang === "tr"
              ? categories.find((c) => c.id === activeId)?.name_tr
              : categories.find((c) => c.id === activeId)?.name_en}
          </h2>
          <div className="h-px bg-gold/50 mb-2" />
          <div>
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>

      {orderingOpen && <CartBar />}
    </div>
  );
}
