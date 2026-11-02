import Link from "next/link";
import { site } from "@/config/site";
import { runChecks } from "@/lib/health";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site Status", robots: { index: false } };

export default async function StatusPage() {
  const checks = await runChecks();
  const required = checks.filter((c) => !c.optional);
  const ready = required.every((c) => c.ok);
  return (
    <main className="min-h-screen bg-sand">
      <div className="container-x max-w-3xl py-14">
        <p className="eyebrow">{site.brand} · Setup checklist</p>
        <h1 className="mt-3 text-5xl">{ready ? "Everything required is set up." : "A few settings still need attention."}</h1>
        <p className="mt-3 text-ink-soft">This page shows only whether each setting exists, never the values.</p>
        <ul className="mt-10 space-y-3">
          {checks.map((c) => (
            <li key={c.label} className="card !bg-white">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 text-lg ${c.ok ? "text-green-700" : c.optional ? "text-amber-600" : "text-red-700"}`}>{c.ok ? "✓" : c.optional ? "○" : "✕"}</span>
                <div>
                  <p className="font-medium">{c.label}{c.optional ? <span className="ml-2 text-xs font-normal text-ink-soft">(optional for now)</span> : null}</p>
                  <p className="mt-1 text-sm text-ink-soft">{c.detail}</p>
                  {!c.ok && c.fix && <p className="mt-2 text-sm"><strong>Fix:</strong> {c.fix}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn-ghost mt-10">Back to the site</Link>
      </div>
    </main>
  );
}
