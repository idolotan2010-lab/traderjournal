import Link from "next/link";
import PageShell  from "@/components/dashboard/page-shell";

export default function TradesPage() {
  return (
    <PageShell>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center sm:p-10">
        <h2 className="text-lg font-semibold text-zinc-100">No trades yet</h2>
        <p className="mt-2 text-sm text-zinc-500">Add your first trade from Dashboard.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          Go to Dashboard
        </Link>
      </section>
    </PageShell>
  );
}
