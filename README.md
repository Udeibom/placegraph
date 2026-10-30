# PlaceGraph

**Qloo-powered cultural intelligence for place decisions.**

PlaceGraph helps developers, hospitality groups, retail brands, and operators decide what kind of experience should be built — for whom, where, and why — before committing significant capital. It uses Qloo cultural intelligence to surface differentiated opportunities and evaluate possible concepts against real audience signals, with full evidence provenance from cultural data through to spatial and architectural implications.

**Live:** [placegraph.vercel.app](https://placegraph.vercel.app)

---

## What it does

You bring a location, an audience, and an objective. PlaceGraph runs a structured pipeline:

```
Location + audience + objective
  → Qloo cultural intelligence
  → Cultural opportunities
  → Possible experience concepts
  → Evidence-based concept recommendation
  → Experience strategy
  → Experience requirements
  → Spatial / architectural implications
  → Concept render
  → Review
```

Every recommendation traces back to Qloo evidence, labelled inferences, and explicit uncertainties — not generic LLM output. The system distinguishes between a Qloo cultural affinity, a PlaceGraph inference from that affinity, and a local supply observation.

### Two analysis modes

- **Evaluate a concept** — you have a business type in mind; PlaceGraph evaluates whether it fits this place and audience, and what would make it compelling.
- **Discover an opportunity** — you have a location and audience; PlaceGraph identifies what should exist here based on cultural signals.

### Operator-type routing

Output is shaped by who is asking:

| Operator | Output focus |
|---|---|
| Developer | Spatial brief, architectural decisions, concept render |
| Hospitality group | Concept identity, F&B strategy, daypart programming, atmosphere |
| Retail brand | Category mix, format recommendation, community fit, local collaborations |
| Operator / facility manager | Programming model, activations, experience mix, tenant rationale |

---

## Running locally

```bash
npm install
cp .env.example .env.local   # add your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without API keys the pipeline still runs: OSM provides location context, Qloo mocks supply clearly-labelled cultural signals, and structured reasoning fallbacks generate opportunities and strategies. With live keys the same screens use real Qloo cultural evidence and LLM reasoning.

---

## Environment variables

| Variable | Effect if missing |
|---|---|
| `QLOO_API_KEY` | Mock cultural affinities, clearly labelled as insufficient |
| `QLOO_API_BASE_URL` | Defaults to `https://hackathon.api.qloo.com` — must be set explicitly for production |
| `GROQ_API_KEY` | Deterministic fallback opportunities, strategies, and architecture |
| `HF_TOKEN` | Spatial concept diagram instead of a photoreal render |

See `.env.example` for all variables. Copy to `.env.local` at the repo root or `apps/web/.env.local`.

> **Note:** The Qloo key currently configured is hackathon-scoped. Production use requires a production-scoped key and an explicit `QLOO_API_BASE_URL`. See `docs/INTELLIGENCE_SPEC.md`.

---

## Project structure

```
apps/
  web/                 Next.js 15 app (UI + API routes)
packages/
  agents/              Orchestrator, prompts, LLM provider, evidence, fallback
  qloo/                Qloo client — verified endpoint contracts, mock, error handling
  types/               Shared TypeScript types and Zod schemas
  core/                Provenance model
docs/
  INTELLIGENCE_SPEC.md Verified Qloo endpoint contracts and intelligence design rules
  IMPLEMENTATION_PLAN.md Implementation sequencing and gates
scripts/
  ts-loader.mjs        Native TypeScript test loader
ARCHITECTURE.md        Full architecture and data model
```

---

## Running tests

```bash
npm test
```

Covers the Qloo client (endpoint contracts, error classification, mock/live separation), the intelligence engine (claim validation, provenance tracking), and remediation paths.

---

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full data model, reasoning pipeline, and Qloo integration design.

See [`docs/INTELLIGENCE_SPEC.md`](./docs/INTELLIGENCE_SPEC.md) for verified Qloo endpoint contracts, error handling rules, and the intelligence specification that governs all cultural claims.

---

## License

[MIT](./LICENSE)
