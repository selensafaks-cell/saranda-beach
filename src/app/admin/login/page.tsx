"use client";

import { useState } from "react";
import { login } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
        <h1 className="font-display font-bold text-2xl text-deep mb-4 text-center">
          S-Cafe Yönetim
        </h1>
        <input
          className="rounded-xl border border-black/10 px-4 py-3"
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-black/10 px-4 py-3"
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-white rounded-xl py-3 font-semibold disabled:opacity-60"
        >
          {loading ? "..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
