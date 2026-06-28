// @ts-nocheck
import { useEffect } from 'react';

export const ActionModal = ({ modal, onClose }) => {
    useEffect(() => {
        if (!modal) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [modal, onClose]);

    if (!modal) return null;

    return (
        <div className={"ActionModal_overlay"} onClick={onClose}>
            <div
                className={"ActionModal_modal"}
                onClick={(e) => e.stopPropagation()}
                style={{ '--accent': modal.accent || '#5BC8A0' }}
            >
                <div className={"ActionModal_header"}>
                    <div className={"ActionModal_iconWrap"}>
                        <i className={`fas fa-${modal.icon}`}></i>
                    </div>
                    <div className={"ActionModal_titleBlock"}>
                        <div className={"ActionModal_title"}>{modal.title}</div>
                        <div className={"ActionModal_badge"}>{modal.badge}</div>
                    </div>
                    <button className={"ActionModal_closeBtn"} onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className={"ActionModal_body"}>
                    <p className={"ActionModal_description"}>{modal.description}</p>

                    {modal.details && (
                        <div className={"ActionModal_detailGrid"}>
                            {modal.details.map((d, i) => (
                                <div key={i} className={"ActionModal_detailItem"}>
                                    <i className={`fas fa-${d.icon}`}></i>
                                    <div>
                                        <div className={"ActionModal_detailLabel"}>{d.label}</div>
                                        <div className={"ActionModal_detailValue"}>{d.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {modal.steps && (
                        <div className={"ActionModal_steps"}>
                            <div className={"ActionModal_stepsTitle"}>What happens next</div>
                            {modal.steps.map((step, i) => (
                                <div key={i} className={"ActionModal_step"}>
                                    <div className={"ActionModal_stepNum"}>{i + 1}</div>
                                    <div className={"ActionModal_stepText"}>{step}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={"ActionModal_footer"}>
                    <button className={"ActionModal_primaryBtn"} onClick={onClose}>
                        <i className="fas fa-arrow-right"></i> {modal.cta || 'Got it'}
                    </button>
                    <button className={"ActionModal_ghostBtn"} onClick={onClose}>Dismiss</button>
                </div>
            </div>
        </div>
    );
};
