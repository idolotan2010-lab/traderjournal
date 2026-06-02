type MetricTone = "profit" | "loss" | "neutral";

type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  tone: MetricTone;
};

const toneClasses: Record<MetricTone, string> = {
  profit: "text-emerald-400",
  loss: "text-rose-400",
  neutral: "text-zinc-300",
};

export function MetricCard({ title, value, change, tone }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.01)] sm:p-5">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{value}</p>
      <p className={`mt-2 text-sm font-medium ${toneClasses[tone]}`}>{change}</p>
    </article>
  );
}
