"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { emailLayout, sendEmail } from "@/lib/email";
import { site } from "@/config/site";

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
  await sendEmail({
    to: lead.email,
    subject: `Welcome to the ${site.brand} Founding Guest list`,
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
  return { ok: true, message: "You're in. Watch your inbox for founding-guest access." };
}
