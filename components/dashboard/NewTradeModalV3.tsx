"use client";

import { useEffect, useMemo, useState } from "react";
export type TradeRuleResult = {
  id: number;
  title: string;
  status: "Followed" | "Broken";
};

export type Trade = {
  symbol: string;
  direction: string;
  entry: string;
  exit: string;
  stopLoss?: string;
  takeProfit?: string;
  quantity: string;
  pnl: string;
  reason: string;
  notes: string;
  date: string;
  mood?: string;
  image?: string;
  ruleResults?: TradeRuleResult[];
};

type RuleStatus =
  | "Followed"
  | "Broken";

type RuleCategory =
  | "Risk"
  | "Psychology"
  | "Strategy"
  | "Timing"
  | "Money Management";

type TradingRule = {
  id: number;
  title: string;
  description: string;
  category: RuleCategory;
  followed: number;
  broken: number;
  status: RuleStatus;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  initialData?: Trade | null;
};
const moods = [
  {
    label: "Calm",
    emoji: "😌",
  },
  {
    label: "Confident",
    emoji: "😎",
  },
  {
    label: "Fear",
    emoji: "😨",
  },
  {
    label: "FOMO",
    emoji: "🔥",
  },
  {
    label: "Anger",
    emoji: "😡",
  },
  {
    label: "Tired",
    emoji: "😴",
  },
  {
    label: "Revenge",
    emoji: "⚡",
  },
];
function getContractMultiplier(
  symbol: string
) {
  const cleanSymbol =
    symbol.toUpperCase().trim();

  if (cleanSymbol === "NQ")
    return 20;

  if (cleanSymbol === "MNQ")
    return 2;

  if (cleanSymbol === "ES")
    return 50;

  if (cleanSymbol === "MES")
    return 5;

  return 1;
}
export default function NewTradeModalV3({
  isOpen,
  onClose,
  onSave,
  initialData,
}: Props) {
    const [symbol, setSymbol] =
  useState("");

const [direction, setDirection] =
  useState("Long");

const [entry, setEntry] =
  useState("");

const [stopLoss, setStopLoss] =
  useState("");

const [takeProfit, setTakeProfit] =
  useState("");

const [exit, setExit] =
  useState("");

const [quantity, setQuantity] =
  useState("");

const [date, setDate] =
  useState("");

const [notes, setNotes] =
  useState("");

const [mood, setMood] =
  useState("");

const [image, setImage] =
  useState<string>("");

const [rules, setRules] =
  useState<TradingRule[]>([]);

const [ruleChecks, setRuleChecks] =
  useState<
    Record<number, RuleStatus>
  >({});
  useEffect(() => {
  const savedRules =
    localStorage.getItem(
      "tradingRules"
    );

  if (!savedRules) return;

  const parsedRules =
    JSON.parse(savedRules);

  setRules(parsedRules);

  const defaults: Record<
    number,
    RuleStatus
  > = {};

  parsedRules.forEach(
    (rule: TradingRule) => {
      defaults[rule.id] =
        "Followed";
    }
  );

  setRuleChecks(defaults);
}, [isOpen]);
const contractMultiplier =
  useMemo(
    () =>
      getContractMultiplier(
        symbol
      ),
    [symbol]
  );

const pnl = useMemo(() => {
  const e = Number(entry);
  const x = Number(exit);
  const q = Number(quantity);

  if (!e || !x || !q)
    return 0;

  const points =
    direction === "Long"
      ? x - e
      : e - x;

  return (
    points *
    q *
    contractMultiplier
  );
}, [
  entry,
  exit,
  quantity,
  direction,
  contractMultiplier,
]);

const riskAmount =
  useMemo(() => {
    const e = Number(entry);
    const sl =
      Number(stopLoss);

    const q =
      Number(quantity);

    if (!e || !sl || !q)
      return 0;

    return (
      Math.abs(e - sl) *
      q *
      contractMultiplier
    );
  }, [
    entry,
    stopLoss,
    quantity,
    contractMultiplier,
  ]);

const rewardAmount =
  useMemo(() => {
    const e = Number(entry);

    const tp =
      Number(takeProfit);

    const q =
      Number(quantity);

    if (!e || !tp || !q)
      return 0;

    return (
      Math.abs(tp - e) *
      q *
      contractMultiplier
    );
  }, [
    entry,
    takeProfit,
    quantity,
    contractMultiplier,
  ]);

const rr = useMemo(() => {
  if (!riskAmount)
    return 0;

  return (
    rewardAmount /
    riskAmount
  );
}, [
  rewardAmount,
  riskAmount,
]);

const tradeStatus =
  pnl > 0
    ? "Winner"
    : pnl < 0
    ? "Loser"
    : "Open";
    if (!isOpen) return null;

function setRuleStatus(
  ruleId: number,
  status: RuleStatus
) {
  setRuleChecks({
    ...ruleChecks,
    [ruleId]: status,
  });
}

function handleImageUpload(
  file: File | undefined
) {
  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setImage(reader.result as string);
  };

  reader.readAsDataURL(file);
}

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

    <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[36px] border border-violet-500/10 bg-[#070914] p-8 text-white shadow-[0_0_120px_rgba(139,92,246,0.18)]">

      {/* HERO */}

      <div className="mb-8 overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-r from-violet-500/15 via-cyan-500/10 to-emerald-500/15 p-8">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-300">
              TRADE PREVIEW
            </p>

            <h2 className="mt-3 text-5xl font-black">
              {symbol || "NQ"}
            </h2>

            <p className="mt-2 text-zinc-400">
              {direction}
            </p>

          </div>

          <div className="text-right">

            <p className="text-sm text-zinc-400">
              Current P&L
            </p>

            <h2
              className={`mt-2 text-6xl font-black ${
                pnl >= 0
                  ? "text-emerald-300"
                  : "text-rose-300"
              }`}
            >
              ${pnl.toFixed(2)}
            </h2>

            <div className="mt-3 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-bold">
              {tradeStatus}
            </div>

          </div>

        </div>
      </div>

      {/* LONG SHORT */}

      <div className="grid gap-4 md:grid-cols-2">

        <button
          type="button"
          onClick={() =>
            setDirection("Long")
          }
          className={`rounded-3xl border p-6 text-left transition ${
            direction === "Long"
              ? "border-emerald-500/40 bg-emerald-500/15 shadow-[0_0_40px_rgba(16,185,129,0.25)]"
              : "border-zinc-800 bg-black/30"
          }`}
        >
          <p className="text-3xl font-black">
            🟢 LONG
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            Buy Position
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setDirection("Short")
          }
          className={`rounded-3xl border p-6 text-left transition ${
            direction === "Short"
              ? "border-rose-500/40 bg-rose-500/15 shadow-[0_0_40px_rgba(244,63,94,0.25)]"
              : "border-zinc-800 bg-black/30"
          }`}
        >
          <p className="text-3xl font-black">
            🔴 SHORT
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            Sell Position
          </p>
        </button>

      </div>

      {/* TRADE INFO */}

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        <input
          value={symbol}
          onChange={(e) =>
            setSymbol(e.target.value)
          }
          placeholder="Symbol"
          className="rounded-3xl border border-zinc-800 bg-black/40 p-5"
        />

        <input
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
          type="date"
          className="rounded-3xl border border-zinc-800 bg-black/40 p-5"
        />

        <input
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          placeholder="Contracts"
          type="number"
          className="rounded-3xl border border-zinc-800 bg-black/40 p-5"
        />

      </div>

      {/* ENTRY STOP TARGET EXIT */}

      <div className="mt-6 grid gap-4 md:grid-cols-4">

        <input
          value={entry}
          onChange={(e) =>
            setEntry(e.target.value)
          }
          placeholder="🔵 Entry"
          type="number"
          className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5"
        />

        <input
          value={stopLoss}
          onChange={(e) =>
            setStopLoss(e.target.value)
          }
          placeholder="🔴 Stop Loss"
          type="number"
          className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5"
        />

        <input
          value={takeProfit}
          onChange={(e) =>
            setTakeProfit(e.target.value)
          }
          placeholder="🟢 Take Profit"
          type="number"
          className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5"
        />

        <input
          value={exit}
          onChange={(e) =>
            setExit(e.target.value)
          }
          placeholder="⚪ Exit"
          type="number"
          className="rounded-3xl border border-zinc-700 bg-zinc-500/5 p-5"
        />

      </div>

      {/* MOOD CHIPS */}

      <div className="mt-6">

        <p className="mb-3 text-sm font-bold text-zinc-400">
          Trade Mood
        </p>

        <div className="flex flex-wrap gap-3">

          {moods.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setMood(item.label)
              }
              className={`rounded-full px-5 py-3 font-bold transition ${
                mood === item.label
                  ? "bg-violet-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.35)]"
                  : "border border-zinc-800 bg-black/30 text-zinc-400"
              }`}
            >
              {item.emoji} {item.label}
            </button>
          ))}

        </div>
      </div>

      {/* KPI */}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard
          title="P&L"
          value={`$${pnl.toFixed(2)}`}
          color="emerald"
        />

        <MetricCard
          title="Risk"
          value={`$${riskAmount.toFixed(2)}`}
          color="rose"
        />

        <MetricCard
          title="Reward"
          value={`$${rewardAmount.toFixed(2)}`}
          color="cyan"
        />

        <MetricCard
          title="RR"
          value={
            rr
              ? `1:${rr.toFixed(2)}`
              : "-"
          }
          color="violet"
        />
      </div>

      {/* SCREENSHOT */}

      <div className="mt-8 rounded-[32px] border border-dashed border-violet-500/30 bg-violet-500/[0.03] p-8">

        <p className="mb-4 text-lg font-black text-violet-300">
          📸 Trade Screenshot
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleImageUpload(
              e.target.files?.[0]
            )
          }
          className="w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:font-bold file:text-white"
        />

        {image && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-800">
            <img
              src={image}
              alt="Trade Screenshot"
              className="max-h-[500px] w-full object-contain"
            />
          </div>
        )}

      </div>

      {/* NOTES */}

      <div className="mt-8">

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          placeholder="What went well? What went wrong? What did you learn?"
          className="min-h-[180px] w-full rounded-[32px] border border-zinc-800 bg-black/40 p-6 text-white outline-none focus:border-violet-400"
        />

      </div>

      {/* RULES */}

      {rules.length > 0 && (
        <div className="mt-8 rounded-[32px] border border-zinc-800 bg-zinc-950/80 p-6">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h3 className="text-2xl font-black">
                Rules Checklist
              </h3>

              <p className="text-zinc-500">
                Discipline matters.
              </p>

            </div>

            <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-300">
              Rules
            </div>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {rules.map((rule) => {

              const selectedStatus =
                ruleChecks[rule.id] ||
                "Followed";

              return (
                <div
                  key={rule.id}
                  className="rounded-3xl border border-zinc-800 bg-black/30 p-5"
                >
                  <p className="font-black">
                    {rule.title}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    {rule.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setRuleStatus(
                          rule.id,
                          "Followed"
                        )
                      }
                      className={`rounded-2xl px-4 py-3 text-sm font-black ${
                        selectedStatus ===
                        "Followed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "border border-zinc-800 text-zinc-500"
                      }`}
                    >
                      ✓ Followed
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRuleStatus(
                          rule.id,
                          "Broken"
                        )
                      }
                      className={`rounded-2xl px-4 py-3 text-sm font-black ${
                        selectedStatus ===
                        "Broken"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "border border-zinc-800 text-zinc-500"
                      }`}
                    >
                      ✕ Broken
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* FOOTER */}

      <div className="mt-8 flex justify-end gap-4">

        <button
          onClick={onClose}
          className="rounded-2xl border border-zinc-700 px-6 py-3 text-zinc-300 hover:bg-zinc-800"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            onSave({
              symbol,
              direction,
              entry,
              exit,
              stopLoss,
              takeProfit,
              quantity,
              pnl: pnl.toFixed(2),
              reason: "",
              notes,
              date,
              mood,
              image,
              ruleResults: rules.map(
                (rule) => ({
                  id: rule.id,
                  title: rule.title,
                  status:
                    ruleChecks[
                      rule.id
                    ] ||
                    "Followed",
                })
              ),
            });

            onClose();
          }}
          className="rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 px-8 py-3 font-black text-black shadow-[0_0_40px_rgba(16,185,129,0.25)]"
        >
          {initialData
            ? "Save Changes"
            : "Save Trade"}
        </button>

      </div>

    </div>
  </div>
);
}

function MetricCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color:
    | "emerald"
    | "rose"
    | "cyan"
    | "violet";
}) {

  const colors = {
    emerald:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",

    rose:
      "border-rose-500/30 bg-rose-500/10 text-rose-300",

    cyan:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",

    violet:
      "border-violet-500/30 bg-violet-500/10 text-violet-300",
  };

  return (
    <div
      className={`rounded-[28px] border p-5 ${colors[color]}`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}