# PlaceGraph Intelligence Specification

Status: implemented, 2026-10-30
Scope: Qloo contract corrections and their impact on the intelligence design
Authority: this document supersedes conflicting Qloo endpoint, parameter, and response-shape assumptions in earlier design notes.

The contract and intelligence model in this document have been implemented across the Qloo adapter, shared agents, persistence, API routes, UI, and tests. Production use remains blocked on a production-scoped Qloo key.

## 1. Purpose

PlaceGraph uses Qloo to establish cultural relationships, then decides whether those relationships constitute a commercial opportunity for a specific place and decision frame.

Qloo evidence must never be presented as demand, identity, behaviour, attendance, purchase intent, or willingness to pay. The system must preserve the distinction between:

- a Qloo search match: the entity exists;
- a scored Qloo affinity: the entity is culturally related to the signal;
- a PlaceGraph inference: the relationship may matter for this decision;
- a local observation: nearby supply or context;
- an assumption or uncertainty.

The intelligence design is only valid if it uses the live Qloo contract correctly. Silent parameter coercion, swallowed errors, or fabricated fallbacks invalidate the evidence chain.

## 2. Non-negotiable rules

1. Qloo is mandatory for cultural claims. If Qloo is unavailable, the cultural recommendation stage fails closed.
2. No generic-LLM cultural fallback may be presented as Qloo evidence.
3. No endpoint error may be converted into an empty successful result without an explicit degraded/insufficient state.
4. No unsupported or misspelled request parameter may be sent. The API may silently ignore it and return a default result set.
5. No fixed opportunity or strategy count is part of the design.
6. Demo/mock evidence must never be labelled live.
7. Secrets must never be logged, returned to the client, committed, or written into fixtures.
8. The implementation is expected to satisfy this specification; production smoke testing remains blocked on a production-scoped Qloo key.

## 3. Verified runtime environment

Live probes were run on 2026-10-30 with the configured key.

| Environment | Base URL | Result |
|---|---|---|
| Configured environment | `https://hackathon.api.qloo.com` | Requests succeed with the configured key. |
| Production | `https://api.qloo.com` | `401 Invalid API Key` with the configured key. |

Consequences:

- The configured key is not production-scoped. Production use remains blocked until a production key is provisioned.
- `QLOO_API_BASE_URL` must be explicit per environment.
- A production base URL must never silently fall back to the hackathon base.
- The current client default of `https://hackathon.api.qloo.com` is acceptable only for local/hackathon use and must not be relied on in production.
- Authentication uses the `X-Api-Key` request header.

## 4. Verified endpoint contracts

### 4.1 Entity search

`GET /v2/search`

Verified working request:

```text
query=Hamilton, Ontario
types=urn:entity:place
take=3
```

Response:

```json
{
  "results": [
    {
      "entity_id": "c1f1e0d5-89b6-4ad3-ac92-10fc4761dec9",
      "name": "Homewood Suites by Hilton Hamilton, Ontario, Canada",
      "type": "urn:entity:place",
      "subtype": "urn:entity:place",
      "popularity": 0.42,
      "properties": {},
      "tags": [],
      "external": {}
    }
  ]
}
```

Verified failure mode:

```text
GET /v2/search?query=Hamilton, Ontario&type=urn:entity:place&limit=3
```

returns `200` with 20 default results. The incorrect `type` and `limit` parameters are ignored rather than rejected.

Required behaviour:

- Use `types`, not `type`.
- Use `take`, not `limit`.
- Treat an unexpected result count as a contract failure when the request specified `take`.
- Validate endpoint-specific parameter names before sending.
- Search results are existence/context evidence, not affinity evidence.
- Multi-type search syntax must be pinned by a fixture before production use.

### 4.2 Entity hydration

`GET /entities`

Verified working request:

```text
entity_ids=<entity UUID>
```

Response:

```json
{
  "results": [
    {
      "entity_id": "C1F1E0D5-89B6-4AD3-AC92-10FC4761DEC9",
      "name": "Homewood Suites by Hilton Hamilton, Ontario, Canada"
    }
  ]
}
```

`GET /v2/entities` returns `404`.

Required behaviour:

- Use `/entities`, never `/v2/entities`.
- Preserve the returned ID casing and type.
- Hydration results are context only unless a separate scored affinity exists.

### 4.3 Audience search

`GET /v2/audiences`

Verified working request:

```text
filter.query=vegan
take=1
```

Response:

```json
{
  "success": true,
  "results": {
    "audiences": [
      {
        "entity_id": "7819CC7E-FEAF-4FC6-B0D8-EFED92CD46AE",
        "id": "urn:audience:lifestyle_preferences_beliefs:veganism",
        "name": "Veganism",
        "parents": [],
        "type": "urn:audience:...",
        "disambiguation": "...",
        "tags": []
      }
    ]
  }
}
```

Verified behaviour:

- Results are under `results.audiences`, not `results.entities`.
- Each audience exposes both a UUID-like `entity_id` and a URN-like `id`.
- Broad or non-taxonomic queries such as `creative`, `remote work`, and `millennials` can return zero audiences with `200`.
- The endpoint is deprecated.
- `GET /v2/audiences/types` works and returns `results.audience_types`, but it is also deprecated.

Required behaviour:

- Use exact taxonomy terms where possible; do not assume free-text descriptions resolve.
- Preserve both audience identifiers.
- Zero audiences means unresolved audience evidence, not an API failure.
- Do not invent an audience mapping from a description.
- Track the replacement endpoint as an open question.

### 4.4 Entity insights and affinities

`GET /v2/insights`

Verified working request:

```text
filter.type=urn:entity:place
signal.interests.entities=<entity UUID>
filter.location.query=Hamilton, Ontario
take=3
feature.explainability=true
```

Response shape:

```json
{
  "success": true,
  "results": {
    "entities": [
      {
        "entity_id": "D300D702-4959-44A4-843A-5D51DA045716",
        "name": "Four Points by Sheraton Hamilton - Stoney Creek",
        "type": "urn:entity:place",
        "query": {
          "affinity": 0.9723023682845005,
          "distance": 0,
          "measurements": {
            "audience_growth": 0
          },
          "explainability": {
            "signal.interests.entities": [
              {
                "entity_id": "C1F1E0D5-89B6-4AD3-AC92-10FC4761DEC9",
                "score": 1
              }
            ]
          }
        }
      }
    ]
  },
  "query": {
    "localities": {
      "filter": []
    }
  }
}
```

Required behaviour:

- Results are under `results.entities`.
- The affinity score is at `query.affinity`.
- Explainability is at each entity's `query.explainability` when `feature.explainability=true`.
- `take` controls result count.
- `signal.demographics.audiences` accepts either the audience UUID or URN for entity insights.
- Only rows with a finite numeric `query.affinity` are affinity evidence.
- Entity presence without a numeric affinity is not evidence of affinity.

### 4.5 Demographics insights

`GET /v2/insights`

Audience-only request:

```text
filter.type=urn:demographics
signal.demographics.audiences=<audience UUID or URN>
filter.location.query=Hamilton, Ontario
take=2
```

Verified result: `400`.

Working request:

```text
filter.type=urn:demographics
signal.interests.entities=<entity UUID>
signal.demographics.audiences=<audience UUID or URN>
filter.location.query=Hamilton, Ontario
take=2
```

Verified result: `200` with `results.demographics[]`. Each row has an `entity_id` and `query.age` / `query.gender` distributions.

Required behaviour:

- `urn:demographics` requires at least one interest signal, such as `signal.interests.entities` or `signal.interests.tags`.
- An audience signal alone is not sufficient for demographics insights.
- Demographics output is contextual evidence; it is not a demand forecast.

### 4.6 Comparison

`GET /v2/analysis/compare`

Verified working request:

```text
a.signal.interests.entities=<entity UUID A>
b.signal.interests.entities=<entity UUID B>
filter.type=urn:entity:place
take=3
```

Verified result: `200`. The exact comparison result schema, grouping rules, and maximum input sizes remain to be pinned by fixtures before implementation.

Required behaviour:

- Use GET.
- Use the `a.` and `b.` signal namespaces exactly.
- Do not infer a winner from an undocumented field.
- Keep comparison output separate from single-signal affinity evidence.

### 4.7 Trending

`GET /v2/trending`

Verified supported `filter.type` values:

- `urn:entity:actor`
- `urn:entity:artist`
- `urn:entity:brand`
- `urn:entity:movie`
- `urn:entity:person`
- `urn:entity:podcast`
- `urn:entity:tv_show`

`urn:entity:place` returns `400`:

```text
filter.type must be one of urn:entity:actor, urn:entity:artist,
urn:entity:brand, urn:entity:movie, urn:entity:person,
urn:entity:podcast, urn:entity:tv_show
```

Working requests require:

```text
filter.type=<supported type>
signal.interests.entities=<entity UUID>
filter.start_date=YYYY-MM-DD
filter.end_date=YYYY-MM-DD
take=<n>
```

Response results are under `results.trending`.

Required behaviour:

- Trending must not be used as place demand evidence.
- Date ranges are mandatory.
- Place trending is unsupported.
- Treat trend movement as momentum evidence, not attendance or spend.

### 4.8 Tags

`GET /v2/tags`

Verified working request:

```text
filter.query=cinema
take=3
```

Response results are under `results.tags`.

Required behaviour:

- Tags are taxonomy/context evidence, not affinity evidence.
- Tag IDs must be preserved exactly.

### 4.9 Heatmaps

Heatmaps are requested through `/v2/insights` with `filter.type=urn:heatmap`.

Verified working request:

```text
filter.type=urn:heatmap
filter.location.query=Hamilton, Ontario
signal.interests.entities=<entity UUID>
take=2
```

Verified failure modes:

- `filter.location.query` only: `400`, because no valid signal is present.
- `signal.location.query` instead of `filter.location.query`: `400`.
- Location plus audience signal only: `400` in the tested configuration.

The API error states:

```text
at least one valid signal and filter.location or filter.location.query
is required for heatmap insight
```

Required behaviour:

- Use `filter.location.query`, not `signal.location.query`.
- Supply at least one valid signal, such as `signal.interests.entities`.
- Do not present a heatmap as proof of demand.
- Confirm the supported signal combinations and boundary/geohash options with fixtures before production use.

### 4.10 Identifier formats

Verified behaviour:

- The same entity can appear with different UUID casing across endpoints.
- Audiences expose a UUID-like `entity_id` and a URN-like `id`.
- Some endpoints accept either form; others require a specific signal context.

Required behaviour:

- Normalize UUIDs for comparison and deduplication without discarding the original string.
- Preserve both UUID and URN where the API returns both.
- Use the identifier form required by each endpoint and signal namespace.
- Never use an entity name as a substitute for an ID in a scored request.

## 5. Canonical adapter design

The Qloo adapter is a contract boundary, not a best-effort helper.

### 5.1 Request construction

- Build requests from typed, endpoint-specific parameter objects.
- Reject unknown parameter names in development and contract tests.
- Reject unsupported entity types before sending.
- Do not silently substitute `types`/`take` with `type`/`limit`.
- Do not omit mandatory date ranges for trending.
- Do not send a heatmap request without both a location filter and a valid signal.

### 5.2 Response parsing

- Parse the verified envelope for each endpoint.
- Return an explicit parse error if the expected envelope is absent.
- Do not scan arbitrary keys for a plausible-looking array.
- Treat missing affinity scores as non-evidence, not as zero.
- Preserve raw response references for provenance where licensing permits.

### 5.3 Error handling

Classify errors as:

- authentication failure;
- authorization/plan failure;
- invalid request (contract bug);
- rate limit;
- upstream availability failure;
- empty valid result;
- parse/contract failure.

Rules:

- Authentication and authorization failures fail closed.
- Invalid request and parse failures are bugs and fail closed.
- Rate limits may retry with backoff, then fail closed.
- Empty valid results produce an explicit insufficient-evidence state.
- No error is converted into a successful empty array silently.

### 5.4 Configuration

- Require an explicit `QLOO_API_KEY` and `QLOO_API_BASE_URL` in live environments.
- Permit hackathon and production hosts only through explicit configuration.
- Never log the key.
- Record the base environment and key scope in diagnostics without recording the secret.
- Cache responses only with a documented TTL and cache key that includes the base environment.

## 6. Stage impacts

### Stage 0: Input and configuration

- Validate Qloo configuration before starting a cultural run.
- Distinguish missing configuration, invalid credentials, and insufficient evidence.
- Do not enter mock mode silently when a live key is configured but rejected.

### Stage 1: Place and entity resolution

- Search with `/v2/search` and `types`/`take`.
- Hydrate with `/entities`.
- Keep search matches separate from scored affinities.

### Stage 2: Audience resolution

- Use `/v2/audiences` while it remains available.
- Store both audience identifiers.
- Mark unresolved audiences explicitly.
- Do not map arbitrary audience descriptions to taxonomy audiences without evidence.

### Stage 3: Affinity collection

- Use `/v2/insights` with `results.entities`.
- Read `query.affinity`.
- Use `feature.explainability=true` when explainability is required.
- For demographics, require an interest signal.
- Never treat a search match as an affinity.

### Stage 3B: Audience profiles

- Pool affinities across resolved seeds.
- Deduplicate by normalized identifier, not display name.
- Record how many seeds supported each profile.
- Distinguish strong, approximate, and unresolved profiles.

### Stage 4: Evidence gate

- Qloo API failure is not the same as insufficient cultural evidence.
- A failed cultural run cannot produce a confident cultural recommendation.
- If Qloo fails closed, downstream opportunity and strategy stages must not invent cultural support.

### Stage 5: Cultural patterns

- Derive patterns only from scored affinities.
- Label patterns as PlaceGraph inference, not additional Qloo scores.
- Do not use trending or tags as substitutes for place affinity.

### Stage 6: Cross-domain relationships

- Use the documented endpoint and signal rules for each entity type.
- Keep domain-specific evidence labelled.
- Do not claim cross-domain affinity without a scored relationship.

### Stage 7: Opportunities

- Opportunities may combine Qloo affinity, local supply, and inference, but each part must remain labelled.
- Opportunity existence is not demand validation.
- No fixed count.

### Stage 8: Strategies

- Every cultural claim must trace to Qloo evidence or be labelled inference.
- Do not cite a Qloo entity merely because it appeared in search.
- Do not cite trending as place demand.

### Stage 9: Results and decisions

- Show uncertainty and evidence quality.
- Show unresolved audiences and failed Qloo stages.
- Do not render a successful-looking analysis when Qloo failed.

### Stage 10: Spatial translation

- Spatial translation remains downstream of a selected opportunity and evidence gate.
- Qloo does not determine floor area, geometry, or construction feasibility.

### Stage 11: Review

- Review may re-run the cultural stage, but must preserve the original contract/environment metadata.
- A contract failure during review must surface as a contract failure, not as revised cultural evidence.

## 7. Specification amendments

| Earlier assumption | Verified contract | Required amendment |
|---|---|---|
| Entity lookup is `/v2/entities`. | `/v2/entities` is `404`; `/entities` returns `results`. | Use `/entities`. |
| Search is `/search` with `limit` and `type`. | `/v2/search` uses `take` and `types`; wrong names are ignored and return 20 results. | Change path and parameter names; validate requests. |
| Insights and comparison are POST. | Both work as GET. | Use GET. |
| Insights return a top-level `results` array. | Results are under `results.entities`. | Parse the verified envelope only. |
| Affinity is at `affinity` or `score`. | Affinity is at `query.affinity`. | Read the documented field. |
| Explainability is top-level. | Explainability is at `query.explainability` for returned entities. | Read the per-entity field. |
| Audiences return `results` entities. | Audiences return `results.audiences` with UUID and URN. | Parse and preserve both IDs. |
| `urn:demographics` works from an audience alone. | It requires an interest signal. | Add interest signal or fail with a clear contract error. |
| Heatmaps accept location alone or `signal.location.query`. | Both fail; use `filter.location.query` plus a valid signal. | Correct request shape. |
| Trending supports places. | Places are unsupported; a date range and supported type are required. | Restrict types and require dates. |
| A single ID format is sufficient. | Mixed UUID casing and UUID/URN pairs occur. | Normalize for matching and preserve originals. |
| API errors can be swallowed as empty results. | Errors are distinct from valid empty results. | Fail closed or mark degraded explicitly. |
| Production and hackathon bases are interchangeable. | The configured key is hackathon-only; production returns `401`. | Provision a production key and make the base explicit. |

## 8. Contract fixtures required before implementation

The implementation plan must not start until these fixtures are captured with a non-production test key and without secrets:

1. `/v2/search` correct request and response.
2. `/v2/search` wrong-parameter request, proving the silent 20-result default.
3. `/entities` response for one and multiple IDs.
4. `/v2/audiences` response with UUID and URN.
5. `/v2/insights` place affinity with explainability.
6. `/v2/insights` audience-to-place affinity using UUID and URN.
7. `/v2/insights` demographics failure with audience only.
8. `/v2/insights` demographics success with interest plus audience.
9. `/v2/analysis/compare` success and schema.
10. `/v2/trending` success for a supported type and failure for place.
11. `/v2/insights` heatmap success with `filter.location.query` plus interest signal.
12. Production authentication failure with the hackathon key.

Each fixture must record the endpoint, request parameters, response status, response envelope keys, and a redacted sample. Fixtures must not contain API keys.

## 9. Open questions

1. What replaces the deprecated `/v2/audiences` and `/v2/audiences/types` endpoints?
2. What is the complete Comparison response schema and input limit?
3. Which heatmap signal combinations are supported beyond an interest entity?
4. What are the heatmap boundary/geohash options and default?
5. Does `feature.explainability` work consistently across all supported entity types?
6. What is the multi-type syntax for `/v2/search`, and what is the maximum `take` per endpoint?
7. What are the production rate limits, caching rules, and licensing constraints for storing/replaying responses?
8. Does the production key support the same entity and audience taxonomy as the hackathon key?

## 10. Change log

- 2026-10-30: Initial corrected contract specification. Replaces `/v2/entities` with `/entities`; corrects search parameters; records GET for insights/comparison; records insights, audience, demographics, trending, tags, and heatmap response constraints; records production-key failure; requires explicit error handling and fail-closed behaviour.
