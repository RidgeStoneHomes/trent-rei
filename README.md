# Ridgestone Retreats: direct booking and guest experience platform

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
```bash
npm install
cp .env.example .env      # set SESSION_SECRET and ADMIN_PASSWORD
npm run setup             # create the database and add sample partners
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

## Deploy
- Vercel or any Node host. For production, switch `prisma/schema.prisma` to `provider = "postgresql"` (Neon or Supabase) and set `DATABASE_URL`.
- Set `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (webhook event `checkout.session.completed` → `/api/stripe/webhook`), `RESEND_API_KEY`, `EMAIL_FROM` and `HOST_NOTIFY_EMAIL`.

## Stack
Next.js 15 (App Router, server actions), TypeScript, Tailwind CSS, Prisma, Stripe, Resend, qrcode.
