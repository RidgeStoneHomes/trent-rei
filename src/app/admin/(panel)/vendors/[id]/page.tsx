import Link from "next/link";
import { notFound } from "next/navigation";
import { vendorCategories } from "@/config/site";
import { db } from "@/lib/db";
import { deleteVendor, saveVendor } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/forms";

export default async function EditVendor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = id === "new" ? null : await db.vendor.findUnique({ where: { id } });
  if (id !== "new" && !v) notFound();

  const field = (name: string, label: string, opts: { value?: string | number | null; textarea?: boolean; placeholder?: string; required?: boolean } = {}) => (
    <label className="block">
      <span className="label">{label}</span>
      {opts.textarea ? (
        <textarea name={name} rows={3} defaultValue={opts.value ?? ""} placeholder={opts.placeholder} required={opts.required} className="input" />
      ) : (
        <input name={name} defaultValue={opts.value ?? ""} placeholder={opts.placeholder} required={opts.required} className="input" />
      )}
    </label>
  );

  return (
    <div className="max-w-3xl">
      <Link href="/admin/vendors" className="text-sm underline">← Partners</Link>
      <h1 className="mt-4 text-3xl">{v ? `Edit ${v.name}` : "Add a partner"}</h1>
      <ActionForm action={saveVendor} className="card mt-6 grid gap-4 !bg-white sm:grid-cols-2">
        <input type="hidden" name="id" value={v?.id ?? "new"} />
        {field("name", "Business name", { value: v?.name, required: true })}
        <label className="block">
          <span className="label">Category</span>
          <select name="category" defaultValue={v?.category ?? "fishing"} className="input">
            {Object.entries(vendorCategories).map(([k, c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
          </select>
        </label>
        <div className="sm:col-span-2">{field("perk", "Guest perk (headline)", { value: v?.perk, required: true, placeholder: "15% off any half-day striper charter" })}</div>
        <div className="sm:col-span-2">{field("blurb", "Public teaser (shown on the marketing site)", { value: v?.blurb, required: true })}</div>
        <div className="sm:col-span-2">{field("description", "Guest description", { value: v?.description, textarea: true, required: true })}</div>
        <div className="sm:col-span-2">{field("perkDetails", "How to redeem / fine print", { value: v?.perkDetails, textarea: true, placeholder: "Mention code when booking. Show Guest Pass at check-in. Valid during your stay." })}</div>
        {field("promoCode", "Promo code", { value: v?.promoCode })}
        {field("bookingUrl", "Booking / affiliate link", { value: v?.bookingUrl, placeholder: "https://…" })}
        {field("phone", "Phone", { value: v?.phone })}
        {field("distance", "Distance", { value: v?.distance, placeholder: "12 min drive" })}
        <div className="sm:col-span-2">{field("address", "Address", { value: v?.address })}</div>
        {field("sortOrder", "Sort order (lower first)", { value: v?.sortOrder ?? 0 })}
        <div className="flex items-end gap-6 pb-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={v?.active ?? true} /> Live</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={v?.featured ?? false} /> Host favorite</label>
        </div>
        <div className="sm:col-span-2"><SubmitButton>Save partner</SubmitButton></div>
      </ActionForm>
      {v && (
        <form action={deleteVendor} className="mt-4">
          <input type="hidden" name="id" value={v.id} />
          <button className="text-sm text-red-700 underline">Delete partner</button>
        </form>
      )}
    </div>
  );
}
