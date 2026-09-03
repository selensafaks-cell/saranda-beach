"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerUpdatePassword } from "@/lib/actions/customerAuth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await customerUpdatePassword(password);
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? "Bir hata oluştu, tekrar dene.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/account"), 1500);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="font-display text-[18px]">Şifren güncellendi ✓</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pt-14 flex flex-col items-center bg-paper">
      <h1 className="font-display font-medium text-[24px] mb-6">Yeni Şifre Belirle</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="password"
          className="font-body border border-ink/20 rounded px-4 py-3 text-[15px] bg-transparent"
          placeholder="Yeni şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="font-body text-[13px] text-wine">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="border border-wine text-wine font-display text-[15px] tracking-[0.08em] uppercase rounded py-3 disabled:opacity-50"
        >
          {loading ? "..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </div>
  );
}
