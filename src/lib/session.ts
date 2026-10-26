import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const GUEST_COOKIE = "guest_session";
const ADMIN_COOKIE = "admin_session";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is not set");
  return s || "dev-only-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function seal(kind: string, id: string, maxAgeSec: number) {
  const payload = `${kind}.${id}.${Math.floor(Date.now() / 1000) + maxAgeSec}`;
  return `${payload}.${sign(payload)}`;
}

function unseal(kind: string, token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== kind) return null;
  const payload = parts.slice(0, 3).join(".");
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(parts[3]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(parts[2]) < Date.now() / 1000) return null;
  return parts[1];
}

const base = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

export async function startGuestSession(bookingId: string) {
  const maxAge = 60 * 60 * 24 * 60;
  (await cookies()).set(GUEST_COOKIE, seal("g", bookingId, maxAge), { ...base, maxAge });
}

export async function guestBookingId() {
  return unseal("g", (await cookies()).get(GUEST_COOKIE)?.value);
}

export async function endGuestSession() {
  (await cookies()).delete(GUEST_COOKIE);
}

export async function startAdminSession() {
  const maxAge = 60 * 60 * 12;
  (await cookies()).set(ADMIN_COOKIE, seal("a", "owner", maxAge), { ...base, maxAge });
}

export async function isAdmin() {
  return unseal("a", (await cookies()).get(ADMIN_COOKIE)?.value) === "owner";
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
