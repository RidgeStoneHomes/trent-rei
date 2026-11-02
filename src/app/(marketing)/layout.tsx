import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBar, activePromo } from "@/components/PromoBar";
import { RevealObserver, ScrollProgress } from "@/components/motion";

// Re-render hourly so date-based pieces (the promo bar, date pickers) stay current.
export const revalidate = 3600;

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Header promo={activePromo() ? <PromoBar /> : undefined} />
      <main>{children}</main>
      <Footer />
      <RevealObserver />
    </>
  );
}
