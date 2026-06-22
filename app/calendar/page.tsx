"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/dashboard/page-shell";
import NewTradeModal, { Trade } from "@/components/dashboard/new-trade-modal";
import { supabase } from "@/lib/supabase";

type CloudTrade = Trade & {
  id?: number;
  user_id?: string;
};

type CalendarDay = {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  pnl: number;
  trades: CloudTrade[];
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [trades, setTrades] = useState<CloudTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<CloudTrade | null>(null);

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

  function openEditTrade(trade: CloudTrade) {
    setEditingTrade(trade);
    setIsEditOpen(true);
  }

  async function handleSaveTrade(trade: Trade) {
    if (!editingTrade?.id) return;

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

    const { error } = await supabase
      .from("trades")
      .update(tradePayload)
      .eq("id", editingTrade.id);

    if (error) {
      alert(error.message);
      return;
    }

    setIsEditOpen(false);
    setEditingTrade(null);
    loadTrades();
  }

  const calendarDays = useMemo(() => {
    return buildCalendarDays(currentDate, trades);
  }, [currentDate, trades]);

  useEffect(() => {
    if (calendarDays.length > 0) {
      const firstTradingDay = calendarDays.find(
        (day) => day.isCurrentMonth && day.trades.length > 0
      );

      setSelectedDay(firstTradingDay || calendarDays[0]);
    }
  }, [calendarDays]);

  const tradingDays = calendarDays.filter(
    (day) => day.isCurrentMonth && day.trades.length > 0
  );

  const winningDays = tradingDays.filter((day) => day.pnl > 0);

  const monthPnl = tradingDays.reduce((sum, day) => sum + day.pnl, 0);

  const bestDay = tradingDays.length
    ? [...tradingDays].sort((a, b) => b.pnl - a.pnl)[0]
    : null;

  function previousMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
          Loading calendar...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.38em] text-violet-400">
              Trading Calendar
            </p>

            <h1 className="text-5xl font-black tracking-tight text-white">
              Calendar
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Track daily performance, win rate and trading behavior.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={previousMonth}
              className="rounded-2xl border border-white/10 bg-[#070b16]/90 px-5 py-3 text-lg font-black text-white transition hover:border-violet-500/40 hover:bg-violet-500/10"
            >
              ‹
            </button>

            <div className="rounded-2xl border border-white/10 bg-[#070b16]/90 px-6 py-3 text-sm font-black text-white shadow-[0_0_35px_rgba(15,23,42,0.45)]">
              {currentDate.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <button
              onClick={nextMonth}
              className="rounded-2xl border border-white/10 bg-[#070b16]/90 px-5 py-3 text-lg font-black text-white transition hover:border-violet-500/40 hover:bg-violet-500/10"
            >
              ›
            </button>

            <button
              onClick={goToday}
              className="rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-black text-white shadow-[0_0_45px_rgba(139,92,246,0.35)] transition hover:scale-[1.03]"
            >
              Today
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <StatCard
            title="Trading Days"
            value={`${tradingDays.length}`}
            subtitle="Days with trades"
            color="violet"
          />

          <StatCard
            title="Winning Days"
            value={`${winningDays.length}`}
            subtitle={`${getPercent(
              winningDays.length,
              tradingDays.length
            )}% of trading days`}
            color="emerald"
          />

          <StatCard
            title="Month P&L"
            value={`$${monthPnl.toFixed(2)}`}
            subtitle="Current month result"
            color={monthPnl >= 0 ? "emerald" : "rose"}
          />

          <StatCard
            title="Best Day"
            value={bestDay ? `$${bestDay.pnl.toFixed(2)}` : "$0.00"}
            subtitle={bestDay ? formatDate(bestDay.date) : "No data yet"}
            color="cyan"
          />
        </div>

        {trades.length === 0 ? (
          <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-10 text-center shadow-[0_0_60px_rgba(15,23,42,0.65)]">
            <h2 className="text-3xl font-black text-white">No trades yet</h2>

            <p className="mt-3 text-sm text-zinc-500">
              Add trades from the dashboard to start seeing your trading
              calendar.
            </p>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
            <section className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.65)]">
              <div className="grid grid-cols-7 gap-3">
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day}
                    className="pb-2 text-center text-sm font-black text-zinc-400"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((day) => (
                  <button
                    key={day.date.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={getDayClass(day, selectedDay)}
                  >
                    <span
                      className={`text-lg font-black ${
                        day.isCurrentMonth ? "text-white" : "text-zinc-700"
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {day.trades.length > 0 ? (
                      <div className="mt-5 space-y-1">
                        <span className={getPnlTextClass(day.pnl)}>
                          {day.pnl >= 0 ? "+" : "-"}$
                          {Math.abs(day.pnl).toFixed(0)}
                        </span>

                        <span className="block text-xs font-black text-zinc-400">
                          {getDayWinRate(day)}% WR
                        </span>
                      </div>
                    ) : (
                      <div className="mt-5 text-xl font-black text-zinc-700">
                        -
                      </div>
                    )}

                    {day.trades.length > 0 && (
                      <span className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-black text-zinc-400">
                        {day.trades.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-zinc-500">
                <Legend color="bg-emerald-400" label="Profit Day" />
                <Legend color="bg-rose-400" label="Loss Day" />
                <Legend color="bg-zinc-500" label="Breakeven" />
                <Legend color="bg-black" label="No Trades" />
              </div>
            </section>

            <aside className="space-y-5">
              <DayDetails day={selectedDay} onEditTrade={openEditTrade} />

              <div className="relative overflow-hidden rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-[#12071d] p-6">
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-300">
                  Focus
                </p>

                <h3 className="mt-4 text-3xl font-black text-white">
                  Let the calendar show the truth.
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Green days are not the goal. Consistent decisions are the
                  goal.
                </p>
              </div>
            </aside>
          </div>
        )}

        <NewTradeModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingTrade(null);
          }}
          onSave={handleSaveTrade}
          initialData={editingTrade}
        />
      </div>
    </PageShell>
  );
}

function DayDetails({
  day,
  onEditTrade,
}: {
  day: CalendarDay | null;
  onEditTrade: (trade: CloudTrade) => void;
}) {
  if (!day) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.65)]">
        <p className="text-zinc-500">Select a day</p>
      </div>
    );
  }

  const wins = day.trades.filter((trade) => Number(trade.pnl || 0) > 0);
  const winRate = getPercent(wins.length, day.trades.length);

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#070b16]/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.65)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
            Day Details
          </p>

          <h2 className="mt-3 text-2xl font-black text-white">
            {formatDate(day.date)}
          </h2>
        </div>

        <span
          className={`rounded-xl border px-3 py-2 text-xs font-black ${
            day.pnl > 0
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : day.pnl < 0
              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
              : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
          }`}
        >
          {day.pnl > 0 ? "Win" : day.pnl < 0 ? "Loss" : "Neutral"}
        </span>
      </div>

      <p
        className={`mt-6 text-5xl font-black ${
          day.pnl >= 0 ? "text-emerald-300" : "text-rose-300"
        }`}
      >
        {day.pnl >= 0 ? "+" : "-"}${Math.abs(day.pnl).toFixed(2)}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <InfoBox title="Trades" value={`${day.trades.length}`} />
        <InfoBox title="Win Rate" value={`${winRate}%`} />
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
          Trades
        </p>

        {day.trades.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
            No trades this day.
          </div>
        ) : (
          day.trades.map((trade, index) => {
            const pnl = Number(trade.pnl || 0);

            return (
              <button
                key={trade.id || index}
                onClick={() => onEditTrade(trade)}
                className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-violet-500/40 hover:bg-violet-500/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-white">
                      {trade.symbol || "Unknown"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {trade.direction || "No direction"} · Click to edit
                    </p>
                  </div>

                  <p
                    className={`text-lg font-black ${
                      pnl >= 0 ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toFixed(2)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
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
  color: "emerald" | "cyan" | "rose" | "violet";
}) {
  const styles = {
    emerald: "border-emerald-500/20 from-emerald-500/12 text-emerald-300",
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

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function buildCalendarDays(currentDate: Date, trades: CloudTrade[]) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);

  const day = firstDay.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  startDate.setDate(firstDay.getDate() + mondayOffset);

  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayTrades = trades.filter((trade) => {
      return isSameDay(parseTradeDate(trade.date), date);
    });

    const pnl = dayTrades.reduce(
      (sum, trade) => sum + Number(trade.pnl || 0),
      0
    );

    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      pnl,
      trades: dayTrades,
    });
  }

  return days;
}

function getDayClass(day: CalendarDay, selectedDay: CalendarDay | null) {
  const isSelected = selectedDay && isSameDay(selectedDay.date, day.date);

  let base =
    "relative min-h-[118px] rounded-[18px] border p-4 text-left transition overflow-hidden";

  if (!day.isCurrentMonth) {
    base += " border-white/5 bg-black/20 text-zinc-700 hover:border-white/10";
  } else if (day.trades.length === 0) {
    base +=
      " border-white/10 bg-[#070b16]/80 hover:border-violet-500/30 hover:bg-violet-500/5";
  } else if (day.pnl > 0) {
    base +=
      " border-emerald-500/25 bg-gradient-to-br from-emerald-500/20 via-emerald-500/8 to-black shadow-[0_0_35px_rgba(16,185,129,0.14)] hover:border-emerald-400/50";
  } else if (day.pnl < 0) {
    base +=
      " border-rose-500/25 bg-gradient-to-br from-rose-500/20 via-rose-500/8 to-black shadow-[0_0_35px_rgba(244,63,94,0.14)] hover:border-rose-400/50";
  } else {
    base +=
      " border-zinc-500/20 bg-gradient-to-br from-zinc-500/10 to-black hover:border-zinc-400/40";
  }

  if (isSelected) {
    base += " ring-2 ring-violet-400 shadow-[0_0_45px_rgba(139,92,246,0.45)]";
  }

  return base;
}

function getPnlTextClass(pnl: number) {
  if (pnl > 0) return "block text-xl font-black text-emerald-300";
  if (pnl < 0) return "block text-xl font-black text-rose-300";
  return "block text-xl font-black text-zinc-500";
}

function getDayWinRate(day: CalendarDay) {
  if (day.trades.length === 0) return 0;

  const wins = day.trades.filter((trade) => Number(trade.pnl || 0) > 0);

  return Math.round((wins.length / day.trades.length) * 100);
}

function parseTradeDate(value?: string) {
  if (!value) return null;

  const cleanValue = value.slice(0, 10);
  const [year, month, day] = cleanValue.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function isSameDay(dateA: Date | null, dateB: Date) {
  if (!dateA) return false;

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function getPercent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}