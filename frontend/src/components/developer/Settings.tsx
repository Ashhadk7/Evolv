// @ts-nocheck
import React, { useRef, useState } from 'react';

import { Topbar, StatCard, ActionModal, FilterBar, InsightCard, InvitationCard, MatchCard, ProfileCard, ProjectCard, StartupCard, ApplicationCard, BlueprintPreview, FeaturedMatch, FeaturedMatchCard, DevOnboardingModal } from './shared';
import { discoverStats, featuredMatch, opportunities, filterOptions, trendingDomains, dashboardData } from './developerData';
import {
    createBlankDeveloperProject,
    getDeveloperEducations,
    normalizeDeveloperProfileForSave,
} from './profileUtils';
import { EDUCATION_LEVELS, createBlankEducation, getDegreeOptions, formatFounderEducations } from '@/components/founder/profileUtils';
const defaultProfile = {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@evolv.dev',
    role: 'Senior AI Engineer',
    location: 'Islamabad, Pakistan',
    bio: 'Passionate AI engineer with 5+ years building scalable ML systems. I love working with early-stage startups to bring AI products to market.',
    techStack: ['Python', 'FastAPI', 'AI/ML', 'React', 'Docker', 'AWS'],
    availability: true,
    openToRemote: true,
    preferredBudget: '$180K – $250K',
    experienceYears: '5',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    experience: '5-8 years',
    education: '',
    educationLevel: '',
    degreeName: '',
    degreeSelection: '',
    customDegreeName: '',
    educations: [],
    github: '',
    linkedin: '',
    portfolioLink: '',
    certifications: [],
    projects: [],
    rating: 4.8,
    reviews: [
        { id: 'review-1', reviewer: 'Asad Ahmed', rating: 5, date: 'Jun 2026', comment: 'Clear communication, thoughtful engineering decisions, and strong ownership from scope to delivery.' },
        { id: 'review-2', reviewer: 'Priya Sharma', rating: 5, date: 'May 2026', comment: 'Great collaborator for early-stage product work. Shipped fast without losing sight of maintainability.' },
    ],
};

const defaultNotifications = {
    newMatch: true,
    applicationUpdate: true,
    messageReceived: true,
    weeklyDigest: true,
    founderViewed: false,
    marketingEmails: false,
};

const Settings = ({ onNavigate }) => {
    const [profile, setProfile] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const raw = localStorage.getItem('evolv_user');
                if (raw) {
                    const user = JSON.parse(raw);
                    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
                    return {
                        ...defaultProfile,
                        ...user,
                        name: name || defaultProfile.name,
                        email: user.email || defaultProfile.email,
                        avatarUrl: user.avatarUrl || defaultProfile.avatarUrl,
                        role: user.jobTitle || user.role || defaultProfile.role,
                        techStack: Array.isArray(user.techStack) ? user.techStack : defaultProfile.techStack,
                        educations: getDeveloperEducations(user),
                        linkedin: user.linkedin || user.linkedIn || '',
                    };
                }
            } catch (_) {}
        }
        return defaultProfile;
    });
    const [notifications, setNotifications] = useState(defaultNotifications);
    const [activeTab, setActiveTab] = useState('profile');
    const [editing, setEditing] = useState(true);
    const [newSkill, setNewSkill] = useState('');
    const [newCertification, setNewCertification] = useState('');
    const [saved, setSaved] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
    const [paySaved, setPaySaved] = useState(false);
    const [payData, setPayData] = useState({ method: 'bank', accountName: 'Sarah Mitchell', accountNumber: '****4821', bankName: 'HBL Pakistan', currency: 'USD', paypal: 'sarah.mitchell@evolv.dev' });
    const photoInputRef = useRef(null);

    const handlePaySave = () => { setPaySaved(true); setTimeout(() => setPaySaved(false), 2000); };
    const [pwSaved, setPwSaved] = useState(false);

    const handleSave = () => {
        try {
            const raw = localStorage.getItem('evolv_user');
            const currentUser = raw ? JSON.parse(raw) : {};
            const parts = profile.name.trim().split(' ');
            const firstName = parts[0] || '';
            const lastName = parts.slice(1).join(' ') || '';
            const normalized = normalizeDeveloperProfileForSave({
                ...profile,
                firstName,
                lastName,
                jobTitle: profile.role,
                role: profile.role,
                education: formatFounderEducations(profile.educations || []),
            });
            localStorage.setItem('evolv_user', JSON.stringify({
                ...currentUser,
                ...normalized,
            }));
            setProfile((current) => ({ ...current, ...normalized, name: profile.name }));
        } catch (_) {}
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2000);
    };

    const handlePhotoUpload = (file) => {
        if (!file || !file.type || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setProfile((p) => ({ ...p, avatarUrl: reader.result }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handlePwSave = () => {
        if (!passwordData.current || !passwordData.newPass) return;
        setPwSaved(true);
        setPasswordData({ current: '', newPass: '', confirm: '' });
        setTimeout(() => setPwSaved(false), 2000);
    };

    const addSkill = () => {
        const trimmed = newSkill.trim();
        if (trimmed && !profile.techStack.includes(trimmed)) {
            setProfile((p) => ({ ...p, techStack: [...p.techStack, trimmed] }));
        }
        setNewSkill('');
    };

    const removeSkill = (skill) => {
        setProfile((p) => ({ ...p, techStack: p.techStack.filter((s) => s !== skill) }));
    };

    const updateEducation = (id, patch) => {
        setProfile((p) => {
            const rows = p.educations?.length ? p.educations : [{ id, level: '', degree: '', customDegree: '', school: '' }];
            const educations = rows.map((education) => {
                if (education.id !== id) return education;
                const next = { ...education, ...patch };
                if (patch.level !== undefined) {
                    next.degree = '';
                    next.customDegree = '';
                }
                if (patch.degree && patch.degree !== 'Other') next.customDegree = '';
                return next;
            });
            return { ...p, educations, education: formatFounderEducations(educations) };
        });
    };

    const addCertification = () => {
        const trimmed = newCertification.trim();
        if (!trimmed) return;
        setProfile((p) => ({ ...p, certifications: [...(p.certifications || []), trimmed] }));
        setNewCertification('');
    };

    const removeCertification = (certification) => {
        setProfile((p) => ({ ...p, certifications: (p.certifications || []).filter((item) => item !== certification) }));
    };

    const updateProject = (id, patch) => {
        setProfile((p) => ({
            ...p,
            projects: (p.projects || []).map((project) => project.id === id ? { ...project, ...patch } : project),
        }));
    };

    const handleProjectImages = (id, files) => {
        const imageFiles = Array.from(files || []).filter((file) => file.type?.startsWith('image/'));
        if (!imageFiles.length) return;
        Promise.all(imageFiles.map((file) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.readAsDataURL(file);
        }))).then((images) => {
            setProfile((p) => ({
                ...p,
                projects: (p.projects || []).map((project) =>
                    project.id === id ? { ...project, images: [...(project.images || []), ...images.filter(Boolean)] } : project
                ),
            }));
        });
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'user' },
        { id: 'payment', label: 'Payment', icon: 'credit-card' },
        { id: 'notifications', label: 'Notifications', icon: 'bell' },
        { id: 'security', label: 'Security', icon: 'lock' },
        { id: 'preferences', label: 'Preferences', icon: 'sliders-h' },
    ];

    return (
        <div className={"Settings_container"}>
            <main className={"Settings_mainWrapper"}>
                <Topbar title="Settings" subtitle="Manage your profile, preferences, and account security." onNavigate={onNavigate} />

                <div className={"Settings_settingsLayout"}>
                    {/* Tabs */}
                    <div className={"Settings_tabsCol"}>
                        {tabs.map((tab) => (
                            <button key={tab.id} className={"Settings_tabBtn" + (activeTab === tab.id ? ' ' + "Settings_tabBtnActive" : '')} onClick={() => setActiveTab(tab.id)}>
                                <i className={'fas fa-' + tab.icon} />
                                {tab.label}
                            </button>
                        ))}
                        <div className={"Settings_dangerZone"}>
                            <div className={"Settings_dangerTitle"}><i className="fas fa-exclamation-triangle" /> Danger Zone</div>
                            <button className={"Settings_dangerBtn"}>Delete Account</button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className={"Settings_contentCol"}>

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className={"Settings_card"}>
                                <div className={"Settings_cardHeader"}>
                                    <span><i className="fas fa-user" /> Developer Profile</span>
                                    <button className={"Settings_addSkillBtn"} onClick={() => setEditing((value) => !value)}>
                                        <i className="fas fa-pen" /> {editing ? 'Preview' : 'Edit Profile'}
                                    </button>
                                </div>

                                <div className={"Settings_avatarSection"}>
                                    <div className={"Settings_avatarCircle"}>
                                        <img src={profile.avatarUrl} alt={profile.name} />
                                    </div>
                                    <div>
                                        <div className={"Settings_avatarName"}>{profile.name}</div>
                                        <div className={"Settings_avatarRole"}>{profile.role}</div>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                                            <span className={"Settings_skillTag"}><i className="fas fa-star" /> {profile.rating}/5 rating</span>
                                            <span className={"Settings_skillTag"}>{(profile.reviews || []).length} reviews</span>
                                        </div>
                                        {editing && <button className={"Settings_changePhotoBtn"} onClick={() => photoInputRef.current?.click()}><i className="fas fa-camera" /> Change Photo</button>}
                                        <input
                                            ref={photoInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                                        />
                                    </div>
                                </div>

                                <div className={"Settings_formGrid"}>
                                    <div className={"Settings_formGroup"}>
                                        <label>Full Name</label>
                                        <input disabled={!editing} type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>Email Address</label>
                                        <input disabled={!editing} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>Professional Role *</label>
                                        <input disabled={!editing} type="text" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>Experience *</label>
                                        <select disabled={!editing} value={profile.experience || ''} onChange={(e) => setProfile({ ...profile, experience: e.target.value })}>
                                            <option value="">Select experience</option>
                                            {['< 1 year', '1-2 years', '3-5 years', '5-8 years', '8+ years'].map((item) => <option key={item}>{item}</option>)}
                                        </select>
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>GitHub *</label>
                                        <input disabled={!editing} type="url" value={profile.github || ''} onChange={(e) => setProfile({ ...profile, github: e.target.value })} placeholder="https://github.com/yourname" />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>LinkedIn *</label>
                                        <input disabled={!editing} type="url" value={profile.linkedin || ''} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/yourname" />
                                    </div>
                                    <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                        <label>Portfolio link</label>
                                        <input disabled={!editing} type="url" value={profile.portfolioLink || ''} onChange={(e) => setProfile({ ...profile, portfolioLink: e.target.value })} placeholder="https://yourportfolio.com" />
                                    </div>
                                    <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                        <label>Professional Summary</label>
                                        <textarea disabled={!editing} rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Optional, but helps founders understand how you work." />
                                    </div>
                                </div>

                                <div className={"Settings_sectionDivider"}>Core Skills *</div>
                                <div className={"Settings_skillsWrap"}>
                                    {profile.techStack.map((s) => (
                                        <div key={s} className={"Settings_skillTag"}>
                                            {s}
                                            {editing && <button className={"Settings_removeSkill"} onClick={() => removeSkill(s)}><i className="fas fa-times" /></button>}
                                        </div>
                                    ))}
                                </div>
                                {editing && <div className={"Settings_addSkillRow"}>
                                    <input type="text" className={"Settings_skillInput"} placeholder="Add skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }} />
                                    <button className={"Settings_addSkillBtn"} onClick={addSkill}><i className="fas fa-plus" /> Add</button>
                                </div>}

                                <div className={"Settings_sectionDivider"}>Education *</div>
                                {(profile.educations?.length ? profile.educations : [{ id: 'settings_primary_education', level: profile.educationLevel || '', degree: profile.degreeSelection === 'Other' ? 'Other' : profile.degreeName || '', customDegree: profile.customDegreeName || '', school: '' }]).map((education, index) => (
                                    <div key={education.id} className={"Settings_formGrid"} style={{ marginBottom: '1rem' }}>
                                        <div className={"Settings_formGroup"}>
                                            <label>Education {index + 1}</label>
                                            <select disabled={!editing} value={education.level} onChange={(e) => updateEducation(education.id, { level: e.target.value })}>
                                                <option value="">Select level</option>
                                                {EDUCATION_LEVELS.map((level) => <option key={level}>{level}</option>)}
                                            </select>
                                        </div>
                                        <div className={"Settings_formGroup"}>
                                            <label>Degree / program</label>
                                            <select disabled={!editing || !education.level} value={education.degree} onChange={(e) => updateEducation(education.id, { degree: e.target.value })}>
                                                <option value="">{education.level ? 'Select degree' : 'Select level first'}</option>
                                                {getDegreeOptions(education.level).map((degree) => <option key={degree}>{degree}</option>)}
                                            </select>
                                        </div>
                                        {education.degree === 'Other' && (
                                            <div className={"Settings_formGroup"}>
                                                <label>Other degree</label>
                                                <input disabled={!editing} value={education.customDegree || ''} onChange={(e) => updateEducation(education.id, { customDegree: e.target.value })} />
                                            </div>
                                        )}
                                        <div className={"Settings_formGroup"}>
                                            <label>School / university</label>
                                            <input disabled={!editing} value={education.school || ''} onChange={(e) => updateEducation(education.id, { school: e.target.value })} />
                                        </div>
                                    </div>
                                ))}
                                {editing && <button className={"Settings_addSkillBtn"} onClick={() => setProfile({ ...profile, educations: [...(profile.educations || []), createBlankEducation()] })}><i className="fas fa-plus" /> Add education</button>}

                                <div className={"Settings_sectionDivider"}>Certifications</div>
                                <div className={"Settings_skillsWrap"}>
                                    {(profile.certifications || []).map((certification) => (
                                        <div key={certification} className={"Settings_skillTag"}>
                                            {certification}
                                            {editing && <button className={"Settings_removeSkill"} onClick={() => removeCertification(certification)}><i className="fas fa-times" /></button>}
                                        </div>
                                    ))}
                                </div>
                                {editing && <div className={"Settings_addSkillRow"}>
                                    <input type="text" className={"Settings_skillInput"} placeholder="Add certification..." value={newCertification} onChange={(e) => setNewCertification(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addCertification(); }} />
                                    <button className={"Settings_addSkillBtn"} onClick={addCertification}><i className="fas fa-plus" /> Add</button>
                                </div>}

                                <div className={"Settings_sectionDivider"}>Projects</div>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {(profile.projects || []).map((project) => (
                                        <div key={project.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                            <div className={"Settings_formGrid"}>
                                                <div className={"Settings_formGroup"}>
                                                    <label>Project title</label>
                                                    <input disabled={!editing} value={project.title} onChange={(e) => updateProject(project.id, { title: e.target.value })} />
                                                </div>
                                                <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                                    <label>Description</label>
                                                    <textarea disabled={!editing} rows={3} value={project.description} onChange={(e) => updateProject(project.id, { description: e.target.value })} />
                                                </div>
                                                {editing && <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                                    <label>Project images</label>
                                                    <input type="file" multiple accept="image/*" onChange={(e) => handleProjectImages(project.id, e.target.files)} />
                                                </div>}
                                            </div>
                                            {project.images?.length > 0 && (
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                                                    {project.images.map((image, index) => <img key={index} src={image} alt={`${project.title || 'Project'} ${index + 1}`} style={{ width: 84, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }} />)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {editing && <button className={"Settings_addSkillBtn"} style={{ marginTop: '1rem' }} onClick={() => setProfile({ ...profile, projects: [...(profile.projects || []), createBlankDeveloperProject()] })}><i className="fas fa-plus" /> Add project</button>}

                                <div className={"Settings_sectionDivider"}>Reviews</div>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {(profile.reviews || []).map((review) => (
                                        <div key={review.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <strong>{review.reviewer}</strong>
                                                <span>{review.rating}/5</span>
                                            </div>
                                            <div style={{ color: '#7a9e8e', fontSize: 12, marginTop: 4 }}>{review.date}</div>
                                            <p style={{ marginTop: 8, lineHeight: 1.6 }}>{review.comment}</p>
                                        </div>
                                    ))}
                                </div>

                                {editing && <div className={"Settings_cardFooter"}>
                                    <button className={"Settings_saveBtn" + (saved ? ' ' + "Settings_saveBtnSaved" : '')} onClick={handleSave}>
                                        {saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Changes</>}
                                    </button>
                                </div>}
                            </div>
                        )}

                        {/* PAYMENT TAB */}
                        {activeTab === 'payment' && (
                            <div className={"Settings_card"}>
                                <div className={"Settings_cardHeader"}><span><i className="fas fa-credit-card" /> Payment & Billing</span></div>

                                <div className={"Settings_sectionDivider"}>Payment Method</div>
                                <div className={"Settings_formGrid"}>
                                    <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                        <label>Preferred Method</label>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            {['bank', 'paypal', 'stripe'].map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => setPayData({ ...payData, method: m })}
                                                    className={"Settings_filterChip" || ''}
                                                    style={{
                                                        padding: '0.5rem 1.2rem',
                                                        borderRadius: '8px',
                                                        border: `1.5px solid ${payData.method === m ? '#5BC8A0' : 'rgba(255,255,255,0.08)'}`,
                                                        background: payData.method === m ? 'rgba(91,200,160,0.12)' : 'rgba(255,255,255,0.03)',
                                                        color: payData.method === m ? '#5BC8A0' : '#a0a0a0',
                                                        fontWeight: payData.method === m ? 700 : 400,
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        textTransform: 'capitalize',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <i className={`fas fa-${m === 'bank' ? 'university' : m === 'paypal' ? 'paypal' : 'credit-card'}`} style={{ marginRight: '0.4rem' }} />
                                                    {m === 'bank' ? 'Bank Transfer' : m === 'paypal' ? 'PayPal' : 'Stripe'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {payData.method === 'bank' && (
                                    <div className={"Settings_formGrid"}>
                                        <div className={"Settings_formGroup"}>
                                            <label>Account Name</label>
                                            <input type="text" value={payData.accountName} onChange={(e) => setPayData({ ...payData, accountName: e.target.value })} />
                                        </div>
                                        <div className={"Settings_formGroup"}>
                                            <label>Account Number</label>
                                            <input type="text" value={payData.accountNumber} onChange={(e) => setPayData({ ...payData, accountNumber: e.target.value })} />
                                        </div>
                                        <div className={"Settings_formGroup"}>
                                            <label>Bank Name</label>
                                            <input type="text" value={payData.bankName} onChange={(e) => setPayData({ ...payData, bankName: e.target.value })} />
                                        </div>
                                        <div className={"Settings_formGroup"}>
                                            <label>Currency</label>
                                            <select value={payData.currency} onChange={(e) => setPayData({ ...payData, currency: e.target.value })}>
                                                <option>USD</option>
                                                <option>EUR</option>
                                                <option>GBP</option>
                                                <option>PKR</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {payData.method === 'paypal' && (
                                    <div className={"Settings_formGrid"}>
                                        <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                            <label>PayPal Email</label>
                                            <input type="email" value={payData.paypal} onChange={(e) => setPayData({ ...payData, paypal: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {payData.method === 'stripe' && (
                                    <div className={"Settings_formGrid"}>
                                        <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                            <label>Stripe Account Email</label>
                                            <input type="email" placeholder="your@email.com" />
                                        </div>
                                    </div>
                                )}

                                <div className={"Settings_sectionDivider"}>Billing Summary</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {[
                                        { label: 'Total Earned', value: '$12,400', icon: 'dollar-sign', color: '#5BC8A0' },
                                        { label: 'Pending Payout', value: '$1,800', icon: 'hourglass-half', color: '#C4973A' },
                                        { label: 'Last Payment', value: '$3,200', icon: 'check-circle', color: '#7C5CBF' },
                                    ].map((item) => (
                                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem 1.2rem' }}>
                                            <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.4rem' }}><i className={`fas fa-${item.icon}`} style={{ marginRight: '0.4rem', color: item.color }} />{item.label}</div>
                                            <div style={{ color: item.color, fontSize: '1.4rem', fontWeight: 700 }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className={"Settings_cardFooter"}>
                                    <button className={"Settings_saveBtn" + (paySaved ? ' ' + "Settings_saveBtnSaved" : '')} onClick={handlePaySave}>
                                        {paySaved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Payment Info</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'notifications' && (
                            <div className={"Settings_card"}>
                                <div className={"Settings_cardHeader"}><span><i className="fas fa-bell" /> Notification Preferences</span></div>
                                <div className={"Settings_notifList"}>
                                    {Object.entries({
                                        newMatch: { label: 'New AI Match Found', sub: 'Get notified when our AI finds a new startup match for you' },
                                        applicationUpdate: { label: 'Application Status Update', sub: 'When founders view or update your application status' },
                                        messageReceived: { label: 'New Message Received', sub: 'When founders or developers message you' },
                                        weeklyDigest: { label: 'Weekly Digest', sub: 'A summary of your activity and new opportunities every Monday' },
                                        founderViewed: { label: 'Profile Viewed by Founder', sub: 'When a founder views your developer profile' },
                                        marketingEmails: { label: 'Marketing & Product Updates', sub: 'News, tips, and announcements from Evolv' },
                                    }).map(([key, { label, sub }]) => (
                                        <div key={key} className={"Settings_notifItem"}>
                                            <div>
                                                <div className={"Settings_notifLabel"}>{label}</div>
                                                <div className={"Settings_notifSub"}>{sub}</div>
                                            </div>
                                            <div className={"Settings_toggle" + (notifications[key] ? ' ' + "Settings_toggleOn" : '')} onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}>
                                                <div className={"Settings_toggleKnob"} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={"Settings_cardFooter"}>
                                    <button className={"Settings_saveBtn" + (saved ? ' ' + "Settings_saveBtnSaved" : '')} onClick={handleSave}>
                                        {saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Preferences</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <div className={"Settings_card"}>
                                <div className={"Settings_cardHeader"}><span><i className="fas fa-lock" /> Security Settings</span></div>
                                <div className={"Settings_formGrid"}>
                                    <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                        <label>Current Password</label>
                                        <input type="password" placeholder="Enter current password" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>New Password</label>
                                        <input type="password" placeholder="Enter new password" value={passwordData.newPass} onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>Confirm New Password</label>
                                        <input type="password" placeholder="Confirm new password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                                    </div>
                                </div>
                                <div className={"Settings_securityInfo"}>
                                    <i className="fas fa-shield-alt" style={{ color: '#5BC8A0' }} />
                                    <span>Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.</span>
                                </div>
                                <div className={"Settings_sectionDivider"}>Two-Factor Authentication</div>
                                <div className={"Settings_twoFARow"}>
                                    <div className={"Settings_twoFALeft"}>
                                        <div className={"Settings_twoFALabel"}><i className="fas fa-mobile-alt" style={{ color: '#5BC8A0' }} /> Authenticator App</div>
                                        <div className={"Settings_twoFASub"}>Use Google Authenticator or Authy to generate one-time codes</div>
                                    </div>
                                    <button className={"Settings_enableBtn"}><i className="fas fa-plus" /> Enable</button>
                                </div>
                                <div className={"Settings_cardFooter"}>
                                    <button className={"Settings_saveBtn" + (pwSaved ? ' ' + "Settings_saveBtnSaved" : '')} onClick={handlePwSave}>
                                        {pwSaved ? <><i className="fas fa-check" /> Password Updated!</> : <><i className="fas fa-save" /> Update Password</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PREFERENCES TAB */}
                        {activeTab === 'preferences' && (
                            <div className={"Settings_card"}>
                                <div className={"Settings_cardHeader"}><span><i className="fas fa-sliders-h" /> Preferences</span></div>
                                <div className={"Settings_formGrid"}>
                                    <div className={"Settings_formGroup"}>
                                        <label>Preferred Budget Range</label>
                                        <select value={profile.preferredBudget} onChange={(e) => setProfile({ ...profile, preferredBudget: e.target.value })}>
                                            <option>Under $100K</option>
                                            <option>$100K – $150K</option>
                                            <option>$150K – $200K</option>
                                            <option>$180K – $250K</option>
                                            <option>$250K+</option>
                                        </select>
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>Years of Experience</label>
                                        <select value={profile.experienceYears} onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}>
                                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'].map((y) => <option key={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className={"Settings_sectionDivider"}>Match Preferences</div>
                                <div className={"Settings_prefNote"}><i className="fas fa-robot" /> These settings help our AI find better startup matches for you.</div>
                                {[
                                    { key: 'ai_match', label: 'Enable AI Matching', sub: 'Allow the AI agent to proactively find and suggest startup matches' },
                                    { key: 'notify_match', label: 'Instant Match Alerts', sub: 'Get notified immediately when a high-compatibility match is found' },
                                ].map(({ key, label, sub }) => (
                                    <div key={key} className={"Settings_toggleRow"}>
                                        <div>
                                            <div className={"Settings_toggleLabel"}>{label}</div>
                                            <div className={"Settings_toggleSub"}>{sub}</div>
                                        </div>
                                        <div className={"Settings_toggle" + ' ' + "Settings_toggleOn"}><div className={"Settings_toggleKnob"} /></div>
                                    </div>
                                ))}
                                <div className={"Settings_cardFooter"}>
                                    <button className={"Settings_saveBtn" + (saved ? ' ' + "Settings_saveBtnSaved" : '')} onClick={handleSave}>
                                        {saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Preferences</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={"Settings_footer"}>
                    <span>Evolv · Settings</span>
                    <div className={"Settings_footerRight"}><div className={"Settings_greenDot"} /><span>© 2025 Evolv. All rights reserved.</span></div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
