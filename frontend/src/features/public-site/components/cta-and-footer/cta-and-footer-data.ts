// Types + static data for testimonials, FAQ, and footer, extracted from cta-and-footer.tsx.

export interface TestimonialItem {
  quote: string;
  author: string;
  image: string;
  alt: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterColumnProps {
  title: string;
  links: NavLink[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const testimonialData: TestimonialItem[] = [
  {
    quote: "I had my idea on Monday. By Wednesday I had a full blueprint and four developer match.",
    author: "Ayesha Khan — Founder, EdTech startup",
    image:
      "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=300&q=80&fit=crop&crop=faces",
    alt: "Ayesha Khan",
  },
  {
    quote:
      "Every blueprint already has the stack, features, constraints, and budget context. It makes freelance discovery dramatically cleaner.",
    author: "James Delgado — Full-stack developer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&fit=crop&crop=faces",
    alt: "James Delgado",
  },
  {
    quote:
      "The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations.",
    author: "Sofia Reyes — Web develper",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80&fit=crop&crop=faces",
    alt: "Sofia Reyes",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What exactly is a blueprint?",
    answer:
      "A blueprint is the complete operating document for your startup idea. It includes a market analysis with competitor mapping, a prioritised MVP feature list, a recommended technical architecture and stack, and a 12-month financial projection — everything a developer needs to start building, in one structured document.",
  },
  {
    question: "How long does it take to generate one?",
    answer:
      "Between 30 and 60 seconds. You describe your idea in plain English — no decks, no frameworks, no formatting required. Evolv's multi-agent pipeline runs market research, competitor analysis, MVP scoping, architecture design, and financial modelling in parallel, then assembles everything into a readable blueprint.",
  },
  {
    question: "Do I need a technical background?",
    answer:
      "Not at all. The intake is a plain-language description of your idea, the problem you're solving, and who you're solving it for. Evolv translates that into technical specifications, stack recommendations, and cost estimates. You review the output and refine it — no engineering knowledge required.",
  },
  {
    question: "Can I edit the blueprint after it's generated?",
    answer:
      "Yes. Once generated, the blueprint is a living document. You can edit any section, update the scope, revise the financial assumptions, and regenerate specific sections. Changes are reflected in real time for any developers who have access to it.",
  },
  {
    question: "How does developer matching work?",
    answer:
      "When a blueprint is published, Evolv matches it against registered developer profiles using stack fit, domain experience, seniority level, and availability. You receive ranked opportunities that match your actual skills — not keyword-searched job boards. You see the full technical spec before deciding whether to reach out.",
  },
  {
    question: "Is Evolv free to use?",
    answer:
      "Yes — completely free. Every user can generate as many blueprints as they want at no cost. No plans, no credit card required, no limits on generation.",
  },
  {
    question: "How is this different from a business plan generator?",
    answer:
      "Business plan generators produce formatted documents. Evolv produces a live, matchable object — a structured blueprint that actively connects you to the developers most likely to act on it. The blueprint is not a PDF you email around; it's the shared source of truth for everyone working on the venture.",
  },
];

export const PRODUCT_LINKS: NavLink[] = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

export const COMPANY_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Our Team", href: "/our-team" },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
];
