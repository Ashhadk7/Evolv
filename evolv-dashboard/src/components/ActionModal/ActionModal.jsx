import React, { useEffect } from 'react';
import styles from './ActionModal.module.css';

const ActionModal = ({ modal, onClose }) => {
    useEffect(() => {
        if (!modal) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [modal, onClose]);

    if (!modal) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                style={{ '--accent': modal.accent || '#5BC8A0' }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.iconWrap}>
                        <i className={`fas fa-${modal.icon}`}></i>
                    </div>
                    <div className={styles.titleBlock}>
                        <div className={styles.title}>{modal.title}</div>
                        <div className={styles.badge}>{modal.badge}</div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    <p className={styles.description}>{modal.description}</p>

                    {modal.details && (
                        <div className={styles.detailGrid}>
                            {modal.details.map((d, i) => (
                                <div key={i} className={styles.detailItem}>
                                    <i className={`fas fa-${d.icon}`}></i>
                                    <div>
                                        <div className={styles.detailLabel}>{d.label}</div>
                                        <div className={styles.detailValue}>{d.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {modal.steps && (
                        <div className={styles.steps}>
                            <div className={styles.stepsTitle}>What happens next</div>
                            {modal.steps.map((step, i) => (
                                <div key={i} className={styles.step}>
                                    <div className={styles.stepNum}>{i + 1}</div>
                                    <div className={styles.stepText}>{step}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.primaryBtn} onClick={onClose}>
                        <i className="fas fa-arrow-right"></i> {modal.cta || 'Got it'}
                    </button>
                    <button className={styles.ghostBtn} onClick={onClose}>Dismiss</button>
                </div>
            </div>
        </div>
    );
};

export default ActionModal;
