import React from 'react';
import styles from './StartupCard.module.css';

const StartupCard = ({ data, compact, detailed, onSelect, onApply, onSave }) => {
    const {
        name,
        industry,
        stage,
        viability,
        matchScore,
        budget,
        teamSize,
        description,
        techStack,
        roles,
        matchExplanation,
        metrics,
        logo,
        founder,
    } = data;

    if (compact) {
        return (
            <div className={styles.compactCard} onClick={onSelect}>
                <div className={styles.compactTop}>
                    <div className={styles.compactLeft}>
                        <span className={styles.compactLogo}>{logo}</span>
                        <span className={styles.compactName}>{name}</span>
                    </div>
                    <span className={styles.compactScore}>{matchScore}%</span>
                </div>
                <div className={styles.compactIndustry}>{industry} · {stage}</div>
                <div className={styles.compactDesc}>{description}</div>
                <div className={styles.compactTags}>
                    {techStack.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className={styles.tag}>{tech}</span>
                    ))}
                    {techStack.length > 3 && (
                        <span className={styles.tag}>+{techStack.length - 3}</span>
                    )}
                </div>
                <div className={styles.compactActions}>
                    <button className={styles.primaryBtn}>Review Match</button>
                    <button className={styles.iconBtn}><i className="fas fa-bookmark"></i></button>
                </div>
            </div>
        );
    }

    if (detailed) {
        return (
            <div className={styles.detailedCard} onClick={onSelect}>
                <div className={styles.detailedTop}>
                    <div className={styles.detailedHeader}>
                        <span className={styles.detailedLogo}>{logo}</span>
                        <div className={styles.detailedInfo}>
                            <div className={styles.detailedName}>{name}</div>
                            <div className={styles.detailedMeta}>
                                <span>{industry}</span>
                                <span>·</span>
                                <span>{stage}</span>
                                <span>·</span>
                                <span>Founder: {founder}</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.detailedBadges}>
                        <span className={styles.viabilityBadge}>Viability {viability}%</span>
                        <span className={styles.matchBadge}>{matchScore}% Match</span>
                    </div>
                </div>

                <div className={styles.detailedBody}>
                    <div className={styles.detailedDesc}>{description}</div>

                    <div className={styles.detailedMetrics}>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Budget</span>
                            <span className={styles.metricValue}>{budget}</span>
                        </div>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Team Size</span>
                            <span className={styles.metricValue}>{teamSize}</span>
                        </div>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Funding Readiness</span>
                            <span className={styles.metricValue}>{metrics?.fundingReadiness || 80}%</span>
                        </div>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Growth Potential</span>
                            <span className={styles.metricValue}>{metrics?.growthPotential || 85}%</span>
                        </div>
                    </div>

                    <div className={styles.detailedTags}>
                        <div className={styles.tagSection}>
                            <span className={styles.tagLabel}>Roles:</span>
                            {roles.map((role, idx) => (
                                <span key={idx} className={styles.roleTag}>{role}</span>
                            ))}
                        </div>
                        <div className={styles.tagSection}>
                            <span className={styles.tagLabel}>Tech Stack:</span>
                            {techStack.map((tech, idx) => (
                                <span key={idx} className={styles.tag}>{tech}</span>
                            ))}
                        </div>
                    </div>

                    {matchExplanation && (
                        <div className={styles.matchExplanation}>
                            <i className="fas fa-lightbulb" style={{ color: '#b38f6b' }}></i>
                            {matchExplanation}
                        </div>
                    )}
                </div>

                <div className={styles.detailedActions}>
                    <button className={styles.primaryBtn}><i className="fas fa-eye"></i> Review Blueprint</button>
                    <button className={styles.primaryBtn}><i className="fas fa-check"></i> Apply Now</button>
                    <button className={styles.iconBtn}><i className="fas fa-bookmark"></i></button>
                </div>
            </div>
        );
    }

    return null;
};

export default StartupCard;