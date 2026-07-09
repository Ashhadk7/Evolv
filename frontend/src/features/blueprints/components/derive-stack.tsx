import { Browser, CloudArrowUp, Cpu, Database, Plugs, Stack } from "@phosphor-icons/react";
import type { StackCat } from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";

// Presentational stack detail (icons live here — the data model itself lives in
// blueprint-content.ts). Feature-local: only used inside BlueprintDetail.
export function deriveStack(bp: Blueprint): StackCat[] {
  const fe = bp.techStack.frontend;
  const be = bp.techStack.backend;
  const ai = bp.techStack.ai;
  const db = bp.techStack.db;
  return [
    {
      icon: <Browser size={18} weight="duotone" className="text-bp-teal" />,
      name: "Frontend",
      primary: fe,
      rows: [
        { k: "Framework", v: "Next.js 16 (App Router) + React" },
        { k: "Language", v: "TypeScript (strict)" },
        { k: "Styling", v: "Tailwind CSS + Framer Motion" },
        { k: "Data / state", v: "TanStack Query + Zustand" },
        { k: "Components", v: "Radix Primitives + custom UI kit" },
      ],
    },
    {
      icon: <Stack size={18} weight="duotone" className="text-bp-teal" />,
      name: "Backend",
      primary: be,
      rows: [
        { k: "Service", v: be },
        { k: "API", v: "REST + OpenAPI (typed client)" },
        { k: "Auth", v: "Auth.js / Clerk — JWT + OAuth" },
        { k: "Validation", v: be.toLowerCase().includes("python") ? "Pydantic" : "Zod" },
        {
          k: "Background jobs",
          v: be.toLowerCase().includes("python") ? "Celery + Redis" : "BullMQ + Redis",
        },
      ],
    },
    {
      icon: <Cpu size={18} weight="duotone" className="text-bp-teal" />,
      name: "AI / ML",
      primary: ai,
      rows: [
        { k: "Models", v: ai },
        { k: "Serving", v: "FastAPI + ONNX Runtime" },
        { k: "Orchestration", v: "LangChain / typed pipeline" },
        { k: "Vector store", v: "pgvector (Postgres)" },
        { k: "Evaluation", v: "Weights & Biases + golden sets" },
      ],
    },
    {
      icon: <Database size={18} weight="duotone" className="text-bp-teal" />,
      name: "Data",
      primary: db,
      rows: [
        { k: "Primary DB", v: db },
        { k: "Cache / queue", v: "Redis" },
        { k: "Object storage", v: "Amazon S3 / Cloudflare R2" },
        { k: "ORM", v: be.toLowerCase().includes("python") ? "SQLAlchemy + Alembic" : "Prisma" },
        { k: "Analytics", v: "ClickHouse / warehouse sync" },
      ],
    },
    {
      icon: <CloudArrowUp size={18} weight="duotone" className="text-bp-teal" />,
      name: "Infra & DevOps",
      primary: "Vercel · AWS",
      rows: [
        { k: "Hosting", v: "Vercel (web) + AWS / Render (API)" },
        { k: "Containers", v: "Docker" },
        { k: "CI / CD", v: "GitHub Actions" },
        { k: "IaC", v: "Terraform" },
        { k: "Observability", v: "Sentry + Grafana / OpenTelemetry" },
      ],
    },
    {
      icon: <Plugs size={18} weight="duotone" className="text-bp-teal" />,
      name: "Integrations",
      primary: "Stripe Connect",
      rows: [
        { k: "Payments", v: "Stripe Connect — milestone escrow" },
        { k: "Email", v: "Resend / Postmark" },
        { k: "Product analytics", v: "PostHog" },
        { k: "Notifications", v: "Knock / Novu" },
        { k: "Error tracking", v: "Sentry" },
      ],
    },
  ];
}
