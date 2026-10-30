'use client';

import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PipelineNav } from '@/components/PipelineNav';
import { PipelineRunner } from '@/components/PipelineRunner';
import { FloorPlanCanvas } from '@/components/FloorPlanCanvas';
import { useProject } from '@/components/ProjectView';
import { useStream } from '@/lib/useStream';
import type { ProjectBundle } from '@/lib/api';
import type {
  ExperienceRequirement,
  ArchitecturalDecision,
  RetailStrategyOutput,
  OperatorOutput,
  HospitalityOutput,
} from '@placegraph/types';

const PRIORITY_COLOR: Record<string, string> = {
  critical: 'var(--error-color)',
  high:     'var(--qloo)',
  medium:   'var(--inference)',
  low:      'var(--muted-2)',
};

function RequirementRow({ req }: { req: ExperienceRequirement }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
      padding: '0.875rem 0',
      borderBottom: '1px solid var(--line-2)',
    }}>
      <div style={{
        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, marginTop: '7px',
        background: PRIORITY_COLOR[req.priority] ?? 'var(--muted)',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
          <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--ink)' }}>{req.requirement}</span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: PRIORITY_COLOR[req.priority] ?? 'var(--muted)' }}>
            {req.priority}
          </span>
          {req.zone && (
            <span style={{
              fontSize: '0.6875rem', padding: '0.1rem 0.45rem', borderRadius: '999px',
              border: '1px solid var(--line)', color: 'var(--muted)', background: 'var(--surface)',
            }}>
              {req.zone}
            </span>
          )}
        </div>
        {req.rationale && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.55 }}>{req.rationale}</p>
        )}
        {req.source && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', fontStyle: 'italic' }}>
            Source: {req.source}
          </span>
        )}
      </div>
    </div>
  );
}

function DecisionCard({ decision, projectId }: { decision: ArchitecturalDecision; projectId: string }) {
  return (
    <div style={{
      border: '1.5px solid var(--line-2)',
      borderLeft: '4px solid var(--accent)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
      padding: '1rem 1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
        {decision.zone && (
          <span className="pg-badge pg-badge-neutral">{decision.zone}</span>
        )}
      </div>
      <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
        {decision.decision}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.5rem', marginBottom: '0.625rem' }}>
        {decision.qlooEstablished && (
          <div style={{ padding: '0.375rem 0.5rem', background: 'var(--qloo-bg)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--qloo)', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Qloo affinity</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{decision.qlooEstablished}</p>
          </div>
        )}
        {decision.locallyEstablished && (
          <div style={{ padding: '0.375rem 0.5rem', background: 'var(--external-bg)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--external)', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Local</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{decision.locallyEstablished}</p>
          </div>
        )}
        {decision.inferred && (
          <div style={{ padding: '0.375rem 0.5rem', background: 'var(--inference-bg)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--inference)', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inferred</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{decision.inferred}</p>
          </div>
        )}
        {decision.unverified && (
          <div style={{ padding: '0.375rem 0.5rem', background: 'var(--assumption-bg)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--assumption)', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Unverified</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{decision.unverified}</p>
          </div>
        )}
      </div>
      {decision.alternatives?.length > 0 && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.375rem' }}>
          Alternatives considered: {decision.alternatives.join(' · ')}
        </p>
      )}
      <Link
        href={`/projects/${projectId}/explain?decision=${decision.id}`}
        style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
      >
        Why is this here? →
      </Link>
    </div>
  );
}

function RetailOutputSection({ output }: { output: RetailStrategyOutput }) {
  return (
    <>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
          Brand positioning
        </h2>
        <blockquote style={{
          fontFamily: '"Libre Baskerville", Georgia, serif',
          fontSize: '1rem', fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.75,
          borderLeft: '3px solid var(--accent)', paddingLeft: '1.25rem', margin: '0 0 1.5rem',
        }}>
          {output.positioning}
        </blockquote>
        {output.formatRecommendation && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>Format recommendation</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{output.formatRecommendation}</p>
          </div>
        )}
        {output.communityFit && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>Community fit</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{output.communityFit}</p>
          </div>
        )}
      </section>

      {output.categoryMix?.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
            Category mix
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {output.categoryMix.map((cat, i) => (
              <div key={i} style={{
                border: '1.5px solid var(--line-2)',
                borderLeft: '4px solid var(--accent)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-raised)',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)' }}>{cat.category}</span>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: cat.confidence === 'strong' ? 'var(--qloo)' : cat.confidence === 'weak' ? 'var(--muted-2)' : 'var(--inference)',
                  }}>{cat.confidence}</span>
                </div>
                {cat.alignment && <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: '0.375rem' }}>{cat.alignment}</p>}
                {cat.evidence?.length > 0 && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontStyle: 'italic' }}>Evidence: {cat.evidence.join(' · ')}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {output.localCollaborations?.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>Local collaborations</h2>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {output.localCollaborations.map((c, i) => <li key={i} style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{c}</li>)}
          </ul>
        </section>
      )}

      {output.gaps?.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>Identified gaps</h2>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {output.gaps.map((g, i) => <li key={i} style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{g}</li>)}
          </ul>
        </section>
      )}
    </>
  );
}

function OperatorOutputSection({ output }: { output: OperatorOutput }) {
  return (
    <>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
          Programming model
        </h2>
        <blockquote style={{
          fontFamily: '"Libre Baskerville", Georgia, serif',
          fontSize: '1rem', fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.75,
          borderLeft: '3px solid var(--accent)', paddingLeft: '1.25rem', margin: '0 0 1.5rem',
        }}>
          {output.programmingModel}
        </blockquote>
      </section>

      {output.experienceMix?.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>Experience mix</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {output.experienceMix.map((e, i) => (
              <div key={i} style={{
                border: '1.5px solid var(--line-2)',
                borderLeft: `4px solid ${e.proportion === 'primary' ? 'var(--accent)' : e.proportion === 'secondary' ? 'var(--qloo)' : 'var(--inference)'}`,
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-raised)',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)', textTransform: 'capitalize' }}>{e.type}</span>
                  <span className="pg-badge pg-badge-neutral">{e.proportion}</span>
                </div>
                {e.rationale && <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.55 }}>{e.rationale}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {output.activations?.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>Activations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {output.activations.map((a, i) => (
              <div key={i} style={{
                border: '1.5px solid var(--line-2)', borderRadius: 'var(--radius-md)',
                background: 'var(--surface-raised)', padding: '1rem 1.25rem',
              }}>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>{a.activity}</p>
                {a.rationale && <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: '0.25rem' }}>{a.rationale}</p>}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--muted)' }}>
                  {a.audience && <span>Audience: {a.audience}</span>}
                  {a.frequency && <span>· {a.frequency}</span>}
                  {a.spaceRequired && <span>· {a.spaceRequired}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {output.tenantRationale?.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>Tenant rationale</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {output.tenantRationale.map((t, i) => (
              <div key={i} style={{
                border: '1.5px solid var(--line-2)', borderRadius: 'var(--radius-md)',
                background: 'var(--surface-raised)', padding: '1rem 1.25rem',
              }}>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>{t.tenantType}</p>
                {t.why && <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.55 }}>{t.why}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {output.whatToStop?.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>What to stop doing</h2>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {output.whatToStop.map((w, i) => <li key={i} style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{w}</li>)}
          </ul>
        </section>
      )}
    </>
  );
}

function HospitalityOutputSection({ output }: { output: HospitalityOutput }) {
  return (
    <section style={{ marginTop: '2.5rem', borderTop: '1px solid var(--line-2)', paddingTop: '2rem', marginBottom: '2.5rem' }}>
      <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
        Concept identity
      </h2>
      {output.conceptIdentity && (
        <blockquote style={{
          fontFamily: '"Libre Baskerville", Georgia, serif',
          fontSize: '1rem', fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.75,
          borderLeft: '3px solid var(--accent)', paddingLeft: '1.25rem', margin: '0 0 1.5rem',
        }}>
          {output.conceptIdentity}
        </blockquote>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {output.fbStrategy && (
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>F&amp;B strategy</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{output.fbStrategy}</p>
          </div>
        )}
        {output.daypartStrategy && (
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>Daypart strategy</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{output.daypartStrategy}</p>
          </div>
        )}
        {output.programmingModel && (
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>Programming</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{output.programmingModel}</p>
          </div>
        )}
        {output.atmosphereNotes && (
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>Atmosphere</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{output.atmosphereNotes}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ConceptPage() {
  const { id } = useParams<{ id: string }>();
  const { bundle, error, loading, setBundle } = useProject(id);

  const handleVisDone = useCallback((b: ProjectBundle) => setBundle(b), [setBundle]);
  const {
    streaming: visStreaming, events: visEvents, error: visError, start: startVis,
  } = useStream(id, 'visualize', handleVisDone);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="pg-skeleton" style={{ height: '32px', width: '55%' }} />
      <div className="pg-skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />
      <div className="pg-skeleton" style={{ height: '320px', borderRadius: 'var(--radius-md)' }} />
    </div>
  );

  if (error || !bundle?.analysis) return (
    <p style={{ color: 'var(--muted)' }}>No analysis loaded.{' '}
      <Link href={`/projects/${id}`} style={{ color: 'var(--accent)' }}>← Back to project</Link>
    </p>
  );

  const { project, analysis } = bundle;
  const operatorType = project.operatorType;
  const strategy = analysis.strategies.find((s) => s.selected) || analysis.strategies.find((s) => s.id === analysis.selectedStrategyId);
  const requirements = analysis.requirements ?? [];
  const decisions    = analysis.decisions    ?? [];
  const concept      = analysis.concept;
  const viz          = (analysis.visualizations ?? [])[0] ?? null;
  const retailOutput     = analysis.retailOutput;
  const operatorOutput   = analysis.operatorOutput;
  const hospitalityOutput = analysis.hospitalityOutput;

  const floorPlanDataUrl = project.floorPlanUrl?.startsWith('data:') ? project.floorPlanUrl : null;

  const pageTitle = operatorType === 'retail'
    ? 'Retail strategy'
    : operatorType === 'operator'
      ? 'Programming model'
      : 'Spatial translation';

  const pageSubtitle = operatorType === 'retail'
    ? 'Category mix and format recommendation derived from the selected strategy and cultural evidence.'
    : operatorType === 'operator'
      ? 'Experience programming model, activations, and tenant rationale derived from the selected strategy.'
      : 'These requirements and spatial decisions are a direct consequence of the chosen investment direction. Every decision traces back to the Qloo cultural evidence, local observation, or agent inference that made this direction the strongest choice for this location.';

  if (!strategy) return (
    <main>
      <PipelineNav projectId={id} current="concept" analysisStatus={analysis?.status ?? project.status} />
      <div style={{
        maxWidth: '34rem', marginTop: '1rem', padding: '1.75rem',
        border: '1.5px solid var(--line-2)', borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
      }}>
        <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
          Choose an investment direction first
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
          Experience requirements, architectural decisions and the spatial concept are all downstream
          consequences of a chosen investment direction. Review the recommendation and proceed from there.
        </p>
        <Link href={`/projects/${id}/recommendation`} className="pg-btn">
          Go to recommendation →
        </Link>
      </div>
    </main>
  );

  return (
    <main>
      <PipelineNav projectId={id} current="concept" analysisStatus={analysis?.status ?? project.status} />

      <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.25rem' }}>
        {pageTitle}
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
        Investment direction:{' '}
        <strong style={{ color: 'var(--ink-2)' }}>{strategy.title}</strong>
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--muted)', maxWidth: '46rem', lineHeight: 1.65, marginBottom: '2rem' }}>
        {pageSubtitle}
      </p>

      {/* Retail brand output */}
      {operatorType === 'retail' && retailOutput && (
        <RetailOutputSection output={retailOutput} />
      )}

      {/* Facility operator output */}
      {operatorType === 'operator' && operatorOutput && (
        <OperatorOutputSection output={operatorOutput} />
      )}

      {/* Developer / Hospitality: standard architecture pipeline */}
      {operatorType !== 'retail' && operatorType !== 'operator' && (
        <>
          {/* Experience requirements */}
          {requirements.length > 0 && (
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
                Experience requirements
              </h2>
              <div>
                {requirements.map((req) => (
                  <RequirementRow key={req.id} req={req} />
                ))}
              </div>
            </section>
          )}

          {/* Architectural decisions */}
          {decisions.length > 0 && (
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
                Architectural decisions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {decisions.map((d) => (
                  <DecisionCard key={d.id} decision={d} projectId={id} />
                ))}
              </div>
            </section>
          )}

          {/* Spatial concept */}
          {concept && (
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
                Spatial concept
              </h2>

              {concept.organization && (
                <blockquote style={{
                  fontFamily: '"Libre Baskerville", Georgia, serif',
                  fontSize: '1rem', fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.75,
                  borderLeft: '3px solid var(--accent)', paddingLeft: '1.25rem', margin: '0 0 1.5rem',
                }}>
                  {concept.organization}
                </blockquote>
              )}

              {/* Interactive floor plan */}
              <div style={{ marginBottom: '1.5rem' }}>
                <FloorPlanCanvas
                  concept={concept}
                  decisions={decisions}
                  floorPlanDataUrl={floorPlanDataUrl}
                />
              </div>

              {/* Spatial attributes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {concept.materials?.length > 0 && (
                  <AttributeGroup label="Materials" items={concept.materials} color="var(--qloo)" />
                )}
                {concept.lighting?.length > 0 && (
                  <AttributeGroup label="Lighting" items={concept.lighting} color="var(--inference)" />
                )}
                {concept.furniture?.length > 0 && (
                  <AttributeGroup label="Furniture" items={concept.furniture} color="var(--external)" />
                )}
                {concept.opsNotes?.length > 0 && (
                  <AttributeGroup label="Operational notes" items={concept.opsNotes} color="var(--constraint)" />
                )}
              </div>

              {concept.circulation && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>
                    Circulation
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{concept.circulation}</p>
                </div>
              )}

              {concept.exterior && (
                <div style={{ marginTop: '0.875rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>
                    Exterior
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{concept.exterior}</p>
                </div>
              )}
            </section>
          )}

          {/* Hospitality: concept identity + F&B layer on top of architecture */}
          {operatorType === 'hospitality' && hospitalityOutput && (
            <HospitalityOutputSection output={hospitalityOutput} />
          )}

          {/* Visualization */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
              Concept render
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', maxWidth: '44rem', lineHeight: 1.65, marginBottom: '1rem' }}>
              Photoreal views translated from the selected strategy, architectural decisions and spatial concept.
              The plan remains the evidence view; the renders are the expected building.
            </p>

            {viz ? (
              <div>
                {viz.prompt && (
                  <details style={{ marginBottom: '1rem' }}>
                    <summary style={{ fontSize: '0.8125rem', color: 'var(--muted)', cursor: 'pointer' }}>
                      Derived visualization prompt
                    </summary>
                    <pre style={{
                      marginTop: '0.5rem', padding: '0.75rem', background: 'var(--surface)',
                      borderRadius: 'var(--radius)', fontSize: '0.8125rem', color: 'var(--ink-2)',
                      whiteSpace: 'pre-wrap', lineHeight: 1.6, border: '1px solid var(--line)',
                    }}>
                      {viz.prompt}
                    </pre>
                  </details>
                )}

                {viz.images?.length > 0 && (
                  <div>
                    <div style={{ marginBottom: '0.875rem' }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.2rem' }}>
                        Concept: {strategy?.title || project.name}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                        One complete-building cutaway, one full exterior and one full interior — derived from the same spatial brief.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {viz.images.map((img, i) => {
                        const isPlan = img.startsWith('data:image/svg');
                        const label = isPlan
                          ? 'Spatial concept plan'
                          : viz.viewLabels?.[i] || `Concept render ${i + 1}`;
                        return (
                          <figure key={i} style={{ margin: 0, maxWidth: '900px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={label}
                              style={{
                                width: '100%',
                                borderRadius: 'var(--radius-md)',
                                border: '1.5px solid var(--line)',
                                boxShadow: isPlan ? 'var(--shadow-sm)' : 'var(--shadow-lg)',
                              }}
                            />
                            <figcaption style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.375rem' }}>
                              {isPlan ? `${label} — reasoning evidence` : `${label} — ${strategy?.title || project.name}`}
                            </figcaption>
                          </figure>
                        );
                      })}
                    </div>
                  </div>
                )}

                {viz.model && viz.images?.some((img) => !img.startsWith('data:image/svg')) && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted-2)', marginTop: '0.75rem' }}>
                    Render model: {viz.model}
                  </p>
                )}

                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => startVis()}
                    disabled={visStreaming}
                    className="pg-btn pg-btn-ghost"
                  >
                    {visStreaming ? 'Rendering…' : 'Re-generate concept renders'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                  Generate photoreal concept renders and a spatial plan from the architectural reasoning chain.
                </p>
                <button
                  type="button"
                  onClick={() => startVis()}
                  disabled={visStreaming || !concept}
                  className="pg-btn"
                >
                  {visStreaming ? 'Rendering…' : 'Generate concept renders'}
                </button>
              </div>
            )}

            {(visStreaming || visEvents.length > 0 || visError) && (
              <div style={{ marginTop: '1rem' }}>
                <PipelineRunner streaming={visStreaming} events={visEvents} error={visError} onRetry={() => startVis()} />
              </div>
            )}
          </section>
        </>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {operatorType !== 'retail' && operatorType !== 'operator' && (
          <Link href={`/projects/${id}/explain`} className="pg-btn pg-btn-ghost">
            Trace reasoning chain
          </Link>
        )}
        <Link href={`/projects/${id}/review`} className="pg-btn pg-btn-ghost">
          Professional review →
        </Link>
        <Link href={`/projects/${id}/report`} className="pg-btn pg-btn-ghost">
          Export report
        </Link>
      </div>
    </main>
  );
}

function AttributeGroup({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontSize: '0.8125rem', padding: '0.125rem 0.5rem', borderRadius: '999px',
            border: `1px solid ${color}33`, background: `${color}12`, color: 'var(--ink-2)',
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
