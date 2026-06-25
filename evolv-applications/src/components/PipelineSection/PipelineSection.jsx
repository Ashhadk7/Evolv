import React from 'react';
import styles from './PipelineSection.module.css';

const PipelineSection = ({ data }) => {
    return (
        <div className={styles.pipelineSection}>
            <div className={styles.pipelineHeader}>
                <h3><i className="fas fa-arrows-alt-h" style={{ color: '#5BC8A0' }}></i> Application Pipeline</h3>
            </div>
            <div className={styles.pipelineGrid}>
                {data.map((item) => (
                    <div key={item.id} className={styles.pipelineItem}>
                        <div className={styles.pipelineBar} style={{ background: item.color }}></div>
                        <div className={styles.pipelineInfo}>
                            <span className={styles.pipelineStage}>{item.stage}</span>
                            <span className={styles.pipelineCount}>{item.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PipelineSection;