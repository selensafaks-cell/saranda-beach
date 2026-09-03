"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex rounded-full bg-white/70 backdrop-blur px-1 py-1 shadow-sm">
      <button
        onClick={() => setLang("tr")}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
          lang === "tr" ? "bg-deepsea text-white" : "text-charcoal/70"
        }`}
        aria-pressed={lang === "tr"}
      >
        TR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
          lang === "en" ? "bg-deepsea text-white" : "text-charcoal/70"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
