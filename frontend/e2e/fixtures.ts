import type { Page, Route } from "@playwright/test";

type Role = "founder" | "developer";

const now = "2026-07-30T08:00:00.000Z";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
};

async function fulfillJson(route: Route, body: unknown, status = 200) {
  if (route.request().method() === "OPTIONS") {
    await route.fulfill({ status: 204, headers: corsHeaders });
    return;
  }

  await route.fulfill({
    status,
    contentType: "application/json",
    headers: corsHeaders,
    body: JSON.stringify(body),
  });
}

function pathAfterApiVersion(url: string) {
  const pathname = new URL(url).pathname;
  return pathname.replace(/^.*\/api\/v1/, "") || "/";
}

function userFor(role: Role) {
  return role === "founder"
    ? {
        id: "founder-e2e-user",
        email: "founder.e2e@example.com",
        role,
        firstName: "Fiona",
        lastName: "Founder",
      }
    : {
        id: "developer-e2e-user",
        email: "developer.e2e@example.com",
        role,
        firstName: "Devon",
        lastName: "Developer",
      };
}

function accountFor(role: Role) {
  const user = userFor(role);
  return {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    phone: "+923001234567",
    // Default matches the pre-existing suite, which asserts the un-verified state.
    // Specs needing a complete profile override /me and the profile endpoint
    // locally rather than changing this shared default.
    phone_verified: false,
    country: "Pakistan",
    country_code: "+92",
    state_province: "Sindh",
    city: "Karachi",
    dob: "2000-01-01",
    gender: null,
    avatar_url: null,
  };
}

const blueprintWire = {
  id: "bp-e2e-1",
  founder_id: "founder-e2e-user",
  visibility: "private",
  created_at: now,
  updated_at: now,
  current_version: {
    id: "bpv-e2e-1",
    blueprint_id: "bp-e2e-1",
    state: "current",
    name: "Clinic Workflow AI",
    industry: "HealthTech",
    idea_desc: "AI assistant for clinic intake and follow-up workflows.",
    differentiator: "Human-in-the-loop care coordination.",
    ai_recommend: "Validate with three pilot clinics before scaling.",
    viability: 82,
    market_potential: 76,
    developer_demand: "High",
    generated_at: now,
    content_json: {
      generation: { status: "completed", completedAgents: ["market", "product", "techStack"] },
      intake: { budget: "$5k-$10k", timeline: "8 weeks" },
      agents: {
        product: { features: ["Patient intake", "Follow-up reminders", "Admin dashboard"] },
        market: { size: "$1.2B", cagr: "14%", barriers: "Moderate", score: 76 },
        competitor: { competitors: [{ name: "CareFlow", type: "Indirect" }] },
        techStack: {
          techStack: {
            frontend: { chosen: "Next.js" },
            backend: { chosen: "FastAPI" },
            database: { chosen: "PostgreSQL" },
            aiProvider: { chosen: "OpenAI API" },
            hosting: { chosen: "Vercel", monthlyCost: "$40" },
          },
          roles: [{ role: "Full-stack Developer", count: 1, skills: "Next.js, FastAPI", lead: true }],
        },
      },
    },
  },
};

const discoverBlueprintWire = {
  id: "discover-bp-e2e-1",
  name: "Clinic Workflow AI",
  industry: "HealthTech",
  founder_id: "founder-e2e-user",
  founder_name: "Fiona Founder",
  stage: "MVP",
  summary: "Automates intake and follow-up for small clinics.",
  differentiator: "Practical workflow automation for under-served clinics.",
  viability: 82,
  developer_demand: "High",
  tech_stack: ["Next.js", "FastAPI", "PostgreSQL"],
  roles: [{ role: "Full-stack Developer", count: 1, skills: ["Next.js", "FastAPI"], lead: true }],
  mvp_features: ["Patient intake", "Follow-up reminders"],
  timeline: "8 weeks",
  match_score: 88,
  match_reasons: ["Matches your React and FastAPI skills"],
  matched_skills: ["React", "FastAPI"],
  saved: false,
  applied: false,
  application_id: null,
  application_status: null,
  applied_role: null,
  applied_at: null,
  withdrawn_at: null,
  updated_at: now,
};

export async function signInAs(page: Page, role: Role) {
  const user = userFor(role);
  await page.goto("/");
  await page.evaluate(
    ({ sessionRole, sessionUser }) => {
      localStorage.setItem(
        "evolv_session",
        JSON.stringify({
          accessToken: `${sessionRole}-e2e-token`,
          refreshToken: `${sessionRole}-e2e-refresh-token`,
          user: sessionUser,
        })
      );
      document.cookie = `evolv_role=${sessionRole}; path=/; SameSite=Lax`;
    },
    { sessionRole: role, sessionUser: user }
  );
}

export async function mockLocationApis(page: Page) {
  await page.route("**/api/v0.1/countries/**", async (route) => {
    const path = new URL(route.request().url()).pathname;

    if (path.endsWith("/states")) {
      await fulfillJson(route, {
        error: false,
        data: [
          { name: "Pakistan", iso2: "PK", states: [{ name: "Sindh" }, { name: "Punjab" }] },
          { name: "United States", iso2: "US", states: [{ name: "California" }, { name: "New York" }] },
        ],
      });
      return;
    }

    if (path.endsWith("/codes")) {
      await fulfillJson(route, {
        error: false,
        data: [
          { name: "Pakistan", code: "PK", dial_code: "+92" },
          { name: "United States", code: "US", dial_code: "+1" },
        ],
      });
      return;
    }

    if (path.endsWith("/state/cities")) {
      const body = route.request().postDataJSON() as { country?: string; state?: string } | null;
      await fulfillJson(route, {
        error: false,
        data:
          body?.country === "United States"
            ? ["Los Angeles", "San Francisco"]
            : ["Karachi", "Hyderabad"],
      });
      return;
    }

    await fulfillJson(route, { error: false, data: ["Karachi"] });
  });
}

/**
 * Per-path response overrides for mockAppApi. Keys are matched against the path
 * after `/api/v1`, longest prefix first. A value may be a plain body or a
 * function of the full request URL, so a spec can vary the response by query
 * string (e.g. asserting that a search parameter really filters).
 */
export type ApiOverrides = Record<string, unknown | ((url: string) => unknown)>;

export async function mockAppApi(
  page: Page,
  role: Role = "founder",
  overrides: ApiOverrides = {}
) {
  const overrideEntries = Object.entries(overrides).sort(
    ([a], [b]) => b.length - a.length
  );

  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const path = pathAfterApiVersion(url);

    for (const [prefix, value] of overrideEntries) {
      if (path === prefix || path.startsWith(prefix)) {
        await fulfillJson(route, typeof value === "function" ? value(url) : value);
        return;
      }
    }

    if (path === "/auth/signin") {
      const user = userFor(role);
      await fulfillJson(route, {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.firstName,
        last_name: user.lastName,
        access_token: `${role}-e2e-token`,
        refresh_token: `${role}-e2e-refresh-token`,
        token_type: "bearer",
        expires_in: 3600,
        expires_at: 1_785_415_600,
      });
      return;
    }

    if (path === "/me") {
      await fulfillJson(route, accountFor(role));
      return;
    }

    if (path === "/founder-profile") {
      await fulfillJson(route, {
        headline: "Founder building practical AI workflows",
        bio: "Focused on making clinic operations easier.",
        description: "Looking for builders who can move quickly.",
        linkedin: "https://www.linkedin.com/in/fiona-founder",
        venture_stage: "idea",
        primary_goal: "find_developers",
        domains: ["HealthTech"],
        profile_complete: false,
        stripe_connected: false,
        billing_plan: null,
        billing_email: null,
        billing_currency: null,
        billing_budget_range: null,
        payment_method: null,
        billing_company_name: null,
        educations: [],
      });
      return;
    }

    if (path === "/developer-profile") {
      await fulfillJson(route, {
        job_title: "Full-stack Developer",
        bio: "I build React and FastAPI products.",
        experience_years: 2,
        availability: true,
        open_to_remote: true,
        preferred_budget: "$20/hr",
        github: "https://github.com/devon",
        linkedin: "https://www.linkedin.com/in/devon-developer",
        portfolio_link: "https://devon.example.com",
        skills: ["React", "FastAPI", "PostgreSQL"],
        tags: ["Full-stack"],
        skill_entries: [
          { id: "skill-react", kind: "Framework", name: "React", experience: "1-3 years" },
          { id: "skill-fastapi", kind: "Framework", name: "FastAPI", experience: "1-3 years" },
        ],
        rating_avg: 4.8,
        profile_complete: false,
        // Required for isDeveloperProfileComplete; the summary falls back to this
        // string when the structured educations array is empty.
        education: "BS Computer Science, NED University",
        educations: [],
        certifications: [],
        reviews: [],
      });
      return;
    }

    if (path === "/blueprints/application-counts") {
      await fulfillJson(route, {
        total: 1,
        in_conversation: 0,
        items: [{ blueprint_id: "bp-e2e-1", count: 1, in_conversation: 0 }],
      });
      return;
    }

    if (path.startsWith("/blueprints")) {
      await fulfillJson(route, { total: 1, limit: 100, offset: 0, items: [blueprintWire] });
      return;
    }

    if (path.startsWith("/projects")) {
      await fulfillJson(route, { total: 0, limit: 100, offset: 0, items: [] });
      return;
    }

    if (path.startsWith("/connections")) {
      await fulfillJson(route, []);
      return;
    }

    if (path.startsWith("/matching")) {
      await fulfillJson(route, { items: [] });
      return;
    }

    if (path === "/notifications/preferences") {
      await fulfillJson(route, { preferences: {} });
      return;
    }

    if (path.startsWith("/notifications")) {
      await fulfillJson(route, { total: 0, limit: 50, offset: 0, items: [] });
      return;
    }

    if (path.startsWith("/discover/saved-blueprints")) {
      await fulfillJson(route, { total: 0, items: [] });
      return;
    }

    if (path.startsWith("/discover/blueprints")) {
      await fulfillJson(route, {
        total: 1,
        limit: 100,
        offset: 0,
        saved_count: 0,
        applications_count: 0,
        high_match_count: 1,
        filter_options: {
          industries: ["HealthTech"],
          stages: ["MVP"],
          tech_stack: ["Next.js", "FastAPI", "PostgreSQL"],
        },
        items: [discoverBlueprintWire],
      });
      return;
    }

    if (path.startsWith("/applications")) {
      await fulfillJson(route, { total: 0, limit: 100, offset: 0, items: [] });
      return;
    }

    if (path.startsWith("/users")) {
      await fulfillJson(route, { total: 0, limit: 100, offset: 0, items: [] });
      return;
    }

    await fulfillJson(route, {});
  });
}

export async function mockInvalidCredentials(page: Page) {
  await page.route("**/api/v1/auth/signin", async (route) => {
    await fulfillJson(route, { detail: "Invalid login credentials." }, 401);
  });
}

export async function mockSignupStart(page: Page) {
  await page.route("**/api/v1/auth/signup", async (route) => {
    await fulfillJson(route, {
      email: "founder.e2e@example.com",
      expires_at: now,
      message: "Verification code sent. Complete signup by verifying your email.",
    });
  });
}

// ── Person 3 builders ────────────────────────────────────────────────────────
// Data shapes for Discover, Applications, Network and Inbox. Kept here so the
// specs read as test intent rather than wire format.

type Wire = Record<string, unknown>;

export function discoverBlueprint(overrides: Wire = {}): Wire {
  return { ...discoverBlueprintWire, ...overrides };
}

/** Response shape of GET /discover/blueprints. */
export function discoverList(items: Wire[], extra: Wire = {}): Wire {
  const industries = [...new Set(items.map((i) => i.industry as string))];
  const stages = [...new Set(items.map((i) => i.stage as string))];
  const tech = [...new Set(items.flatMap((i) => (i.tech_stack as string[]) ?? []))];
  return {
    total: items.length,
    limit: 100,
    offset: 0,
    saved_count: items.filter((i) => i.saved).length,
    applications_count: items.filter((i) => i.applied).length,
    high_match_count: items.filter((i) => ((i.match_score as number) ?? 0) >= 85).length,
    filter_options: { industries, stages, tech_stack: tech },
    items,
    ...extra,
  };
}

/**
 * Discover list that honours the `q` search parameter, so a spec can assert the
 * search box really narrows results rather than just re-rendering.
 */
export function searchableDiscoverList(items: Wire[]) {
  return (url: string) => {
    const q = new URL(url).searchParams.get("q")?.toLowerCase().trim();
    if (!q) return discoverList(items);
    const matched = items.filter((item) =>
      [item.name, item.industry, item.summary, ...((item.tech_stack as string[]) ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
    return discoverList(matched);
  };
}

/**
 * `/me` body for an account that clears the profile-completion gate.
 * Pass as an override so the shared default (which the existing auth suite
 * relies on) is left untouched.
 */
export function verifiedAccount(role: Role = "developer"): Wire {
  return { ...accountFor(role), phone_verified: true };
}

/**
 * `/developer-profile` body that satisfies every rule in
 * `getMissingDeveloperProfileDetailFields` — role, bio, education, skills,
 * GitHub and LinkedIn — so profile-gated actions such as Compose are enabled.
 */
export function completeDeveloperProfile(overrides: Wire = {}): Wire {
  return {
    job_title: "Full-stack Developer",
    bio: "I build React and FastAPI products.",
    experience_years: 2,
    availability: true,
    open_to_remote: true,
    preferred_budget: "$20/hr",
    github: "https://github.com/devon",
    linkedin: "https://www.linkedin.com/in/devon-developer",
    portfolio_link: "https://devon.example.com",
    skills: ["React", "FastAPI", "PostgreSQL"],
    tags: ["Full-stack"],
    skill_entries: [
      { id: "skill-react", kind: "Framework", name: "React", experience: "1-3 years" },
      { id: "skill-fastapi", kind: "Framework", name: "FastAPI", experience: "1-3 years" },
    ],
    rating_avg: 4.8,
    profile_complete: true,
    educations: [
      {
        id: "edu-e2e-1",
        level: "Bachelors",
        degree: "BSc Computer Science",
        school: "NUST",
      },
    ],
    certifications: [],
    reviews: [],
    ...overrides,
  };
}

export function userSummary(overrides: Wire = {}): Wire {
  return {
    id: "user-e2e-1",
    email: "casey.dev@example.com",
    first_name: "Casey",
    last_name: "Coder",
    role: "developer",
    avatar_url: null,
    city: "Karachi",
    country: "Pakistan",
    job_title: "Backend Developer",
    discovery_tags: [],
    rating_avg: 4.5,
    ...overrides,
  };
}

/** Response shape of GET /users. */
export function usersList(items: Wire[]): Wire {
  return { total: items.length, limit: 100, offset: 0, items };
}

export function conversation(overrides: Wire = {}): Wire {
  return {
    id: "conv-e2e-1",
    status: "accepted",
    participant: {
      id: "user-e2e-1",
      role: "developer",
      first_name: "Casey",
      last_name: "Coder",
      avatar_url: null,
      profile_title: "Backend Developer",
      profile_complete: true,
      phone_verified: true,
    },
    last_message: null,
    unread_count: 0,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/** Response shape of GET /messages/inbox. */
export function inbox(
  conversations: Wire[] = [],
  requests: Wire[] = [],
  pending: Wire[] = []
): Wire {
  return { conversations, requests, pending };
}
