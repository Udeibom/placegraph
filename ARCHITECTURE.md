# PlaceGraph Architecture

## Overview
PlaceGraph connects cultural intelligence (Qloo) to architectural/spatial reasoning to answer: what should this place become, for whom, why, and how should it become space. The differentiator is traceable provenance from Qloo evidence through strategy to architectural decisions.

## Core Principles
- Provenance-first: every recommendation links back to Qloo evidence, inferences, assumptions, uncertainties.
- Chain-of-reasoning: Cultural evidence → Opportunity → Strategy → Experience Requirements → Architectural Decisions → Spatial Concept → Visualization.
- Feedback flows down the same chain (not blind regeneration).
- Explainability: users can ask "why is this here?" and get full trace.
- Pluggable: Qloo abstraction, LLM provider abstraction (Groq as primary), image provider abstraction.

## Monorepo Structure
Suggested layout (TypeScript-first):
- apps/web (Next.js 15+, Tailwind, shadcn/ui, React Query)
- apps/api (FastAPI or Node API? Prefer Next.js API routes for Vercel simplicity, or separate backend. Since Vercel auto-deploys from repo, Next.js fullstack is clean; can also add Python workers later if needed.)
- packages/core (shared types, schemas, reasoning engine, provenance model)
- packages/agents (agent orchestration, prompts, tools)
- packages/qloo (Qloo client + cache + mock)
- packages/db (Drizzle/Prisma + migrations)
- packages/ui (shared UI components)
- packages/types (zod schemas)
- scripts (migrations, seeds)

Start with Next.js 15 (app router) fullstack in monorepo (Turborepo or npm workspaces). Vercel works well with Turborepo + Next.js.

## Data Model (core entities)
- Project: id, location, lat/lng/address, floor_plan_url, budget_range, project_type (restaurant/hotel/retail/hospitality/other), objective, constraints (JSON), audiences (JSON), status, created_at
- AnalysisRun: id, project_id, status, inputs_hash, started_at, completed_at
- CulturalLandscape: id, analysis_run_id, type (existing/potential/proposed), data (JSON with POIs, affinities, entities)
- Opportunity: id, analysis_run_id, type (alignment/whitespace/destination/mixed), rationale (provenance), evidence_refs, assumptions[], uncertainties[]
- Strategy: id, analysis_run_id, selected, direction, who_serves, why, competitors[], risks[], experience_thesis
- ExperienceRequirement: id, strategy_id, requirement, rationale, source (evidence/inference), priority
- ArchitecturalDecision: id, strategy_id, zone, decision, why_chain (provenance), constraints_considered[], alternatives[]
- SpatialConcept: id, strategy_id, layout_json, materials[], lighting[], zones[], circulation[], exterior[], ops_notes[]
- Visualization: id, spatial_concept_id, image_url, prompt_trace, model, params
- Review: id, project_id, feedback, chain_level (strategy/req/arch), resolved, revision_run_id
- ProvenanceNode: id, parent_id, kind (qloo_evidence/inference/assumption/decision), refs[], confidence (0-1), explanation

All reasoning outputs must be persisted with provenance.

## Reasoning Pipeline
Stages (deterministic orchestration + agent calls):
1. Input validation & normalization (location, audiences, objective, constraints)
2. Existing landscape: nearby POIs/commercial env (map/places; may use Qloo context + general POI if available)
3. Potential landscape: Qloo affinities for location/audiences/domains (dining, music, entertainment, fashion, travel, hospitality, film...)
4. Opportunity analysis: compare landscapes → identify whitespace, alignment, conflicts
5. Strategy generation: multiple distinct strategies with full rationale
6. User selection (or AI proposes best with justification)
7. Experience requirements: translate strategy → concrete reqs
8. Architectural reasoning: translate reqs → decisions, zones, spatial concept
9. Visualization: generate concept images with prompt derived from reasoning (not raw tags)
10. Review/iteration: route feedback to correct chain level

## Qloo Integration
Abstraction: `packages/qloo/src/client.ts`
- Authoritative contract and verified corrections: `docs/INTELLIGENCE_SPEC.md`
- Implementation sequencing and gates: `docs/IMPLEMENTATION_PLAN.md`
- Endpoints: `/v2/search` (`types`/`take`), `/entities` (`entity_ids`), `/v2/insights`, `/v2/analysis/compare`, `/v2/trending`, `/v2/tags`, `/v2/audiences` (deprecated)
- Do not use `/v2/entities`, `/search`, `type`, or `limit`; unsupported parameters may be silently ignored.
- Fail closed on auth, authorization, invalid-request, and parse failures. Do not convert errors into successful empty evidence.
- Caching (Redis/Supabase KV) to respect limits; cache keys must include the configured base environment.
- Mock mode only when explicitly enabled and labelled; never present mocks as live evidence.
- Normalize: Entity (UUID + URN), Affinity(rel, strength, domain), DomainSet
- Return evidence objects with IDs, sources, confidence

Store minimal raw responses referenced by evidence.

## LLM (free-first)
Recommend Groq for free-ish generous models + speed. Candidates:
- llama-3.1-405b-instruct (if available) or llama-3.3-70b, mixtral, gemma2, deepseek-v3 variants on Groq? 
- Also can use Cerebras, Grok? But need to pick free/accessible. Groq is solid for agentic reasoning.
- Model routing per stage (reasoning-heavy: strategy/opportunity vs lighter: summarization)

Set provider abstraction (`packages/agents/src/providers/llm.ts`) supporting Groq first. Add config via env.

## Image Generation (free-ish)
Options: 
- Groq has some vision? Maybe not primary image gen. 
- HuggingFace Inference (free tier), Replicate (credits), Bing/Civitai? 
- Stable Diffusion via ComfyUI/local or Fal.ai? 
- Flux (free via fal/bing)? Suggest starting with HuggingFace Inference API (stable-diffusion-xl/flux) if key available; otherwise mock generator for dev.

But need to be explicit. Let’s pick pragmatic: HuggingFace Inference (free, easy) + mock. Can swap later.

## Frontend (apps/web)
Next.js 15 app router:
- /projects/new (wizard: location, audience, objective, constraints, upload floorplan)
- /projects/[id]/analysis (pipeline progress, provenance viewer)
- /projects/[id]/strategies (compare strategies with evidence)
- /projects/[id]/concept (selected strategy → reqs, decisions, spatial concept, viz)
- /projects/[id]/review (feedback, iterate)
- /projects/[id]/explain/[nodeId] (why chain)
Components: shadcn/ui, map (leaflet/mapbox), upload, provenance tree, comparison tables.

## Backend/API
Next.js API routes: /api/projects, /api/analysis/*, /api/feedback, /api/viz. 
Or tRPC for end-to-end types. tRPC is nice with monorepo.

## DB (Supabase)
Use Supabase Postgres + RLS. You gave service role key - can run migrations via Drizzle or Prisma. Also Supabase auth later? For now maybe simple session; but mention.

## Provenance requirements
Every inference stored with: type, inputs_refs, qloo_refs[], confidence, explanation. UI must render trace.

## Deployment
Vercel auto-deploys from github (stated). Use Turborepo, set env vars in Vercel.

## Env vars needed
QLOO_*, SUPABASE_*, GROQ_API_KEY (free), HF_TOKEN or other image key, NEXT_PUBLIC_* etc.

## Next steps (phased)
Phase 1 done scaffolding. Phase 2: Core pipeline + provenance. Phase 3: Agents. Phase 4: Qloo integration + mocks. Phase 5: Frontend. Phase 6: Viz. Phase 7: Polish.

Let’s scaffold codebase now.
