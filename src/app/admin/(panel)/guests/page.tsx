import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function GuestsAdmin() {
  const [leads, referrals] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.referralCode.findMany({ orderBy: [{ uses: "desc" }, { createdAt: "desc" }], take: 200 }),
  ]);
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl">Founding Guest list</h1>
        <p className="mt-1 text-sm text-ink-soft">{leads.length} people interested. Email them first when you open dates.</p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-deep/50 text-xs uppercase tracking-wider text-ink-soft"><tr><th className="p-3">Lead</th><th className="p-3">Interest</th><th className="p-3">Joined</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-ink/5"><td className="p-3">{l.name} <span className="text-ink-soft">{l.email}</span></td><td className="p-3 text-ink-soft">{l.interest ?? "—"}</td><td className="p-3 text-xs text-ink-soft">{l.createdAt.toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-3xl">Share the Lake referrals</h2>
        <p className="mt-1 text-sm text-ink-soft">Apply earned credit manually as a discount on the guest's next booking.</p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-deep/50 text-xs uppercase tracking-wider text-ink-soft"><tr><th className="p-3">Guest</th><th className="p-3">Code</th><th className="p-3">Friends booked</th><th className="p-3">Credit</th></tr></thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} className="border-t border-ink/5"><td className="p-3">{r.ownerName} <span className="text-ink-soft">{r.ownerEmail}</span></td><td className="p-3 font-mono">{r.code}</td><td className="p-3">{r.uses}</td><td className="p-3">{formatMoney(r.creditCents)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
