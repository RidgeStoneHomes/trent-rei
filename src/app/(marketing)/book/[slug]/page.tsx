import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getProperty } from "@/config/site";
import { validateStay } from "@/lib/availability";
import { quoteStay } from "@/lib/pricing";
import { createBooking } from "@/app/actions/booking";
import { ActionForm, SubmitButton } from "@/components/forms";
import { StaySummary, Steps } from "@/components/StaySummary";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reserve" };

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const property = getProperty((await params).slug);
  if (!property) notFound();
  const q = await searchParams;
  const guests = Number(q.guests ?? 2);
  const pets = property.petFeeCents === null ? 0 : Number(q.pets ?? 0);
  const check = await validateStay(property, q.checkIn, q.checkOut, guests);

  if (!check.ok) {
    return (
      <section className="container-x py-24 text-center">
        <h1 className="text-4xl">Let's find you different dates</h1>
        <p className="mt-4 text-ink-soft">{check.error}</p>
        <Link href={`/stays/${property.slug}`} className="btn-primary mt-8">Back to {property.name}</Link>
      </section>
    );
  }
  const checkIn = q.checkIn!;
  const checkOut = q.checkOut!;
  const quote = quoteStay(property, checkIn, checkOut, { pets });
  const refCookie = (await cookies()).get("ref")?.value;

  return (
    <section className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_24rem]">
      <div>
        <Steps current={1} />
        <h1 className="mt-6 text-4xl sm:text-5xl">You're almost there.</h1>
        <p className="mt-3 text-ink-soft">Tell us who's coming. Your dates are held for 30 minutes while you finish.</p>

        <ActionForm action={createBooking} className="mt-10 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="slug" value={property.slug} />
          <input type="hidden" name="checkIn" value={checkIn} />
          <input type="hidden" name="checkOut" value={checkOut} />
          <input type="hidden" name="guests" value={guests} />
          <input type="hidden" name="pets" value={pets} />
          <label><span className="label">First name</span><input name="firstName" required className="input" autoComplete="given-name" /></label>
          <label><span className="label">Last name</span><input name="lastName" required className="input" autoComplete="family-name" /></label>
          <label><span className="label">Email</span><input name="email" type="email" required className="input" autoComplete="email" /></label>
          <label><span className="label">Mobile phone</span><input name="phone" type="tel" required className="input" autoComplete="tel" /></label>
          <label className="sm:col-span-2">
            <span className="label">Celebrating anything?</span>
            <select name="occasion" className="input" defaultValue="">
              <option value="">Just a getaway</option>
              <option>Anniversary</option>
              <option>Birthday</option>
              <option>Honeymoon / proposal</option>
              <option>Girls' / guys' trip</option>
              <option>Family reunion</option>
              <option>Fishing trip</option>
              <option>Work retreat</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="label">Anything we should know? (optional)</span>
            <textarea name="notes" rows={3} className="input" placeholder="Arrival time, special requests, a surprise you're planning…" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Referral code (optional)</span>
            <input name="referral" defaultValue={refCookie ?? ""} className="input uppercase" placeholder="From a friend who stayed with us" />
          </label>
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Holding your dates…">Continue to rental agreement</SubmitButton>
          </div>
        </ActionForm>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <StaySummary
          property={property}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          lines={quote.lines}
          totalCents={quote.totalCents}
          savingsCents={quote.otaEstimateCents - quote.totalCents}
        />
        {refCookie && <p className="mt-3 text-center text-xs text-lake-deep">Referral code {refCookie} will be applied if eligible.</p>}
      </aside>
    </section>
  );
}
