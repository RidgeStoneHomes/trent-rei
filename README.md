# Reynolds Retreats: direct booking and guest experience platform

A marketing site and direct-booking engine for two luxury short-term rentals on Lake Texoma. It covers the whole guest path:

**Interest → Excitement → Booking → Contract → Payment → Insider Portal → Stay → Referral**

| Stage | What the guest sees |
|---|---|
| Interest | Homepage, home pages, a "Founding Guest" email list with a launch offer |
| Excitement | `/experiences`: partner perks shown with the offers blurred ("guests only") |
| Booking | Live availability calendar, clear pricing, a "you save $X vs Airbnb" line, 30-minute date holds |
| Contract | Digital short-term rental agreement with typed signature and initials. The record keeps the timestamp, IP address, user agent and a SHA-256 hash of the exact text |
| Payment | Stripe Checkout. With no key set, it runs in **demo mode** |
| Insider Portal | `/trip`: sign in with email and confirmation code. **Partner perks unlock once the stay is no longer refundable** (30 days out by default). Door code and Wi-Fi appear 3 days out |
| Stay | Digital **Guest Pass** QR. Partners scan it and see a green "Verified guest" screen at `/verify/...` |
| Growth | **Share the Lake** referrals: friend gets $100 off, referrer earns $100 credit. Every guest gets a link automatically |

## Partner perks (vendors)
- Manage partners in `/admin/vendors`: perk, promo code, booking/affiliate link, phone, featured flag, show/hide.
- Every "Book" link goes through `/go/<partner>`. Each click is logged and UTM tags are added, so you can show partners how much business you send them.
- `/admin/qr` has printable QR cards:
  - **In-home welcome card** → `/insider`, which opens the guest's live perks. Offers change in admin and the printed card never needs reprinting.
  - **Per-partner QR codes** for welcome books or partner counters, tracked as `qr` scans.

## Run locally
Needs Node 20+ and a Postgres database (a free Neon branch works).
```bash
npm install
cp .env.example .env      # set DATABASE_URL, SESSION_SECRET, ADMIN_PASSWORD
npm run setup             # create tables and add sample partners
npm run demo              # optional: 3 demo bookings, one per trip stage
npm run dev               # http://localhost:3000
```
- Guest portal demo: `demo@example.com` with code `DEMO01` (locked, still refundable), `DEMO02` (portal open) or `DEMO03` (staying now).
- Host dashboard: `/admin`, using `ADMIN_PASSWORD`.

## Customize before launch
- `src/config/site.ts`: brand, homes, rates, fees, tax rate, refund window, referral amounts, arrival details. Anything marked `PLACEHOLDER` must be replaced.
- Photos: put them in `public/images/<slug>/` and list them in the `images` array of each home.
- `src/content/agreement.ts`: **have a Texas attorney review the rental agreement**, then bump `AGREEMENT_VERSION`.
- Replace the sample partners in `/admin/vendors` with your real agreements.

## Channel sync (OwnerRez, VRBO, Airbnb, Furnished Finder)
Calendars sync both ways over iCal, so nothing is double-booked:
- **Export**: `/api/ical/<slug>.ics` lists direct bookings and owner blocks. Import it into OwnerRez, or into each channel directly.
- **Import**: set `ICAL_IMPORT_<SLUG>` to one or more comma-separated export URLs, for example the OwnerRez calendar feed, or VRBO, Airbnb and Furnished Finder feeds. Dates are re-fetched every 10 minutes.

With OwnerRez as the channel manager, the simplest setup is one feed each way: this site ⇄ OwnerRez, and OwnerRez ⇄ VRBO, Airbnb and the others.

## Deploy on Vercel
1. **Import:** Vercel → Add New → Project → import `trent-rei`. The first deploy works even before a database is connected.
2. **Database:** Project → Storage → Create Database → Neon (Postgres) → connect it to the project. This adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Tables are created automatically on every deploy (`prisma migrate deploy`).
3. **Environment variables** (Project → Settings → Environment Variables):
   - `SESSION_SECRET`: a long random string
   - `ADMIN_PASSWORD`: your host dashboard password
   - `NEXT_PUBLIC_SITE_URL`: `https://reynoldsretreats.com`
   - `ALLOW_DEMO_PAYMENTS=true` for a free click-through preview only. **Remove it before launch.**
   - Later: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `HOST_NOTIFY_EMAIL`, `ICAL_IMPORT_*`
4. **Redeploy** (Deployments → ⋯ → Redeploy) after changing variables.
5. **Partners:** in `/admin/vendors`, click "Load sample partners" or add your own.
6. **Domain:** Project → Settings → Domains → add `reynoldsretreats.com` and `www.reynoldsretreats.com`, then add the DNS records Vercel shows at your domain registrar.
7. **Stripe webhook:** endpoint `https://reynoldsretreats.com/api/stripe/webhook`, event `checkout.session.completed`.

## Stack
Next.js 15 (App Router, server actions), TypeScript, Tailwind CSS, Prisma, Stripe, Resend, qrcode.
