"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { submitOrder } from "@/lib/actions/orders";
import { getStoredQrLocation } from "@/components/QrLocationCapture";
import { createClient } from "@/lib/supabase/client";

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
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredQrLocation();
    if (stored && LOCATION_OPTIONS.some((o) => o.code === stored)) {
      setLocationCode(stored);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      // A staff member testing the site while logged into /admin shares the
      // same auth session - only treat this as a customer checkout if a
      // matching customers profile actually exists, never assume.
      const { data: profile } = await supabase
        .from("customers")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();
      if (profile) {
        setCustomerId(user.id);
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
      }
    });
  }, []);

  if (lines.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="font-body italic text-ink/50">{t.emptyCart}</p>
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
      customerId: customerId || undefined,
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
    <div className="min-h-screen px-5 pb-32 pt-6">
      <h1 className="font-display font-medium text-[28px] mb-1">{t.checkout}</h1>
      {!customerId && (
        <p className="font-body text-[12px] italic text-ink/45 mb-4">
          <Link href="/account/login" className="text-deep underline">
            Hesabın var mı? Giriş yap
          </Link>{" "}
          — siparişlerini takip etmek için, ya da misafir olarak devam et.
        </p>
      )}

      <div className="mb-6">
        {lines.map((line) => (
          <div
            key={line.product_id}
            className="flex items-center justify-between py-3 border-b border-ink/12"
          >
            <div>
              <p className="font-display text-[17px] font-semibold">
                {line.quantity}× {lang === "tr" ? line.name_tr : line.name_en}
              </p>
              <p className="font-body text-[12px] italic text-ink/45">
                {line.unit_price * line.quantity} ₺
              </p>
            </div>
            <button onClick={() => remove(line.product_id)} className="font-body text-[13px] text-deep">
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
            className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
            placeholder={t.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
            placeholder={t.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <input
          className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
          placeholder={t.phoneOptional}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <select
          className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-paper"
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
            className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
            placeholder={t.daireNumber}
            value={locationNumber}
            onChange={(e) => setLocationNumber(e.target.value)}
          />
        )}

        <textarea
          className="font-body italic border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
          placeholder={t.orderNote}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />

        {error && <p className="font-body text-[13px] text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="fixed bottom-4 left-5 right-5 bg-paper border border-wine text-deep font-display text-[15px] tracking-[0.1em] uppercase rounded py-4 disabled:opacity-60"
        >
          {submitting ? "..." : `${t.placeOrder} · ${total} ₺`}
        </button>
      </form>
    </div>
  );
}
