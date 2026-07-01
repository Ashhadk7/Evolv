// @ts-nocheck
import React, { useState } from 'react';

import { Sidebar, Topbar, StatCard, ActionModal, FilterBar, InsightCard, InvitationCard, MatchCard, ProfileCard, ProjectCard, StartupCard, ApplicationCard, BlueprintPreview, FeaturedMatch, FeaturedMatchCard, DevOnboardingModal } from './shared';
import { discoverStats, featuredMatch, opportunities, filterOptions, trendingDomains, dashboardData } from './developerData';
const projectsData = [
    {
        id: 1,
        name: 'Nexus Health',
        logo: 'NH',
        role: 'AI Engineer',
        industry: 'HealthTech',
        stage: 'Development',
        progress: 78,
        progressColor: '#5BC8A0',
        team: ['A', 'B', 'C', 'D', 'E'],
        deadline: 'Jul 14, 2025',
        hoursLogged: 24,
        hoursTotal: 40,
        milestones: [
            { id: 1, label: 'MVP', done: true },
            { id: 2, label: 'Beta', done: true },
            { id: 3, label: 'Investor Demo', done: false },
            { id: 4, label: 'Launch', done: false },
        ],
        kanban: {
            'To Do':     ['Set up CI/CD pipeline', 'Write unit tests for API layer', 'Design system doc'],
            'In Progress': ['AI model integration', 'Dashboard UI components'],
            'Review':    ['User authentication module', 'Data export feature'],
            'Completed': ['Project scaffolding', 'Database schema design', 'API endpoints v1'],
        },
        recentActivity: [
            { event: 'Sarah pushed 3 commits to feature/ai-model', time: '2h ago', icon: 'code-branch' },
            { event: 'PR #14 merged by Asad Ahmed', time: '5h ago', icon: 'code-merge' },
            { event: 'Weekly sync meeting completed', time: '1d ago', icon: 'video' },
        ],
        upcomingDeadlines: [
            { label: 'Investor Demo Build', date: 'Jun 30, 2025', urgency: 'urgent' },
            { label: 'Beta Release', date: 'Jul 5, 2025', urgency: 'normal' },
        ],
    },
    {
        id: 2,
        name: 'Aura Logistics',
        logo: 'AL',
        role: 'Full Stack Developer',
        industry: 'Logistics',
        stage: 'Development',
        progress: 42,
        progressColor: '#C4973A',
        team: ['E', 'F', 'G', 'H'],
        deadline: 'Jul 28, 2025',
        hoursLogged: 64,
        hoursTotal: 120,
        milestones: [
            { id: 1, label: 'MVP', done: true },
            { id: 2, label: 'Beta', done: false },
            { id: 3, label: 'Investor Demo', done: false },
            { id: 4, label: 'Launch', done: false },
        ],
        kanban: {
            'To Do':     ['Drone route optimization', 'Payment integration', 'Analytics dashboard', 'Load testing'],
            'In Progress': ['Real-time tracking UI', 'API rate limiting'],
            'Review':    ['Driver app module'],
            'Completed': ['Project setup', 'Core API v1', 'User auth'],
        },
        recentActivity: [
            { event: 'New task added: Load testing', time: '1h ago', icon: 'plus-circle' },
            { event: 'Bug #42 resolved in tracking UI', time: '4h ago', icon: 'bug' },
            { event: 'Priya updated project timeline', time: '1d ago', icon: 'calendar-alt' },
        ],
        upcomingDeadlines: [
            { label: 'Real-time Tracking MVP', date: 'Jul 10, 2025', urgency: 'normal' },
            { label: 'Beta Release', date: 'Jul 20, 2025', urgency: 'normal' },
        ],
    },
];

const projectStats = [
    { id: 1, label: 'Active Projects', value: '2', trend: '+1', trendUp: true },
    { id: 2, label: 'Completed Tasks', value: '6', trend: '+4', trendUp: true },
    { id: 3, label: 'Hours Logged', value: '88', trend: '+12', trendUp: true },
    { id: 4, label: 'Upcoming Deadlines', value: '4', trend: '-1', trendUp: false },
];

const kanbanColors = {
    'To Do':       { bg: '#F7F6F3', border: '#E6E0D7', dot: '#888' },
    'In Progress': { bg: '#FFF8EC', border: '#F3D68B', dot: '#C4973A' },
    'Review':      { bg: '#EEF0FF', border: '#B6BDF7', dot: '#7C5CBF' },
    'Completed':   { bg: '#EAF5F0', border: '#8FD8BE', dot: '#5BC8A0' },
};

const avatarColors = ['#5BC8A0', '#C4973A', '#FF6B6B', '#7C5CBF', '#4A90D9'];

const Projects = ({ onNavigate }) => {
    const [selectedProject, setSelectedProject] = useState(projectsData[0]);

    return (
        <div className={"Projects_container"}>
            <main className={"Projects_mainWrapper"}>
                <Topbar
                    title="My Projects"
                    subtitle="Manage active startup engagements and track progress."
                    onNavigate={onNavigate}
                />

                {/* KPI Row */}
                <div className={"Projects_kpiRow"}>
                    {projectStats.map((s) => <StatCard key={s.id} {...s} />)}
                </div>

                {/* Project Cards */}
                <div className={"Projects_projectCardsRow"}>
                    {projectsData.map((project) => (
                        <div
                            key={project.id}
                            className={`${"Projects_projectCard"} ${selectedProject?.id === project.id ? "Projects_projectCardActive" : ''}`}
                            onClick={() => setSelectedProject(project)}
                        >
                            <div className={"Projects_pcHeader"}>
                                <div className={"Projects_pcLeft"}>
                                    <span className={"Projects_pcLogo"}>{project.logo}</span>
                                    <div>
                                        <div className={"Projects_pcName"}>{project.name}</div>
                                        <div className={"Projects_pcRole"}>{project.role}</div>
                                    </div>
                                </div>
                                <div className={"Projects_pcProgress"} style={{ color: project.progressColor }}>{project.progress}%</div>
                            </div>
                            <div className={"Projects_progressBarWrap"}>
                                <div className={"Projects_progressBar"} style={{ width: `${project.progress}%`, background: project.progressColor }}></div>
                            </div>
                            <div className={"Projects_pcMeta"}>
                                <div className={"Projects_pcTeam"}>
                                    {project.team.slice(0, 3).map((m, i) => (
                                        <div key={i} className={"Projects_teamAvatar"} style={{ background: avatarColors[i] }}>{m}</div>
                                    ))}
                                    {project.team.length > 3 && (
                                        <div className={"Projects_teamAvatarExtra"}>+{project.team.length - 3}</div>
                                    )}
                                </div>
                                <div className={"Projects_pcStats"}>
                                    <span><i className="fas fa-calendar"></i> {project.deadline}</span>
                                    <span><i className="fas fa-clock"></i> {project.hoursLogged}h / {project.hoursTotal}h</span>
                                </div>
                            </div>
                            <div className={"Projects_milestones"}>
                                {project.milestones.map((m) => (
                                    <div key={m.id} className={`${"Projects_milestone"} ${m.done ? "Projects_milestoneDone" : ''}`}>
                                        <div className={"Projects_milestoneDot"}>
                                            {m.done ? <i className="fas fa-check"></i> : ''}
                                        </div>
                                        <span>{m.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Kanban + Sidebar */}
                {selectedProject && (
                    <div className={"Projects_kanbanSection"}>
                        <div className={"Projects_sectionHeader"}>
                            <h3>
                                <span className={"Projects_kanbanLogo"}>{selectedProject.logo}</span>
                                {selectedProject.name} — Kanban Board
                            </h3>
                            <div className={"Projects_sectionRight"}>
                                <span className={"Projects_stageTag"}>{selectedProject.stage}</span>
                            </div>
                        </div>

                        <div className={"Projects_kanbanLayout"}>
                            <div className={"Projects_kanbanBoard"}>
                                {Object.entries(selectedProject.kanban).map(([col, tasks]) => {
                                    const cfg = kanbanColors[col];
                                    return (
                                        <div key={col} className={"Projects_kanbanCol"} style={{ borderColor: cfg.border }}>
                                            <div className={"Projects_kanbanColHeader"} style={{ background: cfg.bg }}>
                                                <span className={"Projects_kanbanDot"} style={{ background: cfg.dot }}></span>
                                                <span className={"Projects_kanbanColName"}>{col}</span>
                                                <span className={"Projects_kanbanCount"}>{tasks.length}</span>
                                            </div>
                                            <div className={"Projects_kanbanTasks"}>
                                                {tasks.map((task, i) => (
                                                    <div key={i} className={"Projects_kanbanTask"}>
                                                        <div className={"Projects_taskCheck"} style={{ borderColor: cfg.dot }}>
                                                            {col === 'Completed' && <i className="fas fa-check" style={{ color: cfg.dot, fontSize: '0.45rem' }}></i>}
                                                        </div>
                                                        <span className={"Projects_taskLabel"}>{task}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={"Projects_kanbanSide"}>
                                {/* Time Tracking */}
                                <div className={"Projects_sideCard"}>
                                    <div className={"Projects_sideCardTitle"}><i className="fas fa-clock"></i> Time Tracking</div>
                                    <div className={"Projects_timeDisplay"}>
                                        <div className={"Projects_timeNum"}>{selectedProject.hoursLogged}h</div>
                                        <div className={"Projects_timeSub"}>of {selectedProject.hoursTotal}h logged</div>
                                    </div>
                                    <div className={"Projects_timeBarWrap"}>
                                        <div className={"Projects_timeBar"} style={{ width: `${(selectedProject.hoursLogged / selectedProject.hoursTotal) * 100}%`, background: selectedProject.progressColor }}></div>
                                    </div>
                                    <div className={"Projects_timePercent"}>{Math.round((selectedProject.hoursLogged / selectedProject.hoursTotal) * 100)}% of budget used</div>
                                </div>

                                {/* Recent Activity */}
                                <div className={"Projects_sideCard"}>
                                    <div className={"Projects_sideCardTitle"}><i className="fas fa-history"></i> Recent Activity</div>
                                    <div className={"Projects_activityList"}>
                                        {selectedProject.recentActivity.map((a, i) => (
                                            <div key={i} className={"Projects_activityItem"}>
                                                <div className={"Projects_activityIcon"}>
                                                    <i className={`fas fa-${a.icon}`}></i>
                                                </div>
                                                <div className={"Projects_activityContent"}>
                                                    <div className={"Projects_activityEvent"}>{a.event}</div>
                                                    <div className={"Projects_activityTime"}>{a.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Upcoming Deadlines */}
                                <div className={"Projects_sideCard"}>
                                    <div className={"Projects_sideCardTitle"}><i className="fas fa-flag"></i> Upcoming Deadlines</div>
                                    <div className={"Projects_deadlineList"}>
                                        {selectedProject.upcomingDeadlines.map((d, i) => (
                                            <div key={i} className={`${"Projects_deadlineItem"} ${d.urgency === 'urgent' ? "Projects_deadlineUrgent" : ''}`}>
                                                <div className={"Projects_deadlineLabel"}>{d.label}</div>
                                                <div className={"Projects_deadlineDate"}>
                                                    <i className="fas fa-calendar-alt"></i> {d.date}
                                                    {d.urgency === 'urgent' && <span className={"Projects_urgentTag"}>Urgent</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className={"Projects_footer"}>
                    <span>Evolv · Projects</span>
                    <div className={"Projects_footerRight"}>
                        <div className={"Projects_greenDot"}></div>
                        <span>© 2025 Evolv. All rights reserved.</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Projects;
