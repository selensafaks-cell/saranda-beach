"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex border border-ink/20 rounded overflow-hidden font-display text-sm tracking-wide">
      <button
        onClick={() => setLang("tr")}
        className={`px-3 py-1.5 ${lang === "tr" ? "bg-gold/10 text-deep" : "text-ink/50"}`}
        aria-pressed={lang === "tr"}
      >
        TR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 border-l border-ink/20 ${lang === "en" ? "bg-gold/10 text-deep" : "text-ink/50"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
