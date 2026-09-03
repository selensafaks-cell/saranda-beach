"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { submitOrder } from "@/lib/actions/orders";
import { getStoredQrLocation } from "@/components/QrLocationCapture";

const LOCATION_OPTIONS = [
  { code: "beach", tr: "Plaj Alanı", en: "Beach Area" },
  { code: "grass", tr: "Çim Alanı", en: "Grass Area" },
  { code: "cardak", tr: "Çardak Alanı", en: "Çardak Area" },
  { code: "havuz_restoran", tr: "Havuz Restoran", en: "Pool Restaurant" },
  { code: "daire", tr: "Daire No.", en: "Apartment No." }
];

export default function CheckoutPage() {
  const { lines, total, remove, clear } = useCart();
  const { lang, t } = useLanguage();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [locationNumber, setLocationNumber] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredQrLocation();
    if (stored && LOCATION_OPTIONS.some((o) => o.code === stored)) {
      setLocationCode(stored);
    }
  }, []);

  if (lines.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-charcoal/60">{t.emptyCart}</p>
      </div>
    );
  }

  async function handleSubmit() {
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError(lang === "tr" ? "Ad ve soyad gerekli" : "First and last name required");
      return;
    }
    setSubmitting(true);
    const result = await submitOrder({
      firstName,
      lastName,
      phone,
      locationCode: locationCode || undefined,
      locationNumber: locationCode === "daire" ? locationNumber : undefined,
      note,
      language: lang,
      lines: lines.map((l) => ({
        product_id: l.product_id,
        quantity: l.quantity,
        line_note: l.line_note
      }))
    });
    setSubmitting(false);

    if ("error" in result) {
      setError(
        result.error === "ORDERING_CLOSED"
          ? lang === "tr"
            ? "Sipariş alımı şu anda kapalı"
            : "Ordering is closed right now"
          : lang === "tr"
          ? "Bir sorun oluştu, tekrar deneyin"
          : "Something went wrong, please try again"
      );
      return;
    }

    clear();
    router.push(`/order/${result.orderId}`);
  }

  return (
    <div className="min-h-screen px-4 pb-32 pt-6">
      <h1 className="font-display font-bold text-xl mb-4">{t.checkout}</h1>

      <div className="flex flex-col gap-3 mb-6">
        {lines.map((line) => (
          <div key={line.product_id} className="flex items-center justify-between bg-white rounded-xl p-3">
            <div>
              <p className="font-semibold text-sm">
                {line.quantity}× {lang === "tr" ? line.name_tr : line.name_en}
              </p>
              <p className="text-xs text-charcoal/50">{line.unit_price * line.quantity} TL</p>
            </div>
            <button
              onClick={() => remove(line.product_id)}
              className="text-sm text-terracotta font-semibold"
            >
              {t.remove}
            </button>
          </div>
        ))}
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded-xl border border-black/10 px-4 py-3 text-base"
            placeholder={t.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-black/10 px-4 py-3 text-base"
            placeholder={t.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <input
          className="rounded-xl border border-black/10 px-4 py-3 text-base"
          placeholder={t.phoneOptional}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <select
          className="rounded-xl border border-black/10 px-4 py-3 text-base bg-white"
          value={locationCode}
          onChange={(e) => setLocationCode(e.target.value)}
        >
          <option value="">{t.locationOptional}</option>
          {LOCATION_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {lang === "tr" ? opt.tr : opt.en}
            </option>
          ))}
        </select>

        {locationCode === "daire" && (
          <input
            className="rounded-xl border border-black/10 px-4 py-3 text-base"
            placeholder={t.daireNumber}
            value={locationNumber}
            onChange={(e) => setLocationNumber(e.target.value)}
          />
        )}

        <textarea
          className="rounded-xl border border-black/10 px-4 py-3 text-base"
          placeholder={t.orderNote}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="fixed bottom-4 left-4 right-4 bg-deepsea text-white rounded-2xl py-4 font-semibold shadow-lg disabled:opacity-60"
        >
          {submitting ? "..." : `${t.placeOrder} · ${total} TL`}
        </button>
      </form>
    </div>
  );
}
