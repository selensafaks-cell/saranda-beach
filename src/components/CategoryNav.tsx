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
    <div className="flex gap-6 px-5 py-3 overflow-x-auto border-b border-ink/15">
      {categories.map((c) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`font-display text-[15px] tracking-[0.06em] uppercase whitespace-nowrap pb-1 border-b-[1.5px] transition-colors ${
              active ? "text-deep border-wine" : "text-ink/45 border-transparent"
            }`}
          >
            {lang === "tr" ? c.name_tr : c.name_en}
          </button>
        );
      })}
    </div>
  );
}
