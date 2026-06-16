// YouTube thumbnail generator for Shopy (1280x720).
// Composites real simulator screenshots over a branded background.
// Run from repo root: node scripts/gen-thumbnail.mjs
import sharp from 'sharp';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SHOTS = resolve(ROOT, 'screenshots');
const W = 1280;
const H = 720;

const PRIMARY = '#634EF0';
const TINT = '#8A74FF';

// --- Brandmark paths (from the app logo) ---
const BAG = 'M372 360 H652 A72 72 0 0 1 724 432 V688 A72 72 0 0 1 652 760 H372 A72 72 0 0 1 300 688 V432 A72 72 0 0 1 372 360 Z';
const HANDLE = 'M384 372 C384 268 640 268 640 372';
const S = 'M480 518 C480 490 499 476 525 476 C547 476 560 490 566 509 L544 528 C541 516 534 509 523 509 C512 509 504 516 504 529 C504 543 513 548 531 556 C557 567 569 582 569 613 C569 646 550 664 523 664 C499 664 483 648 477 627 L501 611 C504 624 512 631 525 631 C537 631 547 624 547 609 C547 594 537 588 520 580 C496 569 480 554 480 518 Z';

// --- Background + text (SVG) ---
function logoMark(x, y, size) {
  const s = size / 1024;
  return `
    <g transform="translate(${x},${y}) scale(${s})">
      <rect width="1024" height="1024" rx="240" fill="url(#brand)"/>
      <path d="${BAG}" fill="#fff"/>
      <path d="${S}" fill="${PRIMARY}"/>
      <path d="${HANDLE}" fill="none" stroke="#fff" stroke-width="46" stroke-linecap="round"/>
    </g>`;
}

function pill(x, y, w, label) {
  return `
    <g transform="translate(${x},${y})">
      <rect width="${w}" height="46" rx="23" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.18"/>
      <text x="${w / 2}" y="30" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="21" fill="#E7E3FF">${label}</text>
    </g>`;
}

const bg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0A0B12"/>
      <stop offset="0.55" stop-color="#15103A"/>
      <stop offset="1" stop-color="#1E1147"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${PRIMARY}"/>
      <stop offset="1" stop-color="${TINT}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${PRIMARY}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${PRIMARY}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accentText" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C9BCFF"/>
      <stop offset="1" stop-color="#8A74FF"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <circle cx="180" cy="120" r="420" fill="url(#glow)"/>
  <circle cx="1120" cy="640" r="360" fill="url(#glow)"/>

  <!-- Brand lockup -->
  ${logoMark(70, 64, 64)}
  <text x="150" y="110" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="40" fill="#ffffff">Shopy</text>

  <!-- Eyebrow -->
  <text x="72" y="198" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="23" letter-spacing="3" fill="${TINT}">FULL-STACK · REACT NATIVE</text>

  <!-- Headline -->
  <text x="70" y="262" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="48" fill="#B9B4D6">Build an</text>
  <text x="68" y="352" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="92" fill="#ffffff">E-Commerce</text>
  <text x="70" y="442" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="92" fill="url(#accentText)">App</text>

  <!-- Subhead -->
  <text x="72" y="498" font-family="Arial, Helvetica, sans-serif" font-weight="500" font-size="25" fill="#B9B4D6">Storefront · Checkout · Admin dashboard</text>

  <!-- Tech pills -->
  ${pill(72, 532, 104, 'Expo')}
  ${pill(188, 532, 168, 'NativeWind')}
  ${pill(368, 532, 116, 'NestJS')}
  ${pill(72, 592, 112, 'Prisma')}
  ${pill(196, 592, 168, 'PostgreSQL')}
  ${pill(376, 592, 162, 'TypeScript')}
</svg>`);

// --- Phone helper: resize, round corners, add border ---
async function phone(file, targetH) {
  const srcW = 1320;
  const srcH = 2868;
  const w = Math.round((targetH * srcW) / srcH);
  const h = targetH;
  const radius = Math.round(w * 0.13);

  const img = sharp(resolve(SHOTS, file)).resize(w, h);
  const mask = Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" ry="${radius}"/></svg>`,
  );
  const border = Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${radius}" ry="${radius}" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="3"/></svg>`,
  );
  const buf = await img
    .composite([
      { input: mask, blend: 'dest-in' },
      { input: border, blend: 'over' },
    ])
    .png()
    .toBuffer();
  return { input: buf, width: w, height: h };
}

async function main() {
  const front = await phone('01-home-light.png', 600);
  const left = await phone('05-home-dark.png', 540);
  const right = await phone('02-product.png', 540);

  // Positions (top-left). Front phone centered-right, two behind it fanned out.
  const frontX = 842, frontY = 70;
  const leftX = 690, leftY = 150;
  const rightX = 1006, rightY = 150;

  await sharp(bg)
    .composite([
      { input: left.input, left: leftX, top: leftY },
      { input: right.input, left: rightX, top: rightY },
      { input: front.input, left: frontX, top: frontY },
    ])
    .png()
    .toFile(resolve(SHOTS, 'youtube-thumbnail.png'));

  console.log('✓ screenshots/youtube-thumbnail.png (1280x720)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
