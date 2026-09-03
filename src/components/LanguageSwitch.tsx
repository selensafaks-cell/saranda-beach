"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitch({ light = false }: { light?: boolean }) {
  const { lang, setLang } = useLanguage();

  const base = light
    ? "border-paper/70 text-paper/70"
    : "border-ink/20 text-ink/50";
  const activeLight = "bg-paper/20 text-paper";
  const activeDark = "bg-wine/10 text-deep";

  return (
    <div className={`inline-flex border rounded overflow-hidden font-display text-sm tracking-wide ${base}`}>
      <button
        onClick={() => setLang("tr")}
        className={`px-3 py-1.5 ${lang === "tr" ? (light ? activeLight : activeDark) : ""}`}
        aria-pressed={lang === "tr"}
      >
        TR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 border-l ${light ? "border-paper/70" : "border-ink/20"} ${
          lang === "en" ? (light ? activeLight : activeDark) : ""
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
