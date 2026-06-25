import React from 'react';
import styles from './BlueprintPreview.module.css';

const BlueprintPreview = ({ data }) => {
    const { name, industry, stage, viability, budget, teamSize, description, techStack, roles, matchExplanation, metrics, logo, founder } = data;

    return (
        <div className={styles.preview}>
            <div className={styles.header}>
                <div className={styles.title}>Blueprint Preview</div>
                <span className={styles.matchBadge}>{data.matchScore || 88}% Match</span>
            </div>

            <div className={styles.content}>
                <div className={styles.startupHeader}>
                    <span className={styles.logo}>{logo}</span>
                    <div>
                        <div className={styles.name}>{name}</div>
                        <div className={styles.meta}>{industry} · {stage}</div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Problem</div>
                    <p>Early-stage oncology diagnosis has a 40% false positive rate, delaying critical treatment.</p>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Solution</div>
                    <p>AI-driven diagnostics platform reducing false positives by 40%.</p>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Target Audience</div>
                    <p>Hospitals, clinics, and oncology centers.</p>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Revenue Model</div>
                    <p>B2B SaaS subscription + per-diagnosis fee.</p>
                </div>

                <div className={styles.metricsGrid}>
                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Viability</span>
                        <span className={styles.metricValue}>{viability}%</span>
                    </div>
                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Funding Readiness</span>
                        <span className={styles.metricValue}>{metrics?.fundingReadiness || 85}%</span>
                    </div>
                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Growth Potential</span>
                        <span className={styles.metricValue}>{metrics?.growthPotential || 90}%</span>
                    </div>
                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Team Size</span>
                        <span className={styles.metricValue}>{teamSize}</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Required Roles</div>
                    <div className={styles.tags}>
                        {roles.map((role, idx) => (
                            <span key={idx} className={styles.roleTag}>{role}</span>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Tech Stack</div>
                    <div className={styles.tags}>
                        {techStack.map((tech, idx) => (
                            <span key={idx} className={styles.techTag}>{tech}</span>
                        ))}
                    </div>
                </div>

                <div className={styles.matchSummary}>
                    <div className={styles.matchTitle}>AI Match Summary</div>
                    <div className={styles.matchExplanation}>{matchExplanation || 'Strong alignment with your skills and experience.'}</div>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.primaryBtn}><i className="fas fa-eye"></i> Full Blueprint</button>
                <button className={styles.primaryBtn}><i className="fas fa-check"></i> Apply Now</button>
                <button className={styles.iconBtn}><i className="fas fa-bookmark"></i></button>
            </div>
        </div>
    );
};

export default BlueprintPreview;