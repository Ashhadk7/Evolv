import React from 'react';
import styles from './ApplicationCard.module.css';

const ApplicationCard = ({ data }) => {
    const { name, icon, iconClass, role, date, status } = data;

    const getStatusClass = (status) => {
        const map = {
            Interview: 'interview',
            Pending: 'pending',
            Accepted: 'accepted',
            Declined: 'declined',
        };
        return map[status] || '';
    };

    return (
        <div className={styles.appItem}>
            <div className={`${styles.icon} ${styles[iconClass]}`}>
                <i className={`fas fa-${icon}`}></i>
            </div>
            <div className={styles.info}>
                <div className={styles.name}>{name}</div>
                <div className={styles.role}>
                    {role} · <span className={styles.date}>{date}</span>
                </div>
            </div>
            <span className={`${styles.status} ${styles[getStatusClass(status)]}`}>
                {status}
            </span>
            <span className={styles.chevron}>
                <i className="fas fa-chevron-right"></i>
            </span>
        </div>
    );
};

export default ApplicationCard;