import React from 'react';
import styles from './ProfileCard.module.css';

const ProfileCard = ({ data }) => {
    const { name, role, location, experience, availability, matchRate, profileStrength, founderRating, image } = data;

    return (
        <div className={styles.profileCard}>
            <div className={styles.header}>
                <span className={styles.title}><i className="fas fa-user-circle"></i> Developer Profile</span>
                <a href="#">Edit Profile</a>
            </div>
            <div className={styles.content}>
                <div className={styles.avatarWrap}>
                    <img src={image} alt={name} className={styles.avatar} />
                    <div className={styles.statusDot}></div>
                </div>
                <div className={styles.right}>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.role}>{role}</div>
                    <div className={styles.meta}>
                        <div className={styles.metaItem}><i className="fas fa-map-marker-alt"></i> {location}</div>
                        <div className={styles.metaItem}><i className="fas fa-briefcase"></i> {experience}</div>
                        <div className={`${styles.metaItem} ${styles.avail}`}><i className="fas fa-circle"></i> Availability: {availability}</div>
                    </div>
                </div>
            </div>
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Match Rate</span>
                    <div className={styles.statNum}>{matchRate}</div>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Profile Strength</span>
                    <div className={styles.statNum}>{profileStrength}</div>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Founder Rating</span>
                    <div className={styles.statNum}><span className={styles.star}>★</span> {founderRating}</div>
                </div>
            </div>
            <div className={styles.bottomRow}>
                <button className={styles.portfolioBtn}><i className="fas fa-briefcase"></i> View Portfolio</button>
                <div className={styles.socials}>
                    <a href="#"><i className="fab fa-github"></i></a>
                    <a href="#"><i className="fab fa-linkedin"></i></a>
                    <a href="#"><i className="fab fa-twitter"></i></a>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;