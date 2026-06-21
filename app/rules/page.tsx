"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/dashboard/page-shell";

type RuleStatus = "Followed" | "Broken";

type RuleCategory =
  | "Risk"
  | "Psychology"
  | "Strategy"
  | "Timing"
  | "Money Management"
  | "Discipline";

type Rule = {
  id: number;
  title: string;
  description: string;
  category: RuleCategory;
  followed: number;
  broken: number;
  status: RuleStatus;
};

const categories = [
  "All Rules",
  "Risk",
  "Psychology",
  "Strategy",
  "Timing",
  "Money Management",
  "Discipline",
];

const defaultRules: Rule[] = [
  {
    id: 1,
    title: "No revenge trading",
    description: "Take a break after a loss. No emotional entries.",
    category: "Psychology",
    followed: 0,
    broken: 0,
    status: "Followed",
  },
  {
    id: 2,
    title: "Max 2 trades per day",
    description: "Quality over quantity. Avoid overtrading.",
    category: "Risk",
    followed: 0,
    broken: 0,
    status: "Followed",
  },
  {
    id: 3,
    title: "Only A+ setups",
    description: "Trade only when the setup matches the plan.",
    category: "Strategy",
    followed: 0,
    broken: 0,
    status: "Followed",
  },
  {
    id: 4,
    title: "No lunch session trades",
    description: "Avoid slow and random market conditions.",
    category: "Timing",
    followed: 0,
    broken: 0,
    status: "Followed",
  },
  {
    id: 5,
    title: "Risk max 1%",
    description: "Protect the account from oversized positions.",
    category: "Money Management",
    followed: 0,
    broken: 0,
    status: "Followed",
  },
  {
    id: 6,
    title: "Review trades daily",
    description: "Review every trade and learn from execution.",
    category: "Discipline",
    followed: 0,
    broken: 0,
    status: "Followed",
  },
];

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>(defaultRules);
  const [selectedCategory, setSelectedCategory] = useState("All Rules");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<RuleCategory>("Discipline");

  useEffect(() => {
    const saved = localStorage.getItem("tradingRules");

    if (saved) {
      setRules(JSON.parse(saved));
    } else {
      localStorage.setItem("tradingRules", JSON.stringify(defaultRules));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tradingRules", JSON.stringify(rules));
  }, [rules]);

  function getCategoryIcon(category: string) {
    if (category === "Risk") return "🛡";
    if (category === "Psychology") return "🧠";
    if (category === "Strategy") return "◎";
    if (category === "Timing") return "◷";
    if (category === "Money Management") return "$";
    if (category === "Discipline") return "✓";
    return "•";
  }

  function getCategoryStyle(category: string, active = false) {
    if (category === "Risk") {
      return active
        ? "border-violet-500/50 bg-violet-500/20 text-violet-100 shadow-[0_0_26px_rgba(139,92,246,0.3)]"
        : "border-violet-500/25 bg-violet-500/10 text-violet-300";
    }

    if (category === "Psychology") {
      return active
        ? "border-pink-500/50 bg-pink-500/20 text-pink-100 shadow-[0_0_26px_rgba(236,72,153,0.3)]"
        : "border-pink-500/25 bg-pink-500/10 text-pink-300";
    }

    if (category === "Strategy") {
      return active
        ? "border-amber-500/50 bg-amber-500/20 text-amber-100 shadow-[0_0_26px_rgba(245,158,11,0.3)]"
        : "border-amber-500/25 bg-amber-500/10 text-amber-300";
    }

    if (category === "Timing") {
      return active
        ? "border-blue-500/50 bg-blue-500/20 text-blue-100 shadow-[0_0_26px_rgba(59,130,246,0.3)]"
        : "border-blue-500/25 bg-blue-500/10 text-blue-300";
    }

    if (category === "Money Management") {
      return active
        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-100 shadow-[0_0_26px_rgba(16,185,129,0.3)]"
        : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
    }

    if (category === "Discipline") {
      return active
        ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.3)]"
        : "border-cyan-500/25 bg-cyan-500/10 text-cyan-300";
    }

    return active
      ? "border-violet-500 bg-violet-500 text-white"
      : "border-white/10 bg-black/30 text-zinc-400";
  }

  function openAddRule() {
    setEditingRuleId(null);
    setNewTitle("");
    setNewDescription("");
    setNewCategory("Discipline");
    setIsAddOpen(true);
  }

  function openEditRule(rule: Rule) {
    setEditingRuleId(rule.id);
    setNewTitle(rule.title);
    setNewDescription(rule.description);
    setNewCategory(rule.category);
    setIsAddOpen(true);
  }

  function saveRule() {
    if (!newTitle.trim()) return;

    if (editingRuleId !== null) {
      setRules((prev) =>
        prev.map((rule) =>
          rule.id === editingRuleId
            ? {
                ...rule,
                title: newTitle.trim(),
                description: newDescription.trim() || "Custom trading rule",
                category: newCategory,
              }
            : rule
        )
      );
    } else {
      const newRule: Rule = {
        id: Date.now(),
        title: newTitle.trim(),
        description: newDescription.trim() || "Custom trading rule",
        category: newCategory,
        followed: 0,
        broken: 0,
        status: "Followed",
      };

      setRules([newRule, ...rules]);
    }

    setNewTitle("");
    setNewDescription("");
    setNewCategory("Discipline");
    setEditingRuleId(null);
    setIsAddOpen(false);
  }

  function deleteRule(id: number) {
    setRules(rules.filter((rule) => rule.id !== id));
  }

  function updateRuleStatus(id: number, status: RuleStatus) {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id !== id) return rule;

        return {
          ...rule,
          followed: status === "Followed" ? rule.followed + 1 : rule.followed,
          broken: status === "Broken" ? rule.broken + 1 : rule.broken,
          status,
        };
      })
    );
  }

  const filteredRules =
    selectedCategory === "All Rules"
      ? rules
      : rules.filter((rule) => rule.category === selectedCategory);

  const totalFollowed = rules.reduce((sum, rule) => sum + rule.followed, 0);
  const totalBroken = rules.reduce((sum, rule) => sum + rule.broken, 0);
  const totalActions = totalFollowed + totalBroken;

  const disciplineScore =
    totalActions > 0 ? Math.round((totalFollowed / totalActions) * 100) : 0;

  const categoryStats = useMemo(() => {
    return categories
      .filter((category) => category !== "All Rules")
      .map((category) => {
        const categoryRules = rules.filter((rule) => rule.category === category);

        const followed = categoryRules.reduce(
          (sum, rule) => sum + rule.followed,
          0
        );

        const broken = categoryRules.reduce(
          (sum, rule) => sum + rule.broken,
          0
        );

        const total = followed + broken;
        const score = total > 0 ? Math.round((followed / total) * 100) : 0;

        return { category, score };
      });
  }, [rules]);

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-[11px] font-black uppercase tracking-[0.38em] text-violet-400">
              Trader Discipline
            </p>

            <h1 className="text-5xl font-black tracking-tight text-white">
              Rules
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Build consistency through discipline.
            </p>
          </div>

          <button
            onClick={openAddRule}
            className="rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-black text-white shadow-[0_0_38px_rgba(139,92,246,0.38)] transition hover:scale-[1.03]"
          >
            + Add Rule
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-[24px] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/18 via-zinc-950 to-black p-4 shadow-[0_0_35px_rgba(16,185,129,0.12)]">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-200/70">
              Discipline Score
            </p>
            <h2 className="mt-3 text-4xl font-black text-emerald-300">
              {disciplineScore}%
            </h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{ width: `${disciplineScore}%` }}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-blue-500/25 bg-gradient-to-br from-blue-500/18 via-zinc-950 to-black p-4 shadow-[0_0_35px_rgba(59,130,246,0.12)]">
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">
              Rules Followed
            </p>
            <h2 className="mt-3 text-4xl font-black text-blue-300">
              {totalFollowed}
            </h2>
            <p className="mt-2 text-xs text-zinc-500">Total completions</p>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-rose-500/25 bg-gradient-to-br from-rose-500/18 via-zinc-950 to-black p-4 shadow-[0_0_35px_rgba(244,63,94,0.12)]">
            <p className="text-[11px] font-black uppercase tracking-widest text-rose-200/70">
              Rules Broken
            </p>
            <h2 className="mt-3 text-4xl font-black text-rose-300">
              {totalBroken}
            </h2>
            <p className="mt-2 text-xs text-zinc-500">Total violations</p>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-violet-500/25 bg-gradient-to-br from-violet-500/18 via-zinc-950 to-black p-4 shadow-[0_0_35px_rgba(139,92,246,0.12)]">
            <p className="text-[11px] font-black uppercase tracking-widest text-violet-200/70">
              Active Rules
            </p>
            <h2 className="mt-3 text-4xl font-black text-violet-300">
              {rules.length}
            </h2>
            <p className="mt-2 text-xs text-zinc-500">Currently tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_330px] gap-5">
          <section className="rounded-[28px] border border-white/10 bg-[#070b16]/85 p-4 shadow-[0_0_55px_rgba(15,23,42,0.7)]">
            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-xl border px-4 py-2 text-xs font-black transition ${
                    selectedCategory === category
                      ? getCategoryStyle(category, true)
                      : "border-white/10 bg-black/25 text-zinc-500 hover:border-violet-500/30 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid min-h-[88px] grid-cols-[44px_1fr_86px_86px_92px_190px] items-center gap-3 border-b border-white/10 px-4 py-3 transition last:border-b-0 hover:bg-white/[0.035]"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg font-black ${getCategoryStyle(
                      rule.category
                    )}`}
                  >
                    {getCategoryIcon(rule.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-lg font-black text-white">
                        {rule.title}
                      </h2>

                      <span
                        className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black ${getCategoryStyle(
                          rule.category
                        )}`}
                      >
                        {rule.category}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {rule.description}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-black text-emerald-300">
                      {rule.followed}
                    </p>
                    <p className="text-[10px] text-zinc-600">Followed</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-black text-rose-300">
                      {rule.broken}
                    </p>
                    <p className="text-[10px] text-zinc-600">Broken</p>
                  </div>

                  <span
                    className={`w-fit rounded-xl border px-3 py-2 text-[11px] font-black ${
                      rule.status === "Followed"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    {rule.status}
                  </span>

                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => updateRuleStatus(rule.id, "Followed")}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-[10px] font-black text-emerald-300 hover:bg-emerald-500/20"
                    >
                      ✓
                    </button>

                    <button
                      onClick={() => updateRuleStatus(rule.id, "Broken")}
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-[10px] font-black text-rose-300 hover:bg-rose-500/20"
                    >
                      ×
                    </button>

                    <button
                      onClick={() => openEditRule(rule)}
                      className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-2 text-[10px] font-black text-cyan-300 hover:bg-cyan-500/20"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[10px] font-black text-zinc-500 hover:border-rose-500/40 hover:text-rose-300"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-[#070b16]/85 p-5 shadow-[0_0_55px_rgba(15,23,42,0.65)]">
              <h2 className="text-xl font-black text-white">Rule Categories</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Performance by category.
              </p>

              <div className="mt-5 space-y-4">
                {categoryStats.map((item) => (
                  <div key={item.category}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-300">
                        {item.category}
                      </p>

                      <p className="text-xs font-black text-white">
                        {item.score}%
                      </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${
                          item.category === "Risk"
                            ? "bg-violet-400"
                            : item.category === "Psychology"
                            ? "bg-pink-400"
                            : item.category === "Strategy"
                            ? "bg-amber-400"
                            : item.category === "Timing"
                            ? "bg-blue-400"
                            : item.category === "Money Management"
                            ? "bg-emerald-400"
                            : "bg-cyan-400"
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-violet-500/20 bg-violet-500/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-300">
                Focus
              </p>

              <h3 className="mt-3 text-2xl font-black text-white">
                Trade the plan.
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Every click should match a rule, setup and risk plan.
              </p>
            </div>
          </aside>
        </div>

        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[30px] border border-violet-500/20 bg-[#070914] p-6 shadow-[0_0_85px_rgba(139,92,246,0.24)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.3em] text-violet-400">
                    {editingRuleId ? "Edit Rule" : "Custom Rule"}
                  </p>

                  <h2 className="text-3xl font-black text-white">
                    {editingRuleId ? "Edit Rule" : "Add Rule"}
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingRuleId(null);
                  }}
                  className="rounded-2xl border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Rule title"
                  className="w-full rounded-2xl border border-zinc-800 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-600 focus:border-violet-400"
                />

                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Rule description"
                  className="min-h-24 w-full resize-none rounded-2xl border border-zinc-800 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-600 focus:border-violet-400"
                />

                <div className="grid grid-cols-2 gap-3">
                  {categories
                    .filter((category) => category !== "All Rules")
                    .map((category) => {
                      const active = newCategory === category;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() =>
                            setNewCategory(category as RuleCategory)
                          }
                          className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                            active
                              ? getCategoryStyle(category, true)
                              : "border-zinc-800 bg-black/40 text-zinc-500 hover:border-zinc-600 hover:text-white"
                          }`}
                        >
                          {getCategoryIcon(category)} {category}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={saveRule}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-4 text-sm font-black text-white shadow-[0_0_38px_rgba(139,92,246,0.35)]"
                >
                  {editingRuleId ? "Save Changes" : "Save Rule"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}