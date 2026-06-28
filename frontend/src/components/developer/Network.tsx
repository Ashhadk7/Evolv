// @ts-nocheck
import React, { useState } from 'react';

import { Sidebar, Topbar, StatCard, ActionModal, FilterBar, InsightCard, InvitationCard, MatchCard, ProfileCard, ProjectCard, StartupCard, ApplicationCard, BlueprintPreview, FeaturedMatch, FeaturedMatchCard, DevOnboardingModal } from './shared';
import { discoverStats, featuredMatch, opportunities, filterOptions, trendingDomains, dashboardData } from './developerData';
const networkStats = [
    { id: 1, label: 'Total Connections', value: '142', trend: '+8', trendUp: true },
    { id: 2, label: 'Founder Connections', value: '38', trend: '+3', trendUp: true },
    { id: 3, label: 'Developer Connections', value: '94', trend: '+5', trendUp: true },
    { id: 4, label: 'Pending Requests', value: '7', trend: '+2', trendUp: true },
];

const connections = [
    {
        id: 1,
        name: 'Asad Ahmed',
        role: 'CEO & Founder',
        company: 'Nexus Health',
        type: 'Founder',
        avatar: 'A',
        avatarColor: '#5BC8A0',
        skills: ['AI/ML', 'Product'],
        experience: '7 years',
        mutual: 12,
        location: 'Islamabad, PK',
        connected: true,
    },
    {
        id: 2,
        name: 'Priya Sharma',
        role: 'CTO',
        company: 'FinFlow AI',
        type: 'Founder',
        avatar: 'P',
        avatarColor: '#C4973A',
        skills: ['FinTech', 'Python'],
        experience: '9 years',
        mutual: 8,
        location: 'Mumbai, IN',
        connected: true,
    },
    {
        id: 3,
        name: 'Jake Rivers',
        role: 'Full Stack Developer',
        company: 'Freelance',
        type: 'Developer',
        avatar: 'J',
        avatarColor: '#7C5CBF',
        skills: ['React', 'Node.js', 'AWS'],
        experience: '5 years',
        mutual: 6,
        location: 'London, UK',
        connected: true,
    },
    {
        id: 4,
        name: 'Fatima Ali',
        role: 'Blockchain Developer',
        company: 'Veritas Energy',
        type: 'Developer',
        avatar: 'F',
        avatarColor: '#FF6B6B',
        skills: ['Solidity', 'Web3', 'Python'],
        experience: '4 years',
        mutual: 4,
        location: 'Lahore, PK',
        connected: true,
    },
    {
        id: 5,
        name: 'Omar Khalid',
        role: 'ML Engineer',
        company: 'AgriTwin',
        type: 'Developer',
        avatar: 'O',
        avatarColor: '#4A90D9',
        skills: ['Python', 'TensorFlow', 'PyTorch'],
        experience: '6 years',
        mutual: 3,
        location: 'Dubai, UAE',
        connected: false,
    },
    {
        id: 6,
        name: 'Rania Hassan',
        role: 'CEO & Founder',
        company: 'MediConnect',
        type: 'Founder',
        avatar: 'R',
        avatarColor: '#E8A87C',
        skills: ['HealthTech', 'Product', 'AI'],
        experience: '10 years',
        mutual: 15,
        location: 'Cairo, EG',
        connected: false,
    },
    {
        id: 7,
        name: 'Dev Patel',
        role: 'Backend Engineer',
        company: 'Aura Logistics',
        type: 'Developer',
        avatar: 'D',
        avatarColor: '#5BC8A0',
        skills: ['Go', 'Kubernetes', 'PostgreSQL'],
        experience: '5 years',
        mutual: 9,
        location: 'Bangalore, IN',
        connected: true,
    },
    {
        id: 8,
        name: 'Sofia Reyes',
        role: 'Product Manager',
        company: 'Veritas Energy',
        type: 'Founder',
        avatar: 'S',
        avatarColor: '#F7B731',
        skills: ['CleanTech', 'Roadmapping'],
        experience: '8 years',
        mutual: 5,
        location: 'Mexico City, MX',
        connected: false,
    },
];

const connectionRequests = [
    { id: 101, name: 'Usman Khan', role: 'CTO', company: 'PayEase', avatar: 'U', avatarColor: '#5BC8A0', mutual: 4 },
    { id: 102, name: 'Layla Nasser', role: 'AI Researcher', company: 'Stealth', avatar: 'L', avatarColor: '#C4973A', mutual: 7 },
    { id: 103, name: 'Chen Wei', role: 'Founder', company: 'DataSync', avatar: 'C', avatarColor: '#7C5CBF', mutual: 2 },
];

const activityFeed = [
    { id: 1, actor: 'Asad Ahmed', action: 'viewed your profile', time: '10 min ago', avatar: 'A', color: '#5BC8A0' },
    { id: 2, actor: 'Priya Sharma', action: 'connected with you', time: '2h ago', avatar: 'P', color: '#C4973A' },
    { id: 3, actor: 'Jake Rivers', action: 'endorsed your React skill', time: '5h ago', avatar: 'J', color: '#7C5CBF' },
    { id: 4, actor: 'Rania Hassan', action: 'sent you a connection request', time: '1d ago', avatar: 'R', color: '#E8A87C' },
    { id: 5, actor: 'Dev Patel', action: 'liked your portfolio project', time: '2d ago', avatar: 'D', color: '#5BC8A0' },
];

const Network = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [connected, setConnected] = useState(
        connections.reduce((acc, c) => ({ ...acc, [c.id]: c.connected }), {})
    );
    const [pendingRequests, setPendingRequests] = useState(connectionRequests);

    const tabs = ['all', 'founders', 'developers'];

    const filteredConnections = connections.filter((c) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'founders') return c.type === 'Founder';
        if (activeTab === 'developers') return c.type === 'Developer';
        return true;
    });

    const handleConnect = (id) => {
        setConnected((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAcceptRequest = (id) => {
        setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    };

    return (
        <div className={"Network_container"}>
            <main className={"Network_mainWrapper"}>
                <Topbar
                    title="My Network"
                    subtitle="Build and grow your professional ecosystem."
                    onNavigate={onNavigate}
                />

                {/* KPI Cards */}
                <div className={"Network_kpiRow"}>
                    {networkStats.map((s) => <StatCard key={s.id} {...s} />)}
                </div>

                {/* Main Grid */}
                <div className={"Network_mainGrid"}>
                    {/* Left: Connections */}
                    <div className={"Network_leftCol"}>
                        {/* Connection Requests */}
                        {pendingRequests.length > 0 && (
                            <div className={"Network_requestsBox"}>
                                <div className={"Network_boxTitle"}>
                                    <i className="fas fa-user-plus"></i>
                                    Connection Requests
                                    <span className={"Network_requestCount"}>{pendingRequests.length}</span>
                                </div>
                                <div className={"Network_requestList"}>
                                    {pendingRequests.map((req) => (
                                        <div key={req.id} className={"Network_requestCard"}>
                                            <div className={"Network_reqAvatar"} style={{ background: req.avatarColor }}>{req.avatar}</div>
                                            <div className={"Network_reqInfo"}>
                                                <div className={"Network_reqName"}>{req.name}</div>
                                                <div className={"Network_reqRole"}>{req.role} · {req.company}</div>
                                                <div className={"Network_reqMutual"}><i className="fas fa-users"></i> {req.mutual} mutual connections</div>
                                            </div>
                                            <div className={"Network_reqActions"}>
                                                <button className={"Network_acceptBtn"} onClick={() => handleAcceptRequest(req.id)}>Accept</button>
                                                <button className={"Network_ignoreBtn"} onClick={() => handleAcceptRequest(req.id)}>Ignore</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className={"Network_tabs"}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={`${"Network_tab"} ${activeTab === tab ? "Network_tabActive" : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    <span className={"Network_tabCount"}>
                                        {tab === 'all' ? connections.length : connections.filter(c => c.type === (tab === 'founders' ? 'Founder' : 'Developer')).length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Connections Grid */}
                        <div className={"Network_connectionsGrid"}>
                            {filteredConnections.map((conn) => (
                                <div key={conn.id} className={"Network_connectionCard"}>
                                    <div className={"Network_ccTop"}>
                                        <div className={"Network_ccAvatar"} style={{ background: conn.avatarColor }}>{conn.avatar}</div>
                                        <div className={"Network_ccInfo"}>
                                            <div className={"Network_ccName"}>{conn.name}</div>
                                            <div className={"Network_ccRole"}>{conn.role}</div>
                                            <div className={"Network_ccCompany"}><i className="fas fa-building"></i> {conn.company}</div>
                                        </div>
                                        <span className={`${"Network_typeTag"} ${conn.type === 'Founder' ? "Network_founderTag" : "Network_devTag"}`}>
                                            {conn.type}
                                        </span>
                                    </div>
                                    <div className={"Network_ccMeta"}>
                                        <span><i className="fas fa-map-marker-alt"></i> {conn.location}</span>
                                        <span><i className="fas fa-briefcase"></i> {conn.experience}</span>
                                        <span><i className="fas fa-users"></i> {conn.mutual} mutual</span>
                                    </div>
                                    <div className={"Network_ccSkills"}>
                                        {conn.skills.map((s, i) => (
                                            <span key={i} className={"Network_skillTag"}>{s}</span>
                                        ))}
                                    </div>
                                    <div className={"Network_ccActions"}>
                                        <button
                                            className={connected[conn.id] ? "Network_connectedBtn" : "Network_connectBtn"}
                                            onClick={() => handleConnect(conn.id)}
                                        >
                                            <i className={`fas fa-${connected[conn.id] ? 'check' : 'user-plus'}`}></i>
                                            {connected[conn.id] ? 'Connected' : 'Connect'}
                                        </button>
                                        <button className={"Network_msgBtn"} onClick={() => onNavigate('inbox')}>
                                            <i className="fas fa-comment-alt"></i> Message
                                        </button>
                                        <button className={"Network_profileBtn"}>
                                            <i className="fas fa-external-link-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Activity Feed + Recommended */}
                    <div className={"Network_rightCol"}>
                        {/* Activity Feed */}
                        <div className={"Network_sideCard"}>
                            <div className={"Network_sideCardTitle"}><i className="fas fa-bolt"></i> Activity Feed</div>
                            <div className={"Network_feedList"}>
                                {activityFeed.map((item) => (
                                    <div key={item.id} className={"Network_feedItem"}>
                                        <div className={"Network_feedAvatar"} style={{ background: item.color }}>{item.avatar}</div>
                                        <div className={"Network_feedContent"}>
                                            <div className={"Network_feedText"}>
                                                <strong>{item.actor}</strong> {item.action}
                                            </div>
                                            <div className={"Network_feedTime"}>{item.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommended */}
                        <div className={"Network_sideCard"}>
                            <div className={"Network_sideCardTitle"}><i className="fas fa-star"></i> Recommended for You</div>
                            <div className={"Network_recommendedList"}>
                                {connections.filter((c) => !connected[c.id]).slice(0, 3).map((c) => (
                                    <div key={c.id} className={"Network_recommendedCard"}>
                                        <div className={"Network_recAvatar"} style={{ background: c.avatarColor }}>{c.avatar}</div>
                                        <div className={"Network_recInfo"}>
                                            <div className={"Network_recName"}>{c.name}</div>
                                            <div className={"Network_recRole"}>{c.role}</div>
                                            <div className={"Network_recMutual"}>{c.mutual} mutual connections</div>
                                        </div>
                                        <button className={"Network_connectBtnSm"} onClick={() => handleConnect(c.id)}>
                                            {connected[c.id] ? '✓' : '+'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Network Stats */}
                        <div className={"Network_sideCard"}>
                            <div className={"Network_sideCardTitle"}><i className="fas fa-chart-pie"></i> Network Breakdown</div>
                            <div className={"Network_breakdownList"}>
                                <div className={"Network_breakdownItem"}>
                                    <div className={"Network_breakdownLabel"}><span className={"Network_bdDot"} style={{ background: '#5BC8A0' }}></span> Developers</div>
                                    <div className={"Network_breakdownBar"}><div className={"Network_breakdownFill"} style={{ width: '66%', background: '#5BC8A0' }}></div></div>
                                    <div className={"Network_breakdownVal"}>94</div>
                                </div>
                                <div className={"Network_breakdownItem"}>
                                    <div className={"Network_breakdownLabel"}><span className={"Network_bdDot"} style={{ background: '#C4973A' }}></span> Founders</div>
                                    <div className={"Network_breakdownBar"}><div className={"Network_breakdownFill"} style={{ width: '27%', background: '#C4973A' }}></div></div>
                                    <div className={"Network_breakdownVal"}>38</div>
                                </div>
                                <div className={"Network_breakdownItem"}>
                                    <div className={"Network_breakdownLabel"}><span className={"Network_bdDot"} style={{ background: '#7C5CBF' }}></span> Investors</div>
                                    <div className={"Network_breakdownBar"}><div className={"Network_breakdownFill"} style={{ width: '7%', background: '#7C5CBF' }}></div></div>
                                    <div className={"Network_breakdownVal"}>10</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={"Network_footer"}>
                    <span>Evolv · Network</span>
                    <div className={"Network_footerRight"}>
                        <div className={"Network_greenDot"}></div>
                        <span>© 2025 Evolv. All rights reserved.</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Network;
