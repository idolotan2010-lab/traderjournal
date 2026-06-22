"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  quantity: string;
  pnl: string;
  reason: string;
  notes: string;
  wentWell?: string;
  improvement?: string;
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

const moods = ["Calm", "Confident", "Fear", "FOMO", "Anger", "Tired", "Revenge"];

const moodEmojis: Record<string, string> = {
  Calm: "🙂",
  Confident: "😎",
  Fear: "😟",
  FOMO: "😬",
  Anger: "😡",
  Tired: "😴",
  Revenge: "🔥",
};

const moodThemes: Record<
  string,
  {
    border: string;
    bg: string;
    text: string;
    glow: string;
    description: string;
  }
> = {
  Calm: {
    border: "border-cyan-500/35",
    bg: "bg-cyan-500/[0.08]",
    text: "text-cyan-300",
    glow: "shadow-[0_0_35px_rgba(34,211,238,0.12)]",
    description: "Clear, patient, and controlled.",
  },
  Confident: {
    border: "border-violet-500/40",
    bg: "bg-violet-500/[0.10]",
    text: "text-violet-300",
    glow: "shadow-[0_0_35px_rgba(139,92,246,0.16)]",
    description: "You trusted your setup and execution.",
  },
  Fear: {
    border: "border-orange-500/35",
    bg: "bg-orange-500/[0.08]",
    text: "text-orange-300",
    glow: "shadow-[0_0_35px_rgba(249,115,22,0.12)]",
    description: "You felt hesitation or pressure during the trade.",
  },
  FOMO: {
    border: "border-amber-500/35",
    bg: "bg-amber-500/[0.08]",
    text: "text-amber-300",
    glow: "shadow-[0_0_35px_rgba(245,158,11,0.12)]",
    description: "You may have chased the move.",
  },
  Anger: {
    border: "border-red-500/35",
    bg: "bg-red-500/[0.08]",
    text: "text-red-300",
    glow: "shadow-[0_0_35px_rgba(239,68,68,0.12)]",
    description: "Emotion may have affected your decisions.",
  },
  Tired: {
    border: "border-blue-500/35",
    bg: "bg-blue-500/[0.08]",
    text: "text-blue-300",
    glow: "shadow-[0_0_35px_rgba(59,130,246,0.12)]",
    description: "Energy was low. Execution may suffer here.",
  },
  Revenge: {
    border: "border-rose-500/35",
    bg: "bg-rose-500/[0.08]",
    text: "text-rose-300",
    glow: "shadow-[0_0_35px_rgba(244,63,94,0.12)]",
    description: "Risk of forcing a trade after a loss.",
  },
};

function formatTradeDate(value: string) {
  if (!value) return "Select date";

  const dateValue = new Date(`${value}T00:00:00`);

  if (Number.isNaN(dateValue.getTime())) return value;

  return dateValue.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}


function getContractMultiplier(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().trim();

  if (cleanSymbol === "NQ") return 20;
  if (cleanSymbol === "MNQ") return 2;
  if (cleanSymbol === "ES") return 50;
  if (cleanSymbol === "MES") return 5;

  return 1;
}

function getDisciplineTheme(score: number) {
  if (score >= 90) {
    return {
      label: "Strong",
      text: "text-emerald-300",
      border: "border-emerald-500/40",
      glow: "shadow-[0_0_45px_rgba(16,185,129,0.18)]",
      bg: "bg-emerald-500/10",
      bar: "bg-emerald-400",
      ring: "border-emerald-400",
    };
  }

  if (score >= 70) {
    return {
      label: "Good",
      text: "text-lime-300",
      border: "border-lime-500/40",
      glow: "shadow-[0_0_45px_rgba(132,204,22,0.16)]",
      bg: "bg-lime-500/10",
      bar: "bg-lime-400",
      ring: "border-lime-400",
    };
  }

  if (score >= 50) {
    return {
      label: "Needs Work",
      text: "text-orange-300",
      border: "border-orange-500/40",
      glow: "shadow-[0_0_45px_rgba(249,115,22,0.16)]",
      bg: "bg-orange-500/10",
      bar: "bg-orange-400",
      ring: "border-orange-400",
    };
  }

  return {
    label: "Poor",
    text: "text-red-300",
    border: "border-red-500/40",
    glow: "shadow-[0_0_45px_rgba(239,68,68,0.16)]",
    bg: "bg-red-500/10",
    bar: "bg-red-400",
    ring: "border-red-400",
  };
}

export default function NewTradeModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState("Long");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [wentWell, setWentWell] = useState("");
  const [improvement, setImprovement] = useState("");
  const [mood, setMood] = useState("");
  const [image, setImage] = useState<string>("");
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [ruleChecks, setRuleChecks] = useState<Record<number, RuleStatus>>({});
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedRules = localStorage.getItem("tradingRules");
    if (!savedRules) return;

    const parsedRules: TradingRule[] = JSON.parse(savedRules);
    setRules(parsedRules);

    const initialChecks: Record<number, RuleStatus> = {};
    parsedRules.forEach((rule) => {
      initialChecks[rule.id] = "Followed";
    });

    setRuleChecks(initialChecks);
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setSymbol(initialData.symbol || "");
      setDirection(initialData.direction || "Long");
      setEntry(initialData.entry || "");
      setExit(initialData.exit || "");
      setQuantity(initialData.quantity || "");
      setDate(initialData.date || "");
      setNotes(initialData.notes || "");
      setWentWell((initialData as any).wentWell || "");
      setImprovement((initialData as any).improvement || "");
      setMood(initialData.mood || "");
      setImage(initialData.image || "");
    } else {
      setSymbol("");
      setDirection("Long");
      setEntry("");
      setExit("");
      setQuantity("");
      setDate("");
      setNotes("");
      setWentWell("");
      setImprovement("");
      setMood("");
      setImage("");
    }
  }, [initialData, isOpen]);

  const contractMultiplier = useMemo(() => getContractMultiplier(symbol), [symbol]);

  const pnl = useMemo(() => {
    const entryValue = Number(entry);
    const exitValue = Number(exit);
    const qty = Number(quantity);

    if (!entryValue || !exitValue || !qty) return 0;

    const points = direction === "Long" ? exitValue - entryValue : entryValue - exitValue;
    return points * qty * contractMultiplier;
  }, [entry, exit, quantity, direction, contractMultiplier]);

  const followedRules = useMemo(() => {
    return rules.filter((rule) => (ruleChecks[rule.id] || "Followed") === "Followed").length;
  }, [rules, ruleChecks]);

  const brokenRules = Math.max(rules.length - followedRules, 0);
  const disciplineScore = rules.length ? Math.round((followedRules / rules.length) * 100) : 100;
  const disciplineTheme = getDisciplineTheme(disciplineScore);
  const moodTheme = moodThemes[mood] || moodThemes.Confident;

  const tradeStatus = pnl > 0 ? "Winner" : pnl < 0 ? "Loser" : "Open";

  if (!isOpen) return null;

  function setRuleStatus(ruleId: number, status: RuleStatus) {
    setRuleChecks({ ...ruleChecks, [ruleId]: status });
  }

  function updateRulesStats() {
    const updatedRules = rules.map((rule) => {
      const selectedStatus = ruleChecks[rule.id];

      if (selectedStatus === "Broken") {
        return { ...rule, status: "Broken" as RuleStatus, broken: rule.broken + 1 };
      }

      return { ...rule, status: "Followed" as RuleStatus, followed: rule.followed + 1 };
    });

    localStorage.setItem("tradingRules", JSON.stringify(updatedRules));
  }

  function saveTrade() {
    updateRulesStats();

    onSave({
      symbol,
      direction,
      entry,
      exit,
      quantity,
      pnl: pnl.toFixed(2),
      reason: "",
      notes,
      wentWell,
      improvement,
      date,
      mood,
      image,
      ruleResults: rules.map((rule) => ({
        id: rule.id,
        title: rule.title,
        status: ruleChecks[rule.id] || "Followed",
      })),
    });

    onClose();
  }

  function handleImageUpload(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
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
              {initialData ? "Edit Trade" : "New Trade"}
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

        {/* BASIC TRADE INFO */}

        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-white outline-none focus:border-violet-400"
          />

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-zinc-800 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setDirection("Long")}
              className={`rounded-xl border px-4 py-3 font-black tracking-wide transition-all ${
                direction === "Long"
                  ? "border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
                  : "border-zinc-800 bg-black/30 text-zinc-500 hover:border-emerald-500/25 hover:text-emerald-300"
              }`}
            >
              LONG
            </button>

            <button
              type="button"
              onClick={() => setDirection("Short")}
              className={`rounded-xl border px-4 py-3 font-black tracking-wide transition-all ${
                direction === "Short"
                  ? "border-rose-400/40 bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.15)]"
                  : "border-zinc-800 bg-black/30 text-zinc-500 hover:border-rose-500/25 hover:text-rose-300"
              }`}
            >
              SHORT
            </button>
          </div>

          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="relative rounded-2xl border border-zinc-800 bg-black/40 p-4 text-left text-white outline-none transition hover:border-violet-500/40 focus:border-violet-400"
          >
            <input
              ref={dateInputRef}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="pointer-events-none absolute h-0 w-0 opacity-0"
              tabIndex={-1}
            />

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                  Date
                </p>

                <p className="mt-1 text-lg font-black text-white">
                  {formatTradeDate(date)}
                </p>
              </div>

              <span className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-lg text-violet-300">
                📅
              </span>
            </div>
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Entry"
            type="number"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-white outline-none focus:border-violet-400"
          />

          <input
            value={exit}
            onChange={(e) => setExit(e.target.value)}
            placeholder="Exit"
            type="number"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-white outline-none focus:border-violet-400"
          />

          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Contracts"
            type="number"
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-white outline-none focus:border-violet-400"
          />
        </div>

        {/* KPI CARDS */}

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            title="P&L"
            value={`$${pnl.toFixed(2)}`}
            color={pnl >= 0 ? "emerald" : "rose"}
          />

          <MetricCard
            title="Status"
            value={tradeStatus}
            color={pnl >= 0 ? "emerald" : "rose"}
          />

          <DisciplineCard
            score={disciplineScore}
            followedRules={followedRules}
            totalRules={rules.length}
            theme={disciplineTheme}
          />

          <div className={`relative rounded-2xl border p-5 text-center ${moodTheme.border} ${moodTheme.bg} ${moodTheme.glow}`}>
            <p className="text-left text-xs uppercase tracking-[0.2em] text-zinc-400">
              Mental State
            </p>

            <button
              type="button"
              onClick={() => setIsMoodOpen(!isMoodOpen)}
              className={`mt-3 w-full text-center text-3xl font-black ${moodTheme.text}`}
            >
              {mood || "Select Mood"}
            </button>

            <p className="mt-2 text-5xl">
              {mood ? moodEmojis[mood] : "🙂"}
            </p>

            <p className="mt-3 text-xs text-zinc-400">
              {mood ? moodTheme.description : "Choose your mindset for this trade."}
            </p>

            {isMoodOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 grid w-full gap-2 rounded-2xl border border-zinc-800 bg-[#0b0f14] p-2 text-left shadow-2xl">
                {moods.map((item) => {
                  const itemTheme = moodThemes[item];

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setMood(item);
                        setIsMoodOpen(false);
                      }}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-bold transition ${itemTheme.border} ${itemTheme.bg} ${itemTheme.text} hover:bg-white/5`}
                    >
                      <span className="text-xl">{moodEmojis[item]}</span>
                      {item}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SCREENSHOT */}

        <div className="mt-6 rounded-3xl border border-dashed border-violet-500/20 bg-violet-500/[0.03] p-6">
          <p className="mb-4 text-sm font-bold text-violet-300">
            Trade Screenshot
          </p>

          <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-black/30 text-center transition hover:border-violet-500/50 hover:bg-violet-500/[0.04]">
            <span className="text-4xl text-violet-400">⇧</span>
            <span className="mt-2 font-black text-white">Upload Image</span>
            <span className="mt-1 text-sm text-zinc-500">PNG, JPG up to 10MB</span>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
              className="hidden"
            />
          </label>

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

        {/* PSYCHOLOGY REVIEW */}

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5">
          <div className="mb-5">
            <h3 className="text-xl font-black text-white">
              Trade Review
            </h3>

            <p className="text-xs text-zinc-500">
              Keep it short. This is for learning, not writing a book.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                  ✓
                </span>

                <p className="font-black text-emerald-300">
                  What went well?
                </p>
              </div>

              <textarea
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder="What did you execute well in this trade?"
                className="min-h-[96px] w-full rounded-2xl border border-emerald-500/20 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400"
              />
            </div>

            <div className="rounded-3xl border border-orange-500/25 bg-orange-500/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
                  !
                </span>

                <p className="font-black text-orange-300">
                  What can I improve?
                </p>
              </div>

              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                {[
                  "Entered too early",
                  "Exited too early",
                  "Moved stop",
                  "Overtraded",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setImprovement((current) =>
                        current
                          ? `${current}, ${item}`
                          : item
                      )
                    }
                    className="rounded-xl border border-orange-500/20 bg-black/30 px-3 py-2 text-left text-xs font-bold text-orange-200 hover:border-orange-400/50 hover:bg-orange-500/10"
                  >
                    + {item}
                  </button>
                ))}
              </div>

              <textarea
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                placeholder="What would you do better next time?"
                className="min-h-[80px] w-full rounded-2xl border border-orange-500/20 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-600 focus:border-orange-400"
              />
            </div>
          </div>

          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="General notes..."
              className="min-h-[110px] w-full rounded-3xl border border-zinc-800 bg-black/40 p-5 text-white outline-none placeholder:text-zinc-600 focus:border-violet-400"
            />
          </div>
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

              <div className="flex items-center gap-3">
                <span className={`rounded-full border px-4 py-2 text-xs font-bold ${disciplineTheme.border} ${disciplineTheme.bg} ${disciplineTheme.text}`}>
                  {disciplineScore}% {disciplineTheme.label}
                </span>

                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300">
                  {rules.length} Rules
                </span>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4 text-center">
              <div>
                <p className="text-2xl font-black text-emerald-400">
                  {followedRules}
                </p>
                <p className="text-xs text-emerald-300">Followed</p>
              </div>

              <div className="border-l border-zinc-800">
                <p className="text-2xl font-black text-rose-400">
                  {brokenRules}
                </p>
                <p className="text-xs text-rose-300">Broken</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {rules.map((rule) => {
                const selectedStatus = ruleChecks[rule.id] || "Followed";

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
                        onClick={() => setRuleStatus(rule.id, "Followed")}
                        className={`rounded-xl border px-3 py-2 text-xs font-black ${
                          selectedStatus === "Followed"
                            ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                            : "border-zinc-800 text-zinc-500"
                        }`}
                      >
                        ✓ Followed
                      </button>

                      <button
                        type="button"
                        onClick={() => setRuleStatus(rule.id, "Broken")}
                        className={`rounded-xl border px-3 py-2 text-xs font-black ${
                          selectedStatus === "Broken"
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

            <div className="mt-5 grid gap-2 text-xs text-zinc-400 md:grid-cols-4">
              <GuideDot color="bg-emerald-400" text="90% - 100% Strong" />
              <GuideDot color="bg-lime-400" text="70% - 89% Good" />
              <GuideDot color="bg-orange-400" text="50% - 69% Needs Work" />
              <GuideDot color="bg-red-400" text="0% - 49% Poor" />
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
            {initialData ? "Save Changes" : "Save Trade"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DisciplineCard({
  score,
  followedRules,
  totalRules,
  theme,
}: {
  score: number;
  followedRules: number;
  totalRules: number;
  theme: ReturnType<typeof getDisciplineTheme>;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${theme.border} ${theme.bg} ${theme.glow}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Discipline
        </p>

        <span className="rounded-full border border-white/20 px-2 text-xs text-zinc-300">
          i
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className={`flex h-24 w-24 items-center justify-center rounded-full border-[8px] ${theme.ring} bg-black/30`}>
          <span className={`text-3xl font-black ${theme.text}`}>
            {score}%
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-300">
            <span className={theme.text}>{followedRules}</span> / {totalRules || 0}
          </p>

          <div className="mt-3 h-2 w-full rounded-full bg-zinc-800">
            <div
              className={`h-2 rounded-full ${theme.bar}`}
              style={{ width: `${score}%` }}
            />
          </div>

          <p className={`mt-3 inline-flex rounded-xl px-3 py-1 text-xs font-bold ${theme.bg} ${theme.text}`}>
            {theme.label}
          </p>
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
  color: "emerald" | "rose";
}) {
  const colors = {
    emerald:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.12)]",
    rose:
      "border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_35px_rgba(244,63,94,0.12)]",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        {title}
      </p>

      <p className="mt-6 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

function GuideDot({
  color,
  text,
}: {
  color: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{text}</span>
    </div>
  );
}
