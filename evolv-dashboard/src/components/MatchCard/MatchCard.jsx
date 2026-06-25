import React from 'react';
import styles from './MatchCard.module.css';

const MatchCard = ({ data }) => {
    const { name, icon, matchScore, description, techStack, industry, stage, budget, teamSize, iconClass } = data;

    return (
        <div className={styles.matchCard}>
            <div className={styles.top}>
                <div className={styles.left}>
                    <div className={`${styles.icon} ${iconClass ? styles[iconClass] : ''}`}>
                        <i className={`fas fa-${icon}`}></i>
                    </div>
                    <span className={styles.name}>{name}</span>
                </div>
                <span className={styles.score}>{matchScore}%</span>
            </div>
            <div className={styles.desc}>{description}</div>
            <div className={styles.tags}>
                {techStack.map((tech, idx) => (
                    <span key={idx} className={styles.techTag}>
                        {tech}
                    </span>
                ))}
            </div>
            <div className={styles.meta}>
                <span><i className={`fas fa-${icon}`}></i> {industry}</span>
                <span><i className="fas fa-seedling"></i> {stage}</span>
                <span><i className="fas fa-dollar-sign"></i> {budget}</span>
                <span><i className="fas fa-users"></i> {teamSize}</span>
            </div>
            <div className={styles.actions}>
                <button className={`${styles.btn} ${styles.primary}`}>
                    <i className="fas fa-eye"></i> Review
                </button>
                <button className={styles.btn}>
                    <i className="fas fa-bookmark"></i> Save
                </button>
            </div>
        </div>
    );
};

export default MatchCard;