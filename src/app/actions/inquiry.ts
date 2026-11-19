"use server";

import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emailLayout, sendEmail } from "@/lib/email";
import { site } from "@/config/site";
import { syncLeadToOwnerRez } from "@/lib/ownerrez";

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  purpose: z.string().trim().max(60).optional(),
  start: z.string().trim().max(20).optional(),
  months: z.string().trim().max(20).optional(),
  people: z.string().trim().max(10).optional(),
  message: z.string().trim().max(2000).optional(),
});

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

// Extended-stay (30+ night) inquiry: saved as a lead, emailed to the host, copied to OwnerRez.
export async function sendExtendedStayInquiry(_prev: { error: string } | null, form: FormData): Promise<{ error: string }> {
  const parsed = schema.safeParse(Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v) || undefined])));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const q = parsed.data;
  const email = q.email.toLowerCase();

  const details = [
    q.company && `Company: ${q.company}`,
    q.purpose && `Stay type: ${q.purpose}`,
    q.start && `Start: ${q.start}`,
    q.months && `Length: ${q.months}`,
    q.people && `People: ${q.people}`,
    q.phone && `Phone: ${q.phone}`,
  ].filter(Boolean) as string[];

  await db.lead.create({
    data: {
      email,
      name: q.name,
      interest: details.join(" · ").slice(0, 400),
      message: q.message ?? null,
      source: "extended-stay",
    },
  });

  if (process.env.HOST_NOTIFY_EMAIL) {
    await sendEmail({
      to: process.env.HOST_NOTIFY_EMAIL,
      subject: `Extended-stay inquiry: ${q.company || q.name}${q.months ? ` (${q.months})` : ""}`,
      html: emailLayout(
        "Extended-stay inquiry",
        `<p><strong>${esc(q.name)}</strong> · <a href="mailto:${esc(email)}">${esc(email)}</a></p>
         <p>${details.map(esc).join("<br/>")}</p>
         ${q.message ? `<p style="white-space:pre-wrap">${esc(q.message)}</p>` : ""}`,
      ),
    });
  }

  await sendEmail({
    to: email,
    subject: `Your extended-stay inquiry with ${site.brand}`,
    html: emailLayout(
      site.brand,
      `<p>Thanks, ${esc(q.name.split(" ")[0])}. We received your inquiry about a longer stay at Ironwood Acres and will reply within one business day with availability and a monthly quote.</p>
       <p>Questions in the meantime? Call or text ${site.contactName} at ${site.phone}.</p>`,
    ),
  });

  after(() =>
    syncLeadToOwnerRez({
      email,
      name: q.name,
      notes: [`Extended-stay inquiry from the website (${new Date().toISOString().slice(0, 10)}).`, ...details, q.message && `Message: ${q.message}`]
        .filter(Boolean)
        .join("\n"),
      tags: ["Website lead", "Extended stay inquiry"],
    }),
  );

  return { error: "" };
}
