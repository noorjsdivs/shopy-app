// Shopy brand asset generator — re-runnable. Renders all PNGs (and master SVGs)
// from a single brandmark definition: a rounded shopping bag whose cutout reads
// as an "S". Run with: node scripts/gen-icons.mjs
//
// Colors here mirror DESIGN-SPEC tokens (--primary 99 78 240, --primary-tint
// 138 116 255, dark --bg 10 11 16). Native config requires hex, so the brand
// colors are baked into the PNGs here; app code still uses tokens.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const ASSETS = resolve(root, 'assets');
const BRAND = resolve(ASSETS, 'brand');

const PRIMARY = '#634EF0';
const PRIMARY_TINT = '#8A74FF';

// --- Brandmark geometry (1024 artboard) ----------------------------------
// Shopping bag body (rounded rect) + handle arc + an "S" glyph.
const BAG_BODY =
  'M372 360 H652 A72 72 0 0 1 724 432 V688 A72 72 0 0 1 652 760 H372 ' +
  'A72 72 0 0 1 300 688 V432 A72 72 0 0 1 372 360 Z';
const HANDLE = 'M384 372 C384 268 640 268 640 372';
const S_GLYPH =
  'M480 518 C480 490 499 476 525 476 C547 476 560 490 566 509 L544 528 ' +
  'C541 516 534 509 523 509 C512 509 504 516 504 529 C504 543 513 548 531 556 ' +
  'C557 567 569 582 569 613 C569 646 550 664 523 664 C499 664 483 648 477 627 ' +
  'L501 611 C504 624 512 631 525 631 C537 631 547 624 547 609 C547 594 537 588 520 580 ' +
  'C496 569 480 554 480 518 Z';

const defs = `
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${PRIMARY}"/>
      <stop offset="1" stop-color="${PRIMARY_TINT}"/>
    </linearGradient>
    <radialGradient id="gloss" cx="0.3" cy="0.22" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

// White bag with a purple S on top + white handle (for use over the gradient).
const glyphColor = `
  <path d="${BAG_BODY}" fill="#ffffff"/>
  <path d="${S_GLYPH}" fill="${PRIMARY}"/>
  <path d="${HANDLE}" fill="none" stroke="#ffffff" stroke-width="46" stroke-linecap="round"/>`;

// All-white glyph with the S punched out (for adaptive icon / notification).
const glyphMono = `
  <path d="${BAG_BODY} ${S_GLYPH}" fill="#ffffff" fill-rule="evenodd"/>
  <path d="${HANDLE}" fill="none" stroke="#ffffff" stroke-width="46" stroke-linecap="round"/>`;

/** Full brand tile (gradient bg + gloss + colored glyph). rx rounds the corners. */
function tile(rx) {
  return `
    <rect x="0" y="0" width="1024" height="1024" rx="${rx}" fill="url(#brand)"/>
    <rect x="0" y="0" width="1024" height="1024" rx="${rx}" fill="url(#gloss)"/>
    ${glyphColor}`;
}

const svg = (inner) =>
  `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${defs}${inner}</svg>`;

// Master SVGs
const logoSvg = svg(tile(220));
const logoMonoSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${glyphMono}</svg>`;

// App icon: full-bleed gradient (OS masks corners)
const iconSvg = svg(tile(0));
// Splash: centered rounded gradient badge with transparent margin
const splashSvg = svg(`<g transform="translate(152,152) scale(0.703)">${tile(180)}</g>`);
// Android adaptive foreground: white glyph inside the 66% safe zone, transparent bg
const adaptiveFgSvg = svg(
  `<g transform="translate(512,512) scale(0.66) translate(-512,-512)">${glyphMono}</g>`,
);
// Notification: white glyph, transparent (Android tints it)
const notifSvg = svg(`<g transform="translate(512,512) scale(0.82) translate(-512,-512)">${glyphMono}</g>`);

async function png(svgStr, out, size) {
  await sharp(Buffer.from(svgStr)).resize(size, size).png().toFile(out);
  console.log('  ✓', out.replace(root + '/', ''));
}

async function main() {
  await mkdir(BRAND, { recursive: true });
  await mkdir(resolve(ASSETS, 'images'), { recursive: true });

  await writeFile(resolve(BRAND, 'logo.svg'), logoSvg);
  await writeFile(resolve(BRAND, 'logo-mono.svg'), logoMonoSvg);
  console.log('  ✓ assets/brand/logo.svg, logo-mono.svg');

  await png(iconSvg, resolve(ASSETS, 'icon.png'), 1024);
  await png(splashSvg, resolve(ASSETS, 'splash-icon.png'), 1024);
  await png(adaptiveFgSvg, resolve(ASSETS, 'adaptive-icon-foreground.png'), 1024);
  await png(notifSvg, resolve(ASSETS, 'notification-icon.png'), 96);
  await png(iconSvg, resolve(ASSETS, 'favicon.png'), 48);

  console.log('🎨 Shopy brand assets generated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
