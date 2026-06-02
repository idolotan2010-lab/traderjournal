"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Overview",
    href: "/dashboard",
  },
  {
    name: "Calendar View",
    href: "/calendar",
  },
  {
    name: "Monthly Analysis",
    href: "/analysis",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

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
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Futures Performance
        </p>

        <p className="mt-2 text-sm text-zinc-300">
          Track the plan.
          <br />
          Control the emotion.
        </p>
      </div>
    </aside>
  );
}