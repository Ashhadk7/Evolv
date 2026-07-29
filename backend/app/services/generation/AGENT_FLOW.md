# Blueprint Generation — Agent Flow

This document explains how Evolv turns a founder's raw startup idea into a fully
researched, evidence-cited blueprint. It covers **what** each stage does, **how**
it does it, and **why** it is built the way it is. It reflects the code in
`backend/app/services/generation/` at `CONTENT_SCHEMA_VERSION = 6`.

---

## 1. The one-paragraph summary

A founder submits an intake form. We immediately create a blueprint row in a
`generating` state and return it, then run a **9-call, multi-agent pipeline** in
the background. The pipeline plans idea-specific web searches, runs live research
through Tavily, and feeds that evidence to a chain of specialist LLM agents —
market, competitor, persona, product, strategy, scorecard, tech stack, and a
final synthesis. Each agent returns **strictly-schema'd JSON** (no free-form
blobs), agents run **concurrently wherever they don't depend on each other**, and
the frontend polls the blueprint to watch progress advance one agent at a time.
The whole run targets **under 90 seconds** when provider quota is available.

---

## 2. Design principles (the "why" behind everything)

These decisions recur throughout the pipeline, so they're stated once here.

| Principle | What it means | Why |
|---|---|---|
| **Evidence over invention** | Every factual claim traces to a real web source or is explicitly flagged as an `assumption`. We never fabricate data. | A blueprint whose scores rest on made-up "traction" is worse than no blueprint — it misleads the founder. |
| **LLM judges, code computes** | The model rates dimensions and estimates inputs; arithmetic (viability score, market SAM) happens in Python. | LLMs are unreliable at math and consistency. Deterministic code makes numbers reproducible and auditable. |
| **Strict schemas, not prose** | Every agent returns Pydantic-validated JSON with length bounds and enums. | The frontend renders structured fields, not paragraphs. Strict schemas catch a bad model response *before* it reaches the UI. |
| **Concurrency by dependency** | Agents run in parallel unless one genuinely needs another's output. | Latency is the sum of the *critical path*, not the sum of all calls. This is what makes the 90s target reachable. |
| **Degrade honestly, never silently** | When a provider fails, we surface the real cause. We do not paper over it with fake content. | The founder (and you, debugging) need the true reason — "Tavily 401", "daily token budget" — to act. |
| **Model tiering** | Heavy reasoning agents run on a large model; mechanical agents run on a cheaper, faster one with its own quota. | Splits load across separate rate-limit budgets and cuts cost, without hurting the calls that need reasoning. |

---

## 3. The request lifecycle

```
POST /api/v1/blueprints/generate
        │
        ▼
start_generation()                     ← synchronous, returns in milliseconds
  • require founder profile
  • create Blueprint row
  • create BlueprintVersion (state=CURRENT, status="generating")
  • commit + return the blueprint
        │
        ▼
background_tasks.add_task(run_generation, blueprint.id, payload)
        │
        ▼
run_generation()                       ← async, own DB session, the slow part
  • Stage 0 … Stage 4  (the agent pipeline, section 5)
  • _finalize() writes the completed content, or
  • _update_generation(status="failed", error=…) on any failure
        │
        ▼
Frontend polls  GET /api/v1/blueprints/{id}  every ~2s
  • reads content_json.generation.completedAgents to animate progress
  • stops when status == "completed" or "failed"
```

**Why split synchronous create from asynchronous generate?**
The pipeline takes tens of seconds. If the HTTP request blocked on it, the
connection could time out and the user would stare at a spinner with no record
to poll. Instead we persist a `generating` blueprint instantly, hand back its
id, and let the client poll. The generation is a FastAPI `BackgroundTask`
(in-process).

> **Known trade-off (documented in code):** because the task runs in-process,
> a server restart mid-generation leaves the blueprint stuck in `generating`.
> That's acceptable at current scale; the fix (a durable queue like Celery/RQ)
> is deferred until it becomes a real problem.

---

## 4. Intake → the agent brief

The founder's form (`BlueprintGenerateRequest`) has many fields: idea, target
customer, problem, solution, stage, budget, timeline, region, monetization,
constraints. Two derived strings drive everything:

- **`agent_brief`** (`_build_agent_brief`) — every non-empty field joined as
  `Label: value` lines. This full context feeds the *LLM* agents.
- **`idea`** (the short one-line field) — feeds the *search templates*.

> **Why keep them separate?** The multi-field brief is great context for a
> language model but terrible input for a search engine — you never want to POST
> a 10-line paragraph to Tavily as a query. The short `idea` builds clean search
> strings; the rich `brief` gives agents the full picture.

---

## 5. The pipeline, stage by stage

The pipeline is a dependency graph, not a straight line. Each stage waits only
for the outputs it actually consumes. `9` LLM calls total (planner + 8 agents).

```
Stage 0     research_planner
                 │  (idea-specific search queries; optional — falls back to templates)
                 ▼
Stage 1     market  ∥  competitor          ← run together, each does its own web research
                 │
                 ▼
Stage 2     persona                        ← grounded in stage-1 sources, no new searches
                 │
                 ▼
Stage 3     product  ∥  strategy  ∥  scorecard   ← all three depend only on stages 1–2
                 │
                 ▼
Stage 4     techStack  ∥  synthesis        ← techStack needs product.features;
                                              synthesis reviews the whole file
                 │
                 ▼
            _build_blueprint_content_payload → _finalize
```

The `∥` symbol means the calls are issued concurrently with `asyncio.gather`
(wrapped in `gather_stage`, see section 7).

### Stage 0 — Research Planner  *(fast model)*

**What:** Reads the brief and proposes 3–5 **market** search queries and 3–5
**competitor** search queries tailored to this specific idea.

**How:** `run_research_planner` → `ResearchPlan` schema (each query 8–90 chars).
Runs on `GROQ_FAST_MODEL` with a tiny `max_tokens=400` budget — it's a cheap,
mechanical rewrite task.

**Why it's optional:** If the planner fails (rate limit, bad JSON), we catch the
error and fall back to **template queries** built from the idea + industry
(defined in `enrichment.py`). This means generation is *never worse* than the
pre-planner behavior — the planner only ever *improves* search relevance, it can
never block the run.

### Stage 1 — Market & Competitor  *(large model)*

These are the two research-heavy agents and they run **concurrently** because
neither needs the other.

**What Market does:** Sizes the market (TAM/SAM feel), estimates CAGR, customer
count, annual price, demand level, timing, "why now", and 3–5 **demand signals**
each tied to source indexes. Returns a `MarketAnalysis`.

**What Competitor does:** Maps 3–6 competitors (Direct/Indirect/Adjacent) with
strengths, weaknesses, and the **gap** each leaves; identifies white space; and
produces the single most important output for downstream stages — the
**`positioning_angle`** (the differentiator). Returns a `CompetitorAnalysis`.

**How each works (identical shape):**
1. `enrich_*_context()` runs the planned (or template) searches through Tavily
   concurrently, dedupes, filters for relevance, and returns a `ResearchBundle`.
2. The sources are rendered into a text block and injected into the prompt.
3. `call_agent()` sends system + user prompt, gets schema-valid JSON back.
4. `attach_research()` merges the LLM analysis with the real sources +
   metadata, so the blueprint carries its evidence.

> **Why source indexes?** Each agent cites evidence by referencing
> `[1]`, `[2]`… in the rendered research block. The schema constrains those
> indexes to the number of sources the prompt actually renders (`le=6` for
> market, `le=8` competitor, `le=10` scorecard) so a model can't cite a source
> that doesn't exist. This is what powers the clickable citations in the UI.
>
> **Runtime clamp (not just schema bounds).** The schema ceiling is static, but
> the real research often returns *fewer* sources than that ceiling — so after
> each research agent returns, `keep_cited_indexes` drops any index past the
> number of sources actually shown to the model (market/competitor/scorecard).
> A citation to a source that wasn't in the prompt is a fabricated footnote;
> dropping it turns "cites nothing" into an honest empty citation.

> **Token discipline here matters most.** Market and competitor carry the
> biggest prompts (many sources × long snippets). They send **trimmed** research
> blocks (market: 6 sources / 450-char snippets; competitor: 8 sources /
> 350-char snippets) to the LLM, while the **full** source list still attaches
> to the blueprint for the evidence UI. On free-tier per-minute token budgets,
> this trimming is what keeps a single call from eating an entire minute's quota.

### Stage 2 — Persona  *(large model)*

**What:** Produces exactly **3 personas** — one Primary user, one Economic buyer,
one Gatekeeper — each with goals, pains, jobs-to-be-done, buying triggers,
objections (each tagged `sourced`/`assumption`), and acquisition channels. Plus
an adoption path and messaging angles.

**How:** `run_persona` consumes a **shared research block** built from the top 5
market + top 5 competitor sources (trimmed to 300-char snippets). It does **not**
run its own searches.

**Why grounded, not fresh:** Personas should be consistent with the market and
competitor findings, not a separate reality. Reusing stage-1 evidence keeps the
blueprint internally coherent and saves two rounds of Tavily calls. The schema
enforces the exact 3-role composition via a model validator, so downstream code
(`_persona_context`) can safely assume the structure.

### Stage 3 — Product, Strategy, Scorecard  *(all three on the large model)*

Three agents, all depending only on stages 1–2, run **concurrently**.

**Product** (`run_product`): scopes a **client-grade MVP spec** — 6–15
**features** (each with module, user story, Given/When/Then acceptance criteria,
priority, effort, `dependencies` on other features, and the persona need it
`addresses`), 2–5 **out-of-scope** cuts, the **data entities** the build revolves
around, the **non-functional requirements**, and 3–6 build **phases**.

> **Why the phases carry a week budget.** `weeks_from_timeline` turns the
> founder's free-text timeline ("4 months") into a concrete week count in
> Python, and the prompt tells the agent its phase weeks must sum to it. This is
> load-bearing, not cosmetic: the frontend prices the entire build as
> `Σ phase.weeks × contractor rate`, so an unanchored roadmap silently halves
> the quoted cost and pulls break-even months forward. Same principle as
> `derive_viability` — the model judges the shape, code fixes the number. Grounded
in the competitor `positioning_angle` and a compact persona digest. Runs on the
**large model** — a real handoff spec is reasoning-heavy. A model validator drops
any `dependencies` reference that isn't a real feature name (hallucination guard).

**Strategy** (`run_strategy`): what the market lacks, recommended additions with
impact, path-to-complete, risks with severity + mitigation, and GTM channels +
sequence grounded in persona acquisition channels. Each risk and addition carries
an evidence **`basis`** (`sourced`/`assumption`) so an invented judgement call is
labelled, not passed as fact. Large model.

**Scorecard** (`run_scorecard`): rates **6 anchored dimensions** 0–100 — problem
severity, market quality, competition, differentiation, execution feasibility,
timing — each with a justification and source citations. Large model.

> **Why the scorecard doesn't output a final score.** The LLM judges each of the
> 6 dimensions; the composite **viability** is computed in Python
> (`derive_viability`) using fixed weights (problem 0.25, market 0.25, diff 0.20,
> feasibility 0.15, competition 0.10, timing 0.05). This guarantees the headline
> number is reproducible and can't drift with model mood — the same 6 dimension
> scores always produce the same viability. The weights are idea/pre-seed tuned
> (problem + market dominate early-stage evaluation).

### Stage 4 — Tech Stack & Synthesis  *(tech stack on fast model; synthesis on large model)*

**Tech Stack** (`run_tech_stack`): recommends a 6-layer stack (frontend, backend,
database, vector DB, AI provider, hosting) each with reasoning + monthly cost,
plus a 3–5 role hiring plan. Depends on `product.features` (you can't pick a
stack without knowing what you're building). Fast model.

**Synthesis** (`run_synthesis`): the editor-in-chief. Reviews the *entire*
assembled file and produces the blueprint's identity and verdict — **brand name**
(becomes the title), tagline, executive summary, a **verdict**
(Build / Validate first / Rethink) with reasoning, red flags with severity,
contradictions it noticed across agents, and key assumptions. Its
`contradictions` audit also **checks grounding**: it flags any persona objection
or strategy risk/addition marked `sourced` that the market/competitor analysis
doesn't actually support — the one place fabrication in the ungrounded agents
gets caught.

> **Why these two run together.** Tech stack needs product; synthesis needs
> everything *except* tech stack (a founder's build stack doesn't change the
> go/no-go verdict). So they have no dependency on each other and run
> concurrently, shaving one call off the critical path.

### Assembly

`_build_blueprint_content_payload` collects every agent's `model_dump(by_alias=True)`
into `content_json.agents`, computes the derived numbers in code
(bottom-up SAM = `customer_count × price_annual_usd`, viability from the
scorecard), sets the top-level fields (name, differentiator, ai_recommend,
viability, market_potential, developer_demand), and `_finalize` writes it to the
version with `status="completed"`.

---

## 6. `call_agent` — the shared LLM call

Every agent funnels through one function (`agent_service.py`). It is where all
the reliability logic lives, so each agent stays a thin schema + prompt wrapper.

**What it guarantees:**
1. **API key present** — fails fast with a clear message if `GROQ_API_KEY` is empty.
2. **Slim schema in the prompt** — Pydantic's auto-generated `title` keys are
   stripped (`_slim_schema`) before the JSON Schema is embedded; they carry no
   validation meaning but cost hundreds of prompt tokens per call.
3. **JSON mode** — requests `response_format: {"type": "json_object"}` and, for
   `gpt-oss` reasoning models, sets `reasoning_effort: "low"` so the model
   doesn't spend its whole `max_tokens` budget on hidden reasoning and truncate
   the JSON.
4. **Concurrency cap** — a module-level `asyncio.Semaphore(1)` serialises Groq calls, because on the
   free tier even two concurrent calls blow the per-minute token window and
   keep re-blowing it on reset. Raise it on a paid key with higher TPM.
5. **Rate-limit handling** (see section 7).
6. **Corrective retries** — if a response fails JSON parsing or schema
   validation, the *next* retry appends a message telling the model exactly what
   was rejected ("your previous response was rejected: … return the data, never
   the schema itself"). Blindly resending the identical prompt at low temperature
   just repeats the same mistake; feedback gives the model a real second chance.
7. **Fence stripping** — `_parse_agent_json` strips ```` ```json ```` fences some
   models add despite JSON mode.

**Model selection:** defaults to `GROQ_MODEL` (large); agents that pass
`model=GROQ_FAST_MODEL` (planner, tech stack) run on the cheaper model with its
separate quota. Product stays on the large model — a handoff spec is the most
reasoning-heavy call in the pipeline.

---

## 7. Failure handling — the four modes

The pipeline has been hardened against four distinct failure modes, each with a
tailored response. This is the part that makes generation *dependable*, not just
functional.

### Mode 1 — Daily token budget exhausted
Groq returns `429` with a `retry-after` in the **thousands of seconds**. No
in-request wait can outlast that, so `call_agent` **fails fast** the moment the
signaled delay exceeds `RETRY_FAIL_FAST_SECONDS` (120s), raising
`AgentRateLimitError` with the real wait time. The user sees *"Try again in
~38 min"*, not an 8-minute frozen progress bar.

### Mode 2 — Per-minute burst saturation
Parallel agents momentarily exceed the tokens-per-minute limit; Groq returns
`429` with a **short** `retry-after` (seconds). Here waiting *works*, so
`call_agent` rides it out against a **wall-clock budget** (`RETRY_BUDGET_SECONDS`
= 300s) rather than an attempt counter — a single call may need several short
waits in a row, and counting those as failures gives up far too early. Each wait
adds **random jitter** so parallel agents don't all retry at the same window
reset and re-collide (the "thundering herd" problem).

### Mode 3 — Bad model output
A model returns malformed JSON or a schema-invalid object (e.g. a small model
echoing the schema back instead of filling it in). Caught by the retry loop,
which injects the corrective feedback message (section 6.6) and retries up to
`MAX_ATTEMPTS`. `JSONDecodeError` deliberately propagates as a `ValueError` so
the loop catches it — wrapping it early would have skipped retries.

### Mode 4 — Research provider outage
Tavily is unauthorized/down/returns nothing. Enrichment **raises
`EnrichmentError` with the real provider detail** — it does **not** fabricate
placeholder sources. Fake evidence would flow into the citations UI as if real
and skew every downstream agent's analysis. Better to fail with
*"Web research unavailable (tavily web: HTTP 401 …)"* so the cause is fixable.

### Sibling cancellation (cross-cutting)
`asyncio.gather` does **not** cancel sibling tasks when one raises. Without
intervention, a failed agent would leave its stage-mates running — retrying rate
limits (burning the very quota that's scarce) and writing progress onto a
blueprint already marked failed. Every stage runs through **`gather_stage`**,
which cancels and drains surviving tasks the instant one fails. This is why a
failure now ends *cleanly and immediately* instead of trailing background 429s.

### Error surfacing
`run_generation` catches exceptions in tiers:
- `AgentRateLimitError` / `EnrichmentError` → the **real, actionable** message
  is stored on the blueprint (`status="failed"`, `error=…`).
- Generic `AgentServiceError` / `ValidationError` → a safe generic message
  ("could not complete — check provider keys and limits"), with the true cause
  logged server-side for debugging. **This tier must stay above the bare
  `except ValueError`**: pydantic's `ValidationError` subclasses `ValueError`,
  so the reverse order leaks a full schema dump into the user-facing field.
- Any unexpected `Exception` → logged with full traceback, generic user message.

---

## 8. Enrichment (web research) internals

`enrichment.py` is the research layer both market and competitor use.

- **Concurrent searches:** all planned queries for an agent fire together via
  `asyncio.gather(return_exceptions=True)` — one failed search doesn't sink the
  others.
- **Tavily config:** `search_depth="advanced"`, `chunks_per_source=3`,
  usage tracking on. Timeout is `ENRICHMENT_TIMEOUT_SECONDS` (12s) per client.
- **Dedupe:** by normalized URL (lowercased, trailing slash stripped).
- **Relevance filter:** naive token-overlap between the idea/industry keywords
  and each source's title+snippet, with stopwords removed. Never filters down to
  nothing (falls back to the unfiltered set if the filter would empty it).
  *(Marked in code as a deliberate simple choice — swap for an LLM relevance
  check only if off-topic sources actually get through.)*
- **Prompt rendering:** `sources_to_prompt_block` formats sources as indexed
  `[n]` entries; `max_sources` / `snippet_chars` let each consumer trim its copy
  without losing the full attached list.

---

## 9. Data contract — what lands on the blueprint

`content_json` on the current `BlueprintVersion`:

```jsonc
{
  "schemaVersion": 6,
  "intake": { /* non-empty intake fields */ },
  "agents": {
    "market":     { /* MarketAnalysis + sources + researchMetadata + bottomUpSam */ },
    "competitor": { /* CompetitorAnalysis + sources + researchMetadata */ },
    "persona":    { /* PersonaOutput */ },
    "product":    { /* ProductOutput */ },
    "techStack":  { /* TechStackOutput */ },
    "strategy":   { /* StrategyOutput */ },
    "scorecard":  { /* ScorecardOutput (6 dimensions) */ },
    "synthesis":  { /* SynthesisOutput */ }
  },
  "generation": {
    "status": "generating | completed | failed",
    "completedAgents": [ /* names, appended as each finishes → drives the UI progress bar */ ],
    "error": "…",           // only when failed
    "updatedAt": "ISO-8601"
  },
  "updatedAt": "ISO-8601"
}
```

`completedAgents` is appended to the moment each agent finishes (via the `track`
wrapper), and every append commits to the DB — which is exactly what lets the
frontend poll and animate the 8-step progress list one tick at a time.

---

## 10. Performance & cost model

- **Critical path (quota available):** Tavily (5–10s) → market∥competitor (~10s)
  → persona (~8s) → stage 3 (~15s) → stage 4 (~10s) ≈ **45–60s**. The 90s target
  has real headroom.
- **What eats the budget:** the 6 large-model calls, each carrying a research
  block. Trimming those blocks (section 5, Stage 1) is the single biggest lever
  on free-tier throughput.
- **Free tier reality:** per-minute token throughput is smaller than one
  generation's appetite, so back-to-back runs ride out short 429s (2–5 min) but
  still complete. **Paid dev tier** is the only thing that makes "<90s, every
  time" reliable — it lifts TPM into the hundreds of thousands. Model tiering
  (large + fast on separate budgets) roughly doubles free-tier capacity in the
  meantime.

---

## 11. File map

| File | Responsibility |
|---|---|
| `blueprint_generation_service.py` | Orchestrator: lifecycle, stage graph, `gather_stage`, assembly, error tiers |
| `agent_service.py` | `call_agent` / `generate_chat`: LLM calls, retries, rate-limit logic, JSON parsing |
| `enrichment.py` | Tavily web research: search, dedupe, relevance, prompt rendering |
| `agents/research_planner.py` | Stage 0 — idea-specific search queries |
| `agents/market.py` | Stage 1 — market sizing & demand |
| `agents/competitor.py` | Stage 1 — competitor map & positioning angle |
| `agents/persona.py` | Stage 2 — 3 personas |
| `agents/product.py` | Stage 3 — MVP scope & phases |
| `agents/strategy.py` | Stage 3 — GTM & risks |
| `agents/scorecard.py` | Stage 3 — 6 dimensions + `derive_viability` |
| `agents/tech_stack.py` | Stage 4 — stack & hiring roles |
| `agents/synthesis.py` | Stage 4 — verdict, brand, executive summary |
| `prompts/*.md` | System + user prompt templates per agent |
| `prompt_loader.py` | Loads & renders prompt templates |
| `text.py` | `clean` (normalize) & `clip` (truncate long free-form fields) |
