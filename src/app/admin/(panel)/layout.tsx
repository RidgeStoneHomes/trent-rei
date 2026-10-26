import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/session";
import { adminLogout } from "@/app/actions/admin";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Host Dashboard", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-sand">
      <header className="no-print bg-ink text-sand">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/admin" className="font-display text-xl">{site.brand} · Host</Link>
          <nav className="flex flex-wrap gap-5 text-sm">
            <Link href="/admin">Bookings</Link>
            <Link href="/admin/vendors">Partners</Link>
            <Link href="/admin/calendar">Calendar</Link>
            <Link href="/admin/qr">QR Codes</Link>
            <Link href="/admin/guests">Leads & Referrals</Link>
            <Link href="/" target="_blank">View site ↗</Link>
            <form action={adminLogout}><button className="text-sand/60">Sign out</button></form>
          </nav>
        </div>
      </header>
      <main className="container-x py-10">{children}</main>
    </div>
  );
}
