import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ currentPage, onNavigate }) => {
    const navSections = [
        {
            label: 'Main',
            items: [
                { path: 'dashboard', label: 'Dashboard', icon: 'th-large' },
            ],
        },
        {
            label: 'Discover',
            items: [
                { path: 'discover', label: 'Discover', icon: 'compass' },
                { path: 'applications', label: 'Applications', icon: 'paper-plane' },
            ],
        },
        {
            label: 'Work',
            items: [
                { path: 'projects', label: 'Projects', icon: 'rocket' },
                { path: 'network', label: 'Network', icon: 'users' },
            ],
        },
        {
            label: 'Connect',
            items: [
                { path: 'inbox', label: 'Inbox', icon: 'inbox', badge: 3 },
            ],
        },
        {
            label: 'Account',
            items: [
                { path: 'settings', label: 'Settings', icon: 'cog' },
            ],
        },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <i className="fas fa-seedling"></i>
                Evolv
            </div>
            <nav>
                {navSections.map((section) => (
                    <div key={section.label}>
                        <div className={styles.navSectionLabel}>{section.label}</div>
                        {section.items.map((item) => (
                            <div
                                key={item.path}
                                className={`${styles.navItem} ${currentPage === item.path ? styles.active : ''}`}
                                onClick={() => onNavigate(item.path)}
                            >
                                <i className={`fas fa-${item.icon}`}></i>
                                {item.label}
                                {item.badge && <span className={styles.badgeNum}>{item.badge}</span>}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>
            <div className={styles.userCard}>
                <div className={styles.avatar}>
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                        alt="Sarah"
                    />
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.name}>Sarah Mitchell</div>
                    <div className={styles.role}>Developer</div>
                </div>
                <span className={styles.dots}>
                    <i className="fas fa-ellipsis-h"></i>
                </span>
            </div>
        </aside>
    );
};

export default Sidebar;