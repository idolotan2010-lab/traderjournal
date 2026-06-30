"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageShell from "@/components/dashboard/page-shell";
import { supabase } from "@/lib/supabase";

type TradeRuleResult = {
  id: number;
  title: string;
  status: "Followed" | "Broken";
};

type CloudTrade = {
  id?: number;
  user_id?: string;
  symbol?: string;
  direction?: string;
  entry?: string;
  exit?: string;
  quantity?: string;
  pnl?: string;
  reason?: string;
  notes?: string;
  wentWell?: string;
  improvement?: string;
  date?: string;
  mood?: string;
  image?: string;
  created_at?: string;
  ruleResults?: TradeRuleResult[];
};

type TimeRange = "Today" | "7D" | "30D" | "90D" | "YTD" | "1Y" | "All Time";

type ChartPoint = {
  [key: string]: string | number;
};

const timeRanges: TimeRange[] = ["Today", "7D", "30D", "90D", "YTD", "1Y", "All Time"];

export default function AnalysisPage() {
  const [trades, setTrades] = useState<CloudTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("All Time");

  useEffect(() => {
    loadTrades();
  }, []);

  async function loadTrades() {
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setTrades([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      console.error(error.message);
      setIsLoading(false);
      return;
    }

    console.log("Analysis trades from Supabase:", data);
    setTrades((data || []) as CloudTrade[]);
    setIsLoading(false);
  }

  const filteredTrades = useMemo(() => {
    return filterTradesByRange(trades, selectedRange);
  }, [trades, selectedRange]);

  const previousTrades = useMemo(() => {
    return filterPreviousPeriodTrades(trades, selectedRange);
  }, [trades, selectedRange]);

  const metrics = useMemo(() => {
    return calculateMetrics(filteredTrades);
  }, [filteredTrades]);

  const previousMetrics = useMemo(() => {
    return calculateMetrics(previousTrades);
  }, [previousTrades]);

  useEffect(() => {
    console.log("Analysis all trades:", trades.length);
    console.log("Analysis filtered trades:", filteredTrades.length);
    console.log("Analysis selected range:", selectedRange);
  }, [trades, filteredTrades, selectedRange]);

  const equityData = useMemo(() => {
    let runningTotal = 0;

    return filteredTrades
      .slice()
      .sort((a, b) => getTradeTime(a) - getTradeTime(b))
      .map((trade, index) => {
        runningTotal += getPnl(trade);

        return {
          day: formatShortDate(parseTradeDate(trade.date)),
          trade: index + 1,
          equity: Number(runningTotal.toFixed(2)),
        };
      });
  }, [filteredTrades]);

  const distributionData = useMemo(() => {
    return [
      { name: "Winners", value: metrics.winRate },
      { name: "Losers", value: metrics.lossRate },
    ];
  }, [metrics.winRate, metrics.lossRate]);

  const streakData = useMemo(() => {
    let currentStreak = 0;

    return filteredTrades
      .slice()
      .sort((a, b) => getTradeTime(a) - getTradeTime(b))
      .map((trade, index) => {
        const pnl = getPnl(trade);

        if (pnl > 0) {
          currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
        } else if (pnl < 0) {
          currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
        } else {
          currentStreak = 0;
        }

        return {
          index: String(index + 1),
          value: currentStreak,
        };
      });
  }, [filteredTrades]);

  const dayData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals = days.map((name) => ({ name, value: 0 }));

    filteredTrades.forEach((trade) => {
      const date = parseTradeDate(trade.date);
      if (!date) return;

      totals[date.getDay()].value += getPnl(trade);
    });

    return totals.map((item) => ({
      ...item,
      value: Number(item.value.toFixed(2)),
    }));
  }, [filteredTrades]);

  const hourData = useMemo(() => {
    const totals = Array.from({ length: 12 }, (_, index) => ({
      hour: String(index * 2).padStart(2, "0"),
      value: 0,
    }));

    filteredTrades.forEach((trade) => {
      const sourceDate = trade.created_at ? new Date(trade.created_at) : parseTradeDate(trade.date);
      if (!sourceDate) return;

      const bucket = Math.floor(sourceDate.getHours() / 2);
      totals[bucket].value += getPnl(trade);
    });

    return totals.map((item) => ({
      ...item,
      value: Number(item.value.toFixed(2)),
    }));
  }, [filteredTrades]);

  const dateLabel = getRangeLabel(selectedRange, filteredTrades);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] items-center justify-center text-zinc-500">
          Loading analysis...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.38em] text-violet-400">
              Trading Performance
            </p>

            <h1 className="text-5xl font-black tracking-tight">Analysis</h1>

            <p className="mt-2 text-sm text-zinc-500">
              Deep dive into your trading performance, discipline and consistency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.18)]">
              📅 {dateLabel}
            </button>

            <button
              type="button"
              onClick={() => setIsFiltersOpen(true)}
              className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.12)] transition hover:border-cyan-400/50 hover:bg-cyan-500/15"
            >
              ⛃ Filters
            </button>
          </div>
        </header>

        <section className="flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-[#070b16]/90 p-2 shadow-[0_0_45px_rgba(15,23,42,0.55)]">
          {timeRanges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                range === selectedRange
                  ? "border border-violet-400/40 bg-violet-500/20 text-violet-200 shadow-[0_0_25px_rgba(139,92,246,0.22)]"
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          <KpiCard
            title="Total P&L"
            value={formatCurrency(metrics.totalPnl)}
            change={formatPercentChange(metrics.totalPnl, previousMetrics.totalPnl)}
            color={metrics.totalPnl >= 0 ? "emerald" : "rose"}
            negative={metrics.totalPnl < previousMetrics.totalPnl}
          />

          <KpiCard
            title="Win Rate"
            value={`${metrics.winRate}%`}
            change={formatPercentChange(metrics.winRate, previousMetrics.winRate)}
            color="violet"
            negative={metrics.winRate < previousMetrics.winRate}
          />

          <KpiCard
            title="Profit Factor"
            value={metrics.profitFactor.toFixed(2)}
            change={formatNumberChange(metrics.profitFactor, previousMetrics.profitFactor)}
            color="cyan"
            negative={metrics.profitFactor < previousMetrics.profitFactor}
          />

          <KpiCard
            title="Total Trades"
            value={`${metrics.totalTrades}`}
            change={formatNumberChange(metrics.totalTrades, previousMetrics.totalTrades)}
            color="blue"
            negative={metrics.totalTrades < previousMetrics.totalTrades}
          />
        </section>

        {filteredTrades.length === 0 ? (
          <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-10 text-center shadow-[0_0_60px_rgba(15,23,42,0.65)]">
            <h2 className="text-3xl font-black text-white">No trades in this period</h2>

            <p className="mt-3 text-sm text-zinc-500">
              Try another time range or add more trades to see analysis.
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr_1.15fr]">
              <ChartCard title="Equity Curve">
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={equityData}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                        <stop offset="45%" stopColor="#8b5cf6" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis dataKey="day" stroke="#71717a" tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                    <Tooltip cursor={false} content={<ChartTooltip type="equity" />} />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="#22d3ee"
                      strokeWidth={4}
                      fill="url(#equityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="P&L Distribution">
                <div className="grid h-[230px] grid-cols-[1fr_1fr] items-center gap-4">
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={distributionData} innerRadius={58} outerRadius={86} dataKey="value">
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-5">
                    <DistributionLine
                      label="Winners"
                      value={`${metrics.winRate}%`}
                      amount={formatCurrency(metrics.grossProfit)}
                      color="emerald"
                    />

                    <DistributionLine
                      label="Losers"
                      value={`${metrics.lossRate}%`}
                      amount={formatCurrency(-metrics.grossLoss)}
                      color="rose"
                    />

                    <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                      <MiniMetric label="Avg Win" value={formatCurrency(metrics.averageWin)} color="emerald" />
                      <MiniMetric label="Avg Loss" value={formatCurrency(-metrics.averageLoss)} color="rose" />
                    </div>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Win / Loss Streak">
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={streakData}>
                    <XAxis dataKey="index" stroke="#71717a" tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                    <Tooltip cursor={false} content={<ChartTooltip type="streak" />} />
                    <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                      {streakData.map((item, index) => (
                        <Cell key={index} fill={item.value >= 0 ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1fr_1fr_1.1fr]">
              <ChartCard title="P&L by Day of Week">
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={dayData}>
                    <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                    <Tooltip cursor={false} content={<ChartTooltip type="pnl" />} />
                    <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                      {dayData.map((item, index) => (
                        <Cell key={index} fill={item.value >= 0 ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="P&L by Hour of Day">
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={hourData}>
                    <XAxis dataKey="hour" stroke="#71717a" tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                    <Tooltip cursor={false} content={<ChartTooltip type="pnl" />} />
                    <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                      {hourData.map((item, index) => (
                        <Cell key={index} fill={item.value >= 0 ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Performance Summary">
                <div className="space-y-4 pt-2">
                  <SummaryRow label="Gross Profit" value={formatCurrency(metrics.grossProfit)} color="emerald" />
                  <SummaryRow label="Gross Loss" value={formatCurrency(-metrics.grossLoss)} color="rose" />
                  <SummaryRow label="Net Profit" value={formatCurrency(metrics.totalPnl)} color={metrics.totalPnl >= 0 ? "emerald" : "rose"} />
                  <SummaryRow label="Best Trade" value={formatCurrency(metrics.bestTrade)} color="emerald" />
                  <SummaryRow label="Worst Trade" value={formatCurrency(metrics.worstTrade)} color="rose" />
                  <SummaryRow label="Longest Win Streak" value={`${metrics.longestWinStreak}`} color="emerald" />
                  <SummaryRow label="Longest Loss Streak" value={`${metrics.longestLossStreak}`} color="rose" />
                </div>
              </ChartCard>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-5 shadow-[0_0_55px_rgba(15,23,42,0.65)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black">More Metrics</h2>
                <span className="text-xs font-bold text-zinc-500">Filtered by: {selectedRange}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <MetricBox title="Best Trade" value={formatCurrency(metrics.bestTrade)} color="emerald" />
                <MetricBox title="Worst Trade" value={formatCurrency(metrics.worstTrade)} color="rose" />
                <MetricBox title="Max Drawdown" value={formatCurrency(metrics.maxDrawdown)} color="rose" />
                <MetricBox title="Discipline" value={`${metrics.disciplineScore}%`} color="violet" />
                <MetricBox title="Avg Winner" value={formatCurrency(metrics.averageWin)} color="emerald" />
                <MetricBox title="Avg Loser" value={formatCurrency(-metrics.averageLoss)} color="rose" />
              </div>
            </section>
          </>
        )}

        {isFiltersOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <aside className="relative h-full w-full max-w-[360px] border-l border-violet-500/25 bg-[#070914]/95 p-5 shadow-[0_0_80px_rgba(139,92,246,0.22)]">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-black">Filters</h3>

                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(false)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
                <FilterSection title="Direction">
                  <FilterPill active label="Long" color="emerald" />
                  <FilterPill active label="Short" color="rose" />
                </FilterSection>

                <FilterSection title="Symbol">
                  <div className="grid grid-cols-2 gap-2">
                    {getUniqueSymbols(trades).map((item) => (
                      <button
                        key={item}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-zinc-300"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Mood">
                  <div className="grid grid-cols-5 gap-2 text-xl">
                    {["🙂", "😎", "😐", "😟", "😡"].map((item, index) => (
                      <button
                        key={item}
                        className={`rounded-xl border px-2 py-2 ${
                          index === 1
                            ? "border-violet-400/50 bg-violet-500/20 shadow-[0_0_18px_rgba(139,92,246,0.2)]"
                            : "border-white/10 bg-white/[0.03]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Discipline Score">
                  <div className="grid grid-cols-2 gap-2">
                    {["90-100", "70-89", "50-69", "0-49"].map((item, index) => (
                      <button
                        key={item}
                        className={`rounded-xl border px-3 py-2 text-sm font-bold ${
                          index === 0
                            ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                            : "border-white/10 bg-white/[0.03] text-zinc-400"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3">
                <button className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-black text-zinc-300">
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(false)}
                  className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-3 text-sm font-black text-white shadow-[0_0_35px_rgba(139,92,246,0.25)]"
                >
                  Apply
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  type = "pnl",
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  type?: "pnl" | "streak" | "equity";
}) {
  if (!active || !payload?.length) return null;

  const rawValue = Number(payload[0].value || 0);
  const isPositive = rawValue >= 0;

  let title = String(label || "");
  let value = "";

  if (type === "streak") {
    title = `Trade #${label}`;
    value = isPositive
      ? `${Math.abs(rawValue)} Wins`
      : `${Math.abs(rawValue)} Losses`;
  }

  if (type === "pnl") {
    value = `${isPositive ? "+" : "-"}$${Math.abs(rawValue).toLocaleString()}`;
  }

  if (type === "equity") {
    title = String(label || "");
    value = `${isPositive ? "+" : "-"}$${Math.abs(rawValue).toLocaleString()}`;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#070914]/95 px-4 py-3 shadow-[0_0_35px_rgba(139,92,246,0.18)] backdrop-blur-xl">
      <p className="text-xs font-bold text-zinc-500">{title}</p>
      <p className={`mt-1 text-lg font-black ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
        {value}
      </p>
    </div>
  );
}

function KpiCard({
  title,
  value,
  change,
  color,
  negative = false,
}: {
  title: string;
  value: string;
  change: string;
  color: "emerald" | "rose" | "violet" | "cyan" | "blue";
  negative?: boolean;
}) {
  const styles = {
    emerald: "border-emerald-500/20 from-emerald-500/12 text-emerald-300",
    rose: "border-rose-500/20 from-rose-500/12 text-rose-300",
    violet: "border-violet-500/20 from-violet-500/12 text-violet-300",
    cyan: "border-cyan-500/20 from-cyan-500/12 text-cyan-300",
    blue: "border-blue-500/20 from-blue-500/12 text-blue-300",
  };

  return (
    <div className={`relative overflow-hidden rounded-[26px] border bg-gradient-to-br via-[#071019] to-black p-5 shadow-[0_0_35px_rgba(15,23,42,0.45)] ${styles[color]}`}>
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-current opacity-10 blur-3xl" />

      <p className="text-[11px] font-black uppercase tracking-[0.25em] opacity-70">
        {title}
      </p>

      <h2 className="mt-4 text-4xl font-black">{value}</h2>

      <p className={`mt-2 text-sm font-bold ${negative ? "text-rose-400" : "text-emerald-400"}`}>
        {negative ? "▼" : "▲"} {change}
      </p>

      <div className="mt-5 h-8 rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20 blur-sm" />
    </div>
  );
}

function ChartCard({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-[#070b16]/90 p-5 shadow-[0_0_55px_rgba(15,23,42,0.65)] ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-white">{title}</h2>
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-xs text-zinc-500">
          i
        </span>
      </div>

      {children}
    </div>
  );
}

function DistributionLine({
  label,
  value,
  amount,
  color,
}: {
  label: string;
  value: string;
  amount: string;
  color: "emerald" | "rose";
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${color === "emerald" ? "bg-emerald-400" : "bg-rose-400"}`} />
        <p className="font-bold text-white">{label}</p>
      </div>

      <p className="mt-1 text-sm text-zinc-400">{value}</p>
      <p className={`font-black ${color === "emerald" ? "text-emerald-300" : "text-rose-300"}`}>{amount}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "emerald" | "rose";
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-xl font-black ${color === "emerald" ? "text-emerald-300" : "text-rose-300"}`}>
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "emerald" | "rose";
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3 last:border-b-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`font-black ${color === "emerald" ? "text-emerald-300" : "text-rose-300"}`}>
        {value}
      </span>
    </div>
  );
}

function MetricBox({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: "emerald" | "rose" | "violet";
}) {
  const styles = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[color]}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-white/10 py-5">
      <p className="mb-3 text-sm font-black text-white">{title}</p>
      {children}
    </section>
  );
}

function FilterPill({
  label,
  active,
  color,
}: {
  label: string;
  active?: boolean;
  color: "emerald" | "rose";
}) {
  return (
    <button
      className={`mb-2 mr-2 rounded-xl border px-4 py-2 text-sm font-bold ${
        active
          ? color === "emerald"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          : "border-white/10 bg-white/[0.03] text-zinc-400"
      }`}
    >
      {label}
    </button>
  );
}

function calculateMetrics(trades: CloudTrade[]) {
  const pnlValues = trades.map(getPnl);
  const winners = pnlValues.filter((value) => value > 0);
  const losers = pnlValues.filter((value) => value < 0);

  const totalPnl = pnlValues.reduce((sum, value) => sum + value, 0);
  const grossProfit = winners.reduce((sum, value) => sum + value, 0);
  const grossLoss = Math.abs(losers.reduce((sum, value) => sum + value, 0));
  const totalTrades = trades.length;

  const averageWin = winners.length ? grossProfit / winners.length : 0;
  const averageLoss = losers.length ? grossLoss / losers.length : 0;
  const winRate = totalTrades ? Math.round((winners.length / totalTrades) * 100) : 0;
  const lossRate = totalTrades ? Math.round((losers.length / totalTrades) * 100) : 0;
  const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;
  const bestTrade = pnlValues.length ? Math.max(...pnlValues) : 0;
  const worstTrade = pnlValues.length ? Math.min(...pnlValues) : 0;

  let runningTotal = 0;
  let peak = 0;
  let maxDrawdown = 0;

  pnlValues.forEach((value) => {
    runningTotal += value;
    peak = Math.max(peak, runningTotal);
    maxDrawdown = Math.min(maxDrawdown, runningTotal - peak);
  });

  const { longestWinStreak, longestLossStreak } = calculateLongestStreaks(pnlValues);
  const disciplineScore = calculateDisciplineScore(trades);

  return {
    totalPnl,
    grossProfit,
    grossLoss,
    totalTrades,
    averageWin,
    averageLoss,
    winRate,
    lossRate,
    profitFactor,
    bestTrade,
    worstTrade,
    maxDrawdown,
    longestWinStreak,
    longestLossStreak,
    disciplineScore,
  };
}

function calculateLongestStreaks(values: number[]) {
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;

  values.forEach((value) => {
    if (value > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
    } else if (value < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }

    longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
  });

  return { longestWinStreak, longestLossStreak };
}

function calculateDisciplineScore(trades: CloudTrade[]) {
  let followed = 0;
  let total = 0;

  trades.forEach((trade) => {
    trade.ruleResults?.forEach((rule) => {
      total++;

      if (rule.status === "Followed") followed++;
    });
  });

  if (!total) return 0;

  return Math.round((followed / total) * 100);
}

function filterTradesByRange(trades: CloudTrade[], range: TimeRange) {
  if (range === "All Time") return trades;

  const now = new Date();
  const startDate = new Date(now);

  if (range === "Today") {
    startDate.setHours(0, 0, 0, 0);
  }

  if (range === "7D") {
    startDate.setDate(now.getDate() - 7);
  }

  if (range === "30D") {
    startDate.setDate(now.getDate() - 30);
  }

  if (range === "90D") {
    startDate.setDate(now.getDate() - 90);
  }

  if (range === "YTD") {
    startDate.setMonth(0, 1);
    startDate.setHours(0, 0, 0, 0);
  }

  if (range === "1Y") {
    startDate.setFullYear(now.getFullYear() - 1);
  }

  return trades.filter((trade) => {
    const date = parseTradeDate(trade.date);
    if (!date) return false;

    return date >= startDate && date <= now;
  });
}

function filterPreviousPeriodTrades(trades: CloudTrade[], range: TimeRange) {
  if (range === "All Time") return [];

  const now = new Date();
  const currentStart = new Date(now);
  const previousStart = new Date(now);

  if (range === "Today") {
    currentStart.setHours(0, 0, 0, 0);
    previousStart.setDate(currentStart.getDate() - 1);
    previousStart.setHours(0, 0, 0, 0);
  }

  if (range === "7D") {
    currentStart.setDate(now.getDate() - 7);
    previousStart.setDate(now.getDate() - 14);
  }

  if (range === "30D") {
    currentStart.setDate(now.getDate() - 30);
    previousStart.setDate(now.getDate() - 60);
  }

  if (range === "90D") {
    currentStart.setDate(now.getDate() - 90);
    previousStart.setDate(now.getDate() - 180);
  }

  if (range === "YTD") {
    currentStart.setMonth(0, 1);
    currentStart.setHours(0, 0, 0, 0);
    previousStart.setFullYear(currentStart.getFullYear() - 1);
  }

  if (range === "1Y") {
    currentStart.setFullYear(now.getFullYear() - 1);
    previousStart.setFullYear(now.getFullYear() - 2);
  }

  return trades.filter((trade) => {
    const date = parseTradeDate(trade.date);
    if (!date) return false;

    return date >= previousStart && date < currentStart;
  });
}

function parseTradeDate(value?: string) {
  if (!value) return null;

  const cleanValue = value.slice(0, 10);
  const [year, month, day] = cleanValue.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function getTradeTime(trade: CloudTrade) {
  const date = parseTradeDate(trade.date);
  return date ? date.getTime() : 0;
}

function getPnl(trade: CloudTrade) {
  return Number(trade.pnl || 0);
}

function formatCurrency(value: number) {
  const sign = value < 0 ? "-" : "";

  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercentChange(current: number, previous: number) {
  if (!previous) return "0%";

  const change = ((current - previous) / Math.abs(previous)) * 100;

  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

function formatNumberChange(current: number, previous: number) {
  const change = current - previous;

  if (Math.abs(change) < 0.01) return "0";

  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;
}

function formatShortDate(date: Date | null) {
  if (!date) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getRangeLabel(range: TimeRange, trades: CloudTrade[]) {
  if (trades.length === 0) return range;

  const dates = trades
    .map((trade) => parseTradeDate(trade.date))
    .filter(Boolean) as Date[];

  if (dates.length === 0) return range;

  const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
  const firstDate = sortedDates[0];
  const lastDate = sortedDates[sortedDates.length - 1];

  return `${formatShortDate(firstDate)} - ${formatShortDate(lastDate)}`;
}

function getUniqueSymbols(trades: CloudTrade[]) {
  const symbols = trades
    .map((trade) => trade.symbol?.trim().toUpperCase())
    .filter(Boolean) as string[];

  const uniqueSymbols = Array.from(new Set(symbols));

  return uniqueSymbols.length ? uniqueSymbols : ["NQ", "MNQ", "ES", "MES"];
}
