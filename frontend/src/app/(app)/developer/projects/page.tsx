"use client";

import type { ComponentType } from "react";
import ProjectsRaw from "@/features/projects/components/developer-projects";
import { isDeveloperProfileComplete } from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";

const Projects = ProjectsRaw as ComponentType<DeveloperPageProps>;

export default function DevProjectsPage() {
  const { profile } = useDeveloperDashboardStore();
  const nav = useDeveloperNavigation();
  const profileComplete = isDeveloperProfileComplete(profile);

  return (
    <Projects
      onNavigate={nav.navigateDeveloper}
      profileComplete={profileComplete}
      onRequireProfile={nav.requireDeveloperProfile}
    />
  );
}
