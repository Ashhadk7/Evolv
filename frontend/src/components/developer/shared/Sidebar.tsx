// @ts-nocheck
import { useState, useEffect } from 'react';

export const Sidebar = ({ currentPage, onNavigate }) => {
    const [userName, setUserName] = useState('Sarah Mitchell');
    useEffect(() => {
        try {
            const raw = localStorage.getItem('evolv_user');
            if (raw) {
                const user = JSON.parse(raw);
                const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
                if (name) setUserName(name);
            }
        } catch (_) {}
    }, []);

    const navSections = [
        { label: 'Main', items: [{ path: 'dashboard', label: 'Dashboard', icon: 'th-large' }] },
        { label: 'Discover', items: [{ path: 'discover', label: 'Discover', icon: 'compass' }, { path: 'applications', label: 'Applications', icon: 'paper-plane' }] },
        { label: 'Work', items: [{ path: 'projects', label: 'Projects', icon: 'rocket' }, { path: 'network', label: 'Network', icon: 'users' }] },
        { label: 'Connect', items: [{ path: 'inbox', label: 'Inbox', icon: 'inbox', badge: 3 }] },
        { label: 'Account', items: [{ path: 'settings', label: 'Settings', icon: 'cog' }] },
    ];

    return (
        <aside className={"Sidebar_sidebar"}>
            <div className={"Sidebar_brand"}><i className="fas fa-seedling"></i> Evolv</div>
            <nav className={"Sidebar_nav"}>
                {navSections.map((section) => (
                    <div key={section.label}>
                        <div className={"Sidebar_navSectionLabel"}>{section.label}</div>
                        {section.items.map((item) => (
                            <div key={item.path} className={`${"Sidebar_navItem"} ${currentPage === item.path ? "Sidebar_active" : ''}`} onClick={() => onNavigate(item.path)}>
                                <i className={`fas fa-${item.icon}`}></i>
                                {item.label}
                                {item.badge && <span className={"Sidebar_badgeNum"}>{item.badge}</span>}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>
            <div className={"Sidebar_userCard"}>
                <div className={"Sidebar_avatar"}><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="Sarah" /></div>
                <div className={"Sidebar_userInfo"}>
                    <div className={"Sidebar_name"}>{userName}</div>
                    <div className={"Sidebar_role"}>Developer</div>
                </div>
                <span className={"Sidebar_dots"}><i className="fas fa-ellipsis-h"></i></span>
            </div>
        </aside>
    );
};
