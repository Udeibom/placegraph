# PlaceGraph Implementation Plan

Status: implemented locally, 2026-10-30
Scope: implementation sequencing for the corrected intelligence design
Companion: [`INTELLIGENCE_SPEC.md`](./INTELLIGENCE_SPEC.md)

Phases 1-8 are implemented and verified locally with tests, typecheck, and a production build. Production Qloo smoke testing remains blocked on a production-scoped key, and Phase 0's full versioned fixture matrix is only partially implemented (the adapter contract is covered by unit tests).

## 1. Delivery rules

- Implement the Qloo contract boundary before wiring it into the intelligence pipeline.
- Fail closed on Qloo authentication, authorization, invalid-request, and parse failures.
- Do not convert API errors into successful empty results.
- Do not ship silent parameter coercion.
- Do not present search matches, tags, trending, or heatmaps as affinity or demand.
- Do not introduce fixed opportunity or strategy counts.
- Preserve the shared-intelligence invariant: the same brief, place, audiences, and Qloo evidence produce the same cultural claims and eligible opportunities across organisation profiles. Organisation and decision frames change projection and deliverables only.
- Every cultural claim in the finished product must trace to Qloo evidence, local evidence, inference, assumption, or uncertainty.

## 2. Phase sequence

### Phase 0: Contract harness and environment

Goal: make the Qloo contract executable and observable before changing product logic.

Deliverables:

- A contract-test harness that runs outside the application.
- Redacted fixtures for every item in Section 8 of the intelligence spec.
- An environment matrix covering production and hackathon bases.
- A credential check that distinguishes missing, invalid, unauthorized, and valid keys.
- A production smoke test that is skipped unless a production-scoped key is present.

Acceptance:

- Correct search requests use `/v2/search`, `types`, and `take`.
- A wrong-parameter search is detected as a contract failure even though Qloo returns `200` with 20 results.
- `/entities` succeeds and `/v2/entities` fails with `404`.
- Insights, comparison, trending, tags, audiences, demographics, and heatmaps are covered by fixtures.
- The production base returns `401` with the hackathon key and is reported as blocked, not retried indefinitely.
- No secret appears in output, fixtures, or logs.

Blocking:

- Production deployment is blocked on a production-scoped Qloo key.
- The deprecated audience endpoint replacement is unknown; keep the existing endpoint behind an adapter until resolved.

### Phase 1: Canonical models and evidence types

Goal: establish stable internal types before changing transports.

Deliverables:

- Canonical organisation profile model with multiple profiles and one primary profile.
- Decision frame model separate from organisation profile.
- Decision types covering develop, establish, enter market, tenant mix, reposition, adapt, store format, utilisation, audience choice, and other.
- Canonical identifiers for Qloo entities: UUID, URN, display name, entity type, domain, and source environment.
- Canonical evidence envelopes for search match, scored affinity, demographics context, trend context, tag context, and heatmap context.
- Explicit evidence-quality states: strong, approximate, insufficient, failed, unresolved, degraded.
- Provenance links from each claim to its source evidence.

Acceptance:

- An entity can be represented with both UUID and URN without collapsing them.
- UUID casing differences deduplicate correctly.
- Search matches cannot be stored as affinities.
- Missing affinity is not represented as zero.
- Failed and empty are distinct states.
- Organisation profile is not used as a proxy for decision frame.

### Phase 2: Qloo adapter rewrite

Goal: implement the verified contract as a strict boundary.

Deliverables:

- Typed request builders for search, entity hydration, insights, demographics, comparison, trending, tags, audiences, and heatmaps.
- Strict parameter validation per endpoint.
- Verified response parsers for `results`, `results.entities`, `results.audiences`, `results.tags`, `results.trending`, and `results.demographics`.
- Error taxonomy: auth, authorization, invalid request, rate limit, upstream failure, empty result, parse failure.
- Explicit base-URL and key-scope configuration.
- Contract-aware caching with environment-scoped cache keys.

Acceptance:

- No call uses `/v2/entities`, `/search`, `type`, or `limit`.
- Search uses `types` and `take`.
- Insights and comparison use GET.
- Affinity is read from `query.affinity`.
- Explainability is read from `query.explainability`.
- Demographics requests include an interest signal.
- Heatmaps use `filter.location.query` plus a valid signal.
- Trending rejects place and requires a date range.
- Unsupported parameters are rejected before the network call.
- Auth/authorization/parse failures fail closed.
- Empty valid results are marked insufficient, not failed and not successful evidence.

### Phase 3: Shared intelligence service

Goal: make cultural evidence reusable and organisation-independent.

Deliverables:

- A shared cultural-intelligence result built from the project brief, place, audiences, and Qloo evidence.
- Audience resolution with both UUID and URN and explicit unresolved status.
- Multi-seed affinity pooling with source and seed counts.
- Claim-level evidence records for place, audience, and relationship claims.
- Evidence gate that separates contract failure, insufficient evidence, and degraded evidence.
- Shared opportunity eligibility independent of organisation profile.

Acceptance:

- Changing organisation profile does not change the shared cultural claims or eligible opportunities.
- Unresolved audiences reduce confidence and remain visible.
- A Qloo failure prevents a confident cultural recommendation.
- Search matches do not become cultural claims.
- Cultural patterns are labelled PlaceGraph inference.
- No fixed opportunity count is enforced.

### Phase 4: Organisation and decision services

Goal: separate who the user is from what they are deciding.

Deliverables:

- Organisation profile selection with multiple profiles and one primary profile.
- Decision frame capture: decision type, subject, time horizon, capital intent, success tests, and constraints.
- Projection rules from shared intelligence to organisation-specific vocabulary and deliverables.
- Decision-specific deliverables for developer, hospitality, retail, operator/facility, investor, and mixed-use profiles.
- Mixed-profile handling without duplicating cultural evidence.

Acceptance:

- The same decision and evidence produce the same cultural claims under different profiles.
- Profile changes affect framing and deliverable projection, not underlying evidence.
- Decision frame drives analysis even when profile is absent.
- Mixed profiles do not create competing cultural evidence sets.

### Phase 5: Discover and Evaluate workflows

Goal: support two distinct decision modes on one evidence base.

Discover:

- User supplies place and audiences; business type is optional.
- System investigates place character, local supply, cultural relationships, and candidate opportunities.
- Zero opportunities is valid.
- Output explains what could exist, for whom, and what remains uncertain.

Evaluate:

- User supplies a proposed concept, format, or tenant mix.
- System tests fit, conflicts, weaker alternatives, and evidence quality.
- Output explains what would need to be true and why alternatives may be weaker.

Acceptance:

- Discover does not require a business type.
- Evaluate captures a structured concept rather than only free text.
- Both modes use the same shared-intelligence service.
- Neither mode presents Qloo affinity as demand.
- Both modes expose evidence quality and unresolved questions.

### Phase 6: Results and decision workspace

Goal: make the decision legible without hiding uncertainty.

Required result sections:

1. Place.
2. Audiences.
3. Qloo relationships.
4. Local supply.
5. Identified relationships.
6. Opportunities.
7. Uncertainty.
8. Next investigation.

Acceptance:

- Every cultural claim shows its source and evidence quality.
- Failed Qloo stages are visible and block confident cultural conclusions.
- Search matches, affinities, trends, tags, and inferences are visually distinct.
- Audience UUID/URN resolution status is visible.
- Results do not imply demand, attendance, spend, or willingness to pay.
- Organisation-specific deliverables are projections of the shared result, not separate analyses.

### Phase 7: Spatial translation

Goal: translate only selected, evidence-qualified opportunities into space.

Deliverables:

- Spatial gate requiring a selected opportunity, passed evidence gate, floor area, and floor plan or geometry.
- Experience requirements derived from the selected opportunity.
- Architectural decisions with provenance back to the selected opportunity and, where applicable, Qloo evidence.
- Spatial concept and visualisation only after the gate passes.

Acceptance:

- No spatial concept is generated from an unselected or failed opportunity.
- Qloo does not determine geometry, floor area, or construction feasibility.
- Architectural claims identify whether they are evidence, inference, constraint, or assumption.
- Visualisations are downstream of the reasoning chain, not a substitute for it.

### Phase 8: Review, re-analysis, and hardening

Goal: preserve integrity through iteration and deployment.

Deliverables:

- Review classification by evidence, audience, opportunity, strategy, experience, or spatial layer.
- Re-analysis that preserves base URL, key scope, fixtures, and contract status.
- Regression tests for every Qloo contract correction.
- Rate-limit, timeout, retry, and circuit-breaker behaviour.
- Observability that records contract failures without recording secrets.
- Production readiness checklist.

Acceptance:

- Review cannot turn a contract failure into a successful cultural result.
- Re-analysis does not silently switch environments.
- Contract regression tests run in CI.
- Production smoke tests fail clearly when the key scope is wrong.
- Cached evidence records its source environment.
- A failed Qloo run produces a clear user-facing blocked/degraded state.

## 3. Dependencies and blockers

| Dependency | Blocks | Current status |
|---|---|---|
| Production-scoped Qloo key | Production smoke tests and launch | Blocked; hackathon key returns `401` on production. |
| Replacement for deprecated audiences endpoint | Long-term audience resolution | Unknown. |
| Comparison schema fixture | Strategy comparison implementation | Partially verified; schema needs pinning. |
| Heatmap signal matrix | Spatial heatmap implementation | Partially verified; interest signal works with `filter.location.query`. |
| Rate-limit and licensing terms | Caching, replay, and production load | Unknown. |

## 4. Definition of done for the contract correction

The correction is complete when:

- The adapter uses only verified paths, parameter names, and envelopes.
- Every endpoint fixture is redacted and versioned.
- Wrong parameters are rejected locally.
- API failures are never converted into successful empty evidence.
- Production and hackathon environments are explicit and non-interchangeable.
- The intelligence pipeline fails closed when Qloo fails.
- No organisation profile can change the underlying cultural claims.
- No product surface presents Qloo affinity as demand.
- The local implementation is verified by unit/contract tests, typecheck, and build.
- Production smoke tests remain blocked on a production-scoped Qloo key.
