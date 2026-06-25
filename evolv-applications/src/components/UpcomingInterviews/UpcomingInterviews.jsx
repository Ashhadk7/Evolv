import React from 'react';
import styles from './UpcomingInterviews.module.css';

const UpcomingInterviews = ({ applications }) => {
    const interviews = applications.filter((app) => app.status === 'Interview' && app.interviewDate);

    if (interviews.length === 0) {
        return null;
    }

    return (
        <div className={styles.interviewsSection}>
            <div className={styles.sectionHeader}>
                <h3><i className="fas fa-calendar-check" style={{ color: '#5BC8A0' }}></i> Upcoming Interviews</h3>
            </div>
            <div className={styles.interviewsGrid}>
                {interviews.map((interview) => (
                    <div key={interview.id} className={styles.interviewCard}>
                        <div className={styles.interviewTop}>
                            <div className={styles.interviewInfo}>
                                <span className={styles.interviewLogo}>{interview.logo}</span>
                                <div>
                                    <div className={styles.interviewStartup}>{interview.startup}</div>
                                    <div className={styles.interviewRole}>{interview.role}</div>
                                </div>
                            </div>
                            <span className={styles.interviewType}>In-Person</span>
                        </div>
                        <div className={styles.interviewDateTime}>
                            <span><i className="fas fa-calendar-alt"></i> {interview.interviewDate}</span>
                            <span>·</span>
                            <span><i className="fas fa-clock"></i> {interview.interviewTime}</span>
                        </div>
                        <div className={styles.interviewLocation}>
                            <i className="fas fa-map-marker-alt"></i> {interview.interviewLocation || 'Islamabad, Pakistan'}
                        </div>
                        <div className={styles.interviewDetails}>
                            <span><i className="fas fa-user"></i> Contact: {interview.interviewContact || 'Asad Ahmed'}</span>
                            <span>·</span>
                            <span><i className="fas fa-phone"></i> {interview.interviewPhone || '+92 300 1234567'}</span>
                        </div>
                        <div className={styles.interviewNotes}>
                            <i className="fas fa-sticky-note"></i> {interview.interviewNotes || 'Please bring your portfolio and a copy of your resume.'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingInterviews;