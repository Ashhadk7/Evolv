import React from 'react';
import styles from './FeaturedMatchCard.module.css';

const FeaturedMatchCard = ({ data }) => {
    const { name, industry, stage, viability, matchScore, budget, founder, teamSize, description, techStack, whyMatched, logo } = data;

    return (
        <div className={styles.featuredCard}>
            <div className={styles.badge}>
                <i className="fas fa-fire" style={{ color: '#FF6B6B' }}></i> Featured Match
            </div>
            <div className={styles.card}>
                <div className={styles.top}>
                    <div className={styles.header}>
                        <span className={styles.logo}>{logo}</span>
                        <div className={styles.info}>
                            <div className={styles.name}>{name}</div>
                            <div className={styles.meta}>
                                <span>{industry}</span>
                                <span>·</span>
                                <span>{stage}</span>
                                <span>·</span>
                                <span>Founder: {founder}</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.badges}>
                        <span className={styles.viabilityBadge}>Viability {viability}%</span>
                        <span className={styles.matchBadge}>{matchScore}% Match</span>
                    </div>
                </div>

                <div className={styles.body}>
                    <div className={styles.desc}>{description}</div>

                    <div className={styles.metrics}>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>Budget</span>
                            <span className={styles.metricValue}>{budget}</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>Team Size</span>
                            <span className={styles.metricValue}>{teamSize}</span>
                        </div>
                    </div>

                    <div className={styles.techTags}>
                        {techStack.map((tech, idx) => (
                            <span key={idx} className={styles.techTag}>{tech}</span>
                        ))}
                    </div>

                    <div className={styles.whyBox}>
                        <div className={styles.whyLabel}>Why matched?</div>
                        <ul>
                            {whyMatched.map((item, idx) => (
                                <li key={idx}><i className="fas fa-check-circle"></i> {item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.primaryBtn}><i className="fas fa-eye"></i> Review Blueprint</button>
                        <button className={styles.primaryBtn}><i className="fas fa-check"></i> Apply Now</button>
                        <button className={styles.iconBtn}><i className="fas fa-bookmark"></i></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedMatchCard;