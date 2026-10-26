"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { endAdminSession, isAdmin, safeEqual, startAdminSession } from "@/lib/session";
import { slugify } from "@/lib/codes";
import { getProperty } from "@/config/site";
import { isIsoDate } from "@/lib/dates";
import { sampleVendors } from "@/content/sample-vendors";

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function adminLogin(_prev: { error: string } | null, form: FormData) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "Set ADMIN_PASSWORD in your environment first." };
  if (!safeEqual(String(form.get("password") ?? ""), expected)) return { error: "Incorrect password." };
  await startAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await endAdminSession();
  redirect("/admin/login");
}

const vendorSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().min(1),
  blurb: z.string().trim().min(1, "Public teaser is required"),
  description: z.string().trim().min(1, "Description is required"),
  perk: z.string().trim().min(1, "Guest perk is required"),
  perkDetails: z.string().trim().optional(),
  promoCode: z.string().trim().optional(),
  bookingUrl: z.union([z.literal(""), z.string().trim().url("Booking link must be a full URL (https://…)")]).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  distance: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveVendor(_prev: { error: string } | null, form: FormData) {
  await guard();
  const id = String(form.get("id") ?? "");
  const parsed = vendorSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const data = {
    ...v,
    perkDetails: v.perkDetails || null,
    promoCode: v.promoCode || null,
    bookingUrl: v.bookingUrl || null,
    phone: v.phone || null,
    address: v.address || null,
    distance: v.distance || null,
    featured: form.get("featured") === "on",
    active: form.get("active") === "on",
  };
  if (id && id !== "new") {
    await db.vendor.update({ where: { id }, data });
  } else {
    let slug = slugify(v.name);
    if (await db.vendor.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    await db.vendor.create({ data: { ...data, slug } });
  }
  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

export async function deleteVendor(form: FormData) {
  await guard();
  await db.vendor.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

export async function toggleVendor(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const v = await db.vendor.findUniqueOrThrow({ where: { id } });
  await db.vendor.update({ where: { id }, data: { active: !v.active } });
  revalidatePath("/admin/vendors");
}

export async function addBlock(_prev: { error: string } | null, form: FormData) {
  await guard();
  const slug = String(form.get("propertySlug"));
  const start = String(form.get("start"));
  const end = String(form.get("end"));
  if (!getProperty(slug)) return { error: "Choose a home." };
  if (!isIsoDate(start) || !isIsoDate(end) || end <= start) return { error: "End date must be after start date." };
  await db.blockedRange.create({ data: { propertySlug: slug, start, end, reason: String(form.get("reason") ?? "") || null } });
  revalidatePath("/admin/calendar");
  return null;
}

export async function deleteBlock(form: FormData) {
  await guard();
  await db.blockedRange.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/admin/calendar");
}

export async function cancelBooking(form: FormData) {
  await guard();
  await db.booking.update({ where: { id: String(form.get("id")) }, data: { status: "CANCELLED" } });
  revalidatePath("/admin");
}

export async function loadSampleVendors() {
  await guard();
  if ((await db.vendor.count()) === 0) await db.vendor.createMany({ data: sampleVendors });
  revalidatePath("/admin/vendors");
}
