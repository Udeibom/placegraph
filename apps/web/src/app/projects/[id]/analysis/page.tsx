'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PipelineNav } from '@/components/PipelineNav';
import { EvidenceQuality } from '@/components/EvidenceQuality';
import { ReasoningChain } from '@/components/ReasoningChain';
import { useProject } from '@/components/ProjectView';
import type { CulturalLandscape, CulturalPattern, Opportunity } from '@placegraph/types';

const OPP_TYPE_CLASS: Record<string, string> = {
  alignment:   'pg-badge pg-badge-external',
  whitespace:  'pg-badge pg-badge-infer',
  destination: 'pg-badge pg-badge-accent',
  mixed:       'pg-badge pg-badge-neutral',
};

const LANDSCAPE_ACCENT: Record<string, string> = {
  existing:  'var(--external)',
  potential: 'var(--qloo)',
  proposed:  'var(--accent)',
};

const LANDSCAPE_BG: Record<string, string> = {
  existing:  'var(--external-bg)',
  potential: 'var(--qloo-bg)',
  proposed:  'var(--accent-light)',
};

const LANDSCAPE_TITLES: Record<string, { title: string; sub: string }> = {
  existing:  { title: 'Existing landscape', sub: 'Nearby commercial environment — observed, not preference' },
  potential: { title: 'Potential landscape', sub: 'Scored cultural affinities from Qloo — relationship evidence only' },
  proposed:  { title: 'Proposed interaction', sub: 'How a new project could position relative to what exists' },
};

function EvidenceQualityDot({ q }: { q: string }) {
  const color = q === 'strong' ? 'var(--success)' : q === 'moderate' ? 'var(--qloo)' : 'var(--error-color)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6875rem', color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
      {q} evidence
    </span>
  );
}

function LandscapeCard({ landscape }: { landscape: CulturalLandscape }) {
  const type = landscape.type as string;
  const meta = LANDSCAPE_TITLES[type] ?? { title: type, sub: '' };
  const accent = LANDSCAPE_ACCENT[type] ?? 'var(--accent)';
  const bg = LANDSCAPE_BG[type] ?? 'var(--surface-raised)';

  return (
    <article style={{
      border: '1.5px solid var(--line-2)',
      borderTop: `4px solid ${accent}`,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '1rem 1.125rem 0.75rem', background: bg, opacity: 0.95 }}>
        <h3 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.1875rem' }}>
          {meta.title}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>{meta.sub}</p>
        <div style={{ marginTop: '0.5rem' }}>
          <EvidenceQualityDot q={landscape.evidenceQuality} />
        </div>
      </div>

      <div style={{ padding: '0.875rem 1.125rem', flex: 1 }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: '0.75rem', fontStyle: 'italic' }}>
          {landscape.summary}
        </p>

        {landscape.experiences?.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>
              Experiences
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {landscape.experiences.slice(0, 10).map((e) => (
                <span key={e.name} style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '999px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink-2)',
                }}>
                  {e.name}
                  {e.category && <span style={{ color: 'var(--muted-2)' }}> · {e.category}</span>}
                  {typeof e.affinity === 'number' && (
                    <span style={{ color: 'var(--qloo)', marginLeft: '0.25rem', fontWeight: 600 }}>
                      Qloo {e.affinity.toFixed(3)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {landscape.gaps?.length > 0 && (
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>
              Gaps identified
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {landscape.gaps.slice(0, 4).map((g, i) => (
                <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', paddingLeft: '0.875rem', position: 'relative', marginBottom: '0.2rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: accent }}>→</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function OpportunityCard({ op }: { op: Opportunity }) {
  const typeClass = OPP_TYPE_CLASS[op.type] ?? 'pg-badge pg-badge-neutral';
  const uncertainCount = op.uncertainties?.length ?? 0;

  return (
    <article style={{
      border: '1.5px solid var(--line-2)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
      overflow: 'hidden',
      marginBottom: '1rem',
    }}>
      <div style={{ padding: '1.25rem 1.375rem', borderBottom: '1.5px solid var(--line-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className={typeClass}>{op.type}</span>
          {uncertainCount > 0 && (
            <span className="pg-badge pg-badge-assume">
              {uncertainCount} assumption{uncertainCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <h3 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
          {op.title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.55 }}>
          Serves: {op.whoServes}
        </p>
      </div>

      <div style={{ padding: '1rem 1.375rem' }}>
        <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: '1rem', fontStyle: 'italic' }}>
          {op.why}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <EvidenceCol
            label="Qloo affinity"
            items={op.qlooEstablished}
            color="var(--qloo)"
            bg="var(--qloo-bg)"
          />
          <EvidenceCol
            label="Locally established"
            items={op.locallyEstablished}
            color="var(--external)"
            bg="var(--external-bg)"
          />
          <EvidenceCol
            label="Inferred"
            items={op.inferred}
            color="var(--inference)"
            bg="var(--inference-bg)"
          />
        </div>

        {op.uncertainties?.length > 0 && (
          <div style={{
            marginTop: '0.875rem', padding: '0.625rem 0.875rem',
            background: 'var(--assumption-bg)', borderRadius: 'var(--radius)',
            border: '1px solid rgba(196,124,42,0.18)',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--assumption)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Unverified assumptions
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {op.uncertainties.map((u, i) => (
                <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.125rem' }}>· {u}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function CulturalPatternSummary({ patterns, thesis }: { patterns: CulturalPattern[]; thesis?: string }) {
  if (!patterns.length) return null;
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{
        border: '1.5px solid var(--line-2)',
        borderLeft: '4px solid var(--qloo)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--qloo-bg)',
        padding: '1.125rem 1.25rem',
      }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--qloo)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
          Qloo cultural pattern
        </p>
        {thesis && (
          <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.7, marginBottom: '1rem', fontFamily: '"Libre Baskerville", Georgia, serif' }}>
            {thesis}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.625rem' }}>
          {patterns.map((pattern) => (
            <div key={pattern.key} style={{ padding: '0.75rem 0.875rem', background: 'var(--surface-raised)', border: '1px solid rgba(181,129,74,0.22)', borderRadius: 'var(--radius)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.8125rem', color: 'var(--ink)' }}>{pattern.label}</strong>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--qloo)' }}>{pattern.count}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: '0.375rem' }}>
                {pattern.places.slice(0, 4).join(' · ')}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.45 }}>{pattern.implication}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', marginTop: '0.75rem', lineHeight: 1.4 }}>
          Patterns are inferred by grouping scored place genres. They are not additional Qloo scores, and affinity is not demand.
        </p>
      </div>
    </section>
  );
}

function EvidenceCol({ label, items, color, bg }: { label: string; items?: string[]; color: string; bg: string }) {
  return (
    <div style={{ padding: '0.625rem', background: bg, borderRadius: 'var(--radius)', border: `1px solid ${color}22` }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
        {label}
      </p>
      {items?.length ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((it, i) => (
            <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.125rem', lineHeight: 1.4 }}>
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-2)', fontStyle: 'italic' }}>None recorded</p>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { bundle, error, loading } = useProject(id);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="pg-skeleton" style={{ height: '32px', width: '50%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        {[1,2,3].map(i => <div key={i} className="pg-skeleton" style={{ height: '280px', borderRadius: 'var(--radius-md)' }} />)}
      </div>
    </div>
  );

  if (error || !bundle?.analysis) return (
    <div>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
        No analysis yet.{' '}
        <Link href={`/projects/${id}`} style={{ color: 'var(--accent)' }}>Run investigation first →</Link>
      </p>
    </div>
  );

  const { analysis, project } = bundle;
  const landscapes = analysis.landscapes;
  const aa = analysis.audienceAnalysis;
  const pois = analysis.locationContext?.pois ?? [];

  return (
    <main>
      <PipelineNav projectId={id} current="culture" analysisStatus={analysis?.status ?? project.status} />

      <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
        Cultural opportunity analysis
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', maxWidth: '44rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
        Three landscapes: what exists nearby, what Qloo shows as culturally adjacent, and how a new project
        could position relative to both. Affinity is treated as relationship evidence — not proof of demand.
      </p>

      <EvidenceQuality
        gate={analysis.evidenceGate}
        intelligenceMode={analysis.intelligenceMode}
        qlooSource={analysis.qlooContext?.source}
      />

      <CulturalPatternSummary
        patterns={analysis.qlooContext?.culturalPatterns ?? []}
        thesis={analysis.qlooContext?.culturalThesis}
      />

      {/* Three landscapes */}
      {landscapes && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <LandscapeCard landscape={landscapes.existing} />
            <LandscapeCard landscape={landscapes.potential} />
            <LandscapeCard landscape={landscapes.proposed} />
          </div>
        </section>
      )}

      {/* Audience relationship analysis */}
      {aa && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
            Audience relationships
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            Where audiences share affinities the space can serve them together. Where they conflict, spatial separation is required.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <AudienceListCard title="Shared" items={aa.shared} color="var(--success)" bg="var(--success-bg)" />
            <AudienceListCard title="Complementary" items={aa.complementary} color="var(--inference)" bg="var(--inference-bg)" />
            <AudienceListCard title="Conflicting" items={aa.conflicting} color="var(--assumption)" bg="var(--assumption-bg)" />
          </div>
          {aa.spatialImplications && (
            <div style={{
              padding: '1rem 1.25rem',
              border: '1.5px solid var(--line-2)',
              borderLeft: '4px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-raised)',
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
                Spatial implications
              </p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.7 }}>{aa.spatialImplications}</p>
            </div>
          )}
        </section>
      )}

      {/* Opportunities */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
          Opportunity hypotheses
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Three genuinely different market positions. Each separates scored Qloo affinities from local evidence,
          search-only matches, and agent inference. Commercial viability is not asserted.
        </p>
        {analysis.opportunities?.map((op) => (
          <OpportunityCard key={op.id} op={op} />
        ))}
      </section>

      {/* Nearby POIs */}
      {pois.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
            Nearby commercial environment
          </h2>
          <div style={{ columns: 3, gap: '0.5rem' }}>
            {pois.map((p) => (
              <div key={p.name} style={{ breakInside: 'avoid', fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.25rem', display: 'flex', gap: '0.375rem', alignItems: 'baseline' }}>
                <span>{p.name}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>{p.category}</span>
                {p.distanceM && <span style={{ fontSize: '0.6875rem', color: 'var(--muted-2)' }}>{p.distanceM}m</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <Link href={`/projects/${id}/strategies`} className="pg-btn">
          Compare strategic directions →
        </Link>
        <Link href={`/projects/${id}/explain`} className="pg-btn pg-btn-ghost">
          Trace reasoning chain
        </Link>
      </div>

      {/* Provenance */}
      {analysis.provenance?.length > 0 && (
        <section>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
            Reasoning chain so far
          </h2>
          <ReasoningChain nodes={analysis.provenance} maxInitial={5} />
        </section>
      )}
    </main>
  );
}

function AudienceListCard({ title, items, color, bg }: { title: string; items: string[]; color: string; bg: string }) {
  return (
    <div style={{ padding: '0.875rem 1rem', border: '1.5px solid var(--line-2)', borderTop: `3px solid ${color}`, borderRadius: 'var(--radius-md)', background: bg }}>
      <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: '0.5rem' }}>{title}</h3>
      {items?.length ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.25rem', lineHeight: 1.4 }}>· {item}</li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-2)', fontStyle: 'italic' }}>None identified</p>
      )}
    </div>
  );
}
