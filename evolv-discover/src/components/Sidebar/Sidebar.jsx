import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'th-large' },
        { path: '/discover', label: 'Discover', icon: 'compass' },
        { path: '/applications', label: 'Applications', icon: 'paper-plane' },
        { path: '/projects', label: 'Projects', icon: 'rocket' },
        { path: '/network', label: 'Network', icon: 'users' },
        { path: '/inbox', label: 'Inbox', icon: 'inbox', badge: 3 },
        { path: '/settings', label: 'Settings', icon: 'cog' },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath.startsWith(path);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <i className="fas fa-seedling"></i>
                Evolv
            </div>
            <nav>
                <div className={styles.navSectionLabel}>Main</div>
                {navItems.slice(0, 1).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                    >
                        <i className={`fas fa-${item.icon}`}></i>
                        {item.label}
                        {item.badge && <span className={styles.badgeNum}>{item.badge}</span>}
                    </Link>
                ))}

                <div className={styles.navSectionLabel}>Discover</div>
                {navItems.slice(1, 3).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                    >
                        <i className={`fas fa-${item.icon}`}></i>
                        {item.label}
                        {item.badge && <span className={styles.badgeNum}>{item.badge}</span>}
                    </Link>
                ))}

                <div className={styles.navSectionLabel}>Work</div>
                {navItems.slice(3, 5).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                    >
                        <i className={`fas fa-${item.icon}`}></i>
                        {item.label}
                        {item.badge && <span className={styles.badgeNum}>{item.badge}</span>}
                    </Link>
                ))}

                <div className={styles.navSectionLabel}>Connect</div>
                {navItems.slice(5, 6).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                    >
                        <i className={`fas fa-${item.icon}`}></i>
                        {item.label}
                        {item.badge && <span className={styles.badgeNum}>{item.badge}</span>}
                    </Link>
                ))}

                <div className={styles.navSectionLabel}>Account</div>
                {navItems.slice(6, 7).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                    >
                        <i className={`fas fa-${item.icon}`}></i>
                        {item.label}
                        {item.badge && <span className={styles.badgeNum}>{item.badge}</span>}
                    </Link>
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
                    <div className={styles.name}>Sarah</div>
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