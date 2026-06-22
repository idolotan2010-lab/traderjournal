"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/calendar", label: "Calendar", icon: "◷" },
  { href: "/analysis", label: "Monthly Analysis", icon: "⌁" },
  { href: "/rules", label: "Trading Rules", icon: "✓" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/auth");
  }

  return (
    <aside className="relative flex h-screen w-[245px] shrink-0 flex-col overflow-hidden border-r border-white/5 bg-[#04060d] px-4 py-5">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-500/20 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-24 left-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-[80px]" />

      <div className="relative">
        <div className="mb-5 flex h-[95px] w-[95px] items-center justify-center overflow-hidden rounded-[26px] border border-violet-500/40 bg-black shadow-[0_0_45px_rgba(139,92,246,0.38)]">
          <img
            src="/logo.png"
            alt="TradeJournal Logo"
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="text-[18px] font-black leading-none tracking-wide text-white">
          TradeJournal
        </h1>

        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
          Pro Trader System
        </p>
      </div>

      <nav className="relative mt-8 space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-[13px] font-black transition ${
                active
                  ? "border-violet-500/40 bg-violet-500/15 text-white shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                  : "border-white/5 bg-black/20 text-zinc-400 hover:border-violet-500/20 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm ${
                  active
                    ? "border-violet-400/40 bg-violet-500/20 text-white"
                    : "border-white/5 bg-zinc-950 text-zinc-500 group-hover:text-white"
                }`}
              >
                {link.icon}
              </span>

              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="overflow-hidden rounded-[24px] border border-white/5 bg-black/30 p-4 shadow-[0_0_40px_rgba(15,23,42,0.55)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                Discipline
              </p>

              <h2 className="mt-3 text-3xl font-black text-violet-300">
                78%
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
              ⌁
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/25 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Status
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.95)]" />

            <p className="text-sm font-black text-zinc-300">
              Cloud Sync Active
            </p>
          </div>
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-300 transition hover:bg-rose-500/20"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => router.push("/auth")}
            className="w-full rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-500/20"
          >
            Login
          </button>
        )}
      </div>
    </aside>
  );
}