"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerSignIn, customerSignUp, customerRequestPasswordReset } from "@/lib/actions/customerAuth";

type Mode = "login" | "signup" | "reset";

export default function AccountLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "login") {
      const result = await customerSignIn(email, password);
      setLoading(false);
      if ("error" in result) {
        setError("E-posta veya şifre yanlış.");
        return;
      }
      router.push("/account");
      return;
    }

    if (mode === "signup") {
      if (!firstName.trim() || !lastName.trim()) {
        setLoading(false);
        setError("Ad ve soyad gerekli.");
        return;
      }
      const result = await customerSignUp(email, password, firstName, lastName);
      setLoading(false);
      if ("error" in result) {
        setError(result.error ?? "Bir hata oluştu, tekrar dene.");
        return;
      }
      router.push("/account");
      return;
    }

    if (mode === "reset") {
      const result = await customerRequestPasswordReset(email);
      setLoading(false);
      if ("error" in result) {
        setError(result.error ?? "Bir hata oluştu, tekrar dene.");
        return;
      }
      setMessage("Şifre sıfırlama linki e-postana gönderildi.");
      return;
    }
  }

  return (
    <div className="min-h-screen px-5 pt-10 flex flex-col items-center bg-paper">
      <h1 className="font-display font-medium text-[26px] mb-1">
        {mode === "login" && "Giriş Yap"}
        {mode === "signup" && "Hesap Oluştur"}
        {mode === "reset" && "Şifremi Unuttum"}
      </h1>
      <p className="font-body text-[13px] italic text-ink/50 mb-6 text-center">
        Siparişlerini ve harcamalarını takip etmek için hesap oluştur.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3">
            <input
              className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
              placeholder="Ad"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
              placeholder="Soyad"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        )}

        <input
          type="email"
          className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {mode !== "reset" && (
          <input
            type="password"
            className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        )}

        {error && <p className="font-body text-[13px] text-wine">{error}</p>}
        {message && <p className="font-body text-[13px] text-deep">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="border border-wine text-wine font-display text-[15px] tracking-[0.08em] uppercase rounded py-3 mt-2 disabled:opacity-50"
        >
          {loading
            ? "..."
            : mode === "login"
            ? "Giriş Yap"
            : mode === "signup"
            ? "Hesap Oluştur"
            : "Sıfırlama Linki Gönder"}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2 font-body text-[13px]">
        {mode === "login" && (
          <>
            <button onClick={() => setMode("reset")} className="text-ink/50 underline">
              Şifremi unuttum
            </button>
            <button onClick={() => setMode("signup")} className="text-deep underline">
              Hesabın yok mu? Oluştur
            </button>
          </>
        )}
        {mode !== "login" && (
          <button onClick={() => setMode("login")} className="text-deep underline">
            Zaten hesabın var mı? Giriş yap
          </button>
        )}
        <button onClick={() => router.push("/")} className="text-ink/40 underline mt-2">
          Misafir olarak devam et
        </button>
      </div>
    </div>
  );
}
