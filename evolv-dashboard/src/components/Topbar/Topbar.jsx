import React, { useState, useEffect } from 'react';
import styles from './Topbar.module.css';

const Topbar = ({ title, subtitle, onNavigate, onNotifClick }) => {
    const fullText = title || 'Welcome back, Sarah';
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(fullText.slice(0, i));
            if (i >= fullText.length) {
                clearInterval(interval);
                setTimeout(() => setDone(true), 1500);
            }
        }, 55);
        return () => clearInterval(interval);
    }, [fullText]);

    return (
        <div className={styles.topbar}>
            <div className={styles.greeting}>
                <h1>
                    {displayed}
                    <span className={`${styles.cursor} ${done ? styles.cursorHidden : ''}`}>|</span>
                </h1>
                <div className={styles.sub}>{subtitle || "Here's your developer dashboard overview."}</div>
            </div>
            <div className={styles.right}>
                <div className={styles.searchWrap}>
                    <i className={`fas fa-search ${styles.searchIcon}`}></i>
                    <input type="text" placeholder="Search..." />
                </div>
                <div className={styles.notifBtn} onClick={onNotifClick} style={{ cursor: onNotifClick ? 'pointer' : 'default' }}>
                    <i className="fas fa-bell"></i>
                    <span className={styles.dot}></span>
                </div>
                <div className={styles.profileAv} onClick={() => onNavigate && onNavigate('settings')} style={{ cursor: 'pointer' }}>
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                        alt="Sarah"
                    />
                </div>
            </div>
        </div>
    );
};

export default Topbar;