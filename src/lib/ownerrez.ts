// OwnerRez API v2 (https://api.ownerrez.com/help/v2). Auth is HTTP Basic with the OwnerRez
// account email as the username and a Personal Access Token (pt_…) as the password.
// Everything here is best-effort: a failure is logged and emailed to the host, and never
// blocks the guest.

import { site, type Property } from "@/config/site";
import { emailLayout, sendEmail } from "./email";
import { formatMoney } from "./money";

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

const errorText = (err: unknown) => String(err instanceof Error ? err.message : err).replace(/</g, "&lt;").slice(0, 1500);

async function alertHost(subject: string, message: string, err: unknown) {
  console.error(`[ownerrez] ${subject}:`, err);
  if (!process.env.HOST_NOTIFY_EMAIL) return;
  await sendEmail({
    to: process.env.HOST_NOTIFY_EMAIL,
    subject,
    html: emailLayout("OwnerRez sync", `<p>${message}</p><p style="font-family:monospace;font-size:12px">${errorText(err)}</p>`),
  });
}

// ---------- Guests ----------

type Guest = { id: number; email_addresses?: { address?: string }[] };

async function findGuestByEmail(email: string): Promise<number | null> {
  const page = await call<{ items?: Guest[] }>(`/v2/guests?q=${encodeURIComponent(email)}&limit=25`);
  const match = page.items?.find((g) => g.email_addresses?.some((e) => e.address?.toLowerCase() === email));
  return match?.id ?? null;
}

async function tag(entityType: "guest" | "booking", entityId: number, name: string) {
  try {
    await call("/v2/tags", { method: "POST", body: { entity_type: entityType, entity_id: entityId, name } });
  } catch (err) {
    if ((err as { status?: number }).status !== 409) throw err; // 409 = already tagged
  }
}

// Finds the guest by email, or creates them. Existing guests are left as they are.
async function upsertGuest(g: { email: string; firstName?: string; lastName?: string; phone?: string; notes?: string }) {
  const email = g.email.toLowerCase();
  const existing = await findGuestByEmail(email);
  if (existing) return existing;
  const created = await call<Guest>("/v2/guests", {
    method: "POST",
    body: {
      first_name: g.firstName || email.split("@")[0],
      last_name: g.lastName || undefined,
      email_addresses: [{ address: email, is_default: true }],
      phones: g.phone ? [{ number: g.phone, is_default: true }] : undefined,
      notes: g.notes,
    },
  });
  return created.id;
}

// Adds a website lead to OwnerRez as a guest (or finds the existing one) and tags it.
export async function syncLeadToOwnerRez(lead: { email: string; name?: string; notes: string; tags: string[] }) {
  if (!ownerRezEnabled) return;
  try {
    const [first, ...rest] = (lead.name ?? "").trim().split(/\s+/).filter(Boolean);
    const guestId = await upsertGuest({ email: lead.email, firstName: first, lastName: rest.join(" "), notes: lead.notes });
    for (const t of lead.tags) await tag("guest", guestId, t);
  } catch (err) {
    await alertHost(
      `OwnerRez didn't accept a website lead (${lead.email})`,
      `${lead.email} joined the guest list but couldn't be added to OwnerRez. They're still saved in /admin → Leads & Referrals.`,
      err,
    );
  }
}

// ---------- Properties ----------

type OrProperty = { id: number; name?: string; external_name?: string; address?: { street1?: string } };

const propertyEnvKey = (slug: string) => "OWNERREZ_PROPERTY_" + slug.toUpperCase().replace(/-/g, "_");

async function listProperties() {
  const page = await call<{ items?: OrProperty[] }>("/v2/properties?limit=100");
  return page.items ?? [];
}

// The OwnerRez property for a home: OWNERREZ_PROPERTY_<SLUG> if set, else matched by name/address.
async function ownerRezPropertyId(property: Property, all?: OrProperty[]): Promise<number | null> {
  const fromEnv = Number(process.env[propertyEnvKey(property.slug)]);
  if (fromEnv) return fromEnv;
  const words = [property.name, ...(property.ownerRezMatch ?? [])].map((w) => w.toLowerCase());
  const match = (all ?? (await listProperties())).find((p) => {
    const hay = [p.name, p.external_name, p.address?.street1].filter(Boolean).join(" ").toLowerCase();
    return words.some((w) => hay.includes(w));
  });
  return match?.id ?? null;
}

// ---------- Bookings ----------

// "4:00 PM" -> "16:00"
function to24h(time: string) {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return undefined;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

type PaidBooking = {
  code: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pets: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occasion: string | null;
  notes: string | null;
  nightlyCents: number;
  stayDiscountCents: number;
  cleaningCents: number;
  petCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  referralCode: string | null;
  stripeSession: string | null;
};

// Creates the paid website booking in OwnerRez, so OwnerRez blocks the dates on every channel.
// Returns the OwnerRez booking id, or null when it couldn't be created (the host is emailed).
export async function pushBookingToOwnerRez(booking: PaidBooking, property: Property): Promise<number | null> {
  if (!ownerRezEnabled) return null;
  try {
    const propertyId = await ownerRezPropertyId(property);
    if (!propertyId) throw new Error(`No OwnerRez property matches "${property.name}". Set ${propertyEnvKey(property.slug)} to its OwnerRez property ID.`);

    const guestId = await upsertGuest({
      email: booking.email,
      firstName: booking.firstName,
      lastName: booking.lastName,
      phone: booking.phone,
    });

    const money = (c: number) => formatMoney(c, { cents: true });
    const notes = [
      `Booked direct on ${site.brand} website. Confirmation ${booking.code}.`,
      `Paid in full by card through Stripe${booking.stripeSession ? ` (${booking.stripeSession})` : ""}: ${money(booking.totalCents)}.`,
      `Nightly ${money(booking.nightlyCents)}` +
        (booking.stayDiscountCents ? `, stay discount -${money(booking.stayDiscountCents)}` : "") +
        `, cleaning ${money(booking.cleaningCents)}` +
        (booking.petCents ? `, pet fee ${money(booking.petCents)}` : "") +
        (booking.discountCents ? `, referral -${money(booking.discountCents)}${booking.referralCode ? ` (${booking.referralCode})` : ""}` : "") +
        `, tax ${money(booking.taxCents)}.`,
      booking.occasion && `Occasion: ${booking.occasion}`,
      booking.notes && `Guest notes: ${booking.notes}`,
      "Rental agreement signed online; signed copy in the website admin.",
    ].filter(Boolean).join("\n");

    const created = await call<{ id: number }>("/v2/bookings", {
      method: "POST",
      body: {
        type: "booking",
        property_id: propertyId,
        guest_id: guestId,
        arrival: booking.checkIn,
        departure: booking.checkOut,
        check_in: to24h(site.policies.checkInTime),
        check_out: to24h(site.policies.checkOutTime),
        adults: booking.guests,
        pets: booking.pets || undefined,
        title: `Direct ${booking.code}`,
        notes,
      },
    });
    await tag("booking", created.id, "Website direct").catch((err) => console.error("[ownerrez] booking tag failed:", err));
    return created.id;
  } catch (err) {
    await alertHost(
      `Add booking ${booking.code} to OwnerRez by hand (${property.name} ${booking.checkIn} → ${booking.checkOut})`,
      `A paid website booking couldn't be created in OwnerRez, so these dates are <strong>not blocked on VRBO/Airbnb</strong> yet. ` +
        `Please add it in OwnerRez now: ${booking.firstName} ${booking.lastName} (${booking.email}, ${booking.phone}), ` +
        `${property.name}, ${booking.checkIn} → ${booking.checkOut}, ${booking.guests} guests, ${formatMoney(booking.totalCents, { cents: true })} paid.`,
      err,
    );
    return null;
  }
}

// ---------- Status (/status page) ----------

// Confirms the saved login works and each home maps to an OwnerRez property, without changing anything.
export async function ownerRezStatus(homes: Property[]): Promise<{ ok: boolean; detail: string }> {
  if (!ownerRezEnabled) {
    const missing = ["OWNERREZ_EMAIL", "OWNERREZ_TOKEN"].filter((k) => !process.env[k]).join(" and ");
    return { ok: false, detail: `${missing} not set.` };
  }
  try {
    const all = await listProperties();
    const lines: string[] = [];
    let ok = true;
    for (const home of homes) {
      const id = await ownerRezPropertyId(home, all);
      const p = all.find((x) => x.id === id);
      if (p) lines.push(`${home.name} → OwnerRez "${p.name ?? p.external_name}" (#${p.id})`);
      else if (!home.comingSoon) {
        ok = false;
        lines.push(`${home.name} → no match. Set ${propertyEnvKey(home.slug)} to its OwnerRez property ID (found: ${all.map((x) => `"${x.name}" #${x.id}`).join(", ") || "none"}).`);
      }
    }
    return { ok, detail: `Connected. Leads become OwnerRez guests; paid bookings are created in OwnerRez. ${lines.join(" · ")}` };
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
