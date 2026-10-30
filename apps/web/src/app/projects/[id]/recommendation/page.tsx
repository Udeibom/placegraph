'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PipelineNav } from '@/components/PipelineNav';
import { PipelineRunner } from '@/components/PipelineRunner';
import { EvidenceQuality } from '@/components/EvidenceQuality';
import { useProject } from '@/components/ProjectView';
import { useStream } from '@/lib/useStream';
import type { ProjectBundle } from '@/lib/api';
import type { Strategy, CulturalLandscape, CulturalPattern, Opportunity } from '@placegraph/types';

// ─── Design tokens mapped to direction type ────────────────────────────────

const DIRECTION_COLOR: Record<string, string> = {
  'Local Cultural Alignment': 'var(--external)',
  'Cultural Whitespace':      'var(--inference)',
  'Destination Experience':   'var(--accent)',
};

const DIRECTION_BADGE: Record<string, string> = {
  'Local Cultural Alignment': 'pg-badge pg-badge-external',
  'Cultural Whitespace':      'pg-badge pg-badge-infer',
  'Destination Experience':   'pg-badge pg-badge-accent',
};

const INTELLIGENCE_LABEL: Record<string, string> = {
  live:     'Live Qloo intelligence',
  mixed:    'Mixed intelligence',
  template: 'Template mode',
};

// ─── Small helpers ─────────────────────────────────────────────────────────

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--line-2)', margin: '1.75rem 0' }} />;
}

function SectionToggle({
  label,
  open,
  onToggle,
  count,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.625rem 0',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--ink-2)',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <span style={{
        width: '18px', height: '18px', borderRadius: '50%',
        border: '1.5px solid var(--line)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        fontSize: '0.625rem', color: 'var(--muted)', transition: 'transform 0.15s',
        transform: open ? 'rotate(180deg)' : 'none',
      }}>
        ▾
      </span>
      {label}
      {count !== undefined && (
        <span style={{
          marginLeft: '0.25rem', fontSize: '0.75rem', fontWeight: 400,
          color: 'var(--muted)', background: 'var(--surface)',
          border: '1px solid var(--line-2)', borderRadius: '999px',
          padding: '0.1rem 0.5rem',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Winner panel ──────────────────────────────────────────────────────────

function WinnerPanel({
  strategy,
  qlooThesis,
  qlooChangedBullets,
  distinctiveness,
  allowConfidentRecommendation,
  onProceed,
  busy,
}: {
  strategy: Strategy;
  qlooThesis: string;
  qlooChangedBullets: string[];
  distinctiveness: string | null;
  allowConfidentRecommendation: boolean;
  onProceed: (id: string) => void;
  busy: boolean;
}) {
  const accentColor = DIRECTION_COLOR[strategy.direction] ?? 'var(--accent)';
  const constraintConflicts = (strategy.assumptions ?? []).filter((a) =>
    a.startsWith('CONSTRAINT CONFLICT:')
  );

  return (
    <div style={{
      border: `2px solid ${accentColor}`,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '0.625rem 1.5rem',
        background: `${accentColor}14`,
        borderBottom: `1px solid ${accentColor}44`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: accentColor,
        }}>
          {allowConfidentRecommendation
            ? 'Recommended investment direction'
            : 'Indicative investment direction — evidence quality limited.'}
        </span>
        <span className={DIRECTION_BADGE[strategy.direction] ?? 'pg-badge pg-badge-neutral'}>
          {strategy.direction}
        </span>
        {allowConfidentRecommendation && typeof strategy.evaluationScore === 'number' && (
          <span style={{
            marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600,
            color: accentColor, opacity: 0.9,
          }}>
            Cultural fit {strategy.evaluationScore}/10
          </span>
        )}
      </div>

      {/* Main content */}
      <div style={{ padding: '1.5rem' }}>

        {/* Title + thesis */}
        <h1 style={{
          fontFamily: '"Libre Baskerville", Georgia, serif',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700, color: 'var(--ink)',
          lineHeight: 1.2, marginBottom: '0.625rem',
          letterSpacing: '-0.01em',
        }}>
          {strategy.title}
        </h1>
        <p style={{
          fontSize: '1rem', fontStyle: 'italic', color: 'var(--ink-2)',
          lineHeight: 1.7, marginBottom: '1.5rem',
          maxWidth: '52rem',
        }}>
          {strategy.experienceThesis}
        </p>

        {/* Qloo engine block — always visible, always first */}
        <div style={{
          padding: '1.125rem 1.25rem',
          background: 'var(--qloo-bg)',
          border: '1px solid rgba(181,129,74,0.3)',
          borderLeft: '4px solid var(--qloo)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
        }}>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--qloo)', marginBottom: '0.5rem',
          }}>
            Why Qloo changed this recommendation
          </p>

          {qlooThesis && (
            <p style={{
              fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.7,
              marginBottom: qlooChangedBullets.length ? '0.875rem' : 0,
              fontFamily: '"Libre Baskerville", Georgia, serif',
            }}>
              {qlooThesis}
            </p>
          )}

          {qlooChangedBullets.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {qlooChangedBullets.map((bullet, i) => (
                <li key={i} style={{
                  fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6,
                  paddingLeft: '1.125rem', position: 'relative',
                }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--qloo)', fontWeight: 700 }}>◆</span>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Constraint conflicts — hard blockers surfaced before the user proceeds */}
        {constraintConflicts.length > 0 && (
          <div style={{
            padding: '0.875rem 1rem',
            background: 'var(--error-bg)',
            border: '1px solid var(--error-color)',
            borderLeft: '4px solid var(--error-color)',
            borderRadius: 'var(--radius)',
            marginBottom: '1.5rem',
          }}>
            <p style={{
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--error-color)', marginBottom: '0.5rem',
            }}>
              Conflicts with your stated constraints
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {constraintConflicts.map((conflict, i) => (
                <li key={i} style={{
                  fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6,
                  paddingLeft: '1.125rem', position: 'relative',
                }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--error-color)', fontWeight: 700 }}>!</span>
                  {conflict.replace(/^CONSTRAINT CONFLICT:\s*/, '')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cultural distinctiveness — why this is impossible without Qloo */}
        {distinctiveness && (
          <div style={{
            padding: '0.875rem 1rem',
            background: 'var(--surface)',
            border: '1px solid var(--line-2)',
            borderLeft: '3px solid var(--qloo)',
            borderRadius: 'var(--radius)',
            marginBottom: '1.5rem',
          }}>
            <p style={{
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--qloo)', marginBottom: '0.375rem',
            }}>
              Why this concept is specific, not generic
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>
              {distinctiveness}
            </p>
          </div>
        )}

        {/* Three Qloo signal questions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
          gap: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          {strategy.culturalRelationships?.length ? (
            <SignalCard
              question="What cultural signals mattered?"
              answer={strategy.culturalRelationships.join(' · ')}
              color="var(--qloo)"
              bg="var(--qloo-bg)"
            />
          ) : null}

          {(strategy.qlooChangedDecision || strategy.qlooEvidenceSummary) && (
            <SignalCard
              question="What relationships changed the recommendation?"
              answer={strategy.qlooChangedDecision ?? strategy.qlooEvidenceSummary ?? ''}
              color="var(--qloo)"
              bg="var(--qloo-bg)"
            />
          )}

          {strategy.opportunityCaptured && (
            <SignalCard
              question="What investment opportunity became visible?"
              answer={strategy.opportunityCaptured}
              color={accentColor}
              bg={`${accentColor}0f`}
            />
          )}
        </div>

        {/* Why it exists + who it serves */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <InfoBlock label="Why it exists here" value={strategy.why} />
          <InfoBlock label="Who it serves" value={strategy.whoServes} />
        </div>

        {/* Proceed CTA */}
        <button
          type="button"
          onClick={() => onProceed(strategy.id)}
          disabled={busy}
          className="pg-btn pg-btn-lg"
          style={{ marginRight: '0.75rem' }}
        >
          {busy ? 'Building spatial translation…' : 'Proceed to spatial translation →'}
        </button>
      </div>
    </div>
  );
}

function SignalCard({
  question,
  answer,
  color,
  bg,
}: {
  question: string;
  answer: string;
  color: string;
  bg: string;
}) {
  return (
    <div style={{
      padding: '0.875rem 1rem',
      background: bg,
      border: `1px solid ${color}33`,
      borderRadius: 'var(--radius)',
    }}>
      <p style={{
        fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color, marginBottom: '0.375rem',
      }}>
        {question}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
        {answer}
      </p>
    </div>
  );
}

// ─── Cultural distinctiveness statement ────────────────────────────────────
// Builds a single sentence that answers: "why is this concept the one that
// couldn't have come from generic AI?" Uses existing landscape gaps + top
// Qloo affinity names to form a verifiable claim, not a generic assertion.

function buildDistinctivenessStatement(
  winner: Strategy,
  existingGaps: string[],
  topAffinities: Array<{ target: string; strength: number }>,
  location: string,
): string | null {
  const topNames = topAffinities.slice(0, 3).map((a) => `${a.target} (${a.strength.toFixed(2)})`);
  const gapText = existingGaps.slice(0, 1)[0] ?? null;

  if (!topNames.length) return null;

  const affinityClause = topNames.join(' · ');
  const locationStr = location || 'this location';
  const gapClause = gapText
    ? `${gapText.replace(/^[.→\s]+/, '').toLowerCase()}`
    : 'no equivalent exists nearby';

  return `Every other option on this street was derivable from a map and a demographic report. This direction exists because Qloo's graph found ${affinityClause} — places with no physical presence near ${locationStr} — whose audiences match the pattern here. That scored absence (${gapClause}) is what makes this concept specific rather than generic.`;
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{
        fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.375rem',
      }}>
        {label}
      </p>
      <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
        {value}
      </p>
    </div>
  );
}

// ─── Alternatives ──────────────────────────────────────────────────────────

function AlternativeCard({ strategy, rank }: { strategy: Strategy; rank: number }) {
  const [open, setOpen] = useState(false);
  const accentColor = DIRECTION_COLOR[strategy.direction] ?? 'var(--muted)';

  return (
    <div style={{
      border: '1.5px solid var(--line-2)',
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--muted-2)',
              }}>
                Alternative {rank}
              </span>
              <span className={DIRECTION_BADGE[strategy.direction] ?? 'pg-badge pg-badge-neutral'}>
                {strategy.direction}
              </span>
              {typeof strategy.evaluationScore === 'number' && (
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.25rem' }}>
                  {strategy.evaluationScore}/10
                </span>
              )}
            </div>
            <h3 style={{
              fontFamily: '"Libre Baskerville", Georgia, serif',
              fontSize: '1.0625rem', fontWeight: 700,
              color: 'var(--ink)', lineHeight: 1.3,
            }}>
              {strategy.title}
            </h3>
            <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.6, marginTop: '0.25rem' }}>
              {strategy.experienceThesis}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            style={{
              background: 'none', border: '1px solid var(--line-2)',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              fontSize: '0.75rem', color: 'var(--muted)',
              padding: '0.3rem 0.75rem', flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {open ? 'Less ↑' : 'More ↓'}
          </button>
        </div>

        {/* Always-visible: why weaker */}
        {strategy.whyWeakerThanAlternatives && (
          <div style={{
            marginTop: '0.875rem', padding: '0.625rem 0.875rem',
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            border: '1px solid var(--line-2)',
          }}>
            <p style={{
              fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--muted-2)', marginBottom: '0.2rem',
            }}>
              Why this is weaker given the Qloo evidence
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
              {strategy.whyWeakerThanAlternatives}
            </p>
          </div>
        )}
      </div>

      {/* Expandable detail */}
      {open && (
        <div style={{
          padding: '0 1.25rem 1.25rem',
          borderTop: '1px solid var(--line-2)',
          paddingTop: '1rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
            <InfoBlock label="Why it exists here" value={strategy.why} />
            <InfoBlock label="Who it serves" value={strategy.whoServes} />
          </div>

          {strategy.fitForAudience && (
            <div style={{
              padding: '0.75rem 0.875rem', marginBottom: '0.875rem',
              background: 'var(--qloo-bg)', borderRadius: 'var(--radius)',
              border: '1px solid rgba(181,129,74,0.2)',
            }}>
              <p style={{
                fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--qloo)', marginBottom: '0.2rem',
              }}>
                Qloo audience fit
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {strategy.fitForAudience}
              </p>
            </div>
          )}

          {(strategy.risks?.length > 0 || strategy.assumptions?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {strategy.risks?.length > 0 && (
                <div style={{ padding: '0.625rem 0.75rem', background: 'var(--error-bg)', borderRadius: 'var(--radius)' }}>
                  <p style={{
                    fontSize: '0.6875rem', fontWeight: 600, color: 'var(--error-color)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
                  }}>
                    Risks
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {strategy.risks.map((r, i) => (
                      <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.125rem' }}>· {r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {strategy.assumptions?.length > 0 && (
                <div style={{ padding: '0.625rem 0.75rem', background: 'var(--assumption-bg)', borderRadius: 'var(--radius)' }}>
                  <p style={{
                    fontSize: '0.6875rem', fontWeight: 600, color: 'var(--assumption)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
                  }}>
                    Assumptions
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {strategy.assumptions.map((a, i) => (
                      <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.125rem' }}>· {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Cross-domain affinity display ────────────────────────────────────────

function CrossDomainSection({ crossDomain }: { crossDomain: any }) {
  if (!crossDomain?.results) return null;

  const { places, brands, artists } = crossDomain.results as {
    places?: Array<{ target: string; strength: number }>;
    brands?: Array<{ target: string; strength: number }>;
    artists?: Array<{ target: string; strength: number }>;
  };

  const hasBrands  = brands?.length  && brands.length  > 0;
  const hasArtists = artists?.length && artists.length > 0;

  if (!hasBrands && !hasArtists) return null;

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <p style={{
        fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--qloo)', marginBottom: '0.5rem',
      }}>
        Cross-domain taste profile
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
        Brands, artists, and cultural references that resonate with this audience — not places, but the broader aesthetic identity they carry.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '0.75rem' }}>
        {hasBrands && (
          <div style={{
            padding: '0.875rem 1rem',
            background: 'var(--qloo-bg)',
            border: '1px solid rgba(181,129,74,0.22)',
            borderRadius: 'var(--radius)',
          }}>
            <p style={{
              fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--qloo)', marginBottom: '0.375rem',
            }}>
              Brand affinities
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {(brands ?? []).slice(0, 8).map((b) => (
                <span key={b.target} style={{
                  fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '999px',
                  border: '1px solid rgba(181,129,74,0.3)', background: 'var(--surface)', color: 'var(--ink-2)',
                }}>
                  {b.target}
                  {typeof b.strength === 'number' && (
                    <span style={{ color: 'var(--qloo)', marginLeft: '0.2rem', fontWeight: 600 }}>
                      {b.strength.toFixed(2)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
        {hasArtists && (
          <div style={{
            padding: '0.875rem 1rem',
            background: 'var(--inference-bg)',
            border: '1px solid rgba(90,122,158,0.2)',
            borderRadius: 'var(--radius)',
          }}>
            <p style={{
              fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--inference)', marginBottom: '0.375rem',
            }}>
              Music & artist affinities
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {(artists ?? []).slice(0, 8).map((a) => (
                <span key={a.target} style={{
                  fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '999px',
                  border: '1px solid rgba(90,122,158,0.3)', background: 'var(--surface)', color: 'var(--ink-2)',
                }}>
                  {a.target}
                  {typeof a.strength === 'number' && (
                    <span style={{ color: 'var(--inference)', marginLeft: '0.2rem', fontWeight: 600 }}>
                      {a.strength.toFixed(2)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cultural evidence drawer ──────────────────────────────────────────────

function LandscapePill({ label, quality }: { label: string; quality?: string }) {
  const color = quality === 'strong' ? 'var(--success)' : quality === 'moderate' ? 'var(--qloo)' : 'var(--muted)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.6875rem', color, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function LandscapeCard({ landscape }: { landscape: CulturalLandscape }) {
  const TITLES: Record<string, { title: string; accent: string }> = {
    existing:  { title: 'Existing commercial environment', accent: 'var(--external)' },
    potential: { title: 'Qloo cultural affinities',        accent: 'var(--qloo)' },
    proposed:  { title: 'Proposed positioning',            accent: 'var(--accent)' },
  };
  const meta = TITLES[landscape.type] ?? { title: landscape.type, accent: 'var(--accent)' };

  return (
    <div style={{
      border: '1.5px solid var(--line-2)',
      borderTop: `3px solid ${meta.accent}`,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
      padding: '1rem 1.125rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <h4 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ink)' }}>
          {meta.title}
        </h4>
        <LandscapePill label={landscape.evidenceQuality} quality={landscape.evidenceQuality} />
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '0.625rem' }}>
        {landscape.summary}
      </p>
      {landscape.experiences?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
          {landscape.experiences.slice(0, 8).map((e) => (
            <span key={e.name} style={{
              fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '999px',
              border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink-2)',
            }}>
              {e.name}
              {typeof e.affinity === 'number' && (
                <span style={{ color: 'var(--qloo)', marginLeft: '0.2rem', fontWeight: 600 }}>
                  {e.affinity.toFixed(2)}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
      {landscape.gaps?.length > 0 && (
        <div style={{ marginTop: '0.625rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>
            Gaps
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {landscape.gaps.slice(0, 3).map((g, i) => (
              <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', paddingLeft: '0.875rem', position: 'relative', marginBottom: '0.15rem' }}>
                <span style={{ position: 'absolute', left: 0, color: meta.accent }}>→</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PatternCard({ pattern }: { pattern: CulturalPattern }) {
  return (
    <div style={{
      padding: '0.75rem 0.875rem',
      background: 'var(--surface-raised)',
      border: '1px solid rgba(181,129,74,0.22)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
        <strong style={{ fontSize: '0.8125rem', color: 'var(--ink)' }}>{pattern.label}</strong>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--qloo)' }}>{pattern.count}</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: '0.25rem' }}>
        {pattern.places.slice(0, 4).join(' · ')}
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>{pattern.implication}</p>
    </div>
  );
}

function OpportunityRow({ op }: { op: Opportunity }) {
  const TYPE_COLOR: Record<string, string> = {
    alignment:   'var(--external)',
    whitespace:  'var(--inference)',
    destination: 'var(--accent)',
    mixed:       'var(--muted)',
  };
  const color = TYPE_COLOR[op.type] ?? 'var(--muted)';

  return (
    <div style={{
      padding: '0.875rem 1rem',
      border: '1.5px solid var(--line-2)',
      borderLeft: `4px solid ${color}`,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.06em', color,
        }}>
          {op.type}
        </span>
        <h4 style={{
          fontFamily: '"Libre Baskerville", Georgia, serif',
          fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ink)', margin: 0,
        }}>
          {op.title}
        </h4>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '0.5rem' }}>
        {op.why}
      </p>
      {op.qlooEstablished?.length > 0 && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
          <span style={{ color: 'var(--qloo)', fontWeight: 600 }}>Qloo: </span>
          {op.qlooEstablished.join(' · ')}
        </p>
      )}
      {op.uncertainties?.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--assumption)', marginTop: '0.25rem' }}>
          {op.uncertainties.length} unverified assumption{op.uncertainties.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function RecommendationPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const { bundle, error, loading, setBundle } = useProject(id);

  const [altOpen,        setAltOpen]        = useState(false);
  const [evidenceOpen,   setEvidenceOpen]   = useState(false);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);

  const handleDone = useCallback((b: ProjectBundle) => {
    setBundle(b);
    router.push(`/projects/${id}/concept`);
  }, [setBundle, router, id]);

  const { streaming, events, error: streamError, start } =
    useStream(id, 'design', handleDone);

  // ── Loading / error states ──────────────────────────────────────────────

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="pg-skeleton" style={{ height: '32px', width: '40%' }} />
      <div className="pg-skeleton" style={{ height: '280px', borderRadius: 'var(--radius-md)' }} />
      <div className="pg-skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />
    </div>
  );

  if (error || !bundle?.analysis?.strategies?.length) return (
    <main>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
        Run the investigation first to get a recommendation.{' '}
        <Link href={`/projects/${id}`} style={{ color: 'var(--accent)' }}>← Back to project</Link>
      </p>
    </main>
  );

  const { analysis, project } = bundle;
  const strategies = analysis.strategies;

  // The recommended direction is the one with the highest evaluationScore,
  // or the first strategy if scores are absent.
  const winner = [...strategies].sort((a, b) =>
    (b.evaluationScore ?? 0) - (a.evaluationScore ?? 0)
  )[0];
  const alternatives = strategies.filter((s) => s.id !== winner.id);

  const currentSelectedId = selectedId ?? analysis.selectedStrategyId ?? null;

  // Already has a design — winner is whatever was selected
  const designedStrategy = analysis.selectedStrategyId
    ? strategies.find((s) => s.id === analysis.selectedStrategyId) ?? winner
    : winner;

  // Qloo thesis — one canonical string shown once
  const qlooThesis = analysis.qlooContext?.culturalThesis ?? '';

  // Counterfactual bullets: use persisted counterfactual if available, otherwise
  // fall back to the winner's qlooChangedDecision field.
  const qlooChangedBullets: string[] = analysis.counterfactual?.whatQlooChanged?.length
    ? analysis.counterfactual.whatQlooChanged.slice(0, 4)
    : winner.qlooChangedDecision
      ? [winner.qlooChangedDecision]
      : [];

  function proceed(strategyId: string) {
    setSelectedId(strategyId);
    start({ strategyId });
  }

  const landscapes = analysis.landscapes;
  const patterns   = analysis.qlooContext?.culturalPatterns ?? [];
  const opps       = analysis.opportunities ?? [];
  const pois       = analysis.locationContext?.pois ?? [];

  // Build the cultural distinctiveness statement from existing gaps + top affinities
  const existingGaps = landscapes?.existing?.gaps ?? [];
  const topAffinities = (analysis.qlooContext?.affinities ?? [])
    .filter((a: any) => typeof a?.strength === 'number')
    .sort((a: any, b: any) => b.strength - a.strength)
    .slice(0, 5)
    .map((a: any) => ({ target: a.target, strength: a.strength }));
  const locationStr = [
    project.location.neighborhood,
    project.location.city,
  ].filter(Boolean).join(', ');
  const distinctiveness = buildDistinctivenessStatement(
    designedStrategy,
    existingGaps,
    topAffinities,
    locationStr,
  );

  return (
    <main>
      <PipelineNav
        projectId={id}
        current="recommendation"
        analysisStatus={analysis?.status ?? project.status}
      />

      {/* ── Intelligence mode badge — one line, not a section ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {analysis.intelligenceMode && (
          <span className={`pg-badge pg-badge-${analysis.intelligenceMode}`}>
            {INTELLIGENCE_LABEL[analysis.intelligenceMode] ?? analysis.intelligenceMode}
          </span>
        )}
        {analysis.evidenceGate && !analysis.evidenceGate.allowConfidentRecommendation && (
          <span className="pg-badge pg-badge-assume">
            Evidence quality limited — treat as indicative
          </span>
        )}
        <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginLeft: 'auto' }}>
          {project.name}
          {project.location.city ? ` · ${project.location.city}` : ''}
        </span>
      </div>

      {/* ── Winner panel (above the fold) ── */}
      <WinnerPanel
        strategy={designedStrategy}
        qlooThesis={qlooThesis}
        qlooChangedBullets={qlooChangedBullets}
        distinctiveness={distinctiveness}
        allowConfidentRecommendation={analysis.evidenceGate?.allowConfidentRecommendation !== false}
        onProceed={proceed}
        busy={streaming}
      />

      {/* ── Streaming progress ── */}
      {(streaming || events.length > 0 || streamError) && (
        <div style={{ marginTop: '1.25rem' }}>
          <PipelineRunner
            streaming={streaming}
            events={events}
            error={streamError}
            onRetry={() => currentSelectedId && start({ strategyId: currentSelectedId })}
          />
        </div>
      )}

      {/* If design is already done, offer link to spatial translation */}
      {analysis.status === 'designed' || analysis.status === 'visualized' ? (
        <div style={{ marginTop: '1.25rem' }}>
          <Link href={`/projects/${id}/concept`} className="pg-btn pg-btn-ghost">
            View spatial translation →
          </Link>
        </div>
      ) : null}

      <Divider />

      {/* ── Progressive disclosure: alternatives ── */}
      {alternatives.length > 0 && (
        <section style={{ marginBottom: '0.5rem' }}>
          <SectionToggle
            label="Alternative investment directions"
            open={altOpen}
            onToggle={() => setAltOpen((o) => !o)}
            count={alternatives.length}
          />
          {altOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.75rem' }}>
              {alternatives.map((s, i) => (
                <AlternativeCard key={s.id} strategy={s} rank={i + 1} />
              ))}
            </div>
          )}
        </section>
      )}

      <Divider />

      {/* ── Progressive disclosure: cultural evidence ── */}
      <section>
        <SectionToggle
          label="Cultural evidence behind this recommendation"
          open={evidenceOpen}
          onToggle={() => setEvidenceOpen((o) => !o)}
        />

        {evidenceOpen && (
          <div style={{ marginTop: '0.875rem' }}>

            {/* Evidence quality */}
            <div style={{ marginBottom: '1.5rem' }}>
              <EvidenceQuality
                gate={analysis.evidenceGate}
                intelligenceMode={analysis.intelligenceMode}
                qlooSource={analysis.qlooContext?.source}
              />
            </div>

            {/* Qloo cultural patterns */}
            {patterns.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{
                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--qloo)', marginBottom: '0.75rem',
                }}>
                  Qloo cultural patterns
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.625rem' }}>
                  {patterns.map((p) => <PatternCard key={p.key} pattern={p} />)}
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', marginTop: '0.625rem', lineHeight: 1.4 }}>
                  Patterns group scored place genres from Qloo. They are cultural relationships, not demand signals.
                </p>
              </div>
            )}

            {/* Cross-domain: brands, artists */}
            <CrossDomainSection crossDomain={analysis.qlooContext?.crossDomain} />

            {/* Landscapes */}
            {landscapes && (
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{
                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.75rem',
                }}>
                  Cultural landscape
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '0.875rem' }}>
                  <LandscapeCard landscape={landscapes.existing} />
                  <LandscapeCard landscape={landscapes.potential} />
                  <LandscapeCard landscape={landscapes.proposed} />
                </div>
              </div>
            )}

            {/* What the gaps revealed */}
            {opps.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{
                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.75rem',
                }}>
                  What the cultural gaps revealed
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {opps.map((op) => <OpportunityRow key={op.id} op={op} />)}
                </div>
              </div>
            )}

            {/* Nearby POIs */}
            {pois.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{
                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.625rem',
                }}>
                  Nearby commercial environment
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {pois.slice(0, 20).map((poi) => (
                    <span key={poi.name} style={{
                      fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px',
                      border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink-2)',
                    }}>
                      {poi.name}
                      {poi.category && <span style={{ color: 'var(--muted-2)' }}> · {poi.category}</span>}
                      {poi.distanceM && <span style={{ color: 'var(--muted-2)' }}> {Math.round(poi.distanceM)}m</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      <Divider />

      {/* ── Footer nav ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingBottom: '2rem' }}>
        <Link href={`/projects/${id}`} style={{ fontSize: '0.875rem', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Brief
        </Link>
        {(analysis.status === 'designed' || analysis.status === 'visualized') && (
          <Link href={`/projects/${id}/concept`} className="pg-btn pg-btn-ghost">
            Spatial translation →
          </Link>
        )}
        <Link href={`/projects/${id}/explain`} style={{ fontSize: '0.875rem', color: 'var(--muted)', textDecoration: 'none', marginLeft: 'auto' }}>
          Trace reasoning chain
        </Link>
        <Link href={`/projects/${id}/review`} style={{ fontSize: '0.875rem', color: 'var(--muted)', textDecoration: 'none' }}>
          Review
        </Link>
      </div>
    </main>
  );
}
