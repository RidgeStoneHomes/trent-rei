import { db } from "./db";
import { stripeEnabled, demoPaymentsAllowed } from "./stripe";
import { importUrlsFor } from "./ical";
import { properties } from "@/config/site";

export type Check = { label: string; ok: boolean; detail: string; fix?: string; optional?: boolean };

// Setup checklist shown at /status. Reports only whether settings exist, never their values.
export async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  checks.push({
    label: "Database connected",
    ok: hasDbUrl,
    detail: hasDbUrl ? "DATABASE_URL is set." : "No database connection setting found.",
    fix: "Vercel → your project → Storage → Create Database → Neon → Connect to this project, then Redeploy.",
  });

  let tablesOk = false;
  let vendorCount = 0;
  if (hasDbUrl) {
    try {
      vendorCount = await db.vendor.count();
      tablesOk = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const missingTables = /does not exist|P2021/.test(msg);
      checks.push({
        label: "Database tables created",
        ok: false,
        detail: missingTables ? "The database is connected but its tables haven't been created yet." : "The database couldn't be reached.",
        fix: missingTables
          ? "Vercel → Deployments → ⋯ on the latest deployment → Redeploy. Tables are created during each build."
          : "Check that the Neon database is connected to this project for the Production environment, then Redeploy.",
      });
    }
    if (tablesOk) checks.push({ label: "Database tables created", ok: true, detail: "Bookings, partners and leads tables are ready." });
  }
  if (tablesOk) {
    checks.push({
      label: "Partners loaded",
      ok: vendorCount > 0,
      detail: vendorCount > 0 ? `${vendorCount} partner(s) in the Insider Collection.` : "No partners yet. The site shows partners as coming soon.",
      fix: "Open /admin → Partners → Add partner when your first offer is agreed.",
      optional: true,
    });
  }

  if (tablesOk) {
    const filled = await db.propertyArrival.count({ where: { doorCode: { not: null } } });
    checks.push({
      label: "Arrival info (door code, Wi-Fi)",
      ok: filled > 0,
      optional: true,
      detail: filled > 0 ? `Entered for ${filled} home(s).` : "Not entered yet. Guests will see \"your host will send this\" instead.",
      fix: "Open /admin → Arrival Info and fill in each home.",
    });
  }

  const envCheck = (key: string, label: string, fix: string, optional = false) =>
    checks.push({ label, ok: Boolean(process.env[key]), detail: process.env[key] ? `${key} is set.` : `${key} is not set.`, fix, optional });

  envCheck("SESSION_SECRET", "Login security key", "Vercel → Settings → Environment Variables → add SESSION_SECRET (40+ random characters), then Redeploy.");
  envCheck("ADMIN_PASSWORD", "Host dashboard password", "Add ADMIN_PASSWORD in Environment Variables, then Redeploy.");
  envCheck("NEXT_PUBLIC_SITE_URL", "Site address", "Add NEXT_PUBLIC_SITE_URL = https://reynoldsretreats.com, then Redeploy.", true);

  checks.push({
    label: "Payments",
    ok: stripeEnabled || demoPaymentsAllowed,
    optional: true,
    detail: stripeEnabled
      ? "Stripe is connected: guests pay by card."
      : demoPaymentsAllowed
        ? "Demo mode: bookings confirm with no charge. Turn this off before real guests book."
        : "Off: guests see a \"contact us to book\" message at the payment step.",
    fix: "Add STRIPE_SECRET_KEY (real payments), or ALLOW_DEMO_PAYMENTS=true for a free preview.",
  });
  envCheck("RESEND_API_KEY", "Confirmation emails", "Set up Resend and add RESEND_API_KEY and EMAIL_FROM.", true);
  const feeds = properties.reduce((n, p) => n + importUrlsFor(p.slug).length, 0);
  checks.push({
    label: "Calendar sync (OwnerRez/VRBO)",
    ok: feeds > 0,
    optional: true,
    detail: feeds ? `${feeds} calendar feed(s) connected.` : "No outside calendars connected yet.",
    fix: "Add ICAL_IMPORT_IRONWOOD_ACRES with your OwnerRez or VRBO calendar link.",
  });
  return checks;
}

export async function databaseReady() {
  if (!process.env.DATABASE_URL) return false;
  try {
    await db.vendor.count();
    return true;
  } catch {
    return false;
  }
}
