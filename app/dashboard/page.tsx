"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/dashboard/page-shell";
import NewTradeModal, { Trade } from "@/components/dashboard/new-trade-modal";
import { supabase } from "@/lib/supabase";

type CloudTrade = Trade & {
  id?: number;
  user_id?: string;
};

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(false);

  const [trades, setTrades] = useState<CloudTrade[]>([]);

  const [editingTrade, setEditingTrade] =
    useState<CloudTrade | null>(null);

  const [editingIndex, setEditingIndex] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [directionFilter, setDirectionFilter] =
    useState("All");

  const [resultFilter, setResultFilter] =
    useState("All");

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
      alert("You must be logged in");
      return;
    }

    if (editingIndex !== null) {
      const tradeToUpdate = trades[editingIndex];

      if (!tradeToUpdate?.id) {
        alert("Trade has no cloud ID");
        return;
      }

      const { data, error } = await supabase
        .from("trades")
        .update({
          symbol: trade.symbol,
          direction: trade.direction,
          entry: trade.entry,
          exit: trade.exit,
          quantity: trade.quantity,
          pnl: trade.pnl,
          reason: trade.reason,
          notes: trade.notes,
          image: trade.image,
          date: trade.date,
        })
        .eq("id", tradeToUpdate.id)
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        const updatedTrades = trades.map((item, index) =>
          index === editingIndex
            ? (data as CloudTrade)
            : item
        );

        setTrades(updatedTrades);
      }
    } else {
      const { data, error } = await supabase
        .from("trades")
        .insert([
          {
            user_id: user.id,
            symbol: trade.symbol,
            direction: trade.direction,
            entry: trade.entry,
            exit: trade.exit,
            quantity: trade.quantity,
            pnl: trade.pnl,
            reason: trade.reason,
            notes: trade.notes,
            image: trade.image,
            date: trade.date,
          },
        ])
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setTrades([
          data as CloudTrade,
          ...trades,
        ]);
      }
    }

    setEditingTrade(null);
    setEditingIndex(null);
    setIsOpen(false);
  }

  async function deleteTrade(indexToDelete: number) {
    const tradeToDelete = trades[indexToDelete];

    if (!tradeToDelete?.id) {
      setTrades(
        trades.filter(
          (_, index) => index !== indexToDelete
        )
      );

      return;
    }

    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("id", tradeToDelete.id);

    if (error) {
      alert(error.message);
      return;
    }

    setTrades(
      trades.filter(
        (_, index) => index !== indexToDelete
      )
    );
  }

  const totalPnl = trades.reduce(
    (sum, trade) =>
      sum + Number(trade.pnl || 0),
    0
  );

  const filteredTrades = trades.filter(
    (trade) => {
      const matchesSearch = trade.symbol
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesDirection =
        directionFilter === "All"
          ? true
          : trade.direction === directionFilter;

      const pnl = Number(trade.pnl || 0);

      const matchesResult =
        resultFilter === "All"
          ? true
          : resultFilter === "Winners"
          ? pnl > 0
          : pnl < 0;

      return (
        matchesSearch &&
        matchesDirection &&
        matchesResult
      );
    }
  );

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Dashboard
            </h1>

            <p className="text-zinc-400">
              Track your trading performance.
            </p>
          </div>

          <button
            onClick={openAddTrade}
            className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black hover:bg-emerald-400"
          >
            + New Trade
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">
              Total Trades
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {trades.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">
              Net P&L
            </p>

            <h2
              className={`mt-2 text-2xl font-bold ${
                totalPnl >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              ${totalPnl.toFixed(2)}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search Symbol..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white outline-none md:max-w-xs"
          />

          <select
            value={directionFilter}
            onChange={(e) =>
              setDirectionFilter(e.target.value)
            }
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
          >
            <option>All</option>
            <option>Long</option>
            <option>Short</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) =>
              setResultFilter(e.target.value)
            }
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
          >
            <option>All</option>
            <option>Winners</option>
            <option>Losers</option>
          </select>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Recent Trades
            </h2>

            <p className="text-sm text-zinc-500">
              Showing {filteredTrades.length} of{" "}
              {trades.length}
            </p>
          </div>

          {filteredTrades.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center text-zinc-500">
              No trades found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrades.map(
                (trade, index) => {
                  const originalIndex =
                    trades.indexOf(trade);

                  return (
                    <div
                      key={`${trade.id ?? "local"}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
                    >
                      <div>
                        <p className="font-bold text-white">
                          {trade.symbol ||
                            "Unknown"}
                        </p>

                        <p className="text-sm text-zinc-400">
                          {trade.direction} |
                          Entry {trade.entry || "-"} |
                          Exit {trade.exit || "-"}
                        </p>

                        <p className="text-sm text-zinc-500">
                          {trade.reason ||
                            "No reason"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p
                          className={`font-bold ${
                            Number(trade.pnl) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          ${trade.pnl || 0}
                        </p>

                        <button
                          onClick={() =>
                            openEditTrade(
                              originalIndex
                            )
                          }
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteTrade(
                              originalIndex
                            )
                          }
                          className="rounded-lg border border-red-900/60 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

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