"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EquityPoint } from "@/components/dashboard/types";

type EquityCurveCardProps = {
  data: EquityPoint[];
};

export function EquityCurveCard({ data }: EquityCurveCardProps) {
  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center sm:p-8">
        <h2 className="text-base font-semibold text-zinc-100">No equity data yet</h2>
        <p className="mt-2 text-sm text-zinc-500">Add your first trade</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Equity Curve</h2>
          <p className="text-sm text-zinc-500">Performance over recent sessions</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
          +12.9% MTD
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
           <Tooltip
  contentStyle={{
    backgroundColor: "#09090b",
    border: "1px solid #27272a",
    borderRadius: "16px",
  }}
  labelStyle={{
    color: "#a1a1aa",
  }}
  formatter={(value) => [
    `$${Number(value).toLocaleString()}`,
    "Equity",
  ]}
/>
            <Line
              type="monotone"
              dataKey="equity"
              stroke="#34d399"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#34d399" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
