import type { TradingDay } from "@/components/dashboard/types";

type TradingCalendarProps = {
  days: TradingDay[];
};

export function TradingCalendar({ days }: TradingCalendarProps) {
  if (days.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center sm:p-8">
        <h2 className="text-base font-semibold text-zinc-100">No calendar data yet</h2>
        <p className="mt-2 text-sm text-zinc-500">Add your first trade</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-100">Trading Calendar</h2>
        <p className="text-sm text-zinc-500">June 2026</p>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500">
        {["M", "T", "W", "T", "F", "S", "S"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((item) => {
          const dayColor =
            item.pnl > 0
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : item.pnl < 0
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-400";

          return (
            <div
              key={item.day}
              className={`rounded-lg border p-2 text-center transition hover:border-zinc-600 ${dayColor}`}
            >
              <p className="text-xs font-medium">{item.day}</p>
              <p className="mt-1 text-[11px]">{item.pnl === 0 ? "-" : `${item.pnl > 0 ? "+" : ""}${item.pnl}%`}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
