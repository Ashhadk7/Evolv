import React, { useState, useRef } from 'react';
import styles from './DevOnboardingModal.module.css';

const TECH_STACKS = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
    'FastAPI', 'Django', 'PostgreSQL', 'MongoDB', 'Docker',
    'AWS', 'GCP', 'AI/ML', 'Solidity', 'GraphQL',
    'Go', 'Rust', 'Vue.js', 'Next.js', 'Kubernetes',
];

const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite'];

const EXPERIENCE_LEVELS = ['< 1 year', '1-2 years', '3-5 years', '5-8 years', '8+ years'];

const DevOnboardingModal = ({ onComplete, userName = '' }) => {
    const [step, setStep] = useState(1);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileRef = useRef(null);

    // Step 1 state
    const [firstName, setFirstName] = useState(userName.split(' ')[0] || '');
    const [lastName, setLastName]   = useState(userName.split(' ').slice(1).join(' ') || '');
    const [jobTitle, setJobTitle]   = useState('');
    const [location, setLocation]   = useState('');
    const [experience, setExperience] = useState('');
    const [bio, setBio]             = useState('');

    // Step 2 state
    const [selectedTech, setSelectedTech]   = useState([]);
    const [availability, setAvailability]   = useState(true);
    const [workType, setWorkType]           = useState('Remote');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleTech = (tech) => {
        setSelectedTech(prev =>
            prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
        );
    };

    const handleFinish = () => {
        // Merge onboarding data into evolv_user in localStorage
        try {
            const existing = JSON.parse(localStorage.getItem('evolv_user') || '{}');
            const updated = {
                ...existing,
                firstName,
                lastName,
                jobTitle,
                location,
                experience,
                bio,
                techStack: selectedTech,
                availability,
                workType,
                photo: photoPreview,
                firstTime: false,          // clears the onboarding flag
            };
            localStorage.setItem('evolv_user', JSON.stringify(updated));
        } catch (_) {}
        onComplete();
    };

    const handleSkip = () => {
        try {
            const existing = JSON.parse(localStorage.getItem('evolv_user') || '{}');
            localStorage.setItem('evolv_user', JSON.stringify({ ...existing, firstTime: false }));
        } catch (_) {}
        onComplete();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Set up your Developer profile</h2>
                        <p className={styles.subtitle}>Step {step} of 2 · Required</p>
                    </div>
                    <button className={styles.closeBtn} onClick={handleSkip} title="Skip for now">✕</button>
                </div>

                {/* Progress bar */}
                <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: step === 1 ? '50%' : '100%' }} />
                </div>

                {/* ─── STEP 1 ─── */}
                {step === 1 && (
                    <div className={styles.body}>

                        {/* Photo upload */}
                        <div className={styles.photoRow}>
                            <div
                                className={styles.photoCircle}
                                onClick={() => fileRef.current?.click()}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="preview" className={styles.photoImg} />
                                ) : (
                                    <>
                                        <i className="fas fa-camera" style={{ fontSize: '1.2rem', color: '#5BC8A0', marginBottom: '0.3rem' }} />
                                        <span className={styles.photoLabel}>Upload photo</span>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoChange}
                            />
                        </div>

                        {/* Name row */}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>First Name <span className={styles.required}>*</span></label>
                                <input
                                    className={styles.input}
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    placeholder="Sara"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Last Name <span className={styles.required}>*</span></label>
                                <input
                                    className={styles.input}
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    placeholder="Ahmed"
                                />
                            </div>
                        </div>

                        {/* Job Title */}
                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>Job Title / Role <span className={styles.required}>*</span></label>
                            <input
                                className={styles.input}
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                                placeholder="e.g. Full Stack Developer, AI Engineer, Backend Engineer"
                            />
                        </div>

                        {/* Location + Experience */}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Location</label>
                                <input
                                    className={styles.input}
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Years of Experience</label>
                                <select
                                    className={styles.input}
                                    value={experience}
                                    onChange={e => setExperience(e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    {EXPERIENCE_LEVELS.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>Bio / Tagline</label>
                            <textarea
                                className={styles.textarea}
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder="e.g. Passionate AI engineer with 5 years building production-grade ML systems"
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* ─── STEP 2 ─── */}
                {step === 2 && (
                    <div className={styles.body}>

                        {/* Tech stack */}
                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>
                                Tech Stack <span className={styles.required}>*</span>
                                <span className={styles.labelNote}> — pick all that apply</span>
                            </label>
                            <div className={styles.chipGrid}>
                                {TECH_STACKS.map(tech => (
                                    <button
                                        key={tech}
                                        type="button"
                                        onClick={() => toggleTech(tech)}
                                        className={`${styles.chip} ${selectedTech.includes(tech) ? styles.chipActive : ''}`}
                                    >
                                        {tech}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Work type */}
                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>Preferred Work Type</label>
                            <div className={styles.workTypeRow}>
                                {WORK_TYPES.map(w => (
                                    <button
                                        key={w}
                                        type="button"
                                        onClick={() => setWorkType(w)}
                                        className={`${styles.workTypeBtn} ${workType === w ? styles.workTypeActive : ''}`}
                                    >
                                        <i className={`fas fa-${w === 'Remote' ? 'laptop-house' : w === 'Hybrid' ? 'building' : 'office-building'}`} />
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Availability */}
                        <div className={styles.availabilityRow}>
                            <div>
                                <p className={styles.availTitle}>Open to Opportunities</p>
                                <p className={styles.availSub}>Let founders discover and reach out to you</p>
                            </div>
                            <div
                                className={`${styles.toggle} ${availability ? styles.toggleOn : ''}`}
                                onClick={() => setAvailability(a => !a)}
                            >
                                <div className={styles.toggleThumb} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.skipBtn} onClick={handleSkip}>
                        Skip for now
                    </button>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {step === 2 && (
                            <button className={styles.backBtn} onClick={() => setStep(1)}>
                                ← Back
                            </button>
                        )}
                        {step === 1 ? (
                            <button
                                className={styles.continueBtn}
                                onClick={() => setStep(2)}
                                disabled={!firstName.trim() || !jobTitle.trim()}
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                className={styles.finishBtn}
                                onClick={handleFinish}
                                disabled={selectedTech.length === 0}
                            >
                                🚀 Let's Go
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevOnboardingModal;
