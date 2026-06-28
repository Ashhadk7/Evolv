// @ts-nocheck
import { useState, useRef } from 'react';

const TECH_STACKS = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
    'FastAPI', 'Django', 'PostgreSQL', 'MongoDB', 'Docker',
    'AWS', 'GCP', 'AI/ML', 'Solidity', 'GraphQL',
    'Go', 'Rust', 'Vue.js', 'Next.js', 'Kubernetes',
];
const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite'];
const EXPERIENCE_LEVELS = ['< 1 year', '1-2 years', '3-5 years', '5-8 years', '8+ years'];

export const DevOnboardingModal = ({ onComplete, userName = '' }) => {
    const [step, setStep] = useState(1);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileRef = useRef(null);

    const [firstName, setFirstName] = useState(userName.split(' ')[0] || '');
    const [lastName, setLastName]   = useState(userName.split(' ').slice(1).join(' ') || '');
    const [jobTitle, setJobTitle]   = useState('');
    const [location, setLocation]   = useState('');
    const [experience, setExperience] = useState('');
    const [bio, setBio]             = useState('');

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

    const toggleTech = (tech) => setSelectedTech(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);

    const handleFinish = () => {
        try {
            const existing = JSON.parse(localStorage.getItem('evolv_user') || '{}');
            const updated = { ...existing, firstName, lastName, jobTitle, location, experience, bio, techStack: selectedTech, availability, workType, photo: photoPreview, firstTime: false, profileComplete: true };
            localStorage.setItem('evolv_user', JSON.stringify(updated));
        } catch (_) {}
        onComplete();
    };

    const handleSkip = () => {
        try {
            const existing = JSON.parse(localStorage.getItem('evolv_user') || '{}');
            localStorage.setItem('evolv_user', JSON.stringify({ ...existing, firstTime: false, profileComplete: false }));
        } catch (_) {}
        onComplete();
    };

    return (
        <div className={"DevOnboardingModal_overlay"}>
            <div className={"DevOnboardingModal_modal"}>
                <div className={"DevOnboardingModal_header"}>
                    <div>
                        <h2 className={"DevOnboardingModal_title"}>Set up your Developer profile</h2>
                        <p className={"DevOnboardingModal_subtitle"}>Step {step} of 2 · Required</p>
                    </div>
                    <button className={"DevOnboardingModal_closeBtn"} onClick={handleSkip} title="Skip for now">✕</button>
                </div>

                <div className={"DevOnboardingModal_progressTrack"}>
                    <div className={"DevOnboardingModal_progressFill"} style={{ width: step === 1 ? '50%' : '100%' }} />
                </div>

                {step === 1 && (
                    <div className={"DevOnboardingModal_body"}>
                        <div className={"DevOnboardingModal_photoRow"}>
                            <div className={"DevOnboardingModal_photoCircle"} onClick={() => fileRef.current?.click()}>
                                {photoPreview ? <img src={photoPreview} alt="preview" className={"DevOnboardingModal_photoImg"} /> : (
                                    <><i className="fas fa-camera" style={{ fontSize: '1.2rem', color: '#5BC8A0', marginBottom: '0.3rem' }} /><span className={"DevOnboardingModal_photoLabel"}>Upload photo</span></>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                        </div>

                        <div className={"DevOnboardingModal_formRow"}>
                            <div className={"DevOnboardingModal_formGroup"}>
                                <label className={"DevOnboardingModal_label"}>First Name <span className={"DevOnboardingModal_required"}>*</span></label>
                                <input className={"DevOnboardingModal_input"} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Sara" />
                            </div>
                            <div className={"DevOnboardingModal_formGroup"}>
                                <label className={"DevOnboardingModal_label"}>Last Name <span className={"DevOnboardingModal_required"}>*</span></label>
                                <input className={"DevOnboardingModal_input"} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ahmed" />
                            </div>
                        </div>

                        <div className={"DevOnboardingModal_formGroupFull"}>
                            <label className={"DevOnboardingModal_label"}>Job Title / Role <span className={"DevOnboardingModal_required"}>*</span></label>
                            <input className={"DevOnboardingModal_input"} value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Full Stack Developer, AI Engineer, Backend Engineer" />
                        </div>

                        <div className={"DevOnboardingModal_formRow"}>
                            <div className={"DevOnboardingModal_formGroup"}>
                                <label className={"DevOnboardingModal_label"}>Location</label>
                                <input className={"DevOnboardingModal_input"} value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
                            </div>
                            <div className={"DevOnboardingModal_formGroup"}>
                                <label className={"DevOnboardingModal_label"}>Years of Experience</label>
                                <select className={"DevOnboardingModal_input"} value={experience} onChange={e => setExperience(e.target.value)}>
                                    <option value="">Select...</option>
                                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className={"DevOnboardingModal_formGroupFull"}>
                            <label className={"DevOnboardingModal_label"}>Bio / Tagline</label>
                            <textarea className={"DevOnboardingModal_textarea"} value={bio} onChange={e => setBio(e.target.value)} placeholder="e.g. Passionate AI engineer with 5 years building production-grade ML systems" rows={3} />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className={"DevOnboardingModal_body"}>
                        <div className={"DevOnboardingModal_formGroupFull"}>
                            <label className={"DevOnboardingModal_label"}>Tech Stack <span className={"DevOnboardingModal_required"}>*</span><span className={"DevOnboardingModal_labelNote"}> — pick all that apply</span></label>
                            <div className={"DevOnboardingModal_chipGrid"}>
                                {TECH_STACKS.map(tech => (
                                    <button key={tech} type="button" onClick={() => toggleTech(tech)} className={`${"DevOnboardingModal_chip"} ${selectedTech.includes(tech) ? "DevOnboardingModal_chipActive" : ''}`}>{tech}</button>
                                ))}
                            </div>
                        </div>

                        <div className={"DevOnboardingModal_formGroupFull"}>
                            <label className={"DevOnboardingModal_label"}>Preferred Work Type</label>
                            <div className={"DevOnboardingModal_workTypeRow"}>
                                {WORK_TYPES.map(w => (
                                    <button key={w} type="button" onClick={() => setWorkType(w)} className={`${"DevOnboardingModal_workTypeBtn"} ${workType === w ? "DevOnboardingModal_workTypeActive" : ''}`}>
                                        <i className={`fas fa-${w === 'Remote' ? 'laptop-house' : w === 'Hybrid' ? 'building' : 'office-building'}`} />{w}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={"DevOnboardingModal_availabilityRow"}>
                            <div>
                                <p className={"DevOnboardingModal_availTitle"}>Open to Opportunities</p>
                                <p className={"DevOnboardingModal_availSub"}>Let founders discover and reach out to you</p>
                            </div>
                            <div className={`${"DevOnboardingModal_toggle"} ${availability ? "DevOnboardingModal_toggleOn" : ''}`} onClick={() => setAvailability(a => !a)}>
                                <div className={"DevOnboardingModal_toggleThumb"} />
                            </div>
                        </div>
                    </div>
                )}

                <div className={"DevOnboardingModal_footer"}>
                    <button className={"DevOnboardingModal_skipBtn"} onClick={handleSkip}>Skip for now</button>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {step === 2 && <button className={"DevOnboardingModal_backBtn"} onClick={() => setStep(1)}>← Back</button>}
                        {step === 1 ? (
                            <button className={"DevOnboardingModal_continueBtn"} onClick={() => setStep(2)} disabled={!firstName.trim() || !jobTitle.trim()}>Continue →</button>
                        ) : (
                            <button className={"DevOnboardingModal_finishBtn"} onClick={handleFinish} disabled={selectedTech.length === 0}>🚀 Let&apos;s Go</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
