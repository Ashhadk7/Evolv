import React from 'react';
import styles from './ApplicationTable.module.css';

const ApplicationTable = ({ applications, onSelect, selectedId }) => {
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
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Startup</th>
                        <th>Role</th>
                        <th>Match Score</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Founder</th>
                        <th>Next Action</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((app) => (
                        <tr
                            key={app.id}
                            className={`${styles.row} ${selectedId === app.id ? styles.selected : ''}`}
                            onClick={() => onSelect(app)}
                        >
                            <td className={styles.startupCell}>
                                <div className={styles.startupInfo}>
                                    <span className={styles.logo}>{app.logo}</span>
                                    <span className={styles.startupName}>{app.startup}</span>
                                </div>
                            </td>
                            <td>{app.role}</td>
                            <td>
                                <span className={styles.matchScore}>{app.matchScore}%</span>
                            </td>
                            <td>{app.appliedDate}</td>
                            <td>
                                <span className={`${styles.status} ${styles[getStatusClass(app.status)]}`}>
                                    {app.status}
                                </span>
                            </td>
                            <td>{app.founder}</td>
                            <td className={styles.nextAction}>{app.nextAction}</td>
                            <td>
                                <button className={styles.viewBtn}>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {applications.length === 0 && (
                <div className={styles.emptyTable}>
                    <div className={styles.emptyIcon}>📋</div>
                    <h4>No applications found</h4>
                    <p>Try adjusting your filters to see more results.</p>
                </div>
            )}
        </div>
    );
};

export default ApplicationTable;