// @ts-nocheck
import React, { useState } from 'react';

import { Sidebar, Topbar, StatCard, ActionModal, FilterBar, InsightCard, InvitationCard, MatchCard, ProfileCard, ProjectCard, StartupCard, ApplicationCard, BlueprintPreview, FeaturedMatch, FeaturedMatchCard, DevOnboardingModal } from './shared';
import { discoverStats, featuredMatch, opportunities, filterOptions, trendingDomains, dashboardData } from './developerData';
// Build unique tech stacks from all opportunities
const allTechStacks = [...new Set(opportunities.flatMap(o => o.techStack))].slice(0, 8);

const Discover = ({ onNavigate }) => {
    const [selectedStartup, setSelectedStartup] = useState(null);
    const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities);
    const [activeFilters, setActiveFilters] = useState({});

    const handleFilterChange = (key, value) => {
        const newFilters = { ...activeFilters, [key]: value === activeFilters[key] ? null : value };
        setActiveFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (filters) => {
        let filtered = [...opportunities];
        if (filters.industry) filtered = filtered.filter(o => o.industry === filters.industry);
        if (filters.fundingStage) filtered = filtered.filter(o => o.stage === filters.fundingStage);
        if (filters.matchScore) {
            const min = parseInt(filters.matchScore);
            filtered = filtered.filter(o => (o.matchScore || 0) >= min);
        }
        if (filters.viability) {
            const [min, max] = filters.viability.split('-').map(Number);
            filtered = filtered.filter(o => (o.viability || 0) >= min && (o.viability || 0) <= max);
        }
        if (filters.techStack) {
            filtered = filtered.filter(o => o.techStack && o.techStack.includes(filters.techStack));
        }
        setFilteredOpportunities(filtered);
    };

    const handleSelectStartup = (startup) => {
        setSelectedStartup(startup === selectedStartup ? null : startup);
    };

    const getViabilityColor = (score) => {
        if (score >= 85) return '#5BC8A0';
        if (score >= 70) return '#C4973A';
        return '#FF6B6B';
    };

    return (
        <div className={"Discover_discoverContainer"}>
            <Sidebar currentPage="discover" onNavigate={onNavigate} />
            <main className={"Discover_mainWrapper"}>
                <Topbar
                    title="Discover Opportunities"
                    subtitle="AI-curated startup blueprints matched to your skills and career goals."
                    onNavigate={onNavigate}
                />

                {/* Stats Row */}
                <div className={"Discover_statsRow"}>
                    {discoverStats.map((stat) => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </div>

                {/* Featured Match */}
                <div className={"Discover_featuredCard"}>
                    <div className={"Discover_featuredBadge"}>
                        <i className="fas fa-fire"></i> Featured AI Match
                    </div>
                    <div className={"Discover_featuredBody"}>
                        <div className={"Discover_featuredLeft"}>
                            <div className={"Discover_featuredLogo"}>{featuredMatch.logo}</div>
                            <div>
                                <div className={"Discover_featuredName"}>{featuredMatch.name}</div>
                                <div className={"Discover_featuredMeta"}>
                                    <span className={"Discover_metaTag"}><i className="fas fa-industry"></i> {featuredMatch.industry}</span>
                                    <span className={"Discover_metaTag"}><i className="fas fa-seedling"></i> {featuredMatch.stage}</span>
                                    <span className={"Discover_metaTag"}><i className="fas fa-users"></i> {featuredMatch.teamSize} team</span>
                                    <span className={"Discover_metaTag"}><i className="fas fa-dollar-sign"></i> {featuredMatch.budget}</span>
                                </div>
                                <div className={"Discover_featuredDesc"}>{featuredMatch.description}</div>
                                <div className={"Discover_techTags"}>
                                    {featuredMatch.techStack.map((tech, i) => (
                                        <span key={i} className={"Discover_techTag"}>{tech}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={"Discover_featuredRight"}>
                            <div className={"Discover_matchScore"}>
                                <div className={"Discover_matchNum"}>{featuredMatch.matchScore}%</div>
                                <div className={"Discover_matchLabel"}>Match Score</div>
                            </div>
                            <div className={"Discover_viabilityScore"}>
                                <div className={"Discover_viabilityNum"} style={{ color: getViabilityColor(featuredMatch.viability) }}>{featuredMatch.viability}%</div>
                                <div className={"Discover_viabilityLabel"}>Viability</div>
                            </div>
                            <div className={"Discover_featuredActions"}>
                                <button className={"Discover_applyBtn"} onClick={() => onNavigate('applications')}>
                                    <i className="fas fa-paper-plane"></i> Apply Now
                                </button>
                                <button className={"Discover_saveBtn"}><i className="fas fa-bookmark"></i></button>
                                <button className={"Discover_saveBtn"}><i className="fas fa-eye"></i></button>
                            </div>
                        </div>
                    </div>
                    <div className={"Discover_whyMatched"}>
                        <span className={"Discover_whyLabel"}>Why you matched:</span>
                        {featuredMatch.whyMatched.slice(0, 3).map((why, i) => (
                            <span key={i} className={"Discover_whyItem"}><i className="fas fa-check-circle"></i> {why}</span>
                        ))}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className={"Discover_filterBar"}>
                    <div className={"Discover_filterGroup"}>
                        <span className={"Discover_filterLabel"}><i className="fas fa-filter"></i> Industry:</span>
                        {filterOptions.industries.map((ind) => (
                            <button
                                key={ind}
                                className={`${"Discover_filterChip"} ${activeFilters.industry === ind ? "Discover_filterActive" : ''}`}
                                onClick={() => handleFilterChange('industry', ind)}
                            >
                                {ind}
                            </button>
                        ))}
                    </div>
                    <div className={"Discover_filterGroup"}>
                        <span className={"Discover_filterLabel"}><i className="fas fa-seedling"></i> Stage:</span>
                        {filterOptions.fundingStages.map((s) => (
                            <button
                                key={s}
                                className={`${"Discover_filterChip"} ${activeFilters.fundingStage === s ? "Discover_filterActive" : ''}`}
                                onClick={() => handleFilterChange('fundingStage', s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className={"Discover_filterGroup"}>
                        <span className={"Discover_filterLabel"}><i className="fas fa-chart-bar"></i> Viability:</span>
                        {filterOptions.viabilityRanges.map((range) => {
                            const labels = { '0-50': '<50%', '50-70': '50–70%', '70-85': '70–85%', '85-100': '85%+' };
                            return (
                                <button
                                    key={range}
                                    className={`${"Discover_filterChip"} ${activeFilters.viability === range ? "Discover_filterActive" : ''}`}
                                    onClick={() => handleFilterChange('viability', range)}
                                >
                                    {labels[range] || range}
                                </button>
                            );
                        })}
                    </div>
                    <div className={"Discover_filterGroup"}>
                        <span className={"Discover_filterLabel"}><i className="fas fa-code"></i> Tech Stack:</span>
                        {allTechStacks.map((tech) => (
                            <button
                                key={tech}
                                className={`${"Discover_filterChip"} ${activeFilters.techStack === tech ? "Discover_filterActive" : ''}`}
                                onClick={() => handleFilterChange('techStack', tech)}
                            >
                                {tech}
                            </button>
                        ))}
                    </div>
                    {Object.values(activeFilters).some(Boolean) && (
                        <div className={"Discover_filterGroup"}>
                            <button
                                className={"Discover_filterChip"}
                                style={{ borderColor: '#FF6B6B', color: '#FF6B6B' }}
                                onClick={() => { setActiveFilters({}); setFilteredOpportunities(opportunities); }}
                            >
                                <i className="fas fa-times"></i> Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Grid */}
                <div className={"Discover_mainGrid"}>
                    {/* Left: Opportunity List */}
                    <div className={"Discover_leftCol"}>
                        <div className={"Discover_sectionHeader"}>
                            <h3><i className="fas fa-list-ul"></i> All Opportunities</h3>
                            <span className={"Discover_resultCount"}>{filteredOpportunities.length} results</span>
                        </div>
                        <div className={"Discover_opportunitiesList"}>
                            {filteredOpportunities.length > 0 ? filteredOpportunities.map((opp) => (
                                <div
                                    key={opp.id}
                                    className={`${"Discover_oppCard"} ${selectedStartup?.id === opp.id ? "Discover_oppCardSelected" : ''}`}
                                    onClick={() => handleSelectStartup(opp)}
                                >
                                    <div className={"Discover_oppTop"}>
                                        <div className={"Discover_oppLeft"}>
                                            <div className={"Discover_oppLogo"}>{opp.logo}</div>
                                            <div>
                                                <div className={"Discover_oppName"}>{opp.name}</div>
                                                <div className={"Discover_oppFounder"}><i className="fas fa-user"></i> {opp.founder}</div>
                                            </div>
                                        </div>
                                        <div className={"Discover_oppRight"}>
                                            <span className={"Discover_oppMatch"}>{opp.matchScore || 80}% match</span>
                                            <span className={"Discover_oppViability"} style={{ color: getViabilityColor(opp.viability) }}>{opp.viability}% viable</span>
                                        </div>
                                    </div>
                                    <div className={"Discover_oppDesc"}>{opp.description}</div>
                                    <div className={"Discover_oppMeta"}>
                                        <span><i className="fas fa-industry"></i> {opp.industry}</span>
                                        <span><i className="fas fa-seedling"></i> {opp.stage}</span>
                                        <span><i className="fas fa-dollar-sign"></i> {opp.budget}</span>
                                        <span><i className="fas fa-users"></i> {opp.teamSize} team</span>
                                    </div>
                                    <div className={"Discover_oppTechTags"}>
                                        {opp.techStack.slice(0, 4).map((t, i) => <span key={i} className={"Discover_techTag"}>{t}</span>)}
                                    </div>
                                    <div className={"Discover_oppActions"}>
                                        <button className={"Discover_applyBtnSm"} onClick={(e) => { e.stopPropagation(); onNavigate('applications'); }}>
                                            <i className="fas fa-paper-plane"></i> Apply
                                        </button>
                                        <button className={"Discover_saveBtnSm"}><i className="fas fa-bookmark"></i> Save</button>
                                        <button className={"Discover_viewBtnSm"} onClick={(e) => { e.stopPropagation(); handleSelectStartup(opp); }}>
                                            <i className="fas fa-eye"></i> View Blueprint
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className={"Discover_emptyState"}>
                                    <div className={"Discover_emptyIcon"}>🔍</div>
                                    <h4>No opportunities match your filters.</h4>
                                    <p>Try adjusting your filters to see more options.</p>
                                    <button className={"Discover_resetBtn"} onClick={() => { setFilteredOpportunities(opportunities); setActiveFilters({}); }}>
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Blueprint Preview Panel */}
                    <div className={"Discover_rightCol"}>
                        {selectedStartup ? (
                            <div className={"Discover_blueprintPanel"}>
                                <div className={"Discover_bpHeader"}>
                                    <div className={"Discover_bpTitle"}>
                                        <span className={"Discover_bpLogo"}>{selectedStartup.logo}</span>
                                        <div>
                                            <div className={"Discover_bpName"}>{selectedStartup.name}</div>
                                            <div className={"Discover_bpStage"}>{selectedStartup.industry} · {selectedStartup.stage}</div>
                                        </div>
                                    </div>
                                    <button className={"Discover_closeBtn"} onClick={() => setSelectedStartup(null)}><i className="fas fa-times"></i></button>
                                </div>

                                <div className={"Discover_bpMetrics"}>
                                    <div className={"Discover_bpMetric"}>
                                        <div className={"Discover_bpMetricVal"} style={{ color: getViabilityColor(selectedStartup.viability) }}>{selectedStartup.viability}%</div>
                                        <div className={"Discover_bpMetricLabel"}>Viability</div>
                                    </div>
                                    <div className={"Discover_bpMetric"}>
                                        <div className={"Discover_bpMetricVal"}>{selectedStartup.metrics?.fundingReadiness || 75}%</div>
                                        <div className={"Discover_bpMetricLabel"}>Funding Ready</div>
                                    </div>
                                    <div className={"Discover_bpMetric"}>
                                        <div className={"Discover_bpMetricVal"}>{selectedStartup.metrics?.growthPotential || 80}%</div>
                                        <div className={"Discover_bpMetricLabel"}>Growth</div>
                                    </div>
                                </div>

                                <div className={"Discover_bpSection"}>
                                    <div className={"Discover_bpSectionTitle"}><i className="fas fa-align-left"></i> Description</div>
                                    <p className={"Discover_bpDesc"}>{selectedStartup.description}</p>
                                </div>

                                <div className={"Discover_bpSection"}>
                                    <div className={"Discover_bpSectionTitle"}><i className="fas fa-code"></i> Tech Stack</div>
                                    <div className={"Discover_bpTechTags"}>
                                        {selectedStartup.techStack.map((t, i) => <span key={i} className={"Discover_techTag"}>{t}</span>)}
                                    </div>
                                </div>

                                <div className={"Discover_bpSection"}>
                                    <div className={"Discover_bpSectionTitle"}><i className="fas fa-briefcase"></i> Open Roles</div>
                                    <div className={"Discover_bpRoles"}>
                                        {selectedStartup.roles?.map((r, i) => (
                                            <div key={i} className={"Discover_bpRole"}>
                                                <i className="fas fa-chevron-right"></i> {r}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={"Discover_bpSection"}>
                                    <div className={"Discover_bpSectionTitle"}><i className="fas fa-robot"></i> Why You Matched</div>
                                    <div className={"Discover_bpWhy"}>{selectedStartup.matchExplanation}</div>
                                </div>

                                <div className={"Discover_bpInfo"}>
                                    <div className={"Discover_bpInfoItem"}><i className="fas fa-users"></i> {selectedStartup.teamSize} members</div>
                                    <div className={"Discover_bpInfoItem"}><i className="fas fa-dollar-sign"></i> {selectedStartup.budget}</div>
                                    <div className={"Discover_bpInfoItem"}><i className="fas fa-user"></i> {selectedStartup.founder}</div>
                                </div>

                                <div className={"Discover_bpActions"}>
                                    <button className={"Discover_applyBtn"} onClick={() => onNavigate('applications')}>
                                        <i className="fas fa-paper-plane"></i> Apply Now
                                    </button>
                                    <button className={"Discover_saveBtn"}><i className="fas fa-bookmark"></i> Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className={"Discover_previewPlaceholder"}>
                                <div className={"Discover_placeholderIcon"}>📋</div>
                                <h4>Select a Startup</h4>
                                <p>Click any startup card to preview its full blueprint here.</p>
                            </div>
                        )}

                        {/* Trending Domains */}
                        <div className={"Discover_trendingBox"}>
                            <div className={"Discover_trendingTitle"}><i className="fas fa-chart-line" style={{ color: '#5BC8A0' }}></i> Trending Domains</div>
                            {trendingDomains.map((d) => (
                                <div key={d.id} className={"Discover_trendingItem"}>
                                    <div className={"Discover_trendingIcon"}>{d.name[0]}</div>
                                    <div className={"Discover_trendingInfo"}>
                                        <div className={"Discover_trendingName"}>{d.name}</div>
                                        <div className={"Discover_trendingBar"}>
                                            <div className={"Discover_trendingFill"} style={{ width: `${d.demand}%` }}></div>
                                        </div>
                                    </div>
                                    <div className={"Discover_trendingGrowth"}>↑{d.growth}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={"Discover_footer"}>
                    <span>Evolv · Discover Opportunities</span>
                    <div className={"Discover_footerRight"}>
                        <div className={"Discover_greenDot"}></div>
                        <span>© 2025 Evolv. All rights reserved.</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Discover;