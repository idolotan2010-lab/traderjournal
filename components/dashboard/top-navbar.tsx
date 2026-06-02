"use client";

type TopNavbarProps = {
  title?: string;
  subtitle?: string;
  showNewTrade?: boolean;
  onNewTrade?: () => void;
  onExport?: () => void;
};

export function TopNavbar({
  title = "Trading Dashboard",
  subtitle = "Tuesday, Jun 2",
  showNewTrade = true,
  onNewTrade,
  onExport,
}: TopNavbarProps) {
  const handleExport =
    onExport ??
    (() => {
      window.alert("Export is coming soon.");
    });

  const handleNewTrade = onNewTrade ?? (() => {});

  return (
    <header className="flex flex-col gap-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
          {subtitle}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-zinc-100 sm:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
        >
          Export
        </button>
        {showNewTrade ? (
          <button
            type="button"
            onClick={handleNewTrade}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            New Trade
          </button>
        ) : null}
        <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-200">
          JD
        </div>
      </div>
    </header>
  );
}
