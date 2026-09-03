"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Language } from "@/lib/types";

const STRINGS = {
  tr: {
    cta: "Şezlongundan sipariş ver",
    cart: "Sepetim",
    items: "ürün",
    add: "Ekle",
    soldOut: "Tükendi",
    friesIncluded: "Patates dahil",
    mostLoved: "Turan'ın Sevdikleri",
    viewCart: "Sepeti Gör",
    checkout: "Siparişi Gönder",
    firstName: "Ad",
    lastName: "Soyad",
    phoneOptional: "Telefon (opsiyonel)",
    location: "Konum",
    locationOptional: "Konum (opsiyonel)",
    daireNumber: "Daire Numarası",
    orderNote: "Sipariş notu (opsiyonel)",
    placeOrder: "Siparişi Gönder",
    orderReceived: "Siparişiniz alındı ✓",
    orderingClosed: "Sipariş alımı şu anda kapalı",
    emptyCart: "Sepetiniz boş",
    remove: "Kaldır",
    total: "Toplam",
    orderStatus: {
      received: "Alındı",
      accepted: "Kabul Edildi",
      preparing: "Hazırlanıyor",
      on_the_way: "Yolda",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi"
    }
  },
  en: {
    cta: "Order from your sunbed",
    cart: "Cart",
    items: "items",
    add: "Add",
    soldOut: "Sold out",
    friesIncluded: "Fries included",
    mostLoved: "Turan's Picks",
    viewCart: "View Cart",
    checkout: "Place Order",
    firstName: "First name",
    lastName: "Last name",
    phoneOptional: "Phone (optional)",
    location: "Location",
    locationOptional: "Location (optional)",
    daireNumber: "Apartment number",
    orderNote: "Order note (optional)",
    placeOrder: "Place Order",
    orderReceived: "Your order has been received ✓",
    orderingClosed: "We're not taking orders right now",
    emptyCart: "Your cart is empty",
    remove: "Remove",
    total: "Total",
    orderStatus: {
      received: "Received",
      accepted: "Accepted",
      preparing: "Preparing",
      on_the_way: "On the way",
      delivered: "Delivered",
      cancelled: "Cancelled"
    }
  }
} as const;

interface Strings {
  cta: string;
  cart: string;
  items: string;
  add: string;
  soldOut: string;
  friesIncluded: string;
  mostLoved: string;
  viewCart: string;
  checkout: string;
  firstName: string;
  lastName: string;
  phoneOptional: string;
  location: string;
  locationOptional: string;
  daireNumber: string;
  orderNote: string;
  placeOrder: string;
  orderReceived: string;
  orderingClosed: string;
  emptyCart: string;
  remove: string;
  total: string;
  orderStatus: {
    received: string;
    accepted: string;
    preparing: string;
    on_the_way: string;
    delivered: string;
    cancelled: string;
  };
}

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: Strings;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "saranda_lang_v1";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("tr");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "tr" || saved === "en") setLangState(saved);
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // non-fatal
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
