// YouTube thumbnail generator for Shopy (1280x720) — bold "I built an app" style.
// Wraps real simulator screenshots in proper iPhone device frames (titanium bezel,
// rim highlight, glassy sheen), cascades three screens, and composites them over a
// glossy branded background. All pills/badges are sized to their text so nothing overflows.
// Run from repo root: node scripts/gen-thumbnail.mjs
import sharp from 'sharp';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SHOTS = resolve(ROOT, 'screenshots');
const W = 1280;
const H = 720;

// Native screenshot resolution (iPhone 16 Pro) → exact aspect ratio.
const SRC_W = 1320;
const SRC_H = 2868;
const ASPECT = SRC_W / SRC_H;

const PRIMARY = '#634EF0'; // Shopy brand (logo only)
const TINT = '#8A74FF';
const INK = '#3A1206'; // warm dark for text on the white eyebrow pill
const ACCENT = '#E5340F'; // orange-red accent matching the background theme

// Rough Arial advance-width estimate (slightly generous so pills never clip).
const measure = (text, fs, ls = 0, caps = false) =>
  text.length * fs * (caps ? 0.66 : 0.58) + ls * Math.max(0, text.length - 1);

const BAG = 'M372 360 H652 A72 72 0 0 1 724 432 V688 A72 72 0 0 1 652 760 H372 A72 72 0 0 1 300 688 V432 A72 72 0 0 1 372 360 Z';
const HANDLE = 'M384 372 C384 268 640 268 640 372';
const S = 'M480 518 C480 490 499 476 525 476 C547 476 560 490 566 509 L544 528 C541 516 534 509 523 509 C512 509 504 516 504 529 C504 543 513 548 531 556 C557 567 569 582 569 613 C569 646 550 664 523 664 C499 664 483 648 477 627 L501 611 C504 624 512 631 525 631 C537 631 547 624 547 609 C547 594 537 588 520 580 C496 569 480 554 480 518 Z';

function logoMark(x, y, size, withBg = true) {
  const s = size / 1024;
  return `
    <g transform="translate(${x},${y}) scale(${s})">
      ${withBg ? `<rect width="1024" height="1024" rx="240" fill="url(#brand)"/>` : ''}
      <path d="${BAG}" fill="#fff"/>
      <path d="${S}" fill="${PRIMARY}"/>
      <path d="${HANDLE}" fill="none" stroke="#fff" stroke-width="46" stroke-linecap="round"/>
    </g>`;
}

function sparkle(cx, cy, r, fill = '#FFE27A') {
  const d = `M${cx} ${cy - r} C ${cx + r * 0.18} ${cy - r * 0.18}, ${cx + r * 0.18} ${cy - r * 0.18}, ${cx + r} ${cy} C ${cx + r * 0.18} ${cy + r * 0.18}, ${cx + r * 0.18} ${cy + r * 0.18}, ${cx} ${cy + r} C ${cx - r * 0.18} ${cy + r * 0.18}, ${cx - r * 0.18} ${cy + r * 0.18}, ${cx - r} ${cy} C ${cx - r * 0.18} ${cy - r * 0.18}, ${cx - r * 0.18} ${cy - r * 0.18}, ${cx} ${cy - r} Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

// --- text-sized pills (left edge fixed at x; width derived from the label) ---
const EYE_TEXT = 'REACT NATIVE · EXPO';
const EYE_FS = 20;
const EYE_LS = 2;
const eyeW = Math.round(48 + measure(EYE_TEXT, EYE_FS, EYE_LS, true) + 26);

const BUILT_TEXT = 'Built with Claude Code';
const BUILT_FS = 23;
const builtW = Math.round(58 + measure(BUILT_TEXT, BUILT_FS, 0, false) + 28);

const bg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FF5C2E"/>
      <stop offset="0.5" stop-color="#EE3A12"/>
      <stop offset="1" stop-color="#B01900"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${PRIMARY}"/>
      <stop offset="1" stop-color="${TINT}"/>
    </linearGradient>
    <radialGradient id="topGloss" cx="0.3" cy="0" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warmAccent" cx="0.05" cy="0.08" r="0.75">
      <stop offset="0" stop-color="#FFB060" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#FFB060" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="phoneGlow" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="#FFD8A8" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#FFD8A8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <rect width="${W}" height="${H}" fill="url(#warmAccent)"/>
  <rect width="${W}" height="${H}" fill="url(#topGloss)"/>
  <!-- soft glow behind the phones to lift them off the background -->
  <ellipse cx="950" cy="370" rx="400" ry="350" fill="url(#phoneGlow)"/>
  <!-- faint brandmark watermark behind the phones -->
  <g opacity="0.06">${logoMark(720, 150, 620, false)}</g>

  <!-- Eyebrow pill (auto-sized so the label never overflows) -->
  <g transform="translate(64,52)">
    <rect width="${eyeW}" height="48" rx="24" fill="#ffffff"/>
    <circle cx="28" cy="24" r="7" fill="${ACCENT}"/>
    <text x="48" y="32" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${EYE_FS}" letter-spacing="${EYE_LS}" fill="${INK}">${EYE_TEXT}</text>
  </g>

  <!-- Headline -->
  <text x="62" y="208" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="62" fill="#ffffff">I BUILT AN</text>

  <!-- highlighted word box -->
  <g transform="translate(62,236)">
    <rect width="468" height="92" rx="18" fill="#ffffff"/>
    <text x="234" y="66" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="68" fill="${ACCENT}">E-COMMERCE</text>
  </g>
  <text x="62" y="420" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="76" fill="#ffffff">APP <tspan fill="#FFE27A">WITH AI</tspan></text>
  ${sparkle(556, 372, 17)}
  ${sparkle(596, 350, 10)}

  <!-- Built-with pill (auto-sized) -->
  <g transform="translate(64,470)">
    <rect width="${builtW}" height="56" rx="28" fill="#15103A"/>
    ${sparkle(34, 28, 11, '#FFE27A')}
    <text x="58" y="36" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${BUILT_FS}" fill="#ffffff">${BUILT_TEXT}</text>
  </g>
  <text x="64" y="566" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="22" fill="#E7E3FF">Glossy storefront · checkout · admin dashboard</text>

  <!-- brand lockup bottom-left -->
  ${logoMark(64, 612, 44)}
  <text x="122" y="646" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="30" fill="#ffffff">Shopy</text>
</svg>`);

// "REAL APP" badge — auto-sized, drawn on top of the phones.
const BADGE_TEXT = 'REAL APP';
const BADGE_FS = 25;
const badgeW = Math.round(72 + measure(BADGE_TEXT, BADGE_FS, 0, true) + 24);
const badge = Buffer.from(`
<svg width="${badgeW}" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="${badgeW - 4}" height="58" rx="29" fill="#16A34A" stroke="#ffffff" stroke-width="3"/>
  <path d="M34 31 l8 9 l16 -18" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="68" y="40" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${BADGE_FS}" fill="#ffffff">${BADGE_TEXT}</text>
</svg>`);

// Builds a realistic iPhone: titanium bezel + rim highlight + glassy screen sheen.
// `screenH` is the on-screen height of the display area; the frame adds a thin bezel.
async function phone(file, screenH, angle) {
  const screenW = Math.round(screenH * ASPECT);
  const bezel = Math.round(screenW * 0.05); // thin, true-to-life titanium border
  const w = screenW + bezel * 2;
  const h = screenH + bezel * 2;
  const frameR = Math.round(w * 0.17); // outer corner radius
  const screenR = Math.round(screenW * 0.155); // display corner radius

  // 1) screenshot resized + corners rounded to the display radius
  const screenMask = Buffer.from(
    `<svg width="${screenW}" height="${screenH}"><rect width="${screenW}" height="${screenH}" rx="${screenR}" ry="${screenR}"/></svg>`,
  );
  const screen = await sharp(resolve(SHOTS, file))
    .resize(screenW, screenH)
    .composite([{ input: screenMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2) titanium frame with an edge rim-light and an inner shadow ring
  const frame = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ti" x1="0" y1="0" x2="0" y2="${h}" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#3a3a40"/>
          <stop offset="0.5" stop-color="#1b1b20"/>
          <stop offset="1" stop-color="#0b0b0f"/>
        </linearGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/>
          <stop offset="0.45" stop-color="#ffffff" stop-opacity="0.05"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0.22"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" rx="${frameR}" fill="url(#ti)"/>
      <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${frameR - 1}" fill="none" stroke="url(#rim)" stroke-width="3"/>
      <rect x="${bezel - 2}" y="${bezel - 2}" width="${screenW + 4}" height="${screenH + 4}" rx="${screenR + 2}" fill="none" stroke="#000000" stroke-opacity="0.55" stroke-width="3"/>
    </svg>`);

  // 3) glassy diagonal sheen, clipped to the display
  const sheen = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="sc"><rect x="${bezel}" y="${bezel}" width="${screenW}" height="${screenH}" rx="${screenR}"/></clipPath>
        <linearGradient id="gl" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="0.22" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g clip-path="url(#sc)"><rect width="${w}" height="${h}" fill="url(#gl)"/></g>
    </svg>`);

  let device = sharp(frame).composite([
    { input: screen, left: bezel, top: bezel },
    { input: sheen, left: 0, top: 0 },
  ]);
  let buf = await device.png().toBuffer();

  if (angle) {
    buf = await sharp(buf).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  }
  const meta = await sharp(buf).metadata();
  return { input: buf, width: meta.width, height: meta.height };
}

// Soft drop shadow matching a framed device's footprint.
async function shadowFor(screenH, angle) {
  const screenW = Math.round(screenH * ASPECT);
  const bezel = Math.round(screenW * 0.05);
  const w = screenW + bezel * 2;
  const h = screenH + bezel * 2;
  const frameR = Math.round(w * 0.17);
  const rect = Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${frameR}" fill="black" fill-opacity="0.5"/></svg>`,
  );
  return sharp(rect)
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .blur(26)
    .png()
    .toBuffer();
}

async function main() {
  const FAN = 9; // outward tilt of the side phones (degrees)
  // Fan: home upright & front in the middle, store + product angled out behind it.
  const center = { file: '01-home-light.png', h: 586, cx: 950, top: 102, angle: 0 };
  const left = { file: '03-store.png', h: 520, cx: 800, top: 150, angle: -FAN };
  const right = { file: '02-product.png', h: 520, cx: 1100, top: 150, angle: FAN };

  const [dC, dL, dR] = await Promise.all([
    phone(center.file, center.h, center.angle),
    phone(left.file, left.h, left.angle),
    phone(right.file, right.h, right.angle),
  ]);
  const [sC, sL, sR] = await Promise.all([
    shadowFor(center.h, center.angle),
    shadowFor(left.h, left.angle),
    shadowFor(right.h, right.angle),
  ]);

  // center each device on its target cx using the post-rotation bounding box
  const place = (d, cfg) => ({ left: Math.round(cfg.cx - d.width / 2), top: cfg.top });
  const pC = place(dC, center);
  const pL = place(dL, left);
  const pR = place(dR, right);

  await sharp(bg)
    .composite([
      // side phones (behind), then the center phone on top — shadow before each
      { input: sL, left: pL.left + 10, top: pL.top + 22 },
      { input: dL.input, left: pL.left, top: pL.top },
      { input: sR, left: pR.left + 10, top: pR.top + 22 },
      { input: dR.input, left: pR.left, top: pR.top },
      { input: sC, left: pC.left + 10, top: pC.top + 24 },
      { input: dC.input, left: pC.left, top: pC.top },
      { input: badge, left: 1280 - badgeW - 26, top: 22 },
    ])
    .png()
    .toFile(resolve(SHOTS, 'youtube-thumbnail.png'));

  console.log('✓ screenshots/youtube-thumbnail.png (1280x720)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
