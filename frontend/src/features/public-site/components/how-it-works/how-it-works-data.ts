// Step data + scroll-transition tuning constants, extracted from how-it-works.tsx.

export interface Step {
  number: string;
  Icon: string;
  title: string;
  description: string;
  tag: string;
  detail: string;
}

export const steps: Step[] = [
  {
    number: "01",
    Icon: "solar:document-add-linear", // Represents inputting notes/idea
    title: "Submit your idea",
    description:
      "Type the concept, target customer, problem, and early vision. Evolv turns messy notes into a structured intake — no business-plan formatting required.",
    tag: "~2 minutes",
    detail: "Idea intake",
  },
  {
    number: "02",
    Icon: "lucide:network", // Represents the agent pipeline and structured blueprint
    title: "AI forges the blueprint",
    description:
      "Specialized agents validate viability, map competitors, plan MVP features, design the architecture, estimate cost, and project the first financial model.",
    tag: "30–60 seconds",
    detail: "Agent pipeline",
  },
  {
    number: "03",
    Icon: "lucide:user-check", // Represents instantly verifying and finding the perfect developer matches
    title: "Matches surface instantly",
    description:
      "Developers are ranked by stack fit while high-scoring blueprints are routed into developer feeds based on domain, stage, and viability thresholds.",
    tag: "Automatic",
    detail: "Vector matching",
  },
  {
    number: "04",
    Icon: "carbon:collaborate", // Represents team building and execution
    title: "Connect and build",
    description:
      "Message developers, share investor-ready context, and keep the blueprint as the source of truth as the venture moves from concept to execution.",
    tag: "All in one place",
    detail: "Shared workspace",
  },
];

// How large the fade window is (fraction of total scroll progress).
// A step fades OUT over [segEnd-TRANS, segEnd+EPS] and the next fades IN
// over [segEnd-EPS, segEnd+TRANS] — giving a hair of overlap so the
// screen never goes fully dark at the boundary.
export const TRANS = 0.07;
export const EPS = 0.015;
