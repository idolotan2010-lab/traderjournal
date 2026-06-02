"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/dashboard/page-shell";
import NewTradeModal, { Trade } from "@/components/dashboard/new-trade-modal";
import { supabase } from "@/lib/supabase";

type CloudTrade = Trade & {
  id: number;
  user_id?: string;
  created_at?: string;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<CloudTrade[]>([]);
  const [selectedTrades, setSelectedTrades] = useState<CloudTrade[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<CloudTrade | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
        .order("id", { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      if (data) {
        setTrades(data as CloudTrade[]);
      }
    }

    loadTrades();
  }, []);

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [year, month]);

  function saveTrades(updatedTrades: CloudTrade[]) {
    setTrades(updatedTrades);
  }

  function getDateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getDayTrades(day: number) {
    const dateKey = getDateKey(day);
    return trades.filter((trade) => trade.date === dateKey);
  }

  function getDayPnl(day: number) {
    return getDayTrades(day).reduce(
      (sum, trade) => sum + Number(trade.pnl || 0),
      0
    );
  }

  function getDayWinRate(day: number) {
    const dayTrades = getDayTrades(day);

    if (dayTrades.length === 0) return 0;

    const wins = dayTrades.filter(
      (trade) => Number(trade.pnl || 0) > 0
    ).length;

    return Math.round((wins / dayTrades.length) * 100);
  }

  function openDayTrades(day: number) {
    setSelectedTrades(getDayTrades(day));
    setSelectedDay(day);
  }

  function closeDayTrades() {
    setSelectedDay(null);
    setSelectedTrades([]);
  }

  function openEditTrade(trade: CloudTrade) {
    const globalIndex = trades.findIndex((item) => item.id === trade.id);

    setEditingTrade(trade);
    setEditingIndex(globalIndex);
    setIsEditOpen(true);
  }

  async function saveEditedTrade(updatedTrade: Trade) {
    if (editingIndex === null) return;

    const tradeToUpdate = trades[editingIndex];

    const { data, error } = await supabase
      .from("trades")
      .update({
        symbol: updatedTrade.symbol,
        direction: updatedTrade.direction,
        entry: updatedTrade.entry,
        exit: updatedTrade.exit,
        quantity: updatedTrade.quantity,
        pnl: updatedTrade.pnl,
        reason: updatedTrade.reason,
        notes: updatedTrade.notes,
        image: updatedTrade.image,
        date: updatedTrade.date,
      })
      .eq("id", tradeToUpdate.id)
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      const updatedTrades = trades.map((trade) =>
        trade.id === tradeToUpdate.id ? (data as CloudTrade) : trade
      );

      saveTrades(updatedTrades);

      if (selectedDay) {
        setSelectedTrades(
          updatedTrades.filter((trade) => trade.date === getDateKey(selectedDay))
        );
      }
    }

    setEditingTrade(null);
    setEditingIndex(null);
    setIsEditOpen(false);
  }

  function goPrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  return (
    <PageShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Calendar View</h1>
            <p className="mt-2 text-zinc-400">
              Track your trading performance by day.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={goPrevMonth}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-xl text-white hover:bg-zinc-900"
            >
              ←
            </button>

            <div className="min-w-52 text-center text-2xl font-bold text-white">
              {monthName}
            </div>

            <button
              onClick={goNextMonth}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-xl text-white hover:bg-zinc-900"
            >
              →
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="mb-5 grid grid-cols-7 gap-5">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-lg font-bold text-zinc-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-5">
            {days.map((day, index) => {
              const pnl = day ? getDayPnl(day) : 0;
              const dayTrades = day ? getDayTrades(day) : [];
              const winRate = day ? getDayWinRate(day) : 0;

              return (
                <div
                  key={index}
                  onClick={() => day && openDayTrades(day)}
                  className={`relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border p-4 transition ${
                    day
                      ? pnl > 0
                        ? "border-emerald-800 bg-emerald-950/30 hover:bg-emerald-950/50"
                        : pnl < 0
                        ? "border-red-800 bg-red-950/30 hover:bg-red-950/50"
                        : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                      : "border-transparent bg-transparent"
                  }`}
                >
                  {day && (
                    <>
                      <span className="absolute left-4 top-4 text-lg font-bold text-zinc-300">
                        {day}
                      </span>

                      {dayTrades.length > 0 && (
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-2xl font-bold ${
                              pnl > 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            ${pnl}
                          </span>

                          <span className="mt-2 text-sm text-zinc-300">
                            {dayTrades.length} Trades | {winRate}% WR
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedDay && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Trades - Day {selectedDay}
                  </h2>
                  <p className="text-zinc-500">All trades from this day</p>
                </div>

                <button
                  onClick={closeDayTrades}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>

              {selectedTrades.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-700 p-10 text-center text-zinc-500">
                  No trades this day.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white">
                            {trade.symbol || "Unknown"}
                          </h3>

                          <p className="text-sm text-zinc-400">
                            {trade.direction} | Entry {trade.entry || "-"} |
                            Exit {trade.exit || "-"}
                          </p>
                        </div>

                        <p
                          className={`text-lg font-bold ${
                            Number(trade.pnl) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          ${trade.pnl || 0}
                        </p>
                      </div>

                      {trade.image && (
                        <img
                          src={trade.image}
                          alt="Trade screenshot"
                          className="mt-4 max-h-48 w-full rounded-xl object-contain"
                        />
                      )}

                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-black/30 p-3">
                          <p className="text-xs text-zinc-500">Reason</p>
                          <p className="text-white">{trade.reason || "-"}</p>
                        </div>

                        <div className="rounded-xl bg-black/30 p-3">
                          <p className="text-xs text-zinc-500">Notes</p>
                          <p className="text-white">{trade.notes || "-"}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => openEditTrade(trade)}
                        className="mt-4 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                      >
                        Edit Trade
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <NewTradeModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingTrade(null);
            setEditingIndex(null);
          }}
          onSave={saveEditedTrade}
          initialData={editingTrade}
        />
      </div>
    </PageShell>
  );
}