'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/api';

const PROJECT_TYPES = [
  { value: 'restaurant',  label: 'Restaurant',  icon: '🍽️' },
  { value: 'hotel',       label: 'Hotel',        icon: '🏨' },
  { value: 'bar',         label: 'Bar',          icon: '🍸' },
  { value: 'cafe',        label: 'Café',         icon: '☕' },
  { value: 'retail',      label: 'Retail',       icon: '🛍️' },
  { value: 'office',      label: 'Office',       icon: '🏢' },
  { value: 'mixed',       label: 'Mixed use',    icon: '🏙️' },
  { value: 'hospitality', label: 'Hospitality',  icon: '🫖' },
  { value: 'other',       label: 'Other',        icon: '🏗️' },
];

const PRIORITY_LABELS = ['Primary', 'Secondary', 'Tertiary'];

const emptyAudience  = { name: '', description: '', priority: 1 as number };
const emptyConstraint = { key: '', value: '', type: 'text' as const };

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: done ? 'var(--accent)' : active ? 'var(--accent)' : 'var(--surface)',
      border: `1.5px solid ${done || active ? 'var(--accent)' : 'var(--line)'}`,
      fontSize: '0.75rem', fontWeight: 700,
      color: done || active ? 'var(--surface-raised)' : 'var(--muted-2)',
      transition: 'all var(--duration-fast) var(--ease)',
    }}>
      {done ? '✓' : n}
    </div>
  );
}

export default function NewProject() {
  const router = useRouter();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [form, setForm] = useState({
    name:            '',
    location:        { address: '', city: '', neighborhood: '' },
    projectType:     'restaurant',
    businessType:    '',
    objective:       '',
    investmentIntent:'',
    targetAudience:  '',
    budgetRange:     '',
    floorArea:       '',
    floorPlanUrl:    '',
    audiences:       [{ ...emptyAudience }],
    constraints:     [{ ...emptyConstraint }],
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFile(file: File) {
    if (file.size > 4_000_000) { setError('Floor plan must be under 4MB.'); return; }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    update('floorPlanUrl', dataUrl);
    setError(null);
  }

  async function submit() {
    setLoading(true); setError(null);
    try {
      const project = await createProject({
        ...form,
        audiences:   form.audiences.filter((a) => a.name.trim()),
        constraints: form.constraints.filter((c) => c.key.trim() && c.value.trim()),
      } as Parameters<typeof createProject>[0]);
      router.push(`/projects/${project.id}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const steps = ['Place & business', 'Target audience', 'Objective & intent', 'Constraints'];
  const canAdvance = [
    form.name.trim() && form.location.city.trim() && (form.businessType.trim() || form.projectType),
    form.targetAudience.trim() || form.audiences.some((a) => a.name.trim()),
    form.objective.trim(),
    true,
  ];

  return (
    <div style={{ maxWidth: '42rem' }}>
      <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '2rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--ink)' }}>
        New project — capital decision brief
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', marginBottom: '2rem' }}>
        Define location, business type, target audience, objective, and investment intent. PlaceGraph uses Qloo to evaluate what kind of place should be built before committing capital.
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: 0 }}>
        {steps.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <button
              type="button"
              onClick={() => i < step || canAdvance[step] ? setStep(i) : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <StepDot n={i + 1} active={i === step} done={i < step} />
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: i === step ? 600 : 400,
                color: i === step ? 'var(--ink)' : i < step ? 'var(--accent)' : 'var(--muted-2)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: '1.5px', margin: '0 0.625rem',
                background: i < step ? 'var(--accent-mid)' : 'var(--line-2)',
                transition: 'background var(--duration-slow) var(--ease)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={{ minHeight: '22rem' }}>

        {/* Step 0 — Place & business */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'pg-slide-up var(--duration-slow) var(--ease-out) both' }}>
            <Field label="Project name" hint="A working name for this brief">
              <input className="pg-input" value={form.name} placeholder="e.g. Warehouse unit, Clerkenwell"
                onChange={(e) => update('name', e.target.value)} />
            </Field>

            <Field label="Business type *" hint="What type of business/experience are you considering (or want to discover)">
              <input className="pg-input" value={form.businessType} placeholder="e.g. neighborhood wine bar, all-day cafe, community gym"
                onChange={(e) => update('businessType', e.target.value)} />
            </Field>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--ink-2)' }}>Project category (optional)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.value} type="button"
                    onClick={() => update('projectType', t.value)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '0.25rem', padding: '0.75rem 0.5rem',
                      border: `1.5px solid ${form.projectType === t.value ? 'var(--accent)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius-md)', background: form.projectType === t.value ? 'var(--accent-light)' : 'var(--surface-raised)',
                      cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em',
                      color: form.projectType === t.value ? 'var(--accent-2)' : 'var(--muted)',
                      transition: 'all var(--duration-fast) var(--ease)',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Street address">
              <input className="pg-input" value={form.location.address}
                onChange={(e) => update('location', { ...form.location, address: e.target.value })} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="City *">
                <input className="pg-input" value={form.location.city}
                  onChange={(e) => update('location', { ...form.location, city: e.target.value })} />
              </Field>
              <Field label="Neighbourhood">
                <input className="pg-input" value={form.location.neighborhood}
                  onChange={(e) => update('location', { ...form.location, neighborhood: e.target.value })} />
              </Field>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted-2)', fontStyle: 'italic' }}>
              The agent will geocode this address and query OpenStreetMap for nearby businesses.
            </p>
          </div>
        )}

        {/* Step 1 — Target audience */}
        {step === 1 && (
          <div style={{ animation: 'pg-slide-up var(--duration-slow) var(--ease-out) both', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Field label="Primary target audience *" hint="Who are you trying to resonate with in this location (be specific)">
              <input className="pg-input" value={form.targetAudience} placeholder="e.g. design-conscious 25-34 year olds in creative industries"
                onChange={(e) => update('targetAudience', e.target.value)} />
            </Field>

            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                Optionally add detailed audience groups (primary/secondary/tertiary). Qloo will evaluate cultural fit against these groups.
              </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {form.audiences.map((a, i) => (
                <div key={i} style={{
                  padding: '1rem', border: '1.5px solid var(--line-2)',
                  borderRadius: 'var(--radius-md)', background: 'var(--surface-raised)',
                  display: 'flex', flexDirection: 'column', gap: '0.625rem',
                }}>
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input className="pg-input" placeholder="Audience name"
                        value={a.name}
                        onChange={(e) => {
                          const next = [...form.audiences];
                          next[i] = { ...a, name: e.target.value };
                          update('audiences', next);
                        }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[1, 2, 3].map((p) => (
                        <button key={p} type="button"
                          onClick={() => {
                            const next = [...form.audiences];
                            next[i] = { ...a, priority: p };
                            update('audiences', next);
                          }}
                          style={{
                            fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em',
                            padding: '0.25rem 0.5rem', borderRadius: '999px',
                            border: `1.5px solid ${a.priority === p ? 'var(--accent)' : 'var(--line)'}`,
                            background: a.priority === p ? 'var(--accent-light)' : 'transparent',
                            color: a.priority === p ? 'var(--accent-2)' : 'var(--muted)',
                            cursor: 'pointer',
                          }}
                        >
                          {PRIORITY_LABELS[p - 1]}
                        </button>
                      ))}
                    </div>
                    {form.audiences.length > 1 && (
                      <button type="button"
                        onClick={() => update('audiences', form.audiences.filter((_, j) => j !== i))}
                        style={{ fontSize: '1rem', color: 'var(--muted-2)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                      >×</button>
                    )}
                  </div>
                  <input className="pg-input" placeholder="Brief description (optional)"
                    value={a.description}
                    onChange={(e) => {
                      const next = [...form.audiences];
                      next[i] = { ...a, description: e.target.value };
                      update('audiences', next);
                    }} />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => update('audiences', [...form.audiences, { ...emptyAudience }])}
              style={{ marginTop: '0.875rem', fontSize: '0.875rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              + Add audience
            </button>
            </div>
          </div>
        )}

        {/* Step 2 — Objective & intent */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'pg-slide-up var(--duration-slow) var(--ease-out) both' }}>
            <Field
              label="Project objective *"
              hint="What capital decision are you trying to make? What type of place should be built, for whom, and why?"
            >
              <textarea
                className="pg-input"
                style={{ minHeight: '8rem' }}
                value={form.objective}
                onChange={(e) => update('objective', e.target.value)}
                placeholder="e.g. Decide whether to convert this warehouse unit into a neighborhood venue that justifies a 10-year lease. Need confidence the concept will resonate culturally before committing capital."
              />
            </Field>

            <Field
              label="Investment intent"
              hint="Scale of commitment / what you're trying to validate before spending significant capital"
            >
              <textarea
                className="pg-input"
                style={{ minHeight: '6rem' }}
                value={form.investmentIntent}
                onChange={(e) => update('investmentIntent', e.target.value)}
                placeholder="e.g. Considering a 10-year lease with ~£250k fit-out. Need to validate cultural fit before signing."
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Budget range" hint="e.g. £800k–1.2M">
                <input className="pg-input" value={form.budgetRange}
                  onChange={(e) => update('budgetRange', e.target.value)} />
              </Field>
              <Field label="Floor area" hint="e.g. 2,800 sq ft">
                <input className="pg-input" value={form.floorArea}
                  onChange={(e) => update('floorArea', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* Step 3 — Constraints + floor plan */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'pg-slide-up var(--duration-slow) var(--ease-out) both' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.375rem', color: 'var(--ink-2)' }}>
                Floor plan (optional)
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                Upload an image. The agent will use a vision model to read room names, approximate areas, and structural constraints.
              </p>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed var(--line)', borderRadius: 'var(--radius-md)',
                padding: '2rem', cursor: 'pointer',
                background: form.floorPlanUrl ? 'var(--surface)' : 'var(--surface-raised)',
                transition: 'background var(--duration-fast) var(--ease)',
              }}>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
                {form.floorPlanUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.floorPlanUrl} alt="Floor plan" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: 'var(--radius)' }} />
                ) : (
                  <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Click to upload or drag and drop</span>
                )}
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.375rem', color: 'var(--ink-2)' }}>
                Operating constraints
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                Structural requirements, kitchen spec, access, parking, schedule, acoustic, licensing…
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {form.constraints.map((c, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                    <input className="pg-input" placeholder="Constraint" value={c.key}
                      onChange={(e) => {
                        const next = [...form.constraints];
                        next[i] = { ...c, key: e.target.value };
                        update('constraints', next);
                      }} />
                    <input className="pg-input" placeholder="Value" value={c.value}
                      onChange={(e) => {
                        const next = [...form.constraints];
                        next[i] = { ...c, value: e.target.value };
                        update('constraints', next);
                      }} />
                    {form.constraints.length > 1 && (
                      <button type="button"
                        onClick={() => update('constraints', form.constraints.filter((_, j) => j !== i))}
                        style={{ fontSize: '1rem', color: 'var(--muted-2)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button"
                onClick={() => update('constraints', [...form.constraints, { ...emptyConstraint }])}
                style={{ marginTop: '0.625rem', fontSize: '0.875rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                + Add constraint
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '0.875rem', color: 'var(--error-color)', marginTop: '1rem', padding: '0.625rem 0.875rem', background: 'var(--error-bg)', borderRadius: 'var(--radius)' }}>
          {error}
        </p>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', alignItems: 'center' }}>
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="pg-btn pg-btn-ghost">
            ← Back
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance[step]}
            className="pg-btn"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            disabled={loading || !form.name || !form.objective}
            onClick={submit}
            className="pg-btn"
          >
            {loading ? 'Creating…' : 'Create project'}
          </button>
        )}
        <span style={{ fontSize: '0.8125rem', color: 'var(--muted-2)' }}>Step {step + 1} of {steps.length}</span>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink-2)', marginBottom: '0.375rem' }}>
        {label}
      </span>
      {hint && <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.375rem' }}>{hint}</span>}
      {children}
    </label>
  );
}
