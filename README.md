# PlaceGraph

Agentic cultural-intelligence and architectural design platform. Determines what commercial physical experience should exist in a location, for whom, and why — then translates that intelligence into an architectural concept.

## What it does
- Cultural Intelligence via Qloo (affinities, cross-domain relationships)
- Opportunity Discovery & Strategy (alignment/whitespace/destination)
- Experience Requirements → Architectural Decisions (traceable provenance)
- Spatial Concept + Visualizations
- Professional Review with feedback routed to correct reasoning chain

## Tech Stack
- Monorepo: Turborepo + npm workspaces (TypeScript)
- Web: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
- Agents: Groq (free-first) for reasoning
- Data: Supabase (Postgres)
- Qloo: Hackathon API
- Viz: HuggingFace Inference (free) + mock

## Getting Started
```bash
npm install
npm run dev
```

## Environment
See `.env.example` in apps/web. Keys: Qloo, Supabase, Groq, HF.

## Architecture
See ARCHITECTURE.md for full design and phased roadmap.

## Deployment
Auto-deploys on Vercel from https://github.com/Udeibom/placegraph
