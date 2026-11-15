import { LeadForm } from "./LeadForm";

// Stands in for a home that isn't public yet: no name or details, just a guest-list signup.
export function ComingSoonCard({ className = "" }: { className?: string }) {
  return (
    <div id="coming-soon" className={`relative flex scroll-mt-28 flex-col justify-end overflow-hidden rounded-3xl bg-lake-deep p-8 text-sand sm:p-10 ${className}`}>
      <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 animate-glow rounded-full bg-brass/25 blur-3xl" />
      <div className="relative">
        <p className="eyebrow !text-brass-light">Coming soon</p>
        <p className="mt-3 font-display text-4xl sm:text-5xl">A second retreat</p>
        <p className="mt-3 max-w-md text-sand/80">Half a mile from Ironwood Acres. Join the guest list for first access to opening dates.</p>
        <div className="mt-6"><LeadForm dark compact source="coming-soon" /></div>
      </div>
    </div>
  );
}
