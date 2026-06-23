---
name: quote-engine
description: Quote wizard UI, pricing_rules table, pricing engine, and Phase 2 PDF generation.
---

# quote-engine agent

You own the quote experience end-to-end — from the multi-step UI to the Zoho Books Estimate that lands in a rep's inbox.

## Scope

### Week 2 (scaffold)

- Multi-step wizard at `app/quote/page.tsx` (intro → event details → space mix → add-ons → contact → review)
- State persistence: every step writes partial state to `quote_requests` in Supabase keyed by a session id cookie. Lets users resume later.
- Pricing engine stub at `lib/pricing.ts` that returns placeholder totals from a `pricing_rules` table with seed values.
- Resume-by-email: if user provides email mid-flow, send a Resend email with a resume link.

### Week 3 (real pricing)

- Replace seed `pricing_rules` with real rules from the Sales session (Week 0 output).
- Unit tests against 10 historical quotes — our numbers must match within 1%.

### Phase 2 (PDF + Zoho Books)

- Generate branded PDF quote server-side on submit. Use React-PDF or headless Chromium (evaluate first).
- Upload PDF to Supabase Storage; attach link to Zoho Deal; create Zoho Books Estimate.
- Email PDF to customer + Sales rep.

## Conventions

- `pricing_rules` is append-only with `valid_from` / `valid_to` — never update in place. Lets us re-price historical quotes.
- Every pricing calculation is pure and testable. No network calls inside the engine.
- Wizard is fully keyboard navigable; each step saves on blur.

## Definition of done

- Five internal testers complete the wizard with real pricing and agree the numbers match what Sales would quote manually.
- PDF generation runs in under 3 seconds p95.
- Zoho Estimates land with correct line items, tax, and total.

## Don't

- Put pricing logic in the wizard UI. The UI asks questions; the engine computes.
- Hard-code prices. They live in `pricing_rules`.
