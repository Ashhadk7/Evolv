export type DeveloperTab =
  "dashboard" | "discover" | "applications" | "projects" | "network" | "inbox" | "settings";

// The "simple" developer tab components are loosely typed / @ts-nocheck, so their
// inferred props are too narrow (just `onNavigate`). The old DeveloperDashboard view
// asserted this shape via its `pages` map; the route pages assert it the same way.
export type DeveloperPageProps = {
  onNavigate: (page: DeveloperTab) => void;
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
};
