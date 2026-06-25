import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ label, value, trend, trendUp }) => {
    return (
        <div className={styles.statCard}>
            <div className={styles.top}>
                <span className={styles.label}>{label}</span>
                <span className={`${styles.trend} ${trendUp ? '' : styles.down}`}>
                    <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'}`}></i> {trend}
                </span>
            </div>
            <div className={styles.value}>{value}</div>
            <svg className={styles.sparkline} viewBox="0 0 120 36" preserveAspectRatio="none">
                <path className={styles.area} d="M0,28 C10,24 20,18 30,20 C40,22 50,10 60,14 C70,18 80,8 90,12 C100,16 110,22 120,18 L120,36 L0,36 Z" />
                <path d="M0,28 C10,24 20,18 30,20 C40,22 50,10 60,14 C70,18 80,8 90,12 C100,16 110,22 120,18" />
            </svg>
        </div>
    );
};

export default StatCard;