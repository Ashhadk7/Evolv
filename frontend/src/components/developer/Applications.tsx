// @ts-nocheck
import React, { useState } from 'react';

import { Sidebar, Topbar, StatCard, ActionModal, FilterBar, InsightCard, InvitationCard, MatchCard, ProfileCard, ProjectCard, StartupCard, ApplicationCard, BlueprintPreview, FeaturedMatch, FeaturedMatchCard, DevOnboardingModal } from './shared';
import { discoverStats, featuredMatch, opportunities, filterOptions, trendingDomains, dashboardData } from './developerData';
const applicationsData = [
    {
        id: 1,
        startup: 'Nexus Health',
        logo: '🏥',
        role: 'AI Engineer',
        matchScore: 94,
        appliedDate: 'Jun 22, 2025',
        status: 'Interview',
        founder: 'Asad Ahmed',
        founderRole: 'CEO & Founder',
        industry: 'HealthTech',
        stage: 'Series A',
        budget: '$250K',
        teamSize: '8',
        nextAction: 'Technical Interview — Jun 28',
        description: 'AI-driven diagnostics platform for early-stage oncology detection, reducing false positives by 40%.',
        techStack: ['Python', 'FastAPI', 'AI/ML', 'React', 'Docker'],
        whyMatched: ['Strong Python & FastAPI expertise', 'AI/ML background aligns perfectly', 'Healthcare domain interest'],
        upcomingInterviews: [{ date: 'Jun 28, 2025', time: '2:00 PM', type: 'Technical Round' }],
        timeline: [
            { date: 'Jun 22', event: 'Application Submitted', icon: 'paper-plane', color: '#5BC8A0' },
            { date: 'Jun 23', event: 'Application Viewed by Founder', icon: 'eye', color: '#C4973A' },
            { date: 'Jun 24', event: 'Moved to Interview Stage', icon: 'comments', color: '#5BC8A0' },
            { date: 'Jun 28', event: 'Technical Interview Scheduled', icon: 'calendar', color: '#7C5CBF' },
        ],
    },
    {
        id: 2,
        startup: 'Aura Logistics',
        logo: '🚚',
        role: 'Full Stack Developer',
        matchScore: 88,
        appliedDate: 'Jun 21, 2025',
        status: 'Pending',
        founder: 'Priya Sharma',
        founderRole: 'CTO',
        industry: 'Logistics',
        stage: 'Seed',
        budget: '$120K',
        teamSize: '6',
        nextAction: 'Awaiting founder review',
        description: 'Last-mile delivery drone network utilizing autonomous navigation in suburban environments.',
        techStack: ['Node.js', 'React', 'AWS', 'Docker'],
        whyMatched: ['Node.js & React expertise', 'AWS cloud experience', 'Startup experience'],
        upcomingInterviews: [],
        timeline: [
            { date: 'Jun 21', event: 'Application Submitted', icon: 'paper-plane', color: '#5BC8A0' },
            { date: 'Jun 22', event: 'Under Review by Team', icon: 'search', color: '#C4973A' },
        ],
    },
    {
        id: 3,
        startup: 'FinFlow AI',
        logo: '💰',
        role: 'Backend Engineer',
        matchScore: 76,
        appliedDate: 'Jun 18, 2025',
        status: 'Accepted',
        founder: 'Usman Khan',
        founderRole: 'CEO',
        industry: 'FinTech',
        stage: 'Seed',
        budget: '$180K',
        teamSize: '7',
        nextAction: 'Sign offer letter',
        description: 'AI-powered financial analytics platform for small business owners.',
        techStack: ['Python', 'GraphQL', 'PostgreSQL', 'AWS'],
        whyMatched: ['Python expertise', 'GraphQL experience', 'FinTech domain knowledge'],
        upcomingInterviews: [],
        timeline: [
            { date: 'Jun 18', event: 'Application Submitted', icon: 'paper-plane', color: '#5BC8A0' },
            { date: 'Jun 19', event: 'Reviewed by Founder', icon: 'eye', color: '#C4973A' },
            { date: 'Jun 20', event: 'Culture Fit Interview', icon: 'comments', color: '#5BC8A0' },
            { date: 'Jun 22', event: 'Offer Extended 🎉', icon: 'check-circle', color: '#5BC8A0' },
        ],
    },
    {
        id: 4,
        startup: 'Veritas Energy',
        logo: '⚡',
        role: 'Blockchain Developer',
        matchScore: 82,
        appliedDate: 'Jun 12, 2025',
        status: 'Declined',
        founder: 'Fatima Ali',
        founderRole: 'CTO',
        industry: 'CleanTech',
        stage: 'MVP',
        budget: '$80K',
        teamSize: '4',
        nextAction: 'Explore similar opportunities',
        description: 'Decentralized micro-grid management software for residential solar cooperatives.',
        techStack: ['Python', 'Solidity', 'Blockchain', 'React'],
        whyMatched: ['Python skills', 'Blockchain interest', 'Clean energy passion'],
        upcomingInterviews: [],
        timeline: [
            { date: 'Jun 12', event: 'Application Submitted', icon: 'paper-plane', color: '#5BC8A0' },
            { date: 'Jun 14', event: 'Profile Reviewed', icon: 'eye', color: '#C4973A' },
            { date: 'Jun 16', event: 'Shortlisted by Founder', icon: 'bookmark', color: '#7C5CBF' },
            { date: 'Jun 18', event: 'Position Filled Internally', icon: 'times-circle', color: '#FF6B6B' },
        ],
    },
    {
        id: 5,
        startup: 'AgriTwin',
        logo: '🌱',
        role: 'Full Stack Developer',
        matchScore: 71,
        appliedDate: 'Jun 10, 2025',
        status: 'Withdrawn',
        founder: 'Ahmed Raza',
        founderRole: 'CEO',
        industry: 'EdTech',
        stage: 'Idea',
        budget: '$50K',
        teamSize: '3',
        nextAction: 'Application withdrawn by you',
        description: 'Digital twin platform for agricultural education and training.',
        techStack: ['React', 'Node.js', 'Three.js', 'PostgreSQL'],
        whyMatched: ['React & Node.js skills', '3D visualization experience'],
        upcomingInterviews: [],
        timeline: [
            { date: 'Jun 10', event: 'Application Submitted', icon: 'paper-plane', color: '#5BC8A0' },
            { date: 'Jun 15', event: 'Application Withdrawn', icon: 'undo', color: '#888' },
        ],
    },
];

const appStats = [
    { id: 1, label: 'Total Applications', value: '5', trend: '+3', trendUp: true },
    { id: 2, label: 'Pending', value: '1', trend: '+1', trendUp: true },
    { id: 3, label: 'Interviews', value: '1', trend: '+1', trendUp: true },
    { id: 4, label: 'Accepted', value: '1', trend: '+1', trendUp: true },
];

const statusConfig = {
    'Interview':    { color: '#7C5CBF', bg: 'rgba(124, 92, 191, 0.1)', icon: 'comments' },
    'Pending':      { color: '#C4973A', bg: 'rgba(196, 151, 58, 0.1)', icon: 'hourglass-half' },
    'Shortlisted':  { color: '#4A90D9', bg: 'rgba(74, 144, 217, 0.1)', icon: 'bookmark' },
    'Accepted':     { color: '#5BC8A0', bg: 'rgba(91, 200, 160, 0.1)', icon: 'check-circle' },
    'Declined':     { color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.1)', icon: 'times-circle' },
    'Withdrawn':    { color: '#888',    bg: 'rgba(136, 136, 136, 0.1)', icon: 'undo' },
    'Applied':      { color: '#5BC8A0', bg: 'rgba(91, 200, 160, 0.1)', icon: 'paper-plane' },
};

const pipelineStages = ['Applied', 'Pending', 'Shortlisted', 'Interview', 'Accepted', 'Declined', 'Withdrawn'];

const Applications = ({ onNavigate }) => {
    const [selectedApp, setSelectedApp] = useState(applicationsData[0]);
    const [filterStatus, setFilterStatus] = useState('All');

    const filtered = filterStatus === 'All'
        ? applicationsData
        : applicationsData.filter(a => a.status === filterStatus);

    return (
        <div className={"Applications_container"}>
            <Sidebar currentPage="applications" onNavigate={onNavigate} />
            <main className={"Applications_mainWrapper"}>
                <Topbar
                    title="My Applications"
                    subtitle="Track and manage your startup application pipeline."
                    onNavigate={onNavigate}
                />

                {/* KPI Cards */}
                <div className={"Applications_kpiRow"}>
                    {appStats.map((s) => <StatCard key={s.id} {...s} />)}
                </div>

                {/* Pipeline */}
                <div className={"Applications_pipeline"}>
                    {pipelineStages.map((stage) => {
                        const count = applicationsData.filter(a => a.status === stage).length;
                        const cfg = statusConfig[stage] || {};
                        return (
                            <div
                                key={stage}
                                className={`${"Applications_pipelineStage"} ${filterStatus === stage ? "Applications_pipelineActive" : ''}`}
                                onClick={() => setFilterStatus(filterStatus === stage ? 'All' : stage)}
                            >
                                <div className={"Applications_pipelineCount"} style={{ color: cfg.color }}>{count}</div>
                                <div className={"Applications_pipelineLabel"}>{stage}</div>
                                <div className={"Applications_pipelineDot"} style={{ background: cfg.color }}></div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className={"Applications_filterBar"}>
                    <span className={"Applications_filterLabel"}><i className="fas fa-filter"></i> Status:</span>
                    {['All', ...pipelineStages].map((s) => (
                        <button
                            key={s}
                            className={`${"Applications_filterChip"} ${filterStatus === s ? "Applications_filterActive" : ''}`}
                            onClick={() => setFilterStatus(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Main Layout */}
                <div className={"Applications_mainGrid"}>
                    {/* Left: Applications Table */}
                    <div className={"Applications_leftCol"}>
                        <div className={"Applications_tableWrap"}>
                            <div className={"Applications_tableHeader"}>
                                <span>Startup</span>
                                <span>Role</span>
                                <span>Match</span>
                                <span>Applied</span>
                                <span>Status</span>
                                <span>Next Action</span>
                            </div>
                            {filtered.map((app) => {
                                const cfg = statusConfig[app.status] || {};
                                return (
                                    <div
                                        key={app.id}
                                        className={`${"Applications_tableRow"} ${selectedApp?.id === app.id ? "Applications_rowSelected" : ''}`}
                                        onClick={() => setSelectedApp(app)}
                                    >
                                        <div className={"Applications_startupCell"}>
                                            <span className={"Applications_startupLogo"}>{app.logo}</span>
                                            <div>
                                                <div className={"Applications_startupName"}>{app.startup}</div>
                                                <div className={"Applications_startupIndustry"}>{app.industry}</div>
                                            </div>
                                        </div>
                                        <div className={"Applications_roleCell"}>{app.role}</div>
                                        <div className={"Applications_matchCell"}>
                                            <span className={"Applications_matchBadge"}>{app.matchScore}%</span>
                                        </div>
                                        <div className={"Applications_dateCell"}>{app.appliedDate}</div>
                                        <div className={"Applications_statusCell"}>
                                            <span className={"Applications_statusBadge"} style={{ color: cfg.color, background: cfg.bg }}>
                                                <i className={`fas fa-${cfg.icon}`}></i> {app.status}
                                            </span>
                                        </div>
                                        <div className={"Applications_nextCell"}>{app.nextAction}</div>
                                    </div>
                                );
                            })}
                            {filtered.length === 0 && (
                                <div className={"Applications_emptyRow"}>
                                    <div className={"Applications_emptyIcon"}>📋</div>
                                    <p>No applications found for this filter.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Application Detail Panel */}
                    {selectedApp && (
                        <div className={"Applications_detailPanel"}>
                            {/* Header */}
                            <div className={"Applications_dpHeader"}>
                                <div className={"Applications_dpLogo"}>{selectedApp.logo}</div>
                                <div className={"Applications_dpInfo"}>
                                    <div className={"Applications_dpStartup"}>{selectedApp.startup}</div>
                                    <div className={"Applications_dpRole"}>{selectedApp.role}</div>
                                    <div className={"Applications_dpMeta"}>
                                        <span><i className="fas fa-industry"></i> {selectedApp.industry}</span>
                                        <span><i className="fas fa-seedling"></i> {selectedApp.stage}</span>
                                    </div>
                                </div>
                                <div className={"Applications_dpMatch"}>{selectedApp.matchScore}%</div>
                            </div>

                            {/* Status Banner */}
                            <div className={"Applications_statusBanner"} style={{ background: statusConfig[selectedApp.status]?.bg, borderColor: statusConfig[selectedApp.status]?.color }}>
                                <i className={`fas fa-${statusConfig[selectedApp.status]?.icon}`} style={{ color: statusConfig[selectedApp.status]?.color }}></i>
                                <span style={{ color: statusConfig[selectedApp.status]?.color, fontWeight: 600, fontSize: '0.8rem' }}>
                                    {selectedApp.status}
                                </span>
                                <span className={"Applications_nextActionText"}>— {selectedApp.nextAction}</span>
                            </div>

                            {/* Description */}
                            <div className={"Applications_dpSection"}>
                                <div className={"Applications_dpSectionTitle"}><i className="fas fa-align-left"></i> Description</div>
                                <p className={"Applications_dpDesc"}>{selectedApp.description}</p>
                            </div>

                            {/* Why Matched */}
                            <div className={"Applications_dpSection"}>
                                <div className={"Applications_dpSectionTitle"}><i className="fas fa-robot"></i> Why Matched</div>
                                <div className={"Applications_whyList"}>
                                    {selectedApp.whyMatched.map((w, i) => (
                                        <div key={i} className={"Applications_whyItem"}>
                                            <i className="fas fa-check-circle"></i> {w}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div className={"Applications_dpSection"}>
                                <div className={"Applications_dpSectionTitle"}><i className="fas fa-code"></i> Tech Stack</div>
                                <div className={"Applications_techTags"}>
                                    {selectedApp.techStack.map((t, i) => (
                                        <span key={i} className={"Applications_techTag"}>{t}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Founder */}
                            <div className={"Applications_dpSection"}>
                                <div className={"Applications_dpSectionTitle"}><i className="fas fa-user"></i> Founder</div>
                                <div className={"Applications_founderCard"}>
                                    <div className={"Applications_founderAvatar"}>{selectedApp.founder[0]}</div>
                                    <div>
                                        <div className={"Applications_founderName"}>{selectedApp.founder}</div>
                                        <div className={"Applications_founderRole"}>{selectedApp.founderRole}</div>
                                    </div>
                                    <button className={"Applications_msgBtn"} onClick={() => onNavigate('inbox')}><i className="fas fa-comment" /> Message</button>
                                </div>
                            </div>

                            {/* Upcoming Interviews */}
                            {selectedApp.upcomingInterviews.length > 0 && (
                                <div className={"Applications_dpSection"}>
                                    <div className={"Applications_dpSectionTitle"}><i className="fas fa-calendar"></i> Upcoming Interviews</div>
                                    {selectedApp.upcomingInterviews.map((iv, i) => (
                                        <div key={i} className={"Applications_interviewCard"}>
                                            <div className={"Applications_ivDate"}>{iv.date}</div>
                                            <div className={"Applications_ivTime"}>{iv.time}</div>
                                            <div className={"Applications_ivType"}>{iv.type}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Activity Timeline */}
                            <div className={"Applications_dpSection"}>
                                <div className={"Applications_dpSectionTitle"}><i className="fas fa-history"></i> Activity Timeline</div>
                                <div className={"Applications_timeline"}>
                                    {selectedApp.timeline.map((ev, i) => (
                                        <div key={i} className={"Applications_timelineItem"}>
                                            <div className={"Applications_timelineLeft"}>
                                                <div className={"Applications_timelineDot"} style={{ background: ev.color, borderColor: ev.color }}>
                                                    <i className={`fas fa-${ev.icon}`} style={{ color: '#fff', fontSize: '0.45rem' }}></i>
                                                </div>
                                                {i < selectedApp.timeline.length - 1 && <div className={"Applications_timelineLine"}></div>}
                                            </div>
                                            <div className={"Applications_timelineContent"}>
                                                <div className={"Applications_timelineEvent"}>{ev.event}</div>
                                                <div className={"Applications_timelineDate"}>{ev.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Insight */}
                            <div className={"Applications_aiInsight"}>
                                <div className={"Applications_aiInsightLabel"}><i className="fas fa-robot"></i> AI Insight</div>
                                <p>Your profile is a strong match. Highlight your {selectedApp.techStack[0]} experience in the upcoming interview for maximum impact.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={"Applications_footer"}>
                    <span>Evolv · Applications</span>
                    <div className={"Applications_footerRight"}>
                        <div className={"Applications_greenDot"}></div>
                        <span>© 2025 Evolv. All rights reserved.</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Applications;
