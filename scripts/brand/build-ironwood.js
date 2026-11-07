// Ironwood Acres Texoma badge: backyard photo (porch, hot tub, putting green) or a line drawing of it.
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");

const OUT = process.argv[2];
const PHOTO = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });

const F = (p) => opentype.loadSync(path.join(__dirname, "node_modules/@fontsource", p));
const serif = F("cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff");
const sans = F("inter/files/inter-latin-500-normal.woff");

const GREEN = "#1f3a2e", GOLD = "#b08d57", GOLD_LIGHT = "#d4b98a", CREAM = "#f5efe6";

function arcText(font, text, size, trackingEm, cx, cy, r, top, fill) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  const adv = glyphs.map((g, i) => g.advanceWidth * scale + (i < glyphs.length - 1 ? trackingEm * size : 0));
  const total = adv.reduce((a, b) => a + b, 0);
  let s = top ? -Math.PI / 2 - total / r / 2 : Math.PI / 2 + total / r / 2;
  let out = "";
  glyphs.forEach((g, i) => {
    const w = g.advanceWidth * scale;
    const a = top ? s + w / 2 / r : s - w / 2 / r;
    const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
    const rot = (a * 180) / Math.PI + (top ? 90 : -90);
    out += `<path transform="translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${rot.toFixed(2)}) translate(${(-w / 2).toFixed(2)} 0)" d="${g.getPath(0, 0, size).toPathData(2)}" fill="${fill}"/>`;
    s += top ? adv[i] / r : -adv[i] / r;
  });
  return out;
}
const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

const flag = (x, y, s, c) =>
  `<g transform="translate(${x - s / 2} ${y - s / 2}) scale(${s / 32})" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 25.5 V4"/><path d="M13 4 L24 8.2 L13 12.4 Z" fill="${c}"/><path d="M5 28 Q16 23.5 27 28"/></g>`;

// Line drawing of the back of the house, porch, hot tub and putting green (inner circle r=186 at 260,260)
function lineScene(c) {
  return `<g fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <!-- sky -->
    <path d="M150 150 Q240 118 330 132 M210 168 Q290 146 372 156" stroke-width="1.6" opacity=".7"/>
    <!-- trees -->
    <path d="M86 300 V246 M86 262 Q66 262 68 244 Q60 226 78 220 Q80 202 98 206 Q116 200 118 220 Q132 230 120 246 Q118 262 98 260" />
    <path d="M432 300 V240 M432 258 Q412 258 414 240 Q406 222 424 216 Q428 198 446 204 Q464 206 460 226 Q470 244 452 254 Q446 260 436 256"/>
    <!-- chimney + main hip roof -->
    <path d="M300 196 V180 H314 V194"/>
    <path d="M196 246 L248 196 H340 L398 248 Z"/>
    <!-- left wing roof -->
    <path d="M112 262 L148 236 H196"/>
    <!-- walls -->
    <path d="M122 262 V318 M386 248 V318"/>
    <path d="M346 254 V316 M356 254 V316 M366 254 V316 M376 254 V316" stroke-width="1.1" opacity=".55"/>
    <rect x="350" y="266" width="22" height="34" fill="${GREEN_FILL}"/>
    <path d="M361 266 V300" stroke-width="1.4"/>
    <!-- covered porch -->
    <path d="M138 266 L170 240 H306 L338 266 Z"/>
    <path d="M150 266 V322 M326 266 V322" stroke-width="3.6"/>
    
    <rect x="214" y="276" width="52" height="40"/><path d="M240 276 V316" stroke-width="1.4"/>
    <rect x="276" y="296" width="40" height="20"/><path d="M276 302 H316" stroke-width="1.4"/>
    <path d="M166 300 H204 V316 M166 300 V316 M170 300 V292 H200 V300" stroke-width="1.8"/>
    <path d="M122 318 H386 M138 324 H340"/>
    <!-- lawn + putting green -->
    <path d="M96 340 Q260 330 430 346" stroke-width="1.4" opacity=".6"/>
    <path d="M300 372 Q330 344 398 346 Q450 350 446 372 Q430 390 360 388 Q306 386 300 372 Z"/>
    <path d="M396 366 V318"/><path d="M396 318 L416 325 L396 332 Z" fill="${c}"/>
    <ellipse cx="396" cy="367" rx="5" ry="2" fill="${c}"/>
    <circle cx="352" cy="372" r="2.6" fill="${c}"/>
    <path d="M110 380 Q190 366 270 384" stroke-width="1.4" opacity=".6"/>
  </g>`;
}
let GREEN_FILL = "none";

function badge({ mode = "photo", ring = GREEN, gold = GOLD_LIGHT, text = CREAM, inner = GREEN }) {
  const c = 260;
  let b = `<defs><clipPath id="iw-${mode}"><circle cx="${c}" cy="${c}" r="186"/></clipPath>
    <linearGradient id="iw-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".72" stop-color="#1f3a2e" stop-opacity="0"/><stop offset="1" stop-color="#1f3a2e" stop-opacity=".55"/></linearGradient></defs>
  <circle cx="${c}" cy="${c}" r="256" fill="${ring}"/>
  <circle cx="${c}" cy="${c}" r="247" fill="none" stroke="${gold}" stroke-width="3"/>
  <circle cx="${c}" cy="${c}" r="241" fill="none" stroke="${gold}" stroke-width="1"/>`;
  if (mode === "photo") {
    const data = fs.readFileSync(PHOTO).toString("base64");
    b += `<g clip-path="url(#iw-${mode})"><image x="74" y="74" width="372" height="372" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${data}"/>
      <rect x="74" y="74" width="372" height="372" fill="url(#iw-fade)"/></g>`;
  } else {
    GREEN_FILL = inner;
    b += `<circle cx="${c}" cy="${c}" r="186" fill="${inner}"/><g clip-path="url(#iw-${mode})">${lineScene(gold)}</g>`;
  }
  b += `<circle cx="${c}" cy="${c}" r="189" fill="none" stroke="${gold}" stroke-width="4"/>
  <circle cx="${c}" cy="${c}" r="196" fill="none" stroke="${gold}" stroke-width="1"/>`;
  b += arcText(serif, "IRONWOOD ACRES", 40, 0.16, c, c, 207, true, text);
  b += arcText(serif, "TEXOMA", 30, 0.55, c, c, 228, false, gold);
  b += flag(c - 220, c + 2, 26, gold) + flag(c + 220, c + 2, 26, gold);
  return svg(520, 520, b, "Ironwood Acres Texoma");
}

fs.writeFileSync(path.join(OUT, "ironwood-acres-badge-photo.svg"), badge({ mode: "photo" }));
fs.writeFileSync(path.join(OUT, "ironwood-acres-badge.svg"), badge({ mode: "line" }));
fs.writeFileSync(path.join(OUT, "ironwood-acres-badge-light.svg"), badge({ mode: "line", ring: CREAM, gold: GOLD, text: GREEN, inner: CREAM }));
console.log("ok");
