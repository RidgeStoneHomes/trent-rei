import Link from "next/link";
import { site } from "@/config/site";

export default function TripLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand">
      <header className="no-print border-b border-sand/10 bg-ink text-sand">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-xl">{site.brand}</Link>
          <span className="eyebrow !text-brass-light">Insider Portal</span>
        </div>
      </header>
      {children}
    </div>
  );
}
