import React from 'react';
import styles from './Topbar.module.css';

const Topbar = () => {
    return (
        <div className={styles.topbar}>
            <div className={styles.right}>
                <div className={styles.searchWrap}>
                    <i className={`fas fa-search ${styles.searchIcon}`}></i>
                    <input type="text" placeholder="Search applications..." />
                </div>
                <div className={styles.notifBtn}>
                    <i className="fas fa-bell"></i>
                    <span className={styles.dot}></span>
                </div>
                <div className={styles.profileAv}>
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                        alt="Sarah"
                    />
                </div>
            </div>
        </div>
    );
};

export default Topbar;