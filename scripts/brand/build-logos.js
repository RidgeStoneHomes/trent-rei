// Reynolds Retreats logo system v3: RR monogram + REYNOLDS / RETREATS wordmark + gold line-art amenity icons.
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));

const F = (p) => opentype.loadSync(path.join(__dirname, "node_modules/@fontsource", p));
const serif = F("cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff");
const serifB = F("cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff");
const sans = F("inter/files/inter-latin-500-normal.woff");

const NAVY = "#1b2c48", GOLD = "#b08d57", GOLD_LIGHT = "#d4b98a", CREAM = "#f5efe6";

function tracked(font, text, size, trackingEm) {
  const scale = size / font.unitsPerEm;
  let x = 0; const parts = []; const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(x, 0, size).toPathData(2));
    x += g.advanceWidth * scale;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale + trackingEm * size;
  });
  return { d: parts.join(""), width: x };
}

// ---------- RR monogram: two interlocking R's; the back R is cut where the front R crosses it ----------
let monoId = 0;
function monogram(cx, baseline, size, color) {
  const id = `rr${monoId++}`;
  const g = serif.charToGlyph("R");
  const adv = (g.advanceWidth * size) / serifB.unitsPerEm;
  const off = adv * 0.66, lift = size * 0.06;
  const total = adv + off, x1 = cx - total / 2, x2 = x1 + off;
  const d1 = g.getPath(x1, baseline + lift * 0.0, size).toPathData(2);
  const d2 = g.getPath(x2, baseline - lift, size).toPathData(2);
  const gap = size * 0.022;
  const bb = g.getPath(0, 0, size).getBoundingBox();
  return {
    svg: `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="${(x1 - size).toFixed(0)}" y="${(baseline - size * 2).toFixed(0)}" width="${(size * 4).toFixed(0)}" height="${(size * 3).toFixed(0)}">
      <rect x="${(x1 - size).toFixed(0)}" y="${(baseline - size * 2).toFixed(0)}" width="${(size * 4).toFixed(0)}" height="${(size * 3).toFixed(0)}" fill="#fff"/>
      <path d="${d2}" fill="#000" stroke="#000" stroke-width="${(gap * 2).toFixed(1)}" stroke-linejoin="round"/></mask></defs>
    <path d="${d1}" fill="${color}" mask="url(#${id})"/><path d="${d2}" fill="${color}"/>`,
    top: baseline - lift + bb.y1, width: total,
  };
}

// ---------- Line-art icons on a 32-unit grid ----------
const ICONS = {
  home: `<path d="M2 27 H30"/><path d="M10.5 27 V14 L16 7.5 L21.5 14 V27"/><path d="M4.5 27 V18.5 L7.5 15.5 H10.5 M27.5 27 V18.5 L24.5 15.5 H21.5"/><path d="M6.5 15.5 V11.5 H8.5 V15.5"/><path d="M14.5 27 V22.5 H17.5 V27"/><path d="M14.5 17.5 V15.5 Q16 13 17.5 15.5 V17.5 Z"/><path d="M6.5 20.5 H8.5 V22.5 H6.5 Z M23.5 20.5 H25.5 V22.5 H23.5 Z"/>`,
  hottub: `<path d="M4 17 H28 V24 Q28 27.5 24.5 27.5 H7.5 Q4 27.5 4 24 Z"/><path d="M4 20.5 H28"/><path d="M10 20.5 V27.5 M16 20.5 V27.5 M22 20.5 V27.5"/><path d="M11 13.5 q-2 -2.4 0 -4.8 t0 -4.4 M16 13.5 q-2 -2.4 0 -4.8 t0 -4.4 M21 13.5 q-2 -2.4 0 -4.8 t0 -4.4"/>`,
  pool: `<path d="M3 18 H19"/><path d="M3 23 q2.6 -2 5.2 0 t5.2 0 t5.2 0 t5.2 0 t5.2 0"/><path d="M3 28 q2.6 -2 5.2 0 t5.2 0 t5.2 0 t5.2 0 t5.2 0"/><path d="M20 21 V9 Q20 5.5 23.5 5.5 M25.5 21 V9 Q25.5 5.5 29 5.5"/><path d="M20 12 H25.5 M20 16.5 H25.5"/>`,
  firepit: `<path d="M5 22 H27 L23.5 27.5 H8.5 Z"/><path d="M3 22 H29"/><path d="M16 20 Q9.5 15.5 13.5 8.5 Q14.6 12 16.2 10.6 Q15.6 6.5 19 3.5 Q23.5 12.5 16 20 Z"/>`,
  golf: `<path d="M13 25.5 V4"/><path d="M13 4 L24 8.2 L13 12.4 Z"/><path d="M3 28 Q16 22.5 29 28"/><circle cx="20" cy="24.2" r="1.5"/>`,
  boat: `<path d="M2.5 18.5 H29.5 L26 24 H8 Q4.5 24 2.5 18.5 Z"/><path d="M10.5 18.5 L15 12.5 H21.5 L23 18.5"/><path d="M16.5 15 H21.8"/><path d="M2 28.5 q3.5 -2 7 0 t7 0 t7 0 t7 0"/>`,
  fish: `<path d="M3.5 16 Q12 7 21.5 13.2 L28.5 9.5 V22.5 L21.5 18.8 Q12 25 3.5 16 Z"/><circle cx="8" cy="14.8" r=".9"/><path d="M11.5 12.5 Q13 16 11.5 19.5"/><path d="M13 10 L15.5 6.5 L18.5 10.3"/>`,
  atv: `<circle cx="7" cy="23" r="5.3"/><circle cx="25" cy="23" r="5.3"/><circle cx="7" cy="23" r="1.5"/><circle cx="25" cy="23" r="1.5"/><path d="M0.8 20.5 Q1.5 15 7 15 Q12.5 15 13 20.5 M19 20.5 Q19.5 15 25 15 Q30.5 15 31.2 20.5"/><path d="M7 15 H25"/><path d="M9.5 15 L10.8 11.5 H16.5 L17.8 15"/><path d="M21.5 15 L23.5 8.5 M21 8.5 H27"/><path d="M13 22 H19"/>`,
  kayak: `<path d="M2.5 21 Q16 15 29.5 21 Q16 27 2.5 21 Z"/><path d="M12.5 21 Q16 18.6 19.5 21"/><path d="M8 6 L24 30"/><ellipse cx="7" cy="4.5" rx="1.8" ry="3.4" transform="rotate(-34 7 4.5)"/>`,
  lake: `<circle cx="9" cy="9" r="3.5"/><path d="M2 21 Q8 15 14 19 Q18 16 22 19"/><path d="M25 21 L27.5 11 L30 21 Z M19.5 21 L21.8 13.5 L24 21"/><path d="M3 25 H21 M7 29 H17 M24 25 H29"/>`,
};
const LABELS = { home: "Luxury homes", hottub: "Hot tub", pool: "Plunge pool", firepit: "Fire pit", golf: "Golf", boat: "Boating", fish: "Fishing", atv: "ATV trails", kayak: "Kayak & paddle", lake: "Lake Texoma" };
function icon(k, x, y, size, color, sw = 1.5) {
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(size / 32).toFixed(4)})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</g>`;
}
function row(keys, cx, y, size, gap, color) {
  const w = keys.length * size + (keys.length - 1) * gap;
  let x = cx - w / 2; let out = "";
  keys.forEach((k) => { out += icon(k, x, y, size, color); x += size + gap; });
  return { svg: out, width: w, left: cx - w / 2, right: cx + w / 2 };
}

const svg = (w, h, body, title = "Reynolds Retreats") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
const write = (n, s) => fs.writeFileSync(path.join(OUT, n), s);

// ---------- Full signature logo ----------
function full({ navy = NAVY, gold = GOLD, bg = null, icons = true } = {}) {
  const W = 1000, cx = W / 2;
  let y = icons ? 40 : 30;
  const mono = monogram(cx, y + 150, 190, gold);
  let body = mono.svg;
  y += 150;
  if (icons) {
    const isz = 66, gap = 26, iy = y - 100;
    const L = row(["hottub", "home", "pool"], cx - mono.width / 2 - 40 - (3 * isz + 2 * gap) / 2, iy, isz, gap, gold);
    const R = row(["golf", "atv", "lake"], cx + mono.width / 2 + 40 + (3 * isz + 2 * gap) / 2, iy, isz, gap, gold);
    body += L.svg + R.svg;
  }
  // — REYNOLDS —
  const rey = tracked(serif, "REYNOLDS", 38, 0.3);
  y += 62;
  body += `<path transform="translate(${(cx - rey.width / 2).toFixed(1)} ${y})" d="${rey.d}" fill="${gold}"/>`;
  body += `<path d="M${(cx - rey.width / 2 - 120).toFixed(1)} ${y - 13} H${(cx - rey.width / 2 - 22).toFixed(1)} M${(cx + rey.width / 2 + 22).toFixed(1)} ${y - 13} H${(cx + rey.width / 2 + 120).toFixed(1)}" stroke="${gold}" stroke-width="1.6"/>`;
  // RETREATS
  const ret = tracked(serif, "RETREATS", 150, 0.13);
  y += 140;
  body += `<path transform="translate(${(cx - ret.width / 2).toFixed(1)} ${y})" d="${ret.d}" fill="${navy}"/>`;
  // lower icon band between rules
  y += 34;
  if (icons) {
    const B = row(["boat", "fish", "firepit", "kayak"], cx, y, 54, 34, gold);
    const ly = y + 27;
    body += B.svg + `<path d="M${(cx - ret.width / 2).toFixed(1)} ${ly} H${(B.left - 30).toFixed(1)} M${(B.right + 30).toFixed(1)} ${ly} H${(cx + ret.width / 2).toFixed(1)}" stroke="${gold}" stroke-width="1.6"/>`;
    y += 54 + 40;
  } else {
    body += `<path d="M${(cx - ret.width / 2).toFixed(1)} ${y} H${(cx + ret.width / 2).toFixed(1)}" stroke="${gold}" stroke-width="1.6"/>`;
    y += 42;
  }
  const tag = tracked(sans, "ELEVATED STAYS · MEMORABLE EXPERIENCES", 21, 0.28);
  body += `<path transform="translate(${(cx - tag.width / 2).toFixed(1)} ${y})" d="${tag.d}" fill="${navy}"/>`;
  const H = Math.ceil(y + 34);
  return svg(W, H, (bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : "") + body);
}
write("reynolds-retreats-logo.svg", full());
write("reynolds-retreats-logo-reversed.svg", full({ navy: CREAM, gold: GOLD_LIGHT, bg: NAVY }));
write("reynolds-retreats-logo-simple.svg", full({ icons: false }));
write("reynolds-retreats-logo-simple-reversed.svg", full({ icons: false, navy: CREAM, gold: GOLD_LIGHT, bg: NAVY }));

// ---------- Horizontal (website header / email signature) ----------
function horizontal({ navy = NAVY, gold = GOLD, bg = null } = {}) {
  const mono = monogram(0, 0, 120, gold);
  const ret = tracked(serif, "RETREATS", 84, 0.12);
  const rey = tracked(serif, "REYNOLDS", 26, 0.3);
  const H = 170, mx = 40 + mono.width / 2, tx = 40 + mono.width + 44;
  const W = Math.ceil(tx + ret.width + 40);
  const m = monogram(mx, 128, 120, gold);
  const reyX = tx + (ret.width - rey.width) / 2;
  const body = `${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ""}${m.svg}
  <path d="M${tx - 22} 30 V140" stroke="${gold}" stroke-width="1.4"/>
  <path transform="translate(${reyX.toFixed(1)} 58)" d="${rey.d}" fill="${gold}"/>
  <path d="M${tx} 49 H${(reyX - 16).toFixed(1)} M${(reyX + rey.width + 16).toFixed(1)} 49 H${(tx + ret.width).toFixed(1)}" stroke="${gold}" stroke-width="1.3"/>
  <path transform="translate(${tx} 132)" d="${ret.d}" fill="${navy}"/>`;
  return svg(W, H, body);
}
write("reynolds-retreats-logo-horizontal.svg", horizontal());
write("reynolds-retreats-logo-horizontal-reversed.svg", horizontal({ navy: CREAM, gold: GOLD_LIGHT, bg: NAVY }));

// ---------- Monogram alone + favicon ----------
{ const m = monogram(150, 210, 230, GOLD); write("reynolds-retreats-monogram.svg", svg(300, 260, m.svg, "RR")); }
{ const m = monogram(100, 146, 150, GOLD_LIGHT);
  write("reynolds-retreats-favicon.svg", svg(200, 200, `<rect width="200" height="200" rx="36" fill="${NAVY}"/>${m.svg}`, "Reynolds Retreats")); }

// ---------- Icon set: one strip with labels for reference, plus each icon as its own file ----------
{
  const keys = Object.keys(ICONS), size = 64, cell = 130, W = keys.length * cell, H = 130;
  let body = "";
  keys.forEach((k, i) => {
    const x = i * cell + (cell - size) / 2;
    body += icon(k, x, 14, size, GOLD);
    const t = tracked(sans, LABELS[k].toUpperCase(), 10, 0.12);
    body += `<path transform="translate(${(i * cell + (cell - t.width) / 2).toFixed(1)} 108)" d="${t.d}" fill="${NAVY}"/>`;
    write(`icon-${k}.svg`, svg(64, 64, icon(k, 0, 0, 64, GOLD), LABELS[k]));
  });
  write("reynolds-retreats-icons.svg", svg(W, H, body, "Reynolds Retreats amenity icons"));
}
console.log(fs.readdirSync(OUT).join("\n"));
