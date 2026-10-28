# PlaceGraph

Qloo-powered cultural intelligence agent for deciding what kind of place should be built, for whom, and why — before committing significant capital.

The working path is:

**Business/project idea → Location + audience + objective → Qloo cultural intelligence → Cultural opportunities → Possible experience concepts → Evidence-based concept recommendation → Experience strategy → Spatial/architectural implications → Concept render → Review**

PlaceGraph evaluates possible experience concepts using Qloo-derived cultural signals, explains why alternatives may be weaker, and shows how Qloo changes the investment decision. Architecture/design is a downstream translation, not the starting point. This is a usable local product loop (no accounts, billing, or construction documentation). Without API keys it still runs using OSM location context, Qloo mocks, structured reasoning fallbacks, and spatial diagrams. With `QLOO_API_KEY` and `GROQ_API_KEY` the same screens use live cultural evidence and LLM reasoning.

## Run it

```bash
npm install
cp .env.example .env.local   # optional keys
npm run dev
```

Open http://localhost:3000.

1. Start a project, or open the sample Clerkenwell brief.
2. **Investigate place and culture** — nearby businesses + Qloo affinities + three cultural landscapes.
3. Compare **strategic directions** (alignment / whitespace / destination) and select one.
4. Review experience requirements, architectural decisions, and the spatial concept.
5. Generate a visualization (diagram always; image model if `HF_TOKEN` is set).
6. In **Professional review**, give feedback. The agent diagnoses which layer of the chain to revise.
7. Optionally run the Qloo vs generic-agent **counterfactual**.

Projects persist in `apps/web/data/store.json` while the server is running.

## Environment

| Variable | Effect if missing |
|---|---|
| `QLOO_API_KEY` | Mock cultural affinities, clearly labelled insufficient |
| `GROQ_API_KEY` | Deterministic fallback opportunities / strategies / architecture |
| `HF_TOKEN` | Spatial concept diagram instead of a photoreal render |

See `.env.example`. Copy to `.env.local` at the repo root or `apps/web/.env.local`.

## Architecture

See `ARCHITECTURE.md`. Qloo supplies cultural relationships. PlaceGraph decides whether they are a project opportunity. Architectural intelligence turns the selected opportunity into space. Professionals evaluate.
