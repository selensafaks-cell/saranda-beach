"use client";

import { useState } from "react";
import { Category, Product } from "@/lib/types";
import { toggleSoldOut, toggleActive, updatePrice } from "@/lib/actions/menu";

export default function MenuEditor({
  categories,
  products
}: {
  categories: Category[];
  products: Product[];
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [localProducts, setLocalProducts] = useState(products);

  const visible = localProducts.filter((p) => p.category_id === activeCategory);

  function patchLocal(id: string, patch: Partial<Product>) {
    setLocalProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
              activeCategory === c.id ? "bg-terracotta text-white" : "bg-white text-charcoal/70"
            }`}
          >
            {c.name_tr}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {visible.map((product) => (
          <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">{product.name_tr}</p>
              <p className="text-xs text-charcoal/50">{product.name_en}</p>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                defaultValue={product.price}
                className="w-24 rounded-lg border border-black/10 px-2 py-1.5 text-sm"
                onBlur={async (e) => {
                  const newPrice = parseFloat(e.target.value);
                  if (!Number.isNaN(newPrice) && newPrice !== product.price) {
                    patchLocal(product.id, { price: newPrice });
                    await updatePrice(product.id, newPrice);
                  }
                }}
              />
              <span className="text-sm text-charcoal/50">TL</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const next = !product.sold_out;
                  patchLocal(product.id, { sold_out: next });
                  await toggleSoldOut(product.id, next);
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                  product.sold_out ? "bg-terracotta text-white" : "bg-sand text-charcoal/70"
                }`}
              >
                {product.sold_out ? "Tükendi ✓" : "Tükendi olarak işaretle"}
              </button>
              <button
                onClick={async () => {
                  const next = !product.active;
                  patchLocal(product.id, { active: next });
                  await toggleActive(product.id, next);
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                  product.active ? "bg-sand text-charcoal/70" : "bg-charcoal text-white"
                }`}
              >
                {product.active ? "Menüde Göster" : "Gizli"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
