import React from 'react';
import styles from './InsightCard.module.css';

const InsightCard = ({ data }) => {
    const { icon, value, label } = data;

    return (
        <div className={styles.insightCard}>
            <div className={`${styles.icon} ${styles[`${icon}Icon`]}`}>
                <i className={`fas fa-${icon}`}></i>
            </div>
            <div className={styles.value}>{value}</div>
            <div className={styles.label}>{label}</div>
        </div>
    );
};

export default InsightCard;