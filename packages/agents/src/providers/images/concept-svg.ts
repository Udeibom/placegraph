import type { SpatialConcept, SpatialLayoutRoom, Strategy } from '@placegraph/types';

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function renderConceptSvg(opts: {
  projectName: string;
  strategy?: Strategy;
  concept?: SpatialConcept;
}): string {
  const layout = opts.concept?.layout;
  if (layout?.length) return renderPlan(opts.projectName, opts.strategy, opts.concept, layout);

  const zones = opts.concept?.zones?.length
    ? opts.concept.zones
    : [
        { name: 'Arrival', purpose: 'Threshold' },
        { name: 'Primary', purpose: 'Core experience' },
        { name: 'Support', purpose: 'Operations' }
      ];

  const palette = ['#3f2e24', '#6b4f3a', '#9a6b4f', '#c4a574', '#8a7355', '#524338'];
  const cols = Math.min(3, zones.length);
  const rows = Math.ceil(zones.length / cols);
  const cardW = 280;
  const cardH = 140;
  const width = 40 + cols * (cardW + 20);
  const height = 150 + rows * (cardH + 18);

  const cards = zones
    .map((z, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 30 + col * (cardW + 20);
      const y = 110 + row * (cardH + 18);
      const fill = palette[i % palette.length];
      return `
        <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="10" fill="${fill}" />
        <text x="${x + 16}" y="${y + 36}" fill="#f6f1e8" font-size="18" font-family="Georgia, serif">${esc(z.name)}</text>
        <text x="${x + 16}" y="${y + 64}" fill="#f6f1e8" font-size="12" font-family="sans-serif">${esc((z.purpose || '').slice(0, 42))}</text>
        <text x="${x + 16}" y="${y + 86}" fill="#e8dcc8" font-size="11" font-family="sans-serif">${esc((z.character || z.adjacency || '').slice(0, 48))}</text>
      `;
    })
    .join('');

  const title = esc(opts.strategy?.title || opts.projectName);
  const subtitle = esc(opts.concept?.organization?.slice(0, 90) || 'Preliminary spatial concept');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f3eadc"/>
    <text x="30" y="42" fill="#1c1917" font-size="22" font-family="Georgia, serif">${title}</text>
    <text x="30" y="70" fill="#57534e" font-size="13" font-family="sans-serif">${subtitle}</text>
    ${cards}
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderPlan(
  projectName: string,
  strategy: Strategy | undefined,
  concept: SpatialConcept | undefined,
  layout: SpatialLayoutRoom[]
): string {
  const width = 920;
  const height = 620;
  const ox = 40;
  const oy = 100;
  const pw = 840;
  const ph = 480;
  const palette = ['#3f2e24', '#6b4f3a', '#9a6b4f', '#c4a574', '#8a7355', '#524338'];
  const rooms = layout
    .map((r, i) => {
      const x = ox + (r.x / 100) * pw;
      const y = oy + (r.y / 100) * ph;
      const w = (r.w / 100) * pw;
      const h = (r.h / 100) * ph;
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${palette[i % palette.length]}" stroke="#f3eadc" stroke-width="3"/>
        <text x="${x + 12}" y="${y + 28}" fill="#f6f1e8" font-size="16" font-family="Georgia, serif">${esc(r.name)}</text>
        <text x="${x + 12}" y="${y + 50}" fill="#e8dcc8" font-size="11" font-family="sans-serif">${esc((r.purpose || '').slice(0, 42))}</text>
      `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f3eadc"/>
    <text x="40" y="42" fill="#1c1917" font-size="22" font-family="Georgia, serif">${esc(strategy?.title || projectName)}</text>
    <text x="40" y="70" fill="#57534e" font-size="13" font-family="sans-serif">${esc((concept?.organization || 'Preliminary plan').slice(0, 110))}</text>
    <rect x="${ox}" y="${oy}" width="${pw}" height="${ph}" fill="#e6dcc8" stroke="#1c1917" stroke-width="2"/>
    ${rooms}
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
