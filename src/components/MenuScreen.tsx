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

      {/* Hero banner: the shoreline is the site's one signature shape - used
          here and on the cart bar only, nowhere else. */}
      <div className="relative bg-horizon">
        <div className="flex items-center justify-between px-4 pt-5 pb-8">
          <div className="flex items-center gap-2.5">
            <svg width="34" height="34" viewBox="0 0 60 60" fill="none">
              <path
                d="M40 16 C40 10, 28 10, 25 15 C22 20, 32 22, 36 25 C41 28, 42 33, 34 38 C27 42, 16 40, 13 34"
                stroke="#FF6B4A"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M13 34 C10 40, 10 46, 20 49 C30 52, 42 50, 46 44"
                stroke="#FF6B4A"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M46 41 C50 41, 51 36, 46 35" stroke="#FF6B4A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </svg>
            <div>
              <h1 className="font-display font-semibold text-xl text-white leading-none">S-Cafe</h1>
              <p className="text-[11px] text-white/60 mt-1">{t.cta}</p>
            </div>
          </div>
          <LanguageSwitch />
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full"
          height="20"
          viewBox="0 0 400 20"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L0,10 Q25,20 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10 T400,10 L400,0 Z"
            fill="#FAF6EC"
          />
        </svg>
      </div>

      <main className="px-4 -mt-1">
        {!orderingOpen && (
          <div className="bg-coral/10 border border-coral/30 text-coral text-sm font-medium rounded-xl px-4 py-3 mb-4 mt-3">
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
