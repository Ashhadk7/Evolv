import React from 'react';
import styles from './ActivityTimeline.module.css';

const ActivityTimeline = ({ activities }) => {
    return (
        <div className={styles.timelineSection}>
            <div className={styles.timelineHeader}>
                <h3><i className="fas fa-clock" style={{ color: '#5BC8A0' }}></i> Application Activity</h3>
            </div>
            <div className={styles.timeline}>
                {activities.map((activity, index) => (
                    <div key={activity.id} className={styles.timelineItem}>
                        <div className={styles.timelineIcon}>
                            <i className={`fas fa-${activity.icon}`}></i>
                        </div>
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineEvent}>{activity.event}</div>
                            <div className={styles.timelineTime}>{activity.time}</div>
                        </div>
                        {index < activities.length - 1 && <div className={styles.timelineLine}></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityTimeline;