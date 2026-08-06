"use client";

import { Suspense } from "react";
import DeveloperProjects from "@/features/projects/components/developer-projects";

export default function DevProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="text-bp-muted text-[13px]">Loading your projects…</div>
        </div>
      }
    >
      <DeveloperProjects />
    </Suspense>
  );
}
