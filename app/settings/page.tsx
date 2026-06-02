import PageShell from "@/components/dashboard/page-shell";

export default function SettingsPage() {
  return (
    <PageShell>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-10">
        <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Configure your profile, risk defaults, and dashboard preferences here.
        </p>
      </section>
    </PageShell>
  );
}
