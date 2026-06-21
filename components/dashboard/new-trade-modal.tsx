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

type RuleStatus = "Followed" | "Broken";

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
  "Calm",
  "Confident",
  "Fear",
  "FOMO",
  "Anger",
  "Tired",
  "Revenge",
];

function getContractMultiplier(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().trim();

  if (cleanSymbol === "NQ") return 20;
  if (cleanSymbol === "MNQ") return 2;
  if (cleanSymbol === "ES") return 50;
  if (cleanSymbol === "MES") return 5;

  return 1;
}

export default function NewTradeModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: Props) {
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState("Long");

  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [exit, setExit] = useState("");

  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");

  const [notes, setNotes] = useState("");

  const [mood, setMood] = useState("");
  const [image, setImage] =
    useState<string>("");

  const [isMoodOpen, setIsMoodOpen] =
    useState(false);

  const [isDirectionOpen, setIsDirectionOpen] =
    useState(false);

  const [rules, setRules] = useState<
    TradingRule[]
  >([]);

  const [ruleChecks, setRuleChecks] =
    useState<Record<number, RuleStatus>>({});

  useEffect(() => {
    const savedRules =
      localStorage.getItem("tradingRules");

    if (!savedRules) return;

    const parsedRules: TradingRule[] =
      JSON.parse(savedRules);

    setRules(parsedRules);

    const initialChecks: Record<
      number,
      RuleStatus
    > = {};

    parsedRules.forEach((rule) => {
      initialChecks[rule.id] =
        "Followed";
    });

    setRuleChecks(initialChecks);
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setSymbol(initialData.symbol || "");

      setDirection(
        initialData.direction || "Long"
      );

      setEntry(initialData.entry || "");

      setExit(initialData.exit || "");

      setStopLoss(
        (initialData as any).stopLoss || ""
      );

      setTakeProfit(
        (initialData as any).takeProfit || ""
      );

      setQuantity(
        initialData.quantity || ""
      );

      setDate(initialData.date || "");

      setNotes(initialData.notes || "");

      setMood(initialData.mood || "");

      setImage(initialData.image || "");
    } else {
      setSymbol("");

      setDirection("Long");

      setEntry("");

      setExit("");

      setStopLoss("");

      setTakeProfit("");

      setQuantity("");

      setDate("");

      setNotes("");

      setMood("");

      setImage("");
    }
  }, [initialData, isOpen]);

  const contractMultiplier = useMemo(
    () => getContractMultiplier(symbol),
    [symbol]
  );

  const pnl = useMemo(() => {
    const entryValue = Number(entry);
    const exitValue = Number(exit);
    const qty = Number(quantity);

    if (
      !entryValue ||
      !exitValue ||
      !qty
    ) {
      return 0;
    }

    const points =
      direction === "Long"
        ? exitValue - entryValue
        : entryValue - exitValue;

    return (
      points *
      qty *
      contractMultiplier
    );
  }, [
    entry,
    exit,
    quantity,
    direction,
    contractMultiplier,
  ]);

  const riskAmount = useMemo(() => {
    const entryValue = Number(entry);
    const stopValue = Number(stopLoss);
    const qty = Number(quantity);

    if (
      !entryValue ||
      !stopValue ||
      !qty
    ) {
      return 0;
    }

    return (
      Math.abs(
        entryValue - stopValue
      ) *
      qty *
      contractMultiplier
    );
  }, [
    entry,
    stopLoss,
    quantity,
    contractMultiplier,
  ]);

  const rewardAmount = useMemo(() => {
    const entryValue = Number(entry);

    const tpValue =
      Number(takeProfit);

    const qty = Number(quantity);

    if (
      !entryValue ||
      !tpValue ||
      !qty
    ) {
      return 0;
    }

    return (
      Math.abs(
        tpValue - entryValue
      ) *
      qty *
      contractMultiplier
    );
  }, [
    entry,
    takeProfit,
    quantity,
    contractMultiplier,
  ]);

  const plannedRR = useMemo(() => {
    if (!riskAmount) return 0;

    return (
      rewardAmount / riskAmount
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

  function updateRulesStats() {
    const updatedRules = rules.map((rule) => {
      const selectedStatus =
        ruleChecks[rule.id];

      if (selectedStatus === "Broken") {
        return {
          ...rule,
          status: "Broken" as RuleStatus,
          broken: rule.broken + 1,
        };
      }

      return {
        ...rule,
        status: "Followed" as RuleStatus,
        followed: rule.followed + 1,
      };
    });

    localStorage.setItem(
      "tradingRules",
      JSON.stringify(updatedRules)
    );
  }

  function saveTrade() {
    updateRulesStats();

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

      ruleResults: rules.map((rule) => ({
        id: rule.id,
        title: rule.title,
        status:
          ruleChecks[rule.id] ||
          "Followed",
      })),
    });

    onClose();
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
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-zinc-800 bg-[#070914] p-7 text-white shadow-[0_0_80px_rgba(139,92,246,0.18)]">
  
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
              Trade Journal
            </p>
  
            <h2 className="text-3xl font-black">
              {initialData
                ? "Edit Trade"
                : "New Trade"}
            </h2>
  
            <p className="mt-1 text-sm text-zinc-400">
              Log your trade and discipline.
            </p>
          </div>
  
          <button
            onClick={onClose}
            className="rounded-2xl border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Close
          </button>
        </div>
  
        {/* ROW 1 */}
  
        <div className="grid gap-4 md:grid-cols-3">
  
          <input
            value={symbol}
            onChange={(e) =>
              setSymbol(e.target.value)
            }
            placeholder="Symbol"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-white outline-none focus:border-violet-400"
          />
  
          <div className="relative">
  
            <button
              type="button"
              onClick={() =>
                setIsDirectionOpen(
                  !isDirectionOpen
                )
              }
              className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-black/40 p-4"
            >
              {direction}
              <span>⌄</span>
            </button>
  
            {isDirectionOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-violet-500/30 bg-[#0b0f14]">
                {["Long", "Short"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setDirection(item);
                        setIsDirectionOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left hover:bg-violet-500/10"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
  
          <input
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            type="date"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-white outline-none focus:border-violet-400"
          />
        </div>
  
        {/* ROW 2 */}
  
        <div className="mt-4 grid gap-4 md:grid-cols-3">
  
          <input
            value={entry}
            onChange={(e) =>
              setEntry(e.target.value)
            }
            placeholder="Entry"
            type="number"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4"
          />
  
          <input
            value={stopLoss}
            onChange={(e) =>
              setStopLoss(e.target.value)
            }
            placeholder="Stop Loss"
            type="number"
            className="rounded-2xl border border-rose-500/20 bg-black/40 p-4"
          />
  
          <input
            value={takeProfit}
            onChange={(e) =>
              setTakeProfit(e.target.value)
            }
            placeholder="Take Profit"
            type="number"
            className="rounded-2xl border border-emerald-500/20 bg-black/40 p-4"
          />
        </div>
  
        {/* ROW 3 */}
  
        <div className="mt-4 grid gap-4 md:grid-cols-3">
  
          <input
            value={exit}
            onChange={(e) =>
              setExit(e.target.value)
            }
            placeholder="Exit"
            type="number"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4"
          />
  
          <input
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            placeholder="Contracts"
            type="number"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4"
          />
  
          <div className="relative">
  
            <button
              type="button"
              onClick={() =>
                setIsMoodOpen(
                  !isMoodOpen
                )
              }
              className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-black/40 p-4"
            >
              {mood || "Select Mood"}
  
              <span>⌄</span>
            </button>
  
            {isMoodOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-violet-500/30 bg-[#0b0f14]">
                {moods.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMood(item);
                      setIsMoodOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left hover:bg-violet-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
  
        {/* KPI CARDS */}
  
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
  
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
              plannedRR
                ? `1:${plannedRR.toFixed(2)}`
                : "-"
            }
            color="violet"
          />
  
          <MetricCard
            title="Status"
            value={tradeStatus}
            color="amber"
          />
        </div>
              {/* SCREENSHOT */}

      <div className="mt-6 rounded-3xl border border-dashed border-violet-500/20 bg-violet-500/[0.03] p-6">

<p className="mb-4 text-sm font-bold text-violet-300">
  Trade Screenshot
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
  <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800">
    <img
      src={image}
      alt="Trade Screenshot"
      className="max-h-[400px] w-full object-contain"
    />
  </div>
)}
</div>

{/* NOTES */}

<div className="mt-6">

<textarea
  value={notes}
  onChange={(e) =>
    setNotes(e.target.value)
  }
  placeholder="Trade Notes..."
  className="min-h-[140px] w-full rounded-3xl border border-zinc-800 bg-black/40 p-5 text-white outline-none focus:border-violet-400"
/>
</div>

{/* RULES */}

{rules.length > 0 && (
<div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5">

  <div className="mb-5 flex items-center justify-between">

    <div>

      <h3 className="text-xl font-black text-white">
        Did you follow your rules?
      </h3>

      <p className="text-xs text-zinc-500">
        Discipline Check
      </p>

    </div>

    <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300">
      Rules
    </span>

  </div>

  <div className="grid gap-3 md:grid-cols-2">

    {rules.map((rule) => {

      const selectedStatus =
        ruleChecks[rule.id] ||
        "Followed";

      return (

        <div
          key={rule.id}
          className="rounded-2xl border border-zinc-800 bg-black/30 p-4"
        >

          <p className="font-black text-white">
            {rule.title}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {rule.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() =>
                setRuleStatus(
                  rule.id,
                  "Followed"
                )
              }
              className={`rounded-xl border px-3 py-2 text-xs font-black ${
                selectedStatus ===
                "Followed"
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : "border-zinc-800 text-zinc-500"
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
              className={`rounded-xl border px-3 py-2 text-xs font-black ${
                selectedStatus ===
                "Broken"
                  ? "border-rose-500/40 bg-rose-500/20 text-rose-300"
                  : "border-zinc-800 text-zinc-500"
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

{/* BUTTONS */}

<div className="mt-8 flex justify-end gap-3">

<button
  onClick={onClose}
  className="rounded-2xl border border-zinc-700 px-6 py-3 text-zinc-300 hover:bg-zinc-800"
>
  Cancel
</button>

<button
  onClick={saveTrade}
  className="rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 px-7 py-3 font-black text-black shadow-[0_0_35px_rgba(16,185,129,0.25)]"
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
| "violet"
| "amber";
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

amber:
"border-amber-500/30 bg-amber-500/10 text-amber-300",
};

return (
<div
className={`rounded-2xl border p-4 ${colors[color]}`}
>
<p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
{title}
</p>

<p className="mt-2 text-2xl font-black">
{value}
</p>
</div>
);
}