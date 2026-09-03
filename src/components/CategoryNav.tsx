"use client";

import { Category } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export default function CategoryNav({
  categories,
  activeId,
  onSelect
}: {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { lang } = useLanguage();

  return (
    <div className="sticky top-[64px] z-20 bg-sand/95 backdrop-blur pt-2 pb-3 -mx-4 px-4 overflow-x-auto">
      <div className="flex gap-2 w-max">
        {categories.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition min-h-[40px] ${
                active ? "bg-terracotta text-white" : "bg-white text-charcoal/70"
              }`}
            >
              {lang === "tr" ? c.name_tr : c.name_en}
            </button>
          );
        })}
      </div>
    </div>
  );
}
