import Link from "next/link";
import { getProperty, propertyPath, site } from "@/config/site";
import { Media } from "@/components/Media";
import { ActionForm, SubmitButton } from "@/components/forms";
import { sendExtendedStayInquiry } from "@/app/actions/inquiry";

export const metadata = {
  title: "Extended & Corporate Stays",
  description: "Furnished 5-bedroom home near Sherman, Denison and Lake Texoma for project crews, relocating families, insurance placements and travel nurses. 30-night minimum.",
};

const audiences = [
  { title: "Project & field-service crews", body: "Five bedrooms, 4.5 baths and room for up to 12, so a whole team stays under one roof near the Sherman and Denison job sites." },
  { title: "Relocating families", body: "A comfortable, fully furnished home while your new house is built or your move comes together." },
  { title: "Insurance placements", body: "Displaced by fire or storm damage? A large, turnkey home for the whole family, with simple billing for your insurer." },
  { title: "Travel nurses & medical staff", body: "A short drive to Texoma Medical Center and Wilson N. Jones in Sherman." },
];

const included = [
  "5 bedrooms, 4.5 baths: 4 king beds and 2 queens",
  "Fully equipped kitchen and a 12-seat dining table",
  "Washer and dryer",
  "Mesh Wi-Fi throughout the home",
  "Air-conditioned game room with an 85\" TV",
  "Private putting green, 7-person hot tub and outdoor kitchen",
  "Large fenced backyard",
  "Self check-in",
];

const drives = [
  { place: "Highport Marina", time: "about 5 min" },
  { place: "Denison", time: "about 15–20 min" },
  { place: "Texoma Medical Center", time: "about 20 min" },
  { place: "Sherman", time: "about 25–30 min" },
];

const purposes = ["Project or field-service crew", "Corporate relocation", "Insurance placement", "Travel nurse / medical", "Other"];

export default function ExtendedStaysPage() {
  const home = getProperty("ironwood-acres")!;
  return (
    <>
      <section className="bg-lake-deep text-sand">
        <div className="container-x grid gap-10 py-20 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow !text-brass-light">Extended & corporate stays</p>
            <h1 className="mt-3 text-5xl sm:text-6xl">A furnished home for the month, or the season.</h1>
            <p className="mt-6 max-w-xl text-sand/80">
              Ironwood Acres is available for stays of 30 nights or more: fully furnished, with room for up to 12 and a
              short drive to Sherman, Denison and Lake Texoma. Monthly rates, a written lease, and company billing available.
            </p>
            <a href="#inquire" className="btn-brass btn-sheen mt-8">Request a monthly quote</a>
          </div>
          <div className="overflow-hidden rounded-3xl">
            <Media property={home} index={1} className="aspect-[4/3] w-full" />
          </div>
        </div>
      </section>

      <section className="container-x py-20">
        <p className="eyebrow">Who it's for</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {audiences.map((a) => (
            <div key={a.title} className="card !bg-white">
              <p className="font-display text-2xl">{a.title}</p>
              <p className="mt-2 text-sm text-ink-soft">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/60">
        <div className="container-x grid gap-12 py-20 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="eyebrow">What's included</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {included.map((i) => (
                <li key={i} className="flex gap-3 text-sm"><span className="text-ember">✦</span>{i}</li>
              ))}
            </ul>
            <Link href={propertyPath(home.slug)} className="btn-ghost mt-8">See photos of Ironwood Acres</Link>
          </div>
          <div>
            <p className="eyebrow">Drive times</p>
            <ul className="mt-6 space-y-3 text-sm">
              {drives.map((d) => (
                <li key={d.place} className="flex justify-between border-b border-ink/10 pb-2"><span>{d.place}</span><span className="text-ink-soft">{d.time}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-x py-20">
        <p className="eyebrow">Terms</p>
        <ul className="mt-6 grid gap-3 text-sm text-ink-soft sm:grid-cols-2">
          <li>30-night minimum; monthly rate quoted for your dates</li>
          <li>Written lease, signed by your company or by you</li>
          <li>Rent billed monthly in advance, plus a refundable security deposit</li>
          <li>Up to 12 people · no pets · no smoking</li>
        </ul>
      </section>

      <section id="inquire" className="scroll-mt-24 bg-ink text-sand">
        <div className="container-x grid gap-10 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl sm:text-5xl">Request a monthly quote</h2>
            <p className="mt-4 max-w-md text-sand/75">
              Tell us about your stay and we'll reply within one business day with availability and pricing. Prefer to talk?
              Call or text {site.contactName} at <a className="underline" href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>{site.phone}</a>.
            </p>
          </div>
          <ActionForm action={sendExtendedStayInquiry} className="grid gap-3 text-ink sm:grid-cols-2" successText="Thanks! We'll reply within one business day.">
            <input name="name" required placeholder="Your name" className="input" autoComplete="name" />
            <input name="company" placeholder="Company (optional)" className="input" autoComplete="organization" />
            <input name="email" type="email" required placeholder="Email" className="input" autoComplete="email" />
            <input name="phone" placeholder="Phone" className="input" autoComplete="tel" />
            <select name="purpose" defaultValue="" className="input sm:col-span-2">
              <option value="" disabled>Type of stay</option>
              {purposes.map((p) => <option key={p}>{p}</option>)}
            </select>
            <input name="start" type="date" className="input" aria-label="Move-in date" />
            <select name="months" defaultValue="" className="input" aria-label="Length of stay">
              <option value="" disabled>Length of stay</option>
              {["1 month", "2 months", "3 months", "4–6 months", "6+ months"].map((m) => <option key={m}>{m}</option>)}
            </select>
            <input name="people" inputMode="numeric" placeholder="Number of people" className="input sm:col-span-2" />
            <textarea name="message" rows={4} placeholder="Anything else we should know?" className="input sm:col-span-2" />
            <div className="sm:col-span-2"><SubmitButton className="btn-brass w-full" pendingText="Sending…">Send inquiry</SubmitButton></div>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
