import React from 'react';
import styles from './ApplicationDetailPanel.module.css';

const ApplicationDetailPanel = ({ application }) => {
    const {
        startup,
        industry,
        stage,
        role,
        matchScore,
        appliedDate,
        status,
        founder,
        nextAction,
        techStack,
        description,
        whyMatched,
        logo,
        interviewDate,
        interviewTime,
        interviewLink,
        interviewPlatform,
    } = application;

    const getStatusClass = (status) => {
        const map = {
            'Applied': 'applied',
            'Under Review': 'review',
            'Interview': 'interview',
            'Accepted': 'accepted',
            'Declined': 'declined',
            'Withdrawn': 'withdrawn',
        };
        return map[status] || '';
    };

    return (
        <div className={styles.detailPanel}>
            <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>Application Details</div>
                <span className={`${styles.status} ${styles[getStatusClass(status)]}`}>
                    {status}
                </span>
            </div>

            <div className={styles.startupHeader}>
                <span className={styles.logo}>{logo}</span>
                <div>
                    <div className={styles.startupName}>{startup}</div>
                    <div className={styles.meta}>
                        {industry} · {stage}
                    </div>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Role</span>
                    <span className={styles.detailValue}>{role}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Match Score</span>
                    <span className={styles.detailValue}>{matchScore}%</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Applied Date</span>
                    <span className={styles.detailValue}>{appliedDate}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Founder</span>
                    <span className={styles.detailValue}>{founder}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Next Action</span>
                    <span className={styles.detailValue}>{nextAction}</span>
                </div>
            </div>

            {interviewDate && (
                <div className={styles.interviewSection}>
                    <div className={styles.interviewTitle}>
                        <i className="fas fa-calendar-check" style={{ color: '#5BC8A0' }}></i> Interview Scheduled
                    </div>
                    <div className={styles.interviewDetails}>
                        <span>{interviewDate} at {interviewTime}</span>
                        <span>·</span>
                        <span>{interviewPlatform}</span>
                    </div>
                    <a href={interviewLink} className={styles.interviewLink}>
                        <i className="fas fa-video"></i> Join Interview
                    </a>
                </div>
            )}

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Description</div>
                <p>{description}</p>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Tech Stack</div>
                <div className={styles.tags}>
                    {techStack.map((tech, idx) => (
                        <span key={idx} className={styles.techTag}>{tech}</span>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Why You Matched</div>
                <ul className={styles.matchList}>
                    {whyMatched.map((item, idx) => (
                        <li key={idx}>
                            <i className="fas fa-check-circle" style={{ color: '#5BC8A0' }}></i>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.actions}>
                <button className={styles.primaryBtn}><i className="fas fa-eye"></i> View Blueprint</button>
                <button className={styles.outlineBtn}><i className="fas fa-envelope"></i> Message Founder</button>
                <button className={styles.dangerBtn}><i className="fas fa-times"></i> Withdraw Application</button>
            </div>
        </div>
    );
};

export default ApplicationDetailPanel;