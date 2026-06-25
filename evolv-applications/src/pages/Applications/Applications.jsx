import React, { useState } from 'react';
import styles from './Applications.module.css';
import {
    Sidebar,
    Topbar,
    StatCard,
    ApplicationTable,
    ApplicationDetailPanel,
    PipelineSection,
    UpcomingInterviews,
    ActivityTimeline,
    FilterBar,
} from '../../components';
import {
    statsData,
    pipelineData,
    applications,
    insights,
    activityData,
    filterOptions,
} from '../../data/applicationsData';

const Applications = () => {
    const [selectedApp, setSelectedApp] = useState(null);
    const [filteredApps, setFilteredApps] = useState(applications);

    const handleFilterChange = (filters) => {
        let filtered = [...applications];

        if (filters.status && filters.status !== 'All Statuses') {
            filtered = filtered.filter((app) => app.status === filters.status);
        }
        if (filters.industry && filters.industry !== 'All Industries') {
            filtered = filtered.filter((app) => app.industry === filters.industry);
        }
        if (filters.fundingStage && filters.fundingStage !== 'All Stages') {
            filtered = filtered.filter((app) => app.stage === filters.fundingStage);
        }
        if (filters.matchScore && filters.matchScore !== 'All Scores') {
            const minScore = parseInt(filters.matchScore);
            filtered = filtered.filter((app) => app.matchScore >= minScore);
        }

        setFilteredApps(filtered);
    };

    const handleSelectApplication = (app) => {
        setSelectedApp(app);
    };

    return (
        <div className={styles.applicationsContainer}>
            <Sidebar />
            <main className={styles.mainWrapper}>
                <Topbar />

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Applications</h1>
                    <p className={styles.subtitle}>
                        Track every startup opportunity you've applied to and monitor your progress through the hiring pipeline.
                    </p>
                </div>

                {/* Stats Row */}
                <div className={styles.statsRow}>
                    {statsData.map((stat) => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </div>

                {/* Pipeline Section */}
                <PipelineSection data={pipelineData} />

                {/* Filter Bar */}
                <FilterBar options={filterOptions} onFilterChange={handleFilterChange} />

                {/* Main Grid */}
                <div className={styles.mainGrid}>
                    {/* Left Column - Applications Table */}
                    <div className={styles.leftCol}>
                        <ApplicationTable
                            applications={filteredApps}
                            onSelect={handleSelectApplication}
                            selectedId={selectedApp?.id}
                        />
                    </div>

                    {/* Right Column - Detail Panel */}
                    <div className={styles.rightCol}>
                        {selectedApp ? (
                            <ApplicationDetailPanel application={selectedApp} />
                        ) : (
                            <div className={styles.previewPlaceholder}>
                                <div className={styles.placeholderIcon}>📋</div>
                                <h4>Select an application</h4>
                                <p>Click on any application row to view detailed information here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Interviews */}
                <UpcomingInterviews applications={applications} />

                {/* Two Column: Activity + Insights */}
                <div className={styles.bottomGrid}>
                    <ActivityTimeline activities={activityData} />
                    <div className={styles.insightsWrapper}>
                        <div className={styles.insightsHeader}>
                            <h3><i className="fas fa-brain" style={{ color: '#5BC8A0' }}></i> AI Insights</h3>
                        </div>
                        {insights.map((insight, index) => (
                            <div key={index} className={styles.insightItem}>
                                <div className={styles.insightIcon}>
                                    <i className="fas fa-lightbulb"></i>
                                </div>
                                <div className={styles.insightText}>{insight}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <span>Evolv · Applications</span>
                    <div className={styles.footerRight}>
                        <div className={styles.greenDot}></div>
                        <span>© 2025 Evolv. All rights reserved.</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Applications;