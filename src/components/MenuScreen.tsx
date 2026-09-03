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
      <header className="sticky top-0 z-30 bg-sand/95 backdrop-blur px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-deepsea">S-Cafe</h1>
          <p className="text-xs text-charcoal/60">{t.cta}</p>
        </div>
        <LanguageSwitch />
      </header>

      <main className="px-4">
        {!orderingOpen && (
          <div className="bg-terracotta/10 border border-terracotta/30 text-terracotta text-sm font-medium rounded-xl px-4 py-3 mb-4">
            {lang === "tr" ? closedMessageTr : closedMessageEn}
          </div>
        )}

        <MostLoved items={mostLoved} />

        <CategoryNav categories={categories} activeId={activeId} onSelect={handleSelect} />

        <div id={`cat-${activeId}`} className="flex flex-col gap-3 mt-3">
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>

      {orderingOpen && <CartBar />}
    </div>
  );
}
