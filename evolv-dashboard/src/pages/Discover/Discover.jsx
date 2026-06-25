import React, { useState } from 'react';
import styles from './Discover.module.css';
import { Sidebar, Topbar, StatCard } from '../../components';
import {
    discoverStats,
    featuredMatch,
    opportunities,
    filterOptions,
    trendingDomains,
} from '../../data/discoverData';

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
        <div className={styles.discoverContainer}>
            <Sidebar currentPage="discover" onNavigate={onNavigate} />
            <main className={styles.mainWrapper}>
                <Topbar
                    title="Discover Opportunities"
                    subtitle="AI-curated startup blueprints matched to your skills and career goals."
                    onNavigate={onNavigate}
                />

                {/* Stats Row */}
                <div className={styles.statsRow}>
                    {discoverStats.map((stat) => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </div>

                {/* Featured Match */}
                <div className={styles.featuredCard}>
                    <div className={styles.featuredBadge}>
                        <i className="fas fa-fire"></i> Featured AI Match
                    </div>
                    <div className={styles.featuredBody}>
                        <div className={styles.featuredLeft}>
                            <div className={styles.featuredLogo}>{featuredMatch.logo}</div>
                            <div>
                                <div className={styles.featuredName}>{featuredMatch.name}</div>
                                <div className={styles.featuredMeta}>
                                    <span className={styles.metaTag}><i className="fas fa-industry"></i> {featuredMatch.industry}</span>
                                    <span className={styles.metaTag}><i className="fas fa-seedling"></i> {featuredMatch.stage}</span>
                                    <span className={styles.metaTag}><i className="fas fa-users"></i> {featuredMatch.teamSize} team</span>
                                    <span className={styles.metaTag}><i className="fas fa-dollar-sign"></i> {featuredMatch.budget}</span>
                                </div>
                                <div className={styles.featuredDesc}>{featuredMatch.description}</div>
                                <div className={styles.techTags}>
                                    {featuredMatch.techStack.map((tech, i) => (
                                        <span key={i} className={styles.techTag}>{tech}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.featuredRight}>
                            <div className={styles.matchScore}>
                                <div className={styles.matchNum}>{featuredMatch.matchScore}%</div>
                                <div className={styles.matchLabel}>Match Score</div>
                            </div>
                            <div className={styles.viabilityScore}>
                                <div className={styles.viabilityNum} style={{ color: getViabilityColor(featuredMatch.viability) }}>{featuredMatch.viability}%</div>
                                <div className={styles.viabilityLabel}>Viability</div>
                            </div>
                            <div className={styles.featuredActions}>
                                <button className={styles.applyBtn} onClick={() => onNavigate('applications')}>
                                    <i className="fas fa-paper-plane"></i> Apply Now
                                </button>
                                <button className={styles.saveBtn}><i className="fas fa-bookmark"></i></button>
                                <button className={styles.saveBtn}><i className="fas fa-eye"></i></button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.whyMatched}>
                        <span className={styles.whyLabel}>Why you matched:</span>
                        {featuredMatch.whyMatched.slice(0, 3).map((why, i) => (
                            <span key={i} className={styles.whyItem}><i className="fas fa-check-circle"></i> {why}</span>
                        ))}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className={styles.filterBar}>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}><i className="fas fa-filter"></i> Industry:</span>
                        {filterOptions.industries.map((ind) => (
                            <button
                                key={ind}
                                className={`${styles.filterChip} ${activeFilters.industry === ind ? styles.filterActive : ''}`}
                                onClick={() => handleFilterChange('industry', ind)}
                            >
                                {ind}
                            </button>
                        ))}
                    </div>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}><i className="fas fa-seedling"></i> Stage:</span>
                        {filterOptions.fundingStages.map((s) => (
                            <button
                                key={s}
                                className={`${styles.filterChip} ${activeFilters.fundingStage === s ? styles.filterActive : ''}`}
                                onClick={() => handleFilterChange('fundingStage', s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}><i className="fas fa-chart-bar"></i> Viability:</span>
                        {filterOptions.viabilityRanges.map((range) => {
                            const labels = { '0-50': '<50%', '50-70': '50–70%', '70-85': '70–85%', '85-100': '85%+' };
                            return (
                                <button
                                    key={range}
                                    className={`${styles.filterChip} ${activeFilters.viability === range ? styles.filterActive : ''}`}
                                    onClick={() => handleFilterChange('viability', range)}
                                >
                                    {labels[range] || range}
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}><i className="fas fa-code"></i> Tech Stack:</span>
                        {allTechStacks.map((tech) => (
                            <button
                                key={tech}
                                className={`${styles.filterChip} ${activeFilters.techStack === tech ? styles.filterActive : ''}`}
                                onClick={() => handleFilterChange('techStack', tech)}
                            >
                                {tech}
                            </button>
                        ))}
                    </div>
                    {Object.values(activeFilters).some(Boolean) && (
                        <div className={styles.filterGroup}>
                            <button
                                className={styles.filterChip}
                                style={{ borderColor: '#FF6B6B', color: '#FF6B6B' }}
                                onClick={() => { setActiveFilters({}); setFilteredOpportunities(opportunities); }}
                            >
                                <i className="fas fa-times"></i> Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Grid */}
                <div className={styles.mainGrid}>
                    {/* Left: Opportunity List */}
                    <div className={styles.leftCol}>
                        <div className={styles.sectionHeader}>
                            <h3><i className="fas fa-list-ul"></i> All Opportunities</h3>
                            <span className={styles.resultCount}>{filteredOpportunities.length} results</span>
                        </div>
                        <div className={styles.opportunitiesList}>
                            {filteredOpportunities.length > 0 ? filteredOpportunities.map((opp) => (
                                <div
                                    key={opp.id}
                                    className={`${styles.oppCard} ${selectedStartup?.id === opp.id ? styles.oppCardSelected : ''}`}
                                    onClick={() => handleSelectStartup(opp)}
                                >
                                    <div className={styles.oppTop}>
                                        <div className={styles.oppLeft}>
                                            <div className={styles.oppLogo}>{opp.logo}</div>
                                            <div>
                                                <div className={styles.oppName}>{opp.name}</div>
                                                <div className={styles.oppFounder}><i className="fas fa-user"></i> {opp.founder}</div>
                                            </div>
                                        </div>
                                        <div className={styles.oppRight}>
                                            <span className={styles.oppMatch}>{opp.matchScore || 80}% match</span>
                                            <span className={styles.oppViability} style={{ color: getViabilityColor(opp.viability) }}>{opp.viability}% viable</span>
                                        </div>
                                    </div>
                                    <div className={styles.oppDesc}>{opp.description}</div>
                                    <div className={styles.oppMeta}>
                                        <span><i className="fas fa-industry"></i> {opp.industry}</span>
                                        <span><i className="fas fa-seedling"></i> {opp.stage}</span>
                                        <span><i className="fas fa-dollar-sign"></i> {opp.budget}</span>
                                        <span><i className="fas fa-users"></i> {opp.teamSize} team</span>
                                    </div>
                                    <div className={styles.oppTechTags}>
                                        {opp.techStack.slice(0, 4).map((t, i) => <span key={i} className={styles.techTag}>{t}</span>)}
                                    </div>
                                    <div className={styles.oppActions}>
                                        <button className={styles.applyBtnSm} onClick={(e) => { e.stopPropagation(); onNavigate('applications'); }}>
                                            <i className="fas fa-paper-plane"></i> Apply
                                        </button>
                                        <button className={styles.saveBtnSm}><i className="fas fa-bookmark"></i> Save</button>
                                        <button className={styles.viewBtnSm} onClick={(e) => { e.stopPropagation(); handleSelectStartup(opp); }}>
                                            <i className="fas fa-eye"></i> View Blueprint
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>🔍</div>
                                    <h4>No opportunities match your filters.</h4>
                                    <p>Try adjusting your filters to see more options.</p>
                                    <button className={styles.resetBtn} onClick={() => { setFilteredOpportunities(opportunities); setActiveFilters({}); }}>
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Blueprint Preview Panel */}
                    <div className={styles.rightCol}>
                        {selectedStartup ? (
                            <div className={styles.blueprintPanel}>
                                <div className={styles.bpHeader}>
                                    <div className={styles.bpTitle}>
                                        <span className={styles.bpLogo}>{selectedStartup.logo}</span>
                                        <div>
                                            <div className={styles.bpName}>{selectedStartup.name}</div>
                                            <div className={styles.bpStage}>{selectedStartup.industry} · {selectedStartup.stage}</div>
                                        </div>
                                    </div>
                                    <button className={styles.closeBtn} onClick={() => setSelectedStartup(null)}><i className="fas fa-times"></i></button>
                                </div>

                                <div className={styles.bpMetrics}>
                                    <div className={styles.bpMetric}>
                                        <div className={styles.bpMetricVal} style={{ color: getViabilityColor(selectedStartup.viability) }}>{selectedStartup.viability}%</div>
                                        <div className={styles.bpMetricLabel}>Viability</div>
                                    </div>
                                    <div className={styles.bpMetric}>
                                        <div className={styles.bpMetricVal}>{selectedStartup.metrics?.fundingReadiness || 75}%</div>
                                        <div className={styles.bpMetricLabel}>Funding Ready</div>
                                    </div>
                                    <div className={styles.bpMetric}>
                                        <div className={styles.bpMetricVal}>{selectedStartup.metrics?.growthPotential || 80}%</div>
                                        <div className={styles.bpMetricLabel}>Growth</div>
                                    </div>
                                </div>

                                <div className={styles.bpSection}>
                                    <div className={styles.bpSectionTitle}><i className="fas fa-align-left"></i> Description</div>
                                    <p className={styles.bpDesc}>{selectedStartup.description}</p>
                                </div>

                                <div className={styles.bpSection}>
                                    <div className={styles.bpSectionTitle}><i className="fas fa-code"></i> Tech Stack</div>
                                    <div className={styles.bpTechTags}>
                                        {selectedStartup.techStack.map((t, i) => <span key={i} className={styles.techTag}>{t}</span>)}
                                    </div>
                                </div>

                                <div className={styles.bpSection}>
                                    <div className={styles.bpSectionTitle}><i className="fas fa-briefcase"></i> Open Roles</div>
                                    <div className={styles.bpRoles}>
                                        {selectedStartup.roles?.map((r, i) => (
                                            <div key={i} className={styles.bpRole}>
                                                <i className="fas fa-chevron-right"></i> {r}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.bpSection}>
                                    <div className={styles.bpSectionTitle}><i className="fas fa-robot"></i> Why You Matched</div>
                                    <div className={styles.bpWhy}>{selectedStartup.matchExplanation}</div>
                                </div>

                                <div className={styles.bpInfo}>
                                    <div className={styles.bpInfoItem}><i className="fas fa-users"></i> {selectedStartup.teamSize} members</div>
                                    <div className={styles.bpInfoItem}><i className="fas fa-dollar-sign"></i> {selectedStartup.budget}</div>
                                    <div className={styles.bpInfoItem}><i className="fas fa-user"></i> {selectedStartup.founder}</div>
                                </div>

                                <div className={styles.bpActions}>
                                    <button className={styles.applyBtn} onClick={() => onNavigate('applications')}>
                                        <i className="fas fa-paper-plane"></i> Apply Now
                                    </button>
                                    <button className={styles.saveBtn}><i className="fas fa-bookmark"></i> Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.previewPlaceholder}>
                                <div className={styles.placeholderIcon}>📋</div>
                                <h4>Select a Startup</h4>
                                <p>Click any startup card to preview its full blueprint here.</p>
                            </div>
                        )}

                        {/* Trending Domains */}
                        <div className={styles.trendingBox}>
                            <div className={styles.trendingTitle}><i className="fas fa-chart-line" style={{ color: '#5BC8A0' }}></i> Trending Domains</div>
                            {trendingDomains.map((d) => (
                                <div key={d.id} className={styles.trendingItem}>
                                    <div className={styles.trendingIcon}>{d.name[0]}</div>
                                    <div className={styles.trendingInfo}>
                                        <div className={styles.trendingName}>{d.name}</div>
                                        <div className={styles.trendingBar}>
                                            <div className={styles.trendingFill} style={{ width: `${d.demand}%` }}></div>
                                        </div>
                                    </div>
                                    <div className={styles.trendingGrowth}>↑{d.growth}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
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