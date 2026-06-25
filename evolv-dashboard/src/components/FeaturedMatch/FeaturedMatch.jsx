import React from 'react';
import styles from './FeaturedMatch.module.css';

const FeaturedMatch = ({ data }) => {
    const { name, icon, matchScore, description, techStack, whyMatched } = data;

    return (
        <div className={styles.featuredMatch}>
            <div className={styles.sectionTop}>
                <i className="fas fa-fire" style={{ color: '#FF6B6B' }}></i>
                <span className={styles.secLabel}>Latest AI Match</span>
            </div>
            <div className={styles.card}>
                <div className={styles.icon}>
                    <i className={`fas fa-${icon}`}></i>
                </div>
                <div className={styles.body}>
                    <div className={styles.topRow}>
                        <span className={styles.name}>{name}</span>
                        <span className={styles.score}>{matchScore}% Match</span>
                    </div>
                    <div className={styles.desc}>{description}</div>
                    <div className={styles.techTags}>
                        {techStack.map((tech, idx) => (
                            <span key={idx} className={styles.techTag}>
                                {tech}
                            </span>
                        ))}
                    </div>
                    <div className={styles.whyBox}>
                        <div className={styles.whyLabel}>Why matched?</div>
                        <ul>
                            {whyMatched.map((item, idx) => (
                                <li key={idx}>
                                    <i className="fas fa-check-circle"></i> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.primary}`}>
                            <i className="fas fa-eye"></i> Review Match
                        </button>
                        <button className={`${styles.btn} ${styles.iconOnly}`}>
                            <i className="fas fa-bookmark"></i>
                        </button>
                        <button className={styles.btn}>
                            <i className="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedMatch;