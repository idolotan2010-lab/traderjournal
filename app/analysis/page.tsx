"use client";

import { useState } from "react";

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

const equityData = [
  { day: "May 1", equity: -120 },
  { day: "May 4", equity: -260 },
  { day: "May 7", equity: 180 },
  { day: "May 10", equity: 520 },
  { day: "May 13", equity: 980 },
  { day: "May 16", equity: 1850 },
  { day: "May 19", equity: 2420 },
  { day: "May 22", equity: 2180 },
  { day: "May 25", equity: 3150 },
  { day: "May 28", equity: 3860 },
  { day: "May 31", equity: 4217 },
];

const dayData = [
  { name: "Mon", value: 320 },
  { name: "Tue", value: 1245 },
  { name: "Wed", value: 842 },
  { name: "Thu", value: -120 },
  { name: "Fri", value: 1102 },
  { name: "Sat", value: 466 },
  { name: "Sun", value: -628 },
];

const hourData = [
  { hour: "00", value: 90 },
  { hour: "02", value: -140 },
  { hour: "04", value: 220 },
  { hour: "06", value: 450 },
  { hour: "08", value: -95 },
  { hour: "10", value: 360 },
  { hour: "12", value: 720 },
  { hour: "14", value: 1160 },
  { hour: "16", value: 1280 },
  { hour: "18", value: 760 },
  { hour: "20", value: 300 },
  { hour: "22", value: -80 },
];

const streakData = [
  { index: "1", value: 3 },
  { index: "2", value: 5 },
  { index: "3", value: 7 },
  { index: "4", value: -2 },
  { index: "5", value: 7 },
  { index: "6", value: -8 },
  { index: "7", value: 4 },
  { index: "8", value: 9 },
  { index: "9", value: 6 },
  { index: "10", value: -7 },
  { index: "11", value: -5 },
];

const distributionData = [
  { name: "Winners", value: 64.3 },
  { name: "Losers", value: 35.7 },
];

const timeRanges = ["Today", "7D", "30D", "90D", "YTD", "1Y", "All Time"];

export default function AnalysisDesignPreview() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#050816] p-6 text-white">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.38em] text-violet-400">
              Trading Performance
            </p>

            <h1 className="text-5xl font-black tracking-tight">
              Analysis
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Deep dive into your trading performance, discipline and consistency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.18)]">
              📅 May 1 - May 31, 2024
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
              className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                range === "30D"
                  ? "border border-violet-400/40 bg-violet-500/20 text-violet-200 shadow-[0_0_25px_rgba(139,92,246,0.22)]"
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          <KpiCard title="Total P&L" value="$4,217.68" change="+18.4%" color="emerald" />
          <KpiCard title="Win Rate" value="64.3%" change="-3.2%" color="violet" negative />
          <KpiCard title="Profit Factor" value="2.15" change="+0.31" color="cyan" />
          <KpiCard title="Total Trades" value="146" change="+18" color="blue" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr_1.15fr]">
          <ChartCard title="Equity Curve" className="xl:col-span-1">
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
                <DistributionLine label="Winners" value="64.3%" amount="$6,832.45" color="emerald" />
                <DistributionLine label="Losers" value="35.7%" amount="-$2,614.77" color="rose" />

                <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                  <MiniMetric label="Avg Win" value="$72.68" color="emerald" />
                  <MiniMetric label="Avg Loss" value="-$50.28" color="rose" />
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
              <SummaryRow label="Gross Profit" value="$6,832.45" color="emerald" />
              <SummaryRow label="Gross Loss" value="-$2,614.77" color="rose" />
              <SummaryRow label="Net Profit" value="$4,217.68" color="emerald" />
              <SummaryRow label="Best Day" value="$1,245.50" color="emerald" />
              <SummaryRow label="Worst Day" value="-$628.30" color="rose" />
              <SummaryRow label="Longest Win Streak" value="9" color="emerald" />
              <SummaryRow label="Longest Loss Streak" value="6" color="rose" />
            </div>
          </ChartCard>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-5 shadow-[0_0_55px_rgba(15,23,42,0.65)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">More Metrics</h2>
            <span className="text-xs font-bold text-zinc-500">Filtered by: 30D</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <MetricBox title="Average R:R" value="1.85" color="violet" />
            <MetricBox title="Best Trade" value="$512.45" color="emerald" />
            <MetricBox title="Worst Trade" value="-$312.80" color="rose" />
            <MetricBox title="Max Drawdown" value="-$1,245.30" color="rose" />
            <MetricBox title="Discipline" value="87%" color="violet" />
            <MetricBox title="Avg Winner" value="$72.68" color="emerald" />
          </div>
        </section>

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
                    {["NQ", "MNQ", "ES", "MES"].map((item) => (
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
    </main>
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
  color: "emerald" | "violet" | "cyan" | "orange" | "blue";
  negative?: boolean;
}) {
  const styles = {
    emerald: "border-emerald-500/20 from-emerald-500/12 text-emerald-300",
    violet: "border-violet-500/20 from-violet-500/12 text-violet-300",
    cyan: "border-cyan-500/20 from-cyan-500/12 text-cyan-300",
    orange: "border-orange-500/20 from-orange-500/12 text-orange-300",
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
