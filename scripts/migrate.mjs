// Runs database migrations during the build. Skips (with a warning) when no database is
// connected yet, so the very first Vercel deploy succeeds before Storage is attached.
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn("⚠ DATABASE_URL is not set — skipping migrations. Connect a database in Vercel → Storage, then redeploy.");
  process.exit(0);
}
if (!process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
execSync("prisma migrate deploy", { stdio: "inherit" });
