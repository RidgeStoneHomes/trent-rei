import type { Property } from "@/config/site";

// Shows a real photo when the property has one, otherwise an elegant gradient placeholder.
export function Media({
  property,
  index = 0,
  className = "",
  label,
}: {
  property: Property;
  index?: number;
  className?: string;
  label?: string;
}) {
  const src = property.images[index];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={label ?? property.name} className={`object-cover ${className}`} />;
  }
  const [a, b] = property.palette;
  const angle = 135 + index * 40;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(${angle}deg, ${a} 0%, ${a} 35%, ${b} 140%)` }}
      role="img"
      aria-label={label ?? property.name}
    >
      <svg className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-30" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden>
        <path d="M0 70 Q 60 40 120 62 T 240 55 T 400 60 V100 H0Z" fill="#f5efe6" fillOpacity=".35" />
        <path d="M0 82 Q 80 64 160 80 T 320 76 T 400 80 V100 H0Z" fill="#f5efe6" fillOpacity=".5" />
      </svg>
      {label && <span className="absolute bottom-3 left-4 text-[10px] uppercase tracking-luxe text-sand/70">{label}</span>}
    </div>
  );
}
