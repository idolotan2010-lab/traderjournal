"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analysis", label: "Monthly Analysis" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-black px-5 py-6">
      <div className="mb-10">
        <h1 className="text-2xl font-black tracking-wide text-white">
          TradeJournal Pro
        </h1>

        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-zinc-500">
          Day Trader Journal
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto rounded-xl border border-red-900/60 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-950/40"
      >
        Logout
      </button>
    </aside>
  );
}