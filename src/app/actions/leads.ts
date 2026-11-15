"use server";

import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emailLayout, sendEmail } from "@/lib/email";
import { getProperty, site } from "@/config/site";
import { syncLeadToOwnerRez } from "@/lib/ownerrez";

const schema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  interest: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(40).optional(),
});

export type LeadState = { ok: boolean; message: string } | null;

export async function joinList(_prev: LeadState, form: FormData): Promise<LeadState> {
  const parsed = schema.safeParse({
    email: form.get("email"),
    name: form.get("name") || undefined,
    interest: form.get("interest") || undefined,
    message: form.get("message") || undefined,
    source: form.get("source") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Please enter a valid email address." };
  const lead = parsed.data;
  await db.lead.create({ data: { ...lead, email: lead.email.toLowerCase(), source: lead.source ?? "founding-list" } });

  // Copy the lead into OwnerRez as a tagged guest, after the response is sent
  const home = lead.source ? getProperty(lead.source) : undefined;
  after(() =>
    syncLeadToOwnerRez({
      email: lead.email,
      name: lead.name,
      notes: [
        `Joined the ${site.brand} guest list on the website (${new Date().toISOString().slice(0, 10)}).`,
        lead.interest && `Interest: ${lead.interest}`,
        lead.message && `Message: ${lead.message}`,
      ].filter(Boolean).join("\n"),
      tags: ["Website lead", ...(home ? [`${home.name} waitlist`] : lead.source === "coming-soon" ? ["Second home waitlist"] : [])],
    }),
  );
  await sendEmail({
    to: lead.email,
    subject: `Welcome to the ${site.brand} guest list`,
    html: emailLayout(
      site.brand,
      `<h1 style="font-weight:400;font-size:28px">You're on the list${lead.name ? `, ${lead.name}` : ""}.</h1>
      <p>${site.foundingGuest.offer}</p>
      <p>We'll send first access to open dates, seasonal rates, and new partner experiences. No spam — ever.</p>
      <p>— ${site.hostName}</p>`,
    ),
  });
  if (process.env.HOST_NOTIFY_EMAIL) {
    await sendEmail({
      to: process.env.HOST_NOTIFY_EMAIL,
      subject: `New lead: ${lead.email}`,
      html: emailLayout("New lead", `<p>${lead.name ?? ""} ${lead.email}<br/>${lead.interest ?? ""}<br/>${lead.message ?? ""}</p>`),
    });
  }
  return { ok: true, message: "You're in. Watch your inbox for open dates and seasonal rates." };
}
