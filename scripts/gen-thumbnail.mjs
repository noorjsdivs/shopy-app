// YouTube thumbnail generator for Shopy (1280x720) — bold "I built an app" style.
// Composites real simulator screenshots over a glossy branded background.
// Run from repo root: node scripts/gen-thumbnail.mjs
import sharp from 'sharp';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SHOTS = resolve(ROOT, 'screenshots');
const W = 1280;
const H = 720;

const PRIMARY = '#634EF0';
const TINT = '#8A74FF';
const INK = '#2A1E66';

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

const bg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7458FF"/>
      <stop offset="0.55" stop-color="#4A38C0"/>
      <stop offset="1" stop-color="#2A1E7A"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${PRIMARY}"/>
      <stop offset="1" stop-color="${TINT}"/>
    </linearGradient>
    <radialGradient id="topGloss" cx="0.35" cy="0" r="0.8">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <rect width="${W}" height="${H}" fill="url(#topGloss)"/>
  <!-- faint brandmark watermark behind the phones -->
  <g opacity="0.07">${logoMark(720, 150, 620, false)}</g>

  <!-- Eyebrow pill -->
  <g transform="translate(64,52)">
    <rect width="288" height="48" rx="24" fill="#ffffff"/>
    <circle cx="30" cy="24" r="7" fill="${PRIMARY}"/>
    <text x="50" y="32" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="21" letter-spacing="2" fill="${INK}">REACT NATIVE · EXPO</text>
  </g>

  <!-- Headline -->
  <text x="62" y="208" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="62" fill="#ffffff">I BUILT AN</text>

  <!-- highlighted word box -->
  <g transform="translate(62,236)">
    <rect width="468" height="92" rx="18" fill="#ffffff"/>
    <text x="234" y="66" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="68" fill="${PRIMARY}">E-COMMERCE</text>
  </g>
  <text x="62" y="420" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="76" fill="#ffffff">APP <tspan fill="#FFE27A">WITH AI</tspan></text>
  ${sparkle(556, 372, 17)}
  ${sparkle(596, 350, 10)}

  <!-- Built-with pill -->
  <g transform="translate(64,470)">
    <rect width="340" height="56" rx="28" fill="#15103A"/>
    ${sparkle(34, 28, 11, '#FFE27A')}
    <text x="56" y="36" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="23" fill="#ffffff">Built with Claude Code</text>
  </g>
  <text x="64" y="566" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="22" fill="#E7E3FF">Glossy storefront · checkout · admin dashboard</text>

  <!-- brand lockup bottom-left -->
  ${logoMark(64, 612, 44)}
  <text x="122" y="646" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="30" fill="#ffffff">Shopy</text>
</svg>`);

// "REAL APP" badge (composited on top of the phones)
const badge = Buffer.from(`
<svg width="220" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="216" height="58" rx="29" fill="#16A34A" stroke="#ffffff" stroke-width="3"/>
  <path d="M34 31 l8 9 l16 -18" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="74" y="40" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="25" fill="#ffffff">REAL APP</text>
</svg>`);

async function phone(file, targetH, angle) {
  const srcW = 1320;
  const srcH = 2868;
  const w = Math.round((targetH * srcW) / srcH);
  const h = targetH;
  const radius = Math.round(w * 0.13);
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" ry="${radius}"/></svg>`);
  const border = Buffer.from(`<svg width="${w}" height="${h}"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${radius}" ry="${radius}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="4"/></svg>`);
  let img = sharp(resolve(SHOTS, file)).resize(w, h).composite([
    { input: mask, blend: 'dest-in' },
    { input: border, blend: 'over' },
  ]);
  let buf = await img.png().toBuffer();
  if (angle) {
    buf = await sharp(buf).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  }
  const meta = await sharp(buf).metadata();
  return { input: buf, width: meta.width, height: meta.height };
}

async function shadowFor(targetH, angle) {
  const w = Math.round((targetH * 1320) / 2868);
  const h = targetH;
  const radius = Math.round(w * 0.13);
  const rect = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" fill="black" fill-opacity="0.5"/></svg>`);
  const buf = await sharp(rect)
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .blur(18)
    .png()
    .toBuffer();
  return buf;
}

async function main() {
  const ANGLE = 7;
  const back = await phone('02-product.png', 580, ANGLE); // right, behind
  const front = await phone('01-home-light.png', 612, ANGLE); // left, front
  const backShadow = await shadowFor(580, ANGLE);
  const frontShadow = await shadowFor(612, ANGLE);

  await sharp(bg)
    .composite([
      { input: backShadow, left: 968 + 12, top: 80 + 22 },
      { input: back.input, left: 968, top: 80 },
      { input: frontShadow, left: 686 + 12, top: 64 + 22 },
      { input: front.input, left: 686, top: 64 },
      { input: badge, left: 1044, top: 30 },
    ])
    .png()
    .toFile(resolve(SHOTS, 'youtube-thumbnail.png'));

  console.log('✓ screenshots/youtube-thumbnail.png (1280x720)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
