import { useState } from "react";
import { getAccessToken } from "@/features/auth/lib/session";

import { Topbar } from "@/features/developer-dashboard/components/topbar";
import { StatCard } from "@/features/developer-dashboard/components/stat-card";
import styles from "@/features/developer-dashboard/components/discover.module.css";
import {
  discoverStats,
  featuredMatch,
  opportunities,
  filterOptions,
} from "@/features/developer-dashboard/data/developer-data";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";
import { FeaturedMatchCard } from "./featured-match-card";
import { FilterBar } from "./filter-bar";
import { OpportunitiesList } from "./opportunities-list";
import { BlueprintPreviewPanel } from "./blueprint-preview-panel";
import { TrendingDomainsPanel } from "./trending-domains-panel";
import type { DiscoverFilters, Opportunity } from "./types";

// Build unique tech stacks from all opportunities
const allTechStacks = [...new Set(opportunities.flatMap((o) => o.techStack))].slice(0, 8);

const Discover = ({ onNavigate, profileComplete = true, onRequireProfile }: DeveloperPageProps) => {
  const [selectedStartup, setSelectedStartup] = useState<Opportunity | null>(null);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>(opportunities);
  const [activeFilters, setActiveFilters] = useState<DiscoverFilters>({});

  const handleApply = async (blueprintId?: string) => {
    if (!profileComplete && onRequireProfile) {
      onRequireProfile(() => onNavigate("applications"));
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const targetId = blueprintId || selectedStartup?.id || "9b178a4a-e642-4cb5-bfef-1c7370f4c807";

      await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers,
        body: JSON.stringify({ blueprint_id: targetId }),
      });
    } catch (e) {
      console.warn("Application creation error:", e);
    }

    onNavigate("applications");
  };

  const applyFilters = (filters: DiscoverFilters) => {
    let filtered = [...opportunities];
    if (filters.industry) filtered = filtered.filter((o) => o.industry === filters.industry);
    if (filters.fundingStage) filtered = filtered.filter((o) => o.stage === filters.fundingStage);
    if (filters.matchScore) {
      const min = parseInt(filters.matchScore);
      filtered = filtered.filter((o) => ((o as Opportunity).matchScore || 0) >= min);
    }
    if (filters.viability) {
      const [min, max] = filters.viability.split("-").map(Number);
      filtered = filtered.filter((o) => (o.viability || 0) >= min && (o.viability || 0) <= max);
    }
    if (filters.techStack) {
      filtered = filtered.filter(
        (o) => o.techStack && o.techStack.includes(filters.techStack as string)
      );
    }
    setFilteredOpportunities(filtered);
  };

  const handleFilterChange = (key: keyof DiscoverFilters, value: string) => {
    const newFilters = { ...activeFilters, [key]: value === activeFilters[key] ? null : value };
    setActiveFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setFilteredOpportunities(opportunities);
  };

  const handleSelectStartup = (startup: Opportunity) => {
    setSelectedStartup(startup === selectedStartup ? null : startup);
  };

  const getViabilityColor = (score: number) => {
    if (score >= 85) return "#5BC8A0";
    if (score >= 70) return "#C4973A";
    return "#FF6B6B";
  };

  return (
    <div className={styles.discoverContainer}>
      <main className={styles.mainWrapper}>
        <Topbar
          title="Discover Opportunities"
          subtitle="AI-curated startup blueprints matched to your skills and career goals."
          onNavigate={onNavigate}
        />

        <div className={styles.statsRow}>
          {discoverStats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>

        <FeaturedMatchCard
          featuredMatch={featuredMatch}
          getViabilityColor={getViabilityColor}
          onApply={handleApply}
        />

        <FilterBar
          filterOptions={filterOptions}
          allTechStacks={allTechStacks}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <div className={styles.mainGrid}>
          <OpportunitiesList
            opportunities={filteredOpportunities}
            selectedStartup={selectedStartup}
            getViabilityColor={getViabilityColor}
            onSelectStartup={handleSelectStartup}
            onApply={handleApply}
            onResetFilters={handleClearFilters}
          />

          <div className={styles.rightCol}>
            <BlueprintPreviewPanel
              selectedStartup={selectedStartup}
              getViabilityColor={getViabilityColor}
              onClose={() => setSelectedStartup(null)}
              onApply={handleApply}
            />
            <TrendingDomainsPanel />
          </div>
        </div>

        <div className={styles.footer}>
          <span>Evolv · Discover Opportunities</span>
          <div className={styles.footerRight}>
            <div className={styles.greenDot}></div>
            <span>© 2025 Evolv. All rights reserved.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Discover;
