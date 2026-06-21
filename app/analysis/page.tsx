"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/dashboard/page-shell";
import { supabase } from "@/lib/supabase";
import { Trade } from "@/components/dashboard/new-trade-modal";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type CloudTrade = Trade & {
  id?: number;
  user_id?: string;
};

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<CloudTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  async function loadTrades() {
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      alert(error.message);
      setIsLoading(false);
      return;
    }

    setTrades((data || []) as CloudTrade[]);
    setIsLoading(false);
  }

  const winningTrades = trades.filter((trade) => Number(trade.pnl || 0) > 0);
  const losingTrades = trades.filter((trade) => Number(trade.pnl || 0) < 0);
  const breakevenTrades = trades.filter((trade) => Number(trade.pnl || 0) === 0);

  const totalPnl = useMemo(() => {
    return trades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  }, [trades]);

  const winRate =
    trades.length > 0
      ? Math.round((winningTrades.length / trades.length) * 100)
      : 0;

  const averageWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0) /
        winningTrades.length
      : 0;

  const averageLoss =
    losingTrades.length > 0
      ? Math.abs(
          losingTrades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0) /
            losingTrades.length
        )
      : 0;

  const profitFactor = useMemo(() => {
    const grossProfit = winningTrades.reduce(
      (sum, trade) => sum + Number(trade.pnl || 0),
      0
    );

    const grossLoss = Math.abs(
      losingTrades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0)
    );

    if (grossLoss === 0) {
      return grossProfit > 0 ? 999 : 0;
    }

    return grossProfit / grossLoss;
  }, [winningTrades, losingTrades]);

  const disciplineScore = useMemo(() => {
    let followed = 0;
    let total = 0;

    trades.forEach((trade) => {
      trade.ruleResults?.forEach((rule) => {
        total++;

        if (rule.status === "Followed") {
          followed++;
        }
      });
    });

    if (total === 0) return 0;

    return Math.round((followed / total) * 100);
  }, [trades]);

  const equityData = useMemo(() => {
    let runningTotal = 0;

    return trades.map((trade, index) => {
      runningTotal += Number(trade.pnl || 0);

      return {
        trade: index + 1,
        equity: runningTotal,
      };
    });
  }, [trades]);

  const breakdownData = [
    { name: "Wins", value: winningTrades.length, color: "#34d399" },
    { name: "Losses", value: losingTrades.length, color: "#fb7185" },
    { name: "Breakeven", value: breakevenTrades.length, color: "#22d3ee" },
  ];

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
          Loading analytics...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.38em] text-violet-400">
            Trading Analytics
          </p>

          <h1 className="text-5xl font-black tracking-tight text-white">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Understand your performance, discipline and trading behavior.
          </p>
        </div>

        {trades.length === 0 ? (
          <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-10 text-center shadow-[0_0_60px_rgba(15,23,42,0.65)]">
            <h2 className="text-3xl font-black text-white">No trades yet</h2>

            <p className="mt-3 text-sm text-zinc-500">
              Add trades from the dashboard to start seeing analytics.
            </p>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-6">
              <StatCard
                title="Total P&L"
                value={`$${totalPnl.toFixed(2)}`}
                subtitle="Current account result"
                color={totalPnl >= 0 ? "emerald" : "rose"}
              />

              <StatCard
                title="Profit Factor"
                value={profitFactor === 999 ? "∞" : profitFactor.toFixed(2)}
                subtitle="Gross profit / gross loss"
                color={
                  profitFactor >= 2
                    ? "emerald"
                    : profitFactor >= 1.5
                    ? "cyan"
                    : "rose"
                }
              />

              <StatCard
                title="Win Rate"
                value={`${winRate}%`}
                subtitle={`${winningTrades.length} wins / ${trades.length} trades`}
                color="blue"
              />

              <StatCard
                title="Discipline"
                value={`${disciplineScore}%`}
                subtitle="Based on rule results"
                color="violet"
              />

              <StatCard
                title="Average Win"
                value={`$${averageWin.toFixed(2)}`}
                subtitle="Average winning trade"
                color="cyan"
              />

              <StatCard
                title="Average Loss"
                value={`$${averageLoss.toFixed(2)}`}
                subtitle="Average losing trade"
                color="rose"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
              <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.65)]">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-white">
                      Performance Curve
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Real account growth from saved trades.
                    </p>
                  </div>

                  <p
                    className={`text-3xl font-black ${
                      totalPnl >= 0 ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    ${totalPnl.toFixed(2)}
                  </p>
                </div>

                <div className="relative h-[380px] w-full overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-b from-violet-500/[0.04] to-black">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

                  <ResponsiveContainer width="100%" height={380}>
                    <AreaChart data={equityData}>
                      <defs>
                        <linearGradient
                          id="analyticsFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.45}
                          />

                          <stop
                            offset="100%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <XAxis
                        dataKey="trade"
                        stroke="#52525b"
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        stroke="#52525b"
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#09090b",
                          border: "1px solid #27272a",
                          borderRadius: "16px",
                          color: "#fff",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="equity"
                        stroke="#8b5cf6"
                        strokeWidth={4}
                        fill="url(#analyticsFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <aside className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.65)]">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  Win / Loss Breakdown
                </p>

                <div className="mt-6 h-[230px] w-full">
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={breakdownData}
                        dataKey="value"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {breakdownData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <InsightCard
                    title="Wins"
                    value={`${winningTrades.length} trades`}
                    color="emerald"
                  />

                  <InsightCard
                    title="Losses"
                    value={`${losingTrades.length} trades`}
                    color="rose"
                  />

                  <InsightCard
                    title="Breakeven"
                    value={`${breakevenTrades.length} trades`}
                    color="cyan"
                  />
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "emerald" | "blue" | "cyan" | "rose" | "violet";
}) {
  const styles = {
    emerald: "border-emerald-500/20 from-emerald-500/12 text-emerald-300",
    blue: "border-blue-500/20 from-blue-500/12 text-blue-300",
    cyan: "border-cyan-500/20 from-cyan-500/12 text-cyan-300",
    rose: "border-rose-500/20 from-rose-500/12 text-rose-300",
    violet: "border-violet-500/20 from-violet-500/12 text-violet-300",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border bg-gradient-to-br via-[#071019] to-black p-5 shadow-[0_0_35px_rgba(15,23,42,0.45)] ${styles[color]}`}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-current opacity-10 blur-3xl" />

      <p className="text-[11px] font-black uppercase tracking-[0.25em] opacity-70">
        {title}
      </p>

      <h2 className="mt-4 text-4xl font-black">{value}</h2>

      <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}

function InsightCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: "emerald" | "rose" | "violet" | "cyan";
}) {
  const styles = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    violet: "border-violet-500/10 bg-violet-500/10 text-violet-300",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[color]}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
        {title}
      </p>

      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}