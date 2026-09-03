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
import ScallopDivider from "@/components/ScallopDivider";

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

  const activeCategory = categories.find((c) => c.id === activeId);

  return (
    <div className="min-h-screen pb-32">
      <QrLocationCapture />

      {/* Hero: your finished brand poster, shown as-is - no overlay needed
          since it already carries the logo, name, and tagline. */}
      <div className="relative w-full bg-[#FDF4D6]">
        <img
          src="/hero-brand.png"
          alt="Saranda Cafe"
          className="w-full h-auto max-h-80 object-contain mx-auto"
        />
        <div className="absolute top-4 right-4">
          <LanguageSwitch />
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur">
        <CategoryNav categories={categories} activeId={activeId} onSelect={handleSelect} />
      </header>

      <main className="px-5">
        {!orderingOpen && (
          <div className="border border-wine/50 bg-wine/5 text-deep text-sm font-body italic px-4 py-3 mt-4">
            {lang === "tr" ? closedMessageTr : closedMessageEn}
          </div>
        )}

        <MostLoved items={mostLoved} />

        <div id={`cat-${activeId}`}>
          <h2 className="font-display font-normal text-[28px] pt-6 pb-2">
            {lang === "tr" ? activeCategory?.name_tr : activeCategory?.name_en}
          </h2>
          <ScallopDivider />
          <div className="mt-1">
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
