"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TokenEntry = {
  id: string;
  token: string;
  owner: string;
  createdAt: string;
};

type UserEntry = {
  username: string;
  role: string;
  createdAt: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [username, setUsername] = useState("");
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [newToken, setNewToken] = useState("");
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"tokens" | "users">("tokens");

  async function loadTokens() {
    const res = await fetch("/api/tokens");
    if (res.status === 401) {
      router.push("/login");
      return false;
    }
    const data = await res.json();
    setTokens(data.tokens || []);
    return true;
  }

  async function loadUsers() {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
  }

  useEffect(() => {
    async function init() {
      // Detect role from a lightweight call
      const res = await fetch("/api/tokens");
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      // We need username + role. Re-use login response pattern:
      // For simplicity, decode from a small /api/me or infer.
      // We'll call tokens and assume — better add /api/me
      const ok = await loadTokens();
      if (!ok) return;

      // Get role via users endpoint (only admin succeeds)
      const usersRes = await fetch("/api/users");
      if (usersRes.ok) {
        setRole("admin");
        const data = await usersRes.json();
        setUsers(data.users || []);
        // username from first successful path — we'll set from cookie-less approach
        // Actually set username after we know
      } else {
        setRole("user");
      }

      // Fetch session info properly
      try {
        const meRes = await fetch("/api/me");
        if (meRes.ok) {
          const me = await meRes.json();
          setUsername(me.username);
          setRole(me.role);
        }
      } catch {}

      setFetching(false);
    }
    init();
  }, []);

  async function handleAddToken(e: React.FormEvent) {
    e.preventDefault();
    if (!newToken.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/add-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: newToken.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Gagal menambah token" });
        return;
      }

      setMessage({ type: "success", text: data.message });
      setNewToken("");
      await loadTokens();
    } catch {
      setMessage({ type: "error", text: "Kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteToken(id: string) {
    if (!confirm("Yakin ingin menghapus token ini?")) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/delete-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      setMessage({ type: "success", text: data.message });
      await loadTokens();
    } catch {
      setMessage({ type: "error", text: "Kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      setMessage({ type: "success", text: data.message });
      setNewUser({ username: "", password: "" });
      await loadUsers();
    } catch {
      setMessage({ type: "error", text: "Kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(uname: string) {
    if (!confirm(`Hapus user "${uname}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }
      setMessage({ type: "success", text: data.message });
      await loadUsers();
    } catch {
      setMessage({ type: "error", text: "Kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  function maskToken(t: string) {
    if (t.length < 20) return t;
    return t.slice(0, 10) + "••••••••" + t.slice(-6);
  }

  if (fetching || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-neo-yellow border-4 border-neo-black shadow-neo-lg px-10 py-5 font-display font-bold text-xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-neo-black text-neo-white border-b-4 border-neo-black">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neo-yellow border-2 border-neo-white flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-none">
                TOKEN MANAGER
              </h1>
              <p className="text-xs text-neo-yellow mt-0.5">
                {role === "admin" ? "Admin Panel" : "User Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`border-2 border-neo-white px-3 py-1 text-xs font-bold uppercase ${
                role === "admin" ? "bg-neo-purple" : "bg-neo-green text-neo-black"
              }`}
            >
              {role === "admin" ? "🛡️ Admin" : "👤 User"} · {username || "—"}
            </span>
            <button
              onClick={handleLogout}
              className="neo-btn bg-neo-pink text-neo-black border-2 border-neo-white shadow-neo-sm px-4 py-1.5 font-display font-bold text-xs uppercase"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="h-2 bg-neo-yellow border-b-4 border-neo-black" />
      <div className="h-1.5 bg-neo-pink border-b-4 border-neo-black" />

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Message */}
        {message && (
          <div
            className={`border-4 border-neo-black px-5 py-3 font-semibold text-sm flex items-center gap-2 shadow-neo-sm ${
              message.type === "success" ? "bg-neo-green" : "bg-neo-pink"
            }`}
          >
            <span>{message.type === "success" ? "✅" : "⚠️"}</span>
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="ml-auto font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Add Token Card */}
        <section className="bg-neo-white border-4 border-neo-black shadow-neo-lg p-5 md:p-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="bg-neo-green border-2 border-neo-black w-8 h-8 flex items-center justify-center text-sm">
              +
            </span>
            Tambah Token Baru
          </h2>

          <form onSubmit={handleAddToken} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              placeholder="123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="flex-1 border-3 border-neo-black px-4 py-3 font-mono text-sm focus:outline-none focus:shadow-neo-sm bg-neo-cream"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="neo-btn bg-neo-green border-4 border-neo-black shadow-neo px-6 py-3 font-display font-bold uppercase tracking-wide hover:bg-neo-yellow disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? "..." : "Tambah"}
            </button>
          </form>
        </section>

        {/* Tabs for Admin */}
        {role === "admin" && (
          <div className="flex border-4 border-neo-black shadow-neo overflow-hidden">
            <button
              onClick={() => setTab("tokens")}
              className={`flex-1 py-3 font-display font-bold text-sm uppercase ${
                tab === "tokens" ? "bg-neo-blue text-neo-white" : "bg-neo-white"
              }`}
            >
              📋 Semua Token ({tokens.length})
            </button>
            <button
              onClick={() => setTab("users")}
              className={`flex-1 py-3 font-display font-bold text-sm uppercase border-l-4 border-neo-black ${
                tab === "users" ? "bg-neo-purple text-neo-white" : "bg-neo-white"
              }`}
            >
              👥 Kelola User ({users.length})
            </button>
          </div>
        )}

        {/* Token List */}
        {(role === "user" || tab === "tokens") && (
          <section className="bg-neo-white border-4 border-neo-black shadow-neo-lg p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg uppercase tracking-wide">
                {role === "admin" ? "Semua Token" : "Token Saya"}
              </h2>
              <span className="bg-neo-blue text-neo-white border-2 border-neo-black px-3 py-1 text-sm font-bold">
                {tokens.length}
              </span>
            </div>

            {tokens.length === 0 ? (
              <div className="border-3 border-dashed border-neo-black/30 p-8 text-center">
                <p className="font-display font-semibold opacity-50">
                  Belum ada token
                </p>
                <p className="text-xs opacity-40 mt-1">
                  Tambahkan token bot Telegram di atas
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {tokens.map((t, i) => (
                  <li
                    key={t.id}
                    className="bg-neo-cream border-3 border-neo-black p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <span className="bg-neo-black text-neo-white px-2.5 py-1 text-xs font-bold shrink-0 w-fit">
                      #{i + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs sm:text-sm break-all">
                        {role === "admin" ? t.token : maskToken(t.token)}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1.5 text-xs opacity-60">
                        <span>
                          Owner: <strong>{t.owner}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          {new Date(t.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {role === "admin" && (
                      <button
                        onClick={() => handleDeleteToken(t.id)}
                        disabled={loading}
                        className="neo-btn bg-neo-red text-neo-white border-3 border-neo-black shadow-neo-sm px-4 py-2 font-display font-bold text-xs uppercase hover:bg-neo-pink hover:text-neo-black shrink-0"
                      >
                        Hapus
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Users Management (Admin only) */}
        {role === "admin" && tab === "users" && (
          <section className="bg-neo-white border-4 border-neo-black shadow-neo-lg p-5 md:p-6 space-y-6">
            <h2 className="font-display font-bold text-lg uppercase tracking-wide">
              Kelola User
            </h2>

            {/* Create User Form */}
            <form
              onSubmit={handleCreateUser}
              className="bg-neo-cream border-3 border-neo-black p-4 space-y-3"
            >
              <p className="font-display font-semibold text-sm uppercase">
                Buat User Baru
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="Username"
                  className="flex-1 border-3 border-neo-black px-3 py-2 text-sm focus:outline-none bg-neo-white"
                  required
                />
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Password (min 6)"
                  className="flex-1 border-3 border-neo-black px-3 py-2 text-sm focus:outline-none bg-neo-white"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn bg-neo-purple text-neo-white border-3 border-neo-black shadow-neo-sm px-5 py-2 font-display font-bold text-xs uppercase hover:bg-neo-yellow hover:text-neo-black"
                >
                  Buat
                </button>
              </div>
            </form>

            {/* User List */}
            {users.length === 0 ? (
              <p className="text-sm opacity-50 italic text-center py-4">
                Belum ada user terdaftar
              </p>
            ) : (
              <ul className="space-y-2">
                {users.map((u) => (
                  <li
                    key={u.username}
                    className="flex items-center justify-between bg-neo-cream border-3 border-neo-black px-4 py-3"
                  >
                    <div>
                      <span className="font-display font-bold">{u.username}</span>
                      <span className="text-xs opacity-50 ml-2">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      disabled={loading}
                      className="neo-btn bg-neo-red text-neo-white border-2 border-neo-black px-3 py-1 font-bold text-xs uppercase"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <p className="text-center text-xs opacity-40 pb-8">
          Data tersimpan di GitHub · Powered by Vercel
        </p>
      </main>
    </div>
  );
}
