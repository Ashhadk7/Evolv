import React from 'react';
import styles from './InvitationCard.module.css';

const InvitationCard = ({ data }) => {
    const { founderName, startupName, role, matchScore, message, logo } = data;

    return (
        <div className={styles.invitationCard}>
            <div className={styles.top}>
                <div className={styles.header}>
                    <span className={styles.logo}>{logo}</span>
                    <div>
                        <div className={styles.startupName}>{startupName}</div>
                        <div className={styles.founderName}>Founder: {founderName}</div>
                    </div>
                </div>
                <span className={styles.matchScore}>{matchScore}% Match</span>
            </div>
            <div className={styles.role}>Looking for: {role}</div>
            <div className={styles.message}>"{message}"</div>
            <div className={styles.actions}>
                <button className={styles.acceptBtn}><i className="fas fa-check"></i> Accept</button>
                <button className={styles.viewBtn}><i className="fas fa-eye"></i> View Blueprint</button>
                <button className={styles.declineBtn}><i className="fas fa-times"></i> Decline</button>
            </div>
        </div>
    );
};

export default InvitationCard;