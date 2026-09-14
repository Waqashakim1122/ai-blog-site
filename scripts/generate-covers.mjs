// One-off generator for abstract SVG cover graphics used as post cover images.
// Run with: node scripts/generate-covers.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const OUT_DIR = "public/images/covers";
mkdirSync(OUT_DIR, { recursive: true });

const PALETTES = [
  ["#0f172a", "#155e75", "#0891b2"],
  ["#0b1324", "#134e4a", "#14b8a6"],
  ["#111827", "#1e3a8a", "#3b82f6"],
  ["#0f172a", "#312e81", "#6366f1"],
  ["#0c1420", "#0e7490", "#22d3ee"],
];

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shapesFor(rand, w, h, stroke) {
  const shapes = [];
  const count = 5 + Math.floor(rand() * 5);
  for (let i = 0; i < count; i++) {
    const kind = rand();
    const cx = rand() * w;
    const cy = rand() * h;
    const opacity = (0.08 + rand() * 0.16).toFixed(2);
    if (kind < 0.4) {
      const r = 30 + rand() * 140;
      shapes.push(
        `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(
          0
        )}" fill="none" stroke="${stroke}" stroke-width="1.5" opacity="${opacity}" />`
      );
    } else if (kind < 0.7) {
      const size = 40 + rand() * 160;
      const rot = (rand() * 360).toFixed(0);
      shapes.push(
        `<rect x="${(cx - size / 2).toFixed(0)}" y="${(cy - size / 2).toFixed(
          0
        )}" width="${size.toFixed(0)}" height="${size.toFixed(
          0
        )}" fill="none" stroke="${stroke}" stroke-width="1.5" opacity="${opacity}" transform="rotate(${rot} ${cx.toFixed(
          0
        )} ${cy.toFixed(0)})" />`
      );
    } else {
      const x2 = rand() * w;
      const y2 = rand() * h;
      shapes.push(
        `<line x1="${cx.toFixed(0)}" y1="${cy.toFixed(0)}" x2="${x2.toFixed(
          0
        )}" y2="${y2.toFixed(0)}" stroke="${stroke}" stroke-width="1" opacity="${opacity}" />`
      );
    }
  }
  return shapes.join("\n    ");
}

const W = 1200;
const H = 630;
const TOTAL = 15;

for (let i = 1; i <= TOTAL; i++) {
  const rand = mulberry32(i * 97 + 13);
  const palette = PALETTES[i % PALETTES.length];
  const [c1, c2, c3] = palette;
  const gradId = `g${i}`;
  const shapes = shapesFor(rand, W, H, c3);
  const nodeX = 120 + rand() * (W - 240);
  const nodeY = 120 + rand() * (H - 240);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="55%" stop-color="${c2}" />
      <stop offset="100%" stop-color="${c1}" />
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${gradId})" />
  <g>
    ${shapes}
  </g>
  <circle cx="${nodeX.toFixed(0)}" cy="${nodeY.toFixed(0)}" r="3" fill="${c3}" opacity="0.9" />
</svg>
`;

  writeFileSync(`${OUT_DIR}/cover-${i}.svg`, svg, "utf8");
}

console.log(`Generated ${TOTAL} covers in ${OUT_DIR}`);
