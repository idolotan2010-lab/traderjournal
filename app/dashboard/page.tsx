"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/dashboard/page-shell";
import NewTradeModal, { Trade } from "@/components/dashboard/new-trade-modal";
import { supabase } from "@/lib/supabase";
import { Toaster, toast } from "sonner";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CloudTrade = Trade & {
  id?: number;
  user_id?: string;
};

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [trades, setTrades] = useState<CloudTrade[]>([]);
  const [editingTrade, setEditingTrade] = useState<CloudTrade | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<CloudTrade | null>(null);

  useEffect(() => {
    loadTrades();
  }, []);

  async function loadTrades() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    setTrades((data || []) as CloudTrade[]);
  }

  function openAddTrade() {
    setEditingTrade(null);
    setEditingIndex(null);
    setIsOpen(true);
  }

  function openEditTrade(index: number) {
    setEditingTrade(trades[index]);
    setEditingIndex(index);
    setIsOpen(true);
  }

  async function handleSave(trade: Trade) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      return false;
    }

    const tradePayload = {
      symbol: trade.symbol,
      direction: trade.direction,
      entry: trade.entry,
      exit: trade.exit,
      quantity: trade.quantity,
      pnl: trade.pnl,
      reason: trade.reason,
      notes: trade.notes,
      date: trade.date,
      mood: trade.mood,
      image: trade.image,
      ruleResults: trade.ruleResults,
    };

    if (editingIndex !== null) {
      const tradeToUpdate = trades[editingIndex];

      if (!tradeToUpdate?.id) return false;

      const { error } = await supabase
        .from("trades")
        .update(tradePayload)
        .eq("id", tradeToUpdate.id);

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success("Trade updated successfully");
    } else {
      const { error } = await supabase.from("trades").insert([
        {
          user_id: user.id,
          ...tradePayload,
        },
      ]);

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success("Trade saved successfully");
    }

    setEditingTrade(null);
    setEditingIndex(null);
    loadTrades();

    return true;
  }

  async function deleteTrade(index: number) {
    const trade = trades[index];

    if (!trade?.id) return;

    const { error } = await supabase.from("trades").delete().eq("id", trade.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Trade deleted successfully");
    loadTrades();
  }

  const totalPnl = useMemo(() => {
    return trades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  }, [trades]);

  const winningTrades = trades.filter((trade) => Number(trade.pnl || 0) > 0);
  const losingTrades = trades.filter((trade) => Number(trade.pnl || 0) < 0);

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

  const equityChartData = useMemo(() => {
    let runningTotal = 0;

    return trades
      .slice()
      .reverse()
      .map((trade, index) => {
        runningTotal += Number(trade.pnl || 0);

        return {
          trade: index + 1,
          equity: runningTotal,
        };
      });
  }, [trades]);

  const bestTrade = useMemo(() => {
    if (trades.length === 0) return null;

    return [...trades].sort(
      (a, b) => Number(b.pnl || 0) - Number(a.pnl || 0)
    )[0];
  }, [trades]);

  const worstTrade = useMemo(() => {
    if (trades.length === 0) return null;

    return [...trades].sort(
      (a, b) => Number(a.pnl || 0) - Number(b.pnl || 0)
    )[0];
  }, [trades]);

  return (
    <PageShell>
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: "#070914",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            color: "#fff",
          },
        }}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.38em] text-violet-400">
              Trading Overview
            </p>

            <h1 className="text-5xl font-black tracking-tight text-white">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Track performance, discipline and execution.
            </p>
          </div>

          <button
            onClick={openAddTrade}
            className="rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-black text-white shadow-[0_0_45px_rgba(139,92,246,0.35)] transition hover:scale-[1.03]"
          >
            + Add Trade
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <StatCard
            title="Total P&L"
            value={`$${totalPnl.toFixed(2)}`}
            subtitle="Current account result"
            color={totalPnl >= 0 ? "emerald" : "rose"}
          />

          <StatCard
            title="Win Rate"
            value={`${winRate}%`}
            subtitle={`${winningTrades.length} wins / ${trades.length} trades`}
            color="blue"
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

          <StatCard
            title="Discipline"
            value={`${disciplineScore}%`}
            subtitle="Based on rule results"
            color="violet"
          />
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-5">
          <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.65)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-white">
                  Equity Curve
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Real account growth from saved trades.
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-3xl font-black ${
                    totalPnl >= 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  ${totalPnl.toFixed(2)}
                </p>

                <p className="mt-1 text-sm text-zinc-500">Total result</p>
              </div>
            </div>

            <div className="relative min-h-[380px] overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-b from-violet-500/[0.04] to-black">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={equityChartData}>
                  <defs>
                    <linearGradient
                      id="equityFill"
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
                    fill="url(#equityFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.65)]">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
                Performance Insights
              </p>

              <div className="mt-6 space-y-4">
                <InsightCard
                  title="Best Trade"
                  value={
                    bestTrade
                      ? `${bestTrade.symbol} $${Number(bestTrade.pnl).toFixed(
                          2
                        )}`
                      : "No data"
                  }
                  color="emerald"
                />

                <InsightCard
                  title="Worst Trade"
                  value={
                    worstTrade
                      ? `${worstTrade.symbol} $${Number(worstTrade.pnl).toFixed(
                          2
                        )}`
                      : "No data"
                  }
                  color="rose"
                />

                <InsightCard
                  title="Discipline Score"
                  value={`${disciplineScore}%`}
                  color="violet"
                />

                <InsightCard
                  title="Trading Volume"
                  value={`${trades.length} trades`}
                  color="cyan"
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-[#12071d] p-6">
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-300">
                Focus
              </p>

              <h3 className="mt-4 text-4xl font-black text-white">
                Trade the plan.
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Every trade should match your setup, discipline and risk model.
              </p>
            </div>
          </aside>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-5 shadow-[0_0_60px_rgba(15,23,42,0.65)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Recent Trades</h2>

              <p className="mt-1 text-sm text-zinc-500">
                Latest saved executions.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
            {trades.length === 0 ? (
              <div className="p-10 text-center text-zinc-500">
                No trades yet.
              </div>
            ) : (
              trades.map((trade, index) => {
                const pnl = Number(trade.pnl || 0);

                return (
                  <div
                    key={trade.id || index}
                    onClick={() => setSelectedTrade(trade)}
                    className="grid min-h-[86px] cursor-pointer grid-cols-[1fr_120px_130px_120px_140px] items-center border-b border-white/10 px-5 py-3 transition last:border-b-0 hover:bg-white/[0.03]"
                  >
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {trade.symbol || "Unknown"}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {trade.date || "No date"}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`rounded-xl border px-3 py-2 text-xs font-black ${
                          trade.direction === "Long"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-400">
                      {trade.entry} → {trade.exit}
                    </p>

                    <p
                      className={`text-xl font-black ${
                        pnl >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      ${trade.pnl}
                    </p>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTrade(index);
                        }}
                        className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrade(index);
                        }}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {selectedTrade && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-zinc-800 bg-[#050816] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-400">
                    Trade Details
                  </p>

                  <h2 className="mt-4 text-6xl font-black text-white">
                    {selectedTrade.symbol}
                  </h2>

                  <p className="mt-2 text-zinc-500">{selectedTrade.date}</p>
                </div>

                <button
                  onClick={() => setSelectedTrade(null)}
                  className="rounded-2xl border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <InfoBox title="Entry" value={selectedTrade.entry} />
                <InfoBox title="Exit" value={selectedTrade.exit} />
                <InfoBox title="Direction" value={selectedTrade.direction} />
                <InfoBox title="Mood" value={selectedTrade.mood || "-"} />
              </div>

              {selectedTrade.image && (
                <img
                  src={selectedTrade.image}
                  alt="Trade"
                  className="mt-6 w-full rounded-3xl border border-zinc-800"
                />
              )}

              <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Notes
                </p>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {selectedTrade.notes || "No notes"}
                </p>
              </div>
            </div>
          </div>
        )}

        <NewTradeModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setEditingTrade(null);
            setEditingIndex(null);
          }}
          onSave={handleSave}
          initialData={editingTrade}
        />
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
    emerald:
      "border-emerald-500/20 from-emerald-500/12 text-emerald-300",
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

      <div className="mt-5 flex h-16 items-end gap-1">
        {[20, 40, 60, 35, 80, 55, 95].map((height, index) => (
          <div
            key={index}
            className="w-full rounded-full bg-current opacity-60"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
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
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
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

function InfoBox({
  title,
  value,
}: {
  title: string;
  value?: string | number;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-black text-white">{value || "-"}</p>
    </div>
  );
}