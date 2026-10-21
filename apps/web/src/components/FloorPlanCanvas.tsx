'use client';

import { useState } from 'react';
import type { SpatialConcept, SpatialLayoutRoom, ArchitecturalDecision } from '@placegraph/types';

const PALETTE = [
  '#3f2e24', '#6b4f3a', '#9a6b4f', '#c4a574',
  '#8a7355', '#524338', '#4e7a5e', '#5a7a9e',
];

function toSvgCoords(v: number) {
  // v is 0–100 percentage → map to drawing area
  return v;
}

interface Props {
  concept: SpatialConcept;
  decisions?: ArchitecturalDecision[];
  floorPlanDataUrl?: string | null;
}

export function FloorPlanCanvas({ concept, decisions = [], floorPlanDataUrl }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const layout: SpatialLayoutRoom[] = concept.layout ?? [];
  const hasLayout = layout.length > 0;

  // Find decision for a room by zone matching
  function decisionForRoom(room: SpatialLayoutRoom): ArchitecturalDecision | null {
    if (!decisions.length) return null;
    const name = room.name.toLowerCase();
    return decisions.find((d) =>
      d.zone.toLowerCase().includes(name) ||
      name.includes(d.zone.toLowerCase().split(' ')[0])
    ) ?? null;
  }

  const selectedDecision = selected
    ? decisionForRoom(layout.find((r) => r.name === selected)!)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* SVG Canvas */}
      <div style={{
        border: '1.5px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        background: '#f0ebe4',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', maxHeight: '420px', display: 'block' }}
        >
          {/* Floor plan image background if available */}
          {floorPlanDataUrl && (
            <image
              href={floorPlanDataUrl}
              x="0" y="0" width="100" height="100"
              preserveAspectRatio="xMidYMid meet"
              style={{ opacity: 0.18 }}
            />
          )}

          {/* Boundary */}
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--line)" strokeWidth="0.3" />

          {hasLayout ? (
            layout.map((room, i) => {
              const isHov = hovered === room.name;
              const isSel = selected === room.name;
              const fill  = PALETTE[i % PALETTE.length];

              return (
                <g
                  key={room.name}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(room.name)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(isSel ? null : room.name)}
                >
                  <rect
                    x={toSvgCoords(room.x)}
                    y={toSvgCoords(room.y)}
                    width={toSvgCoords(room.w)}
                    height={toSvgCoords(room.h)}
                    fill={fill}
                    fillOpacity={isSel ? 0.9 : isHov ? 0.78 : 0.62}
                    stroke="white"
                    strokeWidth="0.4"
                    rx="0.6"
                    style={{ transition: 'fill-opacity 0.12s ease' }}
                  />
                  {room.w > 14 && room.h > 8 && (
                    <>
                      <text
                        x={room.x + room.w / 2}
                        y={room.y + room.h / 2 - 1.8}
                        textAnchor="middle"
                        fill="white"
                        fontSize="2.8"
                        fontFamily="'Libre Baskerville', Georgia, serif"
                        style={{ pointerEvents: 'none' }}
                      >
                        {room.name.slice(0, 20)}
                      </text>
                      {room.purpose && (
                        <text
                          x={room.x + room.w / 2}
                          y={room.y + room.h / 2 + 2.2}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.7)"
                          fontSize="1.9"
                          fontFamily="sans-serif"
                          style={{ pointerEvents: 'none' }}
                        >
                          {room.purpose.slice(0, 30)}
                        </text>
                      )}
                    </>
                  )}
                  {(room.w <= 14 || room.h <= 8) && (
                    <text
                      x={room.x + room.w / 2}
                      y={room.y + room.h / 2 + 1}
                      textAnchor="middle"
                      fill="white"
                      fontSize="2.2"
                      fontFamily="sans-serif"
                      style={{ pointerEvents: 'none' }}
                    >
                      {room.name.slice(0, 12)}
                    </text>
                  )}
                </g>
              );
            })
          ) : (
            /* Fallback: zone cards */
            concept.zones?.slice(0, 6).map((zone, i) => {
              const cols = Math.min(3, (concept.zones ?? []).length);
              const col = i % cols;
              const row = Math.floor(i / cols);
              const w = Math.floor(100 / cols) - 2;
              const h = Math.floor(100 / Math.ceil((concept.zones ?? []).length / cols)) - 2;
              const x = col * (w + 2) + 1;
              const y = row * (h + 2) + 1;
              return (
                <g key={zone.name}>
                  <rect x={x} y={y} width={w} height={h} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.7} rx="1" />
                  <text x={x + w / 2} y={y + h / 2 + 1} textAnchor="middle" fill="white" fontSize="3"
                    fontFamily="'Libre Baskerville', Georgia, serif">
                    {zone.name.slice(0, 16)}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      {hasLayout && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {layout.map((room, i) => (
            <button
              key={room.name}
              type="button"
              onClick={() => setSelected(selected === room.name ? null : room.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: selected === room.name ? 'var(--accent-light)' : 'var(--surface-raised)',
                border: `1.5px solid ${selected === room.name ? 'var(--accent)' : 'var(--line-2)'}`,
                borderRadius: '999px', padding: '0.2rem 0.625rem',
                cursor: 'pointer', fontSize: '0.75rem', color: 'var(--ink-2)',
                transition: 'all var(--duration-fast) var(--ease)',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
              {room.name}
            </button>
          ))}
        </div>
      )}

      {/* Decision panel when room selected */}
      {selected && selectedDecision && (
        <div style={{
          padding: '1rem',
          border: '1.5px solid var(--line)',
          borderLeft: '4px solid var(--accent)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-raised)',
          animation: 'pg-slide-up var(--duration-slow) var(--ease-out) both',
        }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.375rem' }}>
            {selectedDecision.zone}
          </div>
          <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.625rem' }}>
            {selectedDecision.decision}
          </p>
          {selectedDecision.qlooEstablished && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--qloo)', marginBottom: '0.25rem' }}>
              <strong>Qloo:</strong> {selectedDecision.qlooEstablished}
            </p>
          )}
          {selectedDecision.locallyEstablished && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--external)', marginBottom: '0.25rem' }}>
              <strong>Local:</strong> {selectedDecision.locallyEstablished}
            </p>
          )}
          {selectedDecision.inferred && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--inference)' }}>
              <strong>Inferred:</strong> {selectedDecision.inferred}
            </p>
          )}
        </div>
      )}

      {selected && !selectedDecision && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontStyle: 'italic' }}>
          No architectural decision mapped to this zone.
        </div>
      )}
    </div>
  );
}
