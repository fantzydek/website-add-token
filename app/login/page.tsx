"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      // Optional: warn if mode doesn't match role
      if (mode === "admin" && data.role !== "admin") {
        setError("Akun ini bukan Admin");
        return;
      }
      if (mode === "user" && data.role === "admin") {
        // Admin boleh login lewat tab user juga, tetap masuk
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== BANNER ===== */}
      <div className="w-full bg-neo-black text-neo-white border-b-4 border-neo-black">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-neo-yellow border-4 border-neo-white flex items-center justify-center shadow-[4px_4px_0_0_#FFE566]">
              <span className="text-3xl">⚡</span>
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight leading-none">
                TOKEN MANAGER
              </h1>
              <p className="text-neo-yellow text-sm md:text-base font-medium mt-1">
                Kelola Telegram Bot Token dengan aman
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="bg-neo-pink border-2 border-neo-white px-3 py-1 text-xs font-bold uppercase">
              Neobrutalism
            </span>
            <span className="bg-neo-blue border-2 border-neo-white px-3 py-1 text-xs font-bold uppercase">
              Vercel Ready
            </span>
          </div>
        </div>
      </div>

      {/* Decorative stripe */}
      <div className="h-3 bg-neo-yellow border-b-4 border-neo-black" />
      <div className="h-2 bg-neo-pink border-b-4 border-neo-black" />
      <div className="h-2 bg-neo-blue border-b-4 border-neo-black" />

      {/* ===== LOGIN CARD ===== */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Mode Switcher */}
          <div className="flex mb-0 border-4 border-neo-black shadow-neo overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setMode("user");
                setError("");
              }}
              className={`flex-1 py-3 font-display font-bold text-sm uppercase tracking-wide transition-colors ${
                mode === "user"
                  ? "bg-neo-green text-neo-black"
                  : "bg-neo-white text-neo-black/50 hover:bg-neo-cream"
              }`}
            >
              👤 User
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("admin");
                setError("");
              }}
              className={`flex-1 py-3 font-display font-bold text-sm uppercase tracking-wide border-l-4 border-neo-black transition-colors ${
                mode === "admin"
                  ? "bg-neo-purple text-neo-white"
                  : "bg-neo-white text-neo-black/50 hover:bg-neo-cream"
              }`}
            >
              🛡️ Admin
            </button>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleLogin}
            className="bg-neo-white border-4 border-t-0 border-neo-black shadow-neo-lg p-6 md:p-8 space-y-5"
          >
            <div className="text-center mb-2">
              <p className="font-display font-bold text-lg">
                {mode === "admin" ? "Login sebagai Admin" : "Login sebagai User"}
              </p>
              <p className="text-xs opacity-60 mt-1">
                {mode === "admin"
                  ? "Akses penuh: lihat, hapus, kelola user"
                  : "Hanya bisa menambah & melihat token milik sendiri"}
              </p>
            </div>

            <div>
              <label className="block font-display font-semibold mb-2 text-xs uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-3 border-neo-black px-4 py-3 font-medium focus:outline-none focus:shadow-neo-sm bg-neo-cream placeholder:opacity-40"
                placeholder={mode === "admin" ? "admin" : "username kamu"}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block font-display font-semibold mb-2 text-xs uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-3 border-neo-black px-4 py-3 font-medium focus:outline-none focus:shadow-neo-sm bg-neo-cream placeholder:opacity-40"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-neo-pink border-3 border-neo-black px-4 py-3 text-sm font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`neo-btn w-full border-4 border-neo-black shadow-neo py-4 font-display font-bold text-lg uppercase tracking-wide disabled:opacity-60 ${
                mode === "admin"
                  ? "bg-neo-purple text-neo-white hover:bg-neo-yellow hover:text-neo-black"
                  : "bg-neo-green hover:bg-neo-yellow"
              }`}
            >
              {loading ? "Memproses..." : "Masuk →"}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs opacity-50">
              Data disimpan di GitHub • Deployed on Vercel
            </p>
            <div className="flex justify-center gap-2">
              <span className="inline-block w-3 h-3 bg-neo-yellow border border-neo-black" />
              <span className="inline-block w-3 h-3 bg-neo-pink border border-neo-black" />
              <span className="inline-block w-3 h-3 bg-neo-blue border border-neo-black" />
              <span className="inline-block w-3 h-3 bg-neo-green border border-neo-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
