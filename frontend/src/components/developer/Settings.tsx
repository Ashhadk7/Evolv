// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';

import { Topbar, StatCard, ActionModal, FilterBar, InsightCard, InvitationCard, MatchCard, ProfileCard, ProjectCard, StartupCard, ApplicationCard, BlueprintPreview, FeaturedMatch, FeaturedMatchCard, DevOnboardingModal } from './shared';
import { discoverStats, featuredMatch, opportunities, filterOptions, trendingDomains, dashboardData } from './developerData';
import {
    createBlankDeveloperCertification,
    createBlankDeveloperSkill,
    getDeveloperEducations,
    getDeveloperCertifications,
    getDeveloperSkillEntries,
    normalizeDeveloperProfileForSave,
} from './profileUtils';
import { EDUCATION_LEVELS, createBlankEducation, getDegreeOptions, formatFounderEducation, formatFounderEducations } from '@/components/founder/profileUtils';
import { RatingStars } from '../founder/NetworkProfileDetail';

const PROFILE_TAGS = ['Web Developer', 'UI/UX', 'Frontend', 'Backend', 'Full Stack', 'AI Engineer', 'Mobile Developer', 'DevOps', 'Blockchain', 'Data Engineer', 'Product-minded'];
const SKILL_KINDS = ['Skill', 'Tech stack', 'Framework', 'Tool'];
const SKILL_EXPERIENCE = ['Learning', '< 1 year', '1-2 years', '3-5 years', '5+ years'];
const defaultProfile = {
    name: '',
    email: '',
    role: '',
    location: '',
    bio: '',
    techStack: [],
    availability: true,
    openToRemote: true,
    preferredBudget: '$180K – $250K',
    experienceYears: '5',
    avatarUrl: '',
    tags: [],
    skillEntries: [],
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
    rating: 5,
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

const getProfileName = (profile) =>
    profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Developer';

const getProfileInitials = (profile) => {
    const name = getProfileName(profile);
    const fromName = name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2);
    return (fromName || 'D').toUpperCase();
};

const formatProfileLink = (value) => value.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
const getExternalUrl = (value) => {
    if (!value) return '';
    return value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
};

const hydrateDeveloperProfile = (user = {}) => {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const hydrated = {
        ...defaultProfile,
        ...user,
        name: name || user.name || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || user.photo || '',
        photo: user.photo || user.avatarUrl || '',
        role: user.jobTitle || user.role || '',
        bio: user.bio || '',
        tags: Array.isArray(user.tags) ? user.tags : [],
        techStack: Array.isArray(user.techStack) ? user.techStack : Array.isArray(user.skills) ? user.skills : [],
        skillEntries: getDeveloperSkillEntries(user),
        educations: getDeveloperEducations(user),
        linkedin: user.linkedin || user.linkedIn || '',
        linkedIn: user.linkedIn || user.linkedin || '',
        certifications: getDeveloperCertifications(user),
    };
    return hydrated;
};

const Settings = ({ onNavigate }) => {
    const [profile, setProfile] = useState(defaultProfile);
    const [notifications, setNotifications] = useState(defaultNotifications);
    const [activeTab, setActiveTab] = useState('profile');
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
    const [paySaved, setPaySaved] = useState(false);
    const [payData, setPayData] = useState({ method: 'bank', accountName: 'Sarah Mitchell', accountNumber: '****4821', bankName: 'HBL Pakistan', currency: 'USD', paypal: 'sarah.mitchell@evolv.dev' });
    const photoInputRef = useRef(null);

    const handlePaySave = () => { setPaySaved(true); setTimeout(() => setPaySaved(false), 2000); };
    const [pwSaved, setPwSaved] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('evolv_user');
            if (raw) {
                const user = JSON.parse(raw);
                queueMicrotask(() => setProfile(hydrateDeveloperProfile(user)));
            }
        } catch (_) {}
    }, []);

    const profileTags = Array.isArray(profile.tags) ? profile.tags : [];
    const skillEntries = getDeveloperSkillEntries(profile);
    const certifications = getDeveloperCertifications(profile);
    const educationRows = profile.educations?.length
        ? profile.educations
        : [{ id: 'settings_primary_education', level: profile.educationLevel || '', degree: profile.degreeSelection === 'Other' ? 'Other' : profile.degreeName || '', customDegree: profile.customDegreeName || '', school: '' }];
    const displayName = getProfileName(profile);
    const displayInitials = getProfileInitials(profile);
    const displayRole = profile.role || profile.jobTitle || 'Developer';
    const displayPhoto = profile.avatarUrl || profile.photo || '';
    const displayLocation = [profile.city, profile.country].filter(Boolean).join(', ') || profile.location || '';
    const ratingValue = Number(profile.rating) || 0;
    const reviewCount = (profile.reviews || []).length;
    const hasEducation = educationRows.some((education) => formatFounderEducation(education));
    const profileLinks = [
        { id: 'github', label: 'GitHub', value: profile.github || '', icon: 'fab fa-github', required: true },
        { id: 'linkedin', label: 'LinkedIn', value: profile.linkedin || profile.linkedIn || '', icon: 'fab fa-linkedin', required: true },
        { id: 'portfolio', label: 'Portfolio', value: profile.portfolioLink || '', icon: 'fas fa-link', required: false },
    ];

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

    const cancelEditing = () => {
        try {
            const raw = localStorage.getItem('evolv_user');
            if (raw) setProfile(hydrateDeveloperProfile(JSON.parse(raw)));
        } catch (_) {}
        setEditing(false);
    };

    const handlePhotoUpload = (file) => {
        if (!file || !file.type || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setProfile((p) => ({ ...p, avatarUrl: reader.result, photo: reader.result }));
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

    const toggleTag = (tag) => {
        setProfile((p) => {
            const currentTags = Array.isArray(p.tags) ? p.tags : [];
            return {
                ...p,
                tags: currentTags.includes(tag)
                    ? currentTags.filter((item) => item !== tag)
                    : [...currentTags, tag],
            };
        });
    };

    const updateSkillEntry = (id, patch) => {
        setProfile((p) => {
            const next = getDeveloperSkillEntries(p).map((entry) => entry.id === id ? { ...entry, ...patch } : entry);
            return { ...p, skillEntries: next, techStack: next.map((entry) => entry.name).filter(Boolean) };
        });
    };

    const addSkillEntry = () => {
        setProfile((p) => ({ ...p, skillEntries: [...getDeveloperSkillEntries(p), createBlankDeveloperSkill()] }));
    };

    const removeSkillEntry = (id) => {
        setProfile((p) => {
            const next = getDeveloperSkillEntries(p).filter((entry) => entry.id !== id);
            return { ...p, skillEntries: next, techStack: next.map((entry) => entry.name).filter(Boolean) };
        });
    };

    const updateEducation = (id, patch) => {
        setProfile((p) => {
            const rows = p.educations?.length
                ? p.educations
                : [{ id, level: p.educationLevel || '', degree: p.degreeSelection === 'Other' ? 'Other' : p.degreeName || '', customDegree: p.customDegreeName || '', school: '' }];
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

    const removeEducation = (id) => {
        setProfile((p) => {
            const educations = (p.educations?.length ? p.educations : educationRows).filter((education) => education.id !== id);
            if (!educations.length) {
                return {
                    ...p,
                    educations: [],
                    education: '',
                    educationLevel: '',
                    degreeName: '',
                    degreeSelection: '',
                    customDegreeName: '',
                };
            }
            return { ...p, educations, education: formatFounderEducations(educations) };
        });
    };

    const updateCertification = (id, patch) => {
        setProfile((p) => ({
            ...p,
            certifications: getDeveloperCertifications(p).map((certification) => certification.id === id ? { ...certification, ...patch } : certification),
        }));
    };

    const addCertification = () => {
        setProfile((p) => ({ ...p, certifications: [...getDeveloperCertifications(p), createBlankDeveloperCertification()] }));
    };

    const removeCertification = (id) => {
        setProfile((p) => ({ ...p, certifications: getDeveloperCertifications(p).filter((certification) => certification.id !== id) }));
    };

    const handleCertificationImage = (id, file) => {
        if (!file || !file.type?.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') updateCertification(id, { image: reader.result });
        };
        reader.readAsDataURL(file);
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
                            <div className={"Settings_card Settings_profileCard"}>
                                <div className={"Settings_cardHeader Settings_profileHeader"}>
                                    <span><i className="fas fa-user" /> Developer Profile</span>
                                    {!editing && <button className={"Settings_addSkillBtn"} onClick={() => setEditing(true)}><i className="fas fa-pen" /> Edit Profile</button>}
                                </div>

                                {!editing ? (
                                    <div className={"Settings_profileView"}>
                                        <section className={"Settings_devProfileHero"}>
                                            <div className={"Settings_profileAvatar"}>
                                                {displayPhoto ? <img src={displayPhoto} alt={displayName} /> : <span>{displayInitials}</span>}
                                            </div>
                                            <div className={"Settings_profileHeroBody"}>
                                                <div className={"Settings_profileEyebrow"}>Developer profile</div>
                                                <h2>{displayName}</h2>
                                                <p className={"Settings_profileRole"}>{displayRole}</p>
                                                {displayLocation && <p className={"Settings_profileLocation"}><i className="fas fa-map-marker-alt" /> {displayLocation}</p>}
                                                <p className={"Settings_profileBio"}>{profile.bio || 'Add a short professional summary so founders can understand how you work.'}</p>
                                                {profileTags.length > 0 && (
                                                    <div className={"Settings_profileTagRow"}>
                                                        {profileTags.map((tag) => <span key={tag} className={"Settings_profileTag"}>{tag}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={"Settings_profileRatingCard"}>
                                                <RatingStars rating={ratingValue} size={14} />
                                                <div className={"Settings_ratingNumber"}>{ratingValue ? ratingValue.toFixed(1) : 'New'}</div>
                                                <div className={"Settings_ratingSub"}>{reviewCount} review{reviewCount === 1 ? '' : 's'}</div>
                                            </div>
                                        </section>

                                        <section className={"Settings_profileCardsGrid"}>
                                            {profileLinks.map((link) => (
                                                <div key={link.id} className={"Settings_infoCard"}>
                                                    <div className={"Settings_infoIcon"}><i className={link.icon} /></div>
                                                    <div>
                                                        <div className={"Settings_infoLabel"}>{link.label}{link.required ? ' *' : ''}</div>
                                                        {link.value ? (
                                                            <a href={getExternalUrl(link.value)} target="_blank" rel="noreferrer" className={"Settings_infoValue"}>{formatProfileLink(link.value)}</a>
                                                        ) : (
                                                            <div className={"Settings_infoMuted"}>Not added yet</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </section>

                                        <div className={"Settings_profileContentGrid"}>
                                            <section className={"Settings_profilePanel Settings_profilePanelWide"}>
                                                <div className={"Settings_panelHeader"}>
                                                    <div>
                                                        <span>Skills</span>
                                                        <p>Tech stack, frameworks, and practical experience.</p>
                                                    </div>
                                                </div>
                                                <div className={"Settings_skillFlowList"}>
                                                    {skillEntries.length ? skillEntries.map((entry) => (
                                                        <div key={entry.id} className={"Settings_skillFlowItem"}>
                                                            <div>
                                                                <div className={"Settings_itemTitle"}>{entry.name || 'Untitled skill'}</div>
                                                                <div className={"Settings_itemMeta"}>{entry.kind || 'Skill'}</div>
                                                            </div>
                                                            <span className={"Settings_experiencePill"}>{entry.experience || 'Experience not added'}</span>
                                                        </div>
                                                    )) : <div className={"Settings_emptyState"}>No skills added yet.</div>}
                                                </div>
                                            </section>

                                            <section className={"Settings_profilePanel"}>
                                                <div className={"Settings_panelHeader"}>
                                                    <div>
                                                        <span>Education</span>
                                                        <p>Degrees and academic background.</p>
                                                    </div>
                                                </div>
                                                <div className={"Settings_stackList"}>
                                                    {hasEducation ? educationRows.map((education) => (
                                                        <div key={education.id} className={"Settings_stackItem"}>
                                                            <div className={"Settings_itemTitle"}>{formatFounderEducation(education) || 'Education not added'}</div>
                                                            {education.school && <div className={"Settings_itemMeta"}>{education.school}</div>}
                                                        </div>
                                                    )) : <div className={"Settings_emptyState"}>No education added yet.</div>}
                                                </div>
                                            </section>

                                            <section className={"Settings_profilePanel"}>
                                                <div className={"Settings_panelHeader"}>
                                                    <div>
                                                        <span>Certifications</span>
                                                        <p>Optional credentials and certificates.</p>
                                                    </div>
                                                </div>
                                                <div className={"Settings_certGrid"}>
                                                    {certifications.length ? certifications.map((certification) => (
                                                        <div key={certification.id} className={"Settings_certCard"}>
                                                            {certification.image ? (
                                                                <img src={certification.image} alt={certification.name || 'Certification'} />
                                                            ) : (
                                                                <div className={"Settings_certPlaceholder"}><i className="fas fa-certificate" /></div>
                                                            )}
                                                            <div className={"Settings_itemTitle"}>{certification.name || 'Untitled certification'}</div>
                                                        </div>
                                                    )) : <div className={"Settings_emptyState"}>No certifications added yet.</div>}
                                                </div>
                                            </section>

                                            <section className={"Settings_profilePanel Settings_profilePanelWide"}>
                                                <div className={"Settings_panelHeader"}>
                                                    <div>
                                                        <span>Reviews</span>
                                                        <p>Feedback from founders and collaborators.</p>
                                                    </div>
                                                </div>
                                                <div className={"Settings_reviewGrid"}>
                                                    {(profile.reviews || []).length ? (profile.reviews || []).map((review) => (
                                                        <div key={review.id} className={"Settings_reviewCard"}>
                                                            <div className={"Settings_reviewTop"}>
                                                                <div>
                                                                    <div className={"Settings_itemTitle"}>{review.reviewer}</div>
                                                                    <div className={"Settings_itemMeta"}>{review.date}</div>
                                                                </div>
                                                                <RatingStars rating={review.rating || 0} size={12} />
                                                            </div>
                                                            <p>{review.comment}</p>
                                                        </div>
                                                    )) : <div className={"Settings_emptyState"}>No reviews yet.</div>}
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={"Settings_profileEdit"}>
                                        <section className={"Settings_editHero"}>
                                            <button type="button" className={"Settings_profileAvatar Settings_profileAvatarButton"} onClick={() => photoInputRef.current?.click()} aria-label="Change profile photo">
                                                {displayPhoto ? <img src={displayPhoto} alt={displayName} /> : <span>{displayInitials}</span>}
                                            </button>
                                            <div>
                                                <div className={"Settings_itemTitle"}>Profile photo</div>
                                                <p className={"Settings_itemMeta"}>Upload a clear image, or leave it blank to show initials.</p>
                                                <button className={"Settings_changePhotoBtn"} onClick={() => photoInputRef.current?.click()}><i className="fas fa-camera" /> Change Photo</button>
                                                <input
                                                    ref={photoInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                                                />
                                            </div>
                                        </section>

                                        <section className={"Settings_editSection"}>
                                            <div className={"Settings_panelHeader"} style={{padding: 10}}>
                                                <div>
                                                    <span>Basic profile</span>
                                                    <p>Name, headline, summary, and public links.</p>
                                                </div>
                                            </div>
                                            <div className={"Settings_formGrid"}>
                                                <div className={"Settings_formGroup"}>
                                                    <label>Full Name</label>
                                                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                                                </div>
                                                <div className={"Settings_formGroup"}>
                                                    <label>Email Address</label>
                                                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                                                </div>
                                                <div className={"Settings_formGroup"}>
                                                    <label>Professional Role *</label>
                                                    <input type="text" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
                                                </div>
                                                <div className={"Settings_formGroup"}>
                                                    <label>GitHub *</label>
                                                    <input type="url" value={profile.github || ''} onChange={(e) => setProfile({ ...profile, github: e.target.value })} placeholder="https://github.com/yourname" />
                                                </div>
                                                <div className={"Settings_formGroup"}>
                                                    <label>LinkedIn *</label>
                                                    <input type="url" value={profile.linkedin || ''} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/yourname" />
                                                </div>
                                                <div className={"Settings_formGroup"}>
                                                    <label>Portfolio link</label>
                                                    <input type="url" value={profile.portfolioLink || ''} onChange={(e) => setProfile({ ...profile, portfolioLink: e.target.value })} placeholder="https://yourportfolio.com" />
                                                </div>
                                                <div className={"Settings_formGroup Settings_formGroupFull"}>
                                                    <label>Professional Summary</label>
                                                    <textarea rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Optional, but helps founders understand how you work." />
                                                </div>
                                            </div>
                                        </section>

                                        <section className={"Settings_editSection"}>
                                            <div className={"Settings_panelHeader"} style={{padding: 10}}>
                                                <div>
                                                    <span>Profile tags</span>
                                                    <p>Optional labels shown below your role.</p>
                                                </div>
                                            </div>
                                            <div className={"Settings_profileTagPicker"}>
                                                {PROFILE_TAGS.map((tag) => (
                                                    <button style={{marginLeft: 10, marginBottom: 10}} key={tag} type="button" onClick={() => toggleTag(tag)} className={"Settings_profileTagOption" + (profileTags.includes(tag) ? ' Settings_profileTagOptionActive' : '')}>
                                                        <i className={profileTags.includes(tag) ? "fas fa-check" : "fas fa-plus"} /> {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        <section className={"Settings_editSection"}>
                                            <div className={"Settings_panelHeader"} style={{padding: 10}}>
                                                <div>
                                                    <span>Skills, tech stack & frameworks *</span>
                                                    <p>Add each skill with the experience level attached to it.</p>
                                                </div>
                                            </div>
                                            <div className={"Settings_editItemList"}>
                                                {skillEntries.map((entry, index) => (
                                                    <div key={entry.id} className={"Settings_editItemCard"}>
                                                        <div className={"Settings_editItemHeader"}>
                                                            <span>Skill {index + 1}</span>
                                                            <button className={"Settings_iconDangerBtn"} onClick={() => removeSkillEntry(entry.id)}><i className="fas fa-trash" /> Remove</button>
                                                        </div>
                                                        <div className={"Settings_formGrid Settings_formGridTight"}>
                                                            <div className={"Settings_formGroup"}>
                                                                <label>Type</label>
                                                                <select value={entry.kind || 'Skill'} onChange={(e) => updateSkillEntry(entry.id, { kind: e.target.value })}>{SKILL_KINDS.map((kind) => <option key={kind}>{kind}</option>)}</select>
                                                            </div>
                                                            <div className={"Settings_formGroup"}>
                                                                <label>Name</label>
                                                                <input value={entry.name || ''} onChange={(e) => updateSkillEntry(entry.id, { name: e.target.value })} placeholder="React, Figma, Laravel..." />
                                                            </div>
                                                            <div className={"Settings_formGroup"}>
                                                                <label>Experience</label>
                                                                <select value={entry.experience || ''} onChange={(e) => updateSkillEntry(entry.id, { experience: e.target.value })}>
                                                                    <option value="">Select experience</option>
                                                                    {SKILL_EXPERIENCE.map((item) => <option key={item}>{item}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className={"Settings_addSkillBtn Settings_sectionAction"} style={{margin: 20}} onClick={addSkillEntry}><i className="fas fa-plus" /> Add skill / stack / framework</button>
                                        </section>

                                        <section className={"Settings_editSection"}>
                                            <div className={"Settings_panelHeader"} style={{padding: 10}}>
                                                <div>
                                                    <span>Education *</span>
                                                    <p>Add one or more education entries.</p>
                                                </div>
                                            </div>
                                            <div className={"Settings_editItemList"}>
                                                {educationRows.map((education, index) => (
                                                    <div key={education.id} className={"Settings_editItemCard"}>
                                                        <div className={"Settings_editItemHeader"}>
                                                            <span>Education {index + 1}</span>
                                                            <button className={"Settings_iconDangerBtn"} onClick={() => removeEducation(education.id)}><i className="fas fa-trash" /> Remove</button>
                                                        </div>
                                                        <div className={"Settings_formGrid Settings_formGridTight"}>
                                                            <div className={"Settings_formGroup"}>
                                                                <label>Education level</label>
                                                                <select value={education.level} onChange={(e) => updateEducation(education.id, { level: e.target.value })}>
                                                                    <option value="">Select level</option>
                                                                    {EDUCATION_LEVELS.map((level) => <option key={level}>{level}</option>)}
                                                                </select>
                                                            </div>
                                                            <div className={"Settings_formGroup"}>
                                                                <label>Degree / program</label>
                                                                <select disabled={!education.level} value={education.degree} onChange={(e) => updateEducation(education.id, { degree: e.target.value })}>
                                                                    <option value="">{education.level ? 'Select degree' : 'Select level first'}</option>
                                                                    {getDegreeOptions(education.level).map((degree) => <option key={degree}>{degree}</option>)}
                                                                </select>
                                                            </div>
                                                            {education.degree === 'Other' && (
                                                                <div className={"Settings_formGroup"}>
                                                                    <label>Other degree</label>
                                                                    <input value={education.customDegree || ''} onChange={(e) => updateEducation(education.id, { customDegree: e.target.value })} />
                                                                </div>
                                                            )}
                                                            <div className={"Settings_formGroup"}>
                                                                <label>School / university</label>
                                                                <input value={education.school || ''} onChange={(e) => updateEducation(education.id, { school: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className={"Settings_addSkillBtn Settings_sectionAction"} style={{margin: 20}} onClick={() => setProfile({ ...profile, educations: [...educationRows, createBlankEducation()] })}><i className="fas fa-plus" /> Add education</button>
                                        </section>

                                        <section className={"Settings_editSection"}>
                                            <div className={"Settings_panelHeader"} style={{padding: 10}}>
                                                <div>
                                                    <span>Certifications</span>
                                                    <p>Optional certificates with proof images.</p>
                                                </div>
                                            </div>
                                            <div className={"Settings_editItemList"}>
                                                {certifications.map((certification, index) => (
                                                    <div key={certification.id} className={"Settings_editItemCard"}>
                                                        <div className={"Settings_editItemHeader"}>
                                                            <span>Certification {index + 1}</span>
                                                            <button className={"Settings_iconDangerBtn"} onClick={() => removeCertification(certification.id)}><i className="fas fa-trash" /> Remove</button>
                                                        </div>
                                                        <div className={"Settings_formGrid Settings_formGridTight"}>
                                                            <div className={"Settings_formGroup"}>
                                                                <label>Certificate name</label>
                                                                <input value={certification.name || ''} onChange={(e) => updateCertification(certification.id, { name: e.target.value })} placeholder="AWS Certified Developer" />
                                                            </div>
                                                            <div className={"Settings_formGroup"}>
                                                                <label>Certificate image</label>
                                                                <input type="file" accept="image/*" onChange={(e) => handleCertificationImage(certification.id, e.target.files?.[0])} />
                                                            </div>
                                                        </div>
                                                        {certification.image && <img className={"Settings_certEditImage"} src={certification.image} alt={certification.name || 'Certification'} />}
                                                    </div>
                                                ))}
                                            </div>
                                            <button className={"Settings_addSkillBtn Settings_sectionAction"} style={{margin: 20}}  onClick={addCertification}><i className="fas fa-plus" /> Add certification</button>
                                        </section>

                                        <div className={"Settings_cardFooter Settings_profileFooter"}>
                                            <button className={"Settings_secondaryBtn"} onClick={cancelEditing}>Cancel</button>
                                            <button className={"Settings_saveBtn" + (saved ? ' ' + "Settings_saveBtnSaved" : '')} onClick={handleSave}>
                                                {saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Changes</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
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
