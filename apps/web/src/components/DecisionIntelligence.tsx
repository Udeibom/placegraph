'use client';

import type { AnalysisSnapshot } from '@placegraph/types';

const QUALITY_COLOR: Record<string, string> = {
  strong: 'var(--success)',
  moderate: 'var(--qloo)',
  approximate: 'var(--assumption)',
  insufficient: 'var(--error-color)',
  failed: 'var(--error-color)',
  unresolved: 'var(--error-color)',
  degraded: 'var(--assumption)'
};

const STATUS_COLOR: Record<string, string> = {
  complete: 'var(--success)',
  resolved: 'var(--success)',
  degraded: 'var(--assumption)',
  approximate: 'var(--assumption)',
  failed: 'var(--error-color)',
  unresolved: 'var(--error-color)',
  skipped: 'var(--muted)',
  pending: 'var(--muted)'
};

function Pill({ value, color }: { value: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.625rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color,
      border: `1px solid ${color}66`,
      background: `${color}12`,
      borderRadius: '999px',
      padding: '0.1rem 0.45rem'
    }}>
      {value}
    </span>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.6875rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--muted-2)',
      marginBottom: '0.5rem'
    }}>
      {children}
    </p>
  );
}

export function DecisionIntelligence({ analysis }: { analysis: AnalysisSnapshot }) {
  const frame = analysis.decisionFrame;
  const profiles = analysis.organisationProfiles || [];
  const audiences = analysis.audienceResolutions || [];
  const claims = analysis.evidenceClaims || [];
  const relationships = analysis.relationships || [];
  const deliverables = analysis.deliverables || [];
  const stages = analysis.stageStates || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {frame && (
        <section>
          <Heading>Decision frame</Heading>
          <div style={{
            padding: '0.875rem 1rem',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)',
            background: 'var(--surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
              <strong style={{ fontSize: '0.875rem', color: 'var(--ink)' }}>{frame.subject || analysis.projectId}</strong>
              <Pill value={frame.type.replace(/_/g, ' ')} color="var(--accent)" />
            </div>
            {frame.capitalIntent && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>Capital intent: {frame.capitalIntent}</p>
            )}
            {profiles.length > 0 && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                Profiles: {profiles.map((profile) => `${profile.name}${profile.primary ? ' (primary)' : ''}`).join(' · ')}
              </p>
            )}
          </div>
        </section>
      )}

      {audiences.length > 0 && (
        <section>
          <Heading>Audience resolution</Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {audiences.map((audience) => (
              <div key={audience.id} style={{
                padding: '0.75rem 0.875rem',
                border: '1px solid var(--line-2)',
                borderRadius: 'var(--radius)',
                background: 'var(--surface-raised)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--ink)' }}>{audience.name}</strong>
                  <Pill value={audience.status} color={STATUS_COLOR[audience.status] || 'var(--muted)'} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {audience.seeds.length} seed{audience.seeds.length === 1 ? '' : 's'} · {audience.affinities.length} affinities
                  </span>
                </div>
                {audience.limitations.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--assumption)', marginTop: '0.25rem' }}>
                    {audience.limitations.join(' ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {relationships.length > 0 && (
        <section>
          <Heading>Cultural relationships</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '0.625rem' }}>
            {relationships.slice(0, 12).map((relationship) => (
              <div key={relationship.id} style={{
                padding: '0.75rem 0.875rem',
                border: '1px solid var(--line-2)',
                borderLeft: `3px solid ${QUALITY_COLOR[relationship.quality] || 'var(--muted)'}`,
                borderRadius: 'var(--radius)',
                background: 'var(--surface-raised)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--ink)' }}>{relationship.object}</strong>
                  <Pill value={relationship.relationshipType.replace(/_/g, ' ')} color="var(--qloo)" />
                  <Pill value={relationship.quality} color={QUALITY_COLOR[relationship.quality] || 'var(--muted)'} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  {relationship.commercialRelevance}
                </p>
                {relationship.evidenceClaimIds.length > 0 && (
                  <p style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                    {relationship.evidenceClaimIds.length} evidence claim{relationship.evidenceClaimIds.length === 1 ? '' : 's'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {claims.length > 0 && (
        <section>
          <Heading>Evidence claims</Heading>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--accent)' }}>
              Show {claims.length} claim{claims.length === 1 ? '' : 's'}
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {claims.slice(0, 30).map((claim) => (
                <div key={claim.id} style={{
                  padding: '0.625rem 0.75rem',
                  border: '1px solid var(--line-2)',
                  borderRadius: 'var(--radius)',
                  background: 'var(--surface)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <Pill value={claim.source} color="var(--qloo)" />
                    <Pill value={claim.quality} color={QUALITY_COLOR[claim.quality] || 'var(--muted)'} />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>{claim.stage}</span>
                    {claim.sourceEnvironment && (
                      <span style={{ fontSize: '0.6875rem', color: claim.sourceEnvironment === 'live' ? 'var(--success)' : 'var(--assumption)' }}>
                        {claim.sourceEnvironment}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>{claim.claim}</p>
                  {claim.limitations.length > 0 && (
                    <p style={{ fontSize: '0.6875rem', color: 'var(--assumption)', marginTop: '0.25rem' }}>
                      Limits: {claim.limitations.join(' ')}
                    </p>
                  )}
                  {claim.validationRequired.length > 0 && (
                    <p style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                      Validate: {claim.validationRequired.join(' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {deliverables.length > 0 && (
        <section>
          <Heading>Primary-profile deliverables</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '0.625rem' }}>
            {deliverables.map((deliverable) => (
              <div key={deliverable.id} style={{
                padding: '0.75rem 0.875rem',
                border: '1px solid var(--line-2)',
                borderRadius: 'var(--radius)',
                background: 'var(--surface-raised)'
              }}>
                <strong style={{ fontSize: '0.8125rem', color: 'var(--ink)' }}>{deliverable.title}</strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.55, marginTop: '0.25rem' }}>
                  {deliverable.body}
                </p>
                {deliverable.limitations.length > 0 && (
                  <p style={{ fontSize: '0.6875rem', color: 'var(--assumption)', marginTop: '0.25rem' }}>
                    {deliverable.limitations.join(' ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {stages.length > 0 && (
        <section>
          <Heading>Pipeline stages</Heading>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {stages.map((stage) => (
              <span key={stage.stage} title={stage.message}>
                <Pill value={`${stage.stage.replace(/_/g, ' ')}: ${stage.status}`} color={STATUS_COLOR[stage.status] || 'var(--muted)'} />
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
