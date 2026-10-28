"use client";

import { useActionState } from "react";
import { joinList, type LeadState } from "@/app/actions/leads";
import { properties } from "@/config/site";

export function LeadForm({ dark = false, source = "founding-list", compact = false }: { dark?: boolean; source?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(joinList, null);
  if (state?.ok) {
    return <p className={`font-display text-2xl ${dark ? "text-sand" : ""}`}>{state.message}</p>;
  }
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="source" value={source} />
      <input name="name" placeholder="First name" className="input" autoComplete="given-name" />
      <input name="email" type="email" required placeholder="Email address" className="input" autoComplete="email" />
      {!compact && <select name="interest" className="input sm:col-span-2" defaultValue="">
        <option value="" disabled>What are you dreaming about?</option>
        {properties.map((p) => (
          <option key={p.slug}>{p.name}</option>
        ))}
        <option>Anniversary or celebration</option>
        <option>Girls' trip / guys' fishing weekend</option>
        <option>Family gathering</option>
        <option>Just exploring</option>
      </select>}
      <button disabled={pending} className={`${dark ? "btn-brass" : "btn-primary"} btn-sheen sm:col-span-2`}>
        {pending ? "Saving your spot…" : compact ? "Join the list" : "Claim Founding Guest Access"}
      </button>
      {state && !state.ok && <p className="text-sm text-red-600 sm:col-span-2">{state.message}</p>}
    </form>
  );
}
