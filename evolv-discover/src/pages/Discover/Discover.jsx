import React, { useState } from 'react';
import styles from './Discover.module.css';
import {
    Sidebar,
    Topbar,
    StatCard,
    FeaturedMatchCard,
    StartupCard,
    InvitationCard,
    FilterBar,
    BlueprintPreview,
} from '../../components';
import {
    discoverStats,
    featuredMatch,
    recentMatches,
    opportunities,
    founders,
    trendingDomains,
    filterOptions,
} from '../../data/discoverData';

const Discover = () => {
    const [selectedStartup, setSelectedStartup] = useState(null);
    const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities);

    const handleFilterChange = (filters) => {
        let filtered = [...opportunities];

        if (filters.industry) {
            filtered = filtered.filter((opp) => opp.industry === filters.industry);
        }
        if (filters.fundingStage) {
            filtered = filtered.filter((opp) => opp.stage === filters.fundingStage);
        }
        if (filters.viabilityRange) {
            const [min, max] = filters.viabilityRange.split('-').map(Number);
            filtered = filtered.filter((opp) => opp.viability >= min && opp.viability <= max);
        }
        if (filters.techStack) {
            filtered = filtered.filter((opp) =>
                opp.techStack.some((tech) => tech === filters.techStack)
            );
        }
        if (filters.matchScore) {
            const minScore = parseInt(filters.matchScore);
            filtered = filtered.filter((opp) => opp.matchScore >= minScore);
        }

        setFilteredOpportunities(filtered);
    };

    const handleSelectStartup = (startup) => {
        setSelectedStartup(startup);
        console.log('Selected startup:', startup);
    };

    return (
        <div className={styles.discoverContainer}>
            <Sidebar />
            <main className={styles.mainWrapper}>
                <Topbar />

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Discover Startup Opportunities</h1>
                    <p className={styles.subtitle}>
                        AI-curated startup blueprints matched to your skills, experience, interests, and career goals.
                    </p>
                </div>

                {/* Stats Row */}
                <div className={styles.statsRow}>
                    {discoverStats.map((stat) => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </div>

                {/* Filter Bar */}
                <FilterBar options={filterOptions} onFilterChange={handleFilterChange} />

                {/* Main Grid */}
                <div className={styles.mainGrid}>
                    {/* Left Column */}
                    <div className={styles.leftCol}>
                        {/* Featured Match */}
                        <FeaturedMatchCard data={featuredMatch} />

                        {/* Recent Top Matches */}
                        <div className={styles.sectionHeader}>
                            <h3><i className="fas fa-star" style={{ color: '#C4973A' }}></i> Recent Top Matches</h3>
                            <a href="#">View all →</a>
                        </div>
                        <div className={styles.recentMatchesGrid}>
                            {recentMatches.map((match) => (
                                <StartupCard
                                    key={match.id}
                                    data={match}
                                    compact
                                    onSelect={() => handleSelectStartup(match)}
                                />
                            ))}
                        </div>

                        {/* All Opportunities */}
                        <div className={styles.sectionHeader}>
                            <h3><i className="fas fa-list-ul"></i> All Opportunities</h3>
                            <span className={styles.resultCount}>
                                {filteredOpportunities.length} opportunities
                            </span>
                        </div>
                        <div className={styles.opportunitiesList}>
                            {filteredOpportunities.length > 0 ? (
                                filteredOpportunities.map((opp) => (
                                    <StartupCard
                                        key={opp.id}
                                        data={opp}
                                        detailed
                                        onSelect={() => handleSelectStartup(opp)}
                                        onApply={() => console.log('Apply to:', opp.name)}
                                        onSave={() => console.log('Save:', opp.name)}
                                    />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>🔍</div>
                                    <h4>No startup opportunities match your current filters.</h4>
                                    <p>Try adjusting your filters to see more options.</p>
                                    <button
                                        className={styles.resetBtn}
                                        onClick={() => {
                                            setFilteredOpportunities(opportunities);
                                            document.querySelector('form')?.reset();
                                        }}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Blueprint Preview */}
                    <div className={styles.rightCol}>
                        {selectedStartup ? (
                            <BlueprintPreview data={selectedStartup} />
                        ) : (
                            <div className={styles.previewPlaceholder}>
                                <div className={styles.placeholderIcon}>📋</div>
                                <h4>Select a startup</h4>
                                <p>Click on any startup card to view the full blueprint preview here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Founder Invitations */}
                {founders.length > 0 && (
                    <div className={styles.invitationsSection}>
                        <div className={styles.sectionHeader}>
                            <h3><i className="fas fa-envelope" style={{ color: '#5BC8A0' }}></i> Founder Invitations</h3>
                            <a href="#">View all →</a>
                        </div>
                        <div className={styles.invitationsGrid}>
                            {founders.map((invite) => (
                                <InvitationCard key={invite.id} data={invite} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Domains */}
                <div className={styles.sectionHeader}>
                    <h3><i className="fas fa-chart-line" style={{ color: '#5BC8A0' }}></i> Trending Domains</h3>
                </div>
                <div className={styles.trendingGrid}>
                    {trendingDomains.map((domain) => (
                        <div key={domain.id} className={styles.trendingCard}>
                            <div className={styles.trendingIcon}>
                                {domain.name.charAt(0)}
                            </div>
                            <div className={styles.trendingName}>{domain.name}</div>
                            <div className={styles.trendingStats}>
                                <span>{domain.startups} startups</span>
                                <span className={styles.trendingGrowth}>↑ {domain.growth}%</span>
                            </div>
                            <div className={styles.trendingDemand}>
                                <span>Developer Demand</span>
                                <div className={styles.demandBar}>
                                    <div
                                        className={styles.demandFill}
                                        style={{ width: domain.demand + '%' }}
                                    ></div>
                                </div>
                                <span className={styles.demandPercent}>{domain.demand}%</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
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