// OwnerRez API v2 (https://api.ownerrez.com/help/v2). Auth is HTTP Basic with the OwnerRez
// account email as the username and a Personal Access Token (pt_…) as the password.
// Everything here is best-effort: a failure is logged and never blocks the guest.

import { emailLayout, sendEmail } from "./email";

const BASE = "https://api.ownerrez.com";

export const ownerRezEnabled = Boolean(process.env.OWNERREZ_EMAIL && process.env.OWNERREZ_TOKEN);

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const auth = Buffer.from(`${process.env.OWNERREZ_EMAIL}:${process.env.OWNERREZ_TOKEN}`).toString("base64");
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "User-Agent": "ReynoldsRetreatsWebsite/1.0", // OwnerRez rejects requests without one
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = new Error(`OwnerRez ${init.method ?? "GET"} ${path} → ${res.status}: ${await res.text()}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

type Guest = { id: number; email_addresses?: { address?: string }[] };

async function findGuestByEmail(email: string): Promise<number | null> {
  const page = await call<{ items?: Guest[] }>(`/v2/guests?q=${encodeURIComponent(email)}&limit=25`);
  const match = page.items?.find((g) => g.email_addresses?.some((e) => e.address?.toLowerCase() === email));
  return match?.id ?? null;
}

async function tagGuest(guestId: number, name: string) {
  try {
    await call("/v2/tags", { method: "POST", body: { entity_type: "guest", entity_id: guestId, name } });
  } catch (err) {
    if ((err as { status?: number }).status !== 409) throw err; // 409 = already tagged
  }
}

// Adds a website lead to OwnerRez as a guest (or finds the existing one) and tags it.
export async function syncLeadToOwnerRez(lead: {
  email: string;
  name?: string;
  phone?: string;
  notes: string;
  tags: string[];
}) {
  if (!ownerRezEnabled) return;
  try {
    const email = lead.email.toLowerCase();
    let guestId = await findGuestByEmail(email);
    if (!guestId) {
      const [first, ...rest] = (lead.name ?? "").trim().split(/\s+/).filter(Boolean);
      const created = await call<Guest>("/v2/guests", {
        method: "POST",
        body: {
          first_name: first ?? email.split("@")[0],
          last_name: rest.join(" ") || undefined,
          email_addresses: [{ address: email, is_default: true }],
          phones: lead.phone ? [{ number: lead.phone, is_default: true }] : undefined,
          notes: lead.notes,
        },
      });
      guestId = created.id;
    }
    for (const tag of lead.tags) await tagGuest(guestId, tag);
  } catch (err) {
    console.error("[ownerrez] lead sync failed:", err);
    // Tell the host, so a lead never silently goes missing from OwnerRez
    if (process.env.HOST_NOTIFY_EMAIL) {
      await sendEmail({
        to: process.env.HOST_NOTIFY_EMAIL,
        subject: `OwnerRez didn't accept a website lead (${lead.email})`,
        html: emailLayout(
          "OwnerRez sync",
          `<p>${lead.email} joined the guest list but couldn't be added to OwnerRez. They're still saved in /admin → Leads.</p><p style="font-family:monospace;font-size:12px">${String(err instanceof Error ? err.message : err).replace(/</g, "&lt;").slice(0, 1500)}</p>`,
        ),
      });
    }
  }
}

// For the /status page: confirms the saved login works, without changing anything.
export async function ownerRezStatus(): Promise<{ ok: boolean; detail: string }> {
  if (!ownerRezEnabled) {
    const missing = ["OWNERREZ_EMAIL", "OWNERREZ_TOKEN"].filter((k) => !process.env[k]).join(" and ");
    return { ok: false, detail: `${missing} not set.` };
  }
  try {
    await call(`/v2/guests?limit=1&created_since_utc=${encodeURIComponent(new Date().toISOString())}`);
    return { ok: true, detail: "Connected: new website leads are added to OwnerRez as guests." };
  } catch (err) {
    const status = (err as { status?: number }).status;
    const hint =
      status === 401 ? " OwnerRez rejected the login: check OWNERREZ_EMAIL is your OwnerRez login email and OWNERREZ_TOKEN is the full pt_ token."
      : status === 403 ? " OwnerRez refused access: make sure the token's IP restriction is set to Allow All."
      : "";
    const msg = err instanceof Error ? err.message.replace(/^OwnerRez GET \S+ → /, "") : String(err);
    return { ok: false, detail: `Error ${msg.slice(0, 300)}.${hint}` };
  }
}
