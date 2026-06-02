"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/dashboard/page-shell";
import { supabase } from "@/lib/supabase";

type Trade = {
  id: number;
  symbol: string;
  pnl: string;
  direction: string;
  date: string;
};

export default function AnalysisPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    async function loadTrades() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: true });

      if (!error && data) {
        setTrades(data);
      }
    }

    loadTrades();
  }, []);

  const stats = useMemo(() => {
    const totalTrades = trades.length;

    const totalPnl = trades.reduce(
      (sum, trade) => sum + Number(trade.pnl || 0),
      0
    );

    const wins = trades.filter(
      (trade) => Number(trade.pnl || 0) > 0
    ).length;

    const losses = trades.filter(
      (trade) => Number(trade.pnl || 0) < 0
    ).length;

    const winRate =
      totalTrades > 0
        ? Math.round((wins / totalTrades) * 100)
        : 0;

    const bestTrade = [...trades].sort(
      (a, b) =>
        Number(b.pnl || 0) - Number(a.pnl || 0)
    )[0];

    const worstTrade = [...trades].sort(
      (a, b) =>
        Number(a.pnl || 0) - Number(b.pnl || 0)
    )[0];

    return {
      totalTrades,
      totalPnl,
      wins,
      losses,
      winRate,
      bestTrade,
      worstTrade,
    };
  }, [trades]);

  const equityData = useMemo(() => {
    let running = 0;

    return trades.map((trade) => {
      running += Number(trade.pnl || 0);

      return running;
    });
  }, [trades]);

  const maxEquity = Math.max(...equityData, 1);
  const minEquity = Math.min(...equityData, 0);

  return (
    <PageShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white">
            Monthly Analysis
          </h1>

          <p className="mt-2 text-zinc-400">
            Deep analytics of your trading performance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Total P&L
            </p>

            <h2
              className={`mt-3 text-3xl font-black ${
                stats.totalPnl >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              ${stats.totalPnl.toFixed(2)}
            </h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Win Rate
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              {stats.winRate}%
            </h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Wins / Losses
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              {stats.wins} / {stats.losses}
            </h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Total Trades
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              {stats.totalTrades}
            </h2>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                Equity Curve
              </h2>

              <p className="text-zinc-500">
                Growth of your account over time.
              </p>
            </div>
          </div>

          <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-black p-6">
            {equityData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-500">
                No equity data yet.
              </div>
            ) : (
              <svg
                viewBox="0 0 1000 300"
                className="h-full w-full"
              >
                <polyline
                  fill="none"
                  stroke={
                    stats.totalPnl >= 0
                      ? "#4ade80"
                      : "#f87171"
                  }
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={equityData
                    .map((value, index) => {
                      const x =
                        (index /
                          Math.max(
                            equityData.length - 1,
                            1
                          )) *
                        1000;

                      const normalized =
                        (value - minEquity) /
                        Math.max(
                          maxEquity - minEquity,
                          1
                        );

                      const y =
                        280 - normalized * 240;

                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {equityData.map((value, index) => {
                  const x =
                    (index /
                      Math.max(
                        equityData.length - 1,
                        1
                      )) *
                    1000;

                  const normalized =
                    (value - minEquity) /
                    Math.max(
                      maxEquity - minEquity,
                      1
                    );

                  const y =
                    280 - normalized * 240;

                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={
                        Number(
                          trades[index]?.pnl || 0
                        ) >= 0
                          ? "#4ade80"
                          : "#f87171"
                      }
                    />
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Best Trade
            </p>

            {stats.bestTrade ? (
              <div className="mt-4">
                <h3 className="text-2xl font-black text-emerald-400">
                  ${stats.bestTrade.pnl}
                </h3>

                <p className="mt-2 text-zinc-300">
                  {stats.bestTrade.symbol}
                </p>

                <p className="text-sm text-zinc-500">
                  {stats.bestTrade.direction}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-zinc-500">
                No trades yet.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Worst Trade
            </p>

            {stats.worstTrade ? (
              <div className="mt-4">
                <h3 className="text-2xl font-black text-red-400">
                  ${stats.worstTrade.pnl}
                </h3>

                <p className="mt-2 text-zinc-300">
                  {stats.worstTrade.symbol}
                </p>

                <p className="text-sm text-zinc-500">
                  {stats.worstTrade.direction}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-zinc-500">
                No trades yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}