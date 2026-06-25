import React from 'react';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ data }) => {
    const { name, icon, iconClass, role, progress, progressColor, teamMembers, extraMembers, stage, deadline, hoursLogged } = data;

    return (
        <div className={styles.projItem}>
            <div className={styles.top}>
                <div className={`${styles.icon} ${styles[iconClass]}`}>
                    <i className={`fas fa-${icon}`}></i>
                </div>
                <div className={styles.info}>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.role}>{role}</div>
                </div>
                <div className={styles.right}>
                    <div className={styles.pct}>{progress}%</div>
                </div>
            </div>
            <div className={styles.progress}>
                <div className={`${styles.fill} ${styles[progressColor]}`} style={{ width: `${progress}%` }}></div>
            </div>
            <div className={styles.avatars}>
                {teamMembers.map((member, idx) => (
                    <div key={idx} className={styles.avatar}>{member}</div>
                ))}
                {extraMembers > 0 && (
                    <div className={`${styles.avatar} ${styles.more}`}>+{extraMembers}</div>
                )}
            </div>
            <div className={styles.metaRow}>
                <span>Stage</span>
                <span className={styles.stageBadge}>{stage}</span>
                <span>Deadline</span>
                <span className={styles.deadlineValue}>{deadline}</span>
            </div>
            <div className={styles.metaRow}>
                <span>Hours Logged</span>
                <span className={styles.hoursValue}>{hoursLogged}</span>
            </div>
        </div>
    );
};

export default ProjectCard;