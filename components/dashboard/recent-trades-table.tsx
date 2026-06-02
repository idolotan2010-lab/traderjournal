import type { Trade } from "@/components/dashboard/types";
import Link from "next/link";

type RecentTradesTableProps = {
  trades: Trade[];
  onAddFirstTrade?: () => void;
};

export function RecentTradesTable({ trades, onAddFirstTrade }: RecentTradesTableProps) {
  if (trades.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center sm:p-8">
        <h2 className="text-base font-semibold text-zinc-100">No trades yet</h2>
        <button
          type="button"
          onClick={onAddFirstTrade}
          className="mt-2 text-sm text-emerald-300 hover:text-emerald-200"
        >
          Add your first trade
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">Recent Trades</h2>
        <Link href="/trades" className="text-sm text-zinc-400 hover:text-zinc-100">
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="pb-3 font-medium">Symbol</th>
              <th className="pb-3 font-medium">Side</th>
              <th className="pb-3 font-medium">Setup</th>
              <th className="pb-3 font-medium">Result</th>
              <th className="pb-3 text-right font-medium">PnL</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const pnlClass = trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400";
              const sideBadge =
                trade.direction === "Long"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-rose-500/10 text-rose-300";

              return (
                <tr key={trade.id} className="border-b border-zinc-800/70 text-zinc-200">
                  <td className="py-3 font-medium">{trade.symbol}</td>
                  <td className="py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${sideBadge}`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">{trade.setup}</td>
                  <td className="py-3 text-zinc-300">{trade.result}</td>
                  <td className={`py-3 text-right font-semibold ${pnlClass}`}>
                    {trade.pnl >= 0 ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
