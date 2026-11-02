// Animated Lake Texoma sunset, drawn in SVG and CSS. It weighs a few kilobytes
// instead of a hero video and loops seamlessly. Swap in a photo by passing `photo`.

// One wave cycle is 800 units wide; the path covers 1600 so a -50% shift loops cleanly.
function wave(y: number, amp: number) {
  let d = `M0 ${y}`;
  for (let x = 0; x < 1600; x += 200) d += ` Q ${x + 50} ${y - amp} ${x + 100} ${y} T ${x + 200} ${y}`;
  return `${d} V 400 H 0 Z`;
}

export function LakeScene({ photo }: { photo?: string }) {
  if (photo) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="h-full w-full scale-110 animate-[kenburns_24s_ease-in-out_infinite_alternate] object-cover" />
      </div>
    );
  }
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,#0e1a24_0%,#1d3446_30%,#7a4a4a_58%,#d9774b_70%,#f0b483_76%)]">
      {/* Stars fading in the upper sky */}
      <div className="absolute inset-x-0 top-0 h-1/2 opacity-60" style={{ backgroundImage: "radial-gradient(1px 1px at 12% 20%, #fff, transparent), radial-gradient(1px 1px at 32% 12%, #fff, transparent), radial-gradient(1.5px 1.5px at 58% 26%, #fff, transparent), radial-gradient(1px 1px at 76% 8%, #fff, transparent), radial-gradient(1px 1px at 88% 30%, #fff, transparent), radial-gradient(1px 1px at 45% 6%, #fff, transparent)" }} />

      {/* Sun and its glow, setting on the horizon */}
      <div className="absolute left-1/2 top-[74%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2">
        <div className="h-full w-full animate-glow rounded-full bg-[radial-gradient(circle,rgba(255,214,160,.85)_0%,rgba(240,167,127,.45)_22%,rgba(217,119,75,0)_60%)]" />
      </div>
      <div className="absolute left-1/2 top-[74%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffe2b8] shadow-[0_0_80px_30px_rgba(255,200,140,.5)] sm:h-32 sm:w-32" />

      {/* Birds drifting across */}
      <svg className="absolute left-[18%] top-[30%] w-16 animate-float text-ink/70" viewBox="0 0 60 20">
        <path d="M2 12 Q 10 2 18 12 Q 26 2 34 12" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M38 6 Q 44 0 50 6 Q 56 0 60 6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>

      {/* Far shoreline */}
      <svg className="absolute inset-x-0 top-[66%] h-[10%] w-full text-[#2a2f36]" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d="M0 60 V38 C80 30 120 22 200 28 S330 18 420 26 560 14 650 24 780 30 880 20 1040 26 1200 30 V60Z" fill="currentColor" />
        <path d="M0 60 V46 C120 40 260 44 400 40 S700 46 860 42 1100 44 1200 42 V60Z" fill="#1d2329" />
      </svg>

      {/* Water */}
      <div className="absolute inset-x-0 bottom-0 top-[75%] bg-[linear-gradient(180deg,#5b4146_0%,#2b3a49_35%,#123543_100%)]">
        {/* Sun's reflection on the water */}
        <div className="absolute left-1/2 top-0 flex h-full w-40 -translate-x-1/2 flex-col items-center gap-2 pt-2 sm:w-56">
          {[90, 70, 84, 56, 66, 40, 48, 28].map((w, i) => (
            <span key={i} className="block h-[3px] animate-shimmer rounded-full bg-[#ffd9a8]" style={{ width: `${w}%`, animationDelay: `${i * 0.35}s` }} />
          ))}
        </div>
      </div>
      {[
        { top: "77%", fill: "rgba(245,239,230,.08)", anim: "animate-drift-slow", amp: 6 },
        { top: "82%", fill: "rgba(18,53,67,.55)", anim: "animate-drift-mid", amp: 9 },
        { top: "88%", fill: "rgba(14,26,36,.75)", anim: "animate-drift-fast", amp: 12 },
      ].map((l) => (
        <svg key={l.top} className={`absolute left-0 w-[200%] ${l.anim}`} style={{ top: l.top, height: `calc(100% - ${l.top})` }} viewBox="0 0 1600 400" preserveAspectRatio="none">
          <path d={wave(20, l.amp)} fill={l.fill} />
        </svg>
      ))}
    </div>
  );
}
