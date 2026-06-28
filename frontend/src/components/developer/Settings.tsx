// @ts-nocheck
import React, { useRef, useState } from 'react';

import { Sidebar, Topbar, StatCard, ActionModal, FilterBar, InsightCard, InvitationCard, MatchCard, ProfileCard, ProjectCard, StartupCard, ApplicationCard, BlueprintPreview, FeaturedMatch, FeaturedMatchCard, DevOnboardingModal } from './shared';
import { discoverStats, featuredMatch, opportunities, filterOptions, trendingDomains, dashboardData } from './developerData';
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
                        name: name || defaultProfile.name,
                        email: user.email || defaultProfile.email,
                        avatarUrl: user.avatarUrl || defaultProfile.avatarUrl,
                    };
                }
            } catch (_) {}
        }
        return defaultProfile;
    });
    const [notifications, setNotifications] = useState(defaultNotifications);
    const [activeTab, setActiveTab] = useState('profile');
    const [newSkill, setNewSkill] = useState('');
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
            localStorage.setItem('evolv_user', JSON.stringify({
                ...currentUser,
                firstName,
                lastName,
                email: profile.email,
                avatarUrl: profile.avatarUrl,
            }));
        } catch (_) {}
        setSaved(true);
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

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'user' },
        { id: 'payment', label: 'Payment', icon: 'credit-card' },
        { id: 'notifications', label: 'Notifications', icon: 'bell' },
        { id: 'security', label: 'Security', icon: 'lock' },
        { id: 'preferences', label: 'Preferences', icon: 'sliders-h' },
    ];

    return (
        <div className={"Settings_container"}>
            <Sidebar currentPage="settings" onNavigate={onNavigate} />
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
                                    <span><i className="fas fa-user" /> Profile Information</span>
                                </div>

                                <div className={"Settings_avatarSection"}>
                                    <div className={"Settings_avatarCircle"}>
                                        <img src={profile.avatarUrl} alt="Sarah" />
                                    </div>
                                    <div>
                                        <div className={"Settings_avatarName"}>{profile.name}</div>
                                        <div className={"Settings_avatarRole"}>{profile.role}</div>
                                        <button className={"Settings_changePhotoBtn"} onClick={() => photoInputRef.current?.click()}><i className="fas fa-camera" /> Change Photo</button>
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
                                        <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>Email Address</label>
                                        <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>Professional Role</label>
                                        <input type="text" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup"}>
                                        <label>Location</label>
                                        <input type="text" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                                    </div>
                                    <div className={"Settings_formGroup" + ' ' + "Settings_formGroupFull"}>
                                        <label>Bio</label>
                                        <textarea rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                                    </div>
                                </div>

                                <div className={"Settings_sectionDivider"}>Tech Stack</div>
                                <div className={"Settings_skillsWrap"}>
                                    {profile.techStack.map((s) => (
                                        <div key={s} className={"Settings_skillTag"}>
                                            {s}
                                            <button className={"Settings_removeSkill"} onClick={() => removeSkill(s)}><i className="fas fa-times" /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className={"Settings_addSkillRow"}>
                                    <input type="text" className={"Settings_skillInput"} placeholder="Add skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }} />
                                    <button className={"Settings_addSkillBtn"} onClick={addSkill}><i className="fas fa-plus" /> Add</button>
                                </div>

                                <div className={"Settings_sectionDivider"}>Availability</div>
                                <div className={"Settings_toggleRow"}>
                                    <div>
                                        <div className={"Settings_toggleLabel"}>Open to Opportunities</div>
                                        <div className={"Settings_toggleSub"}>Let founders see you are actively looking</div>
                                    </div>
                                    <div className={"Settings_toggle" + (profile.availability ? ' ' + "Settings_toggleOn" : '')} onClick={() => setProfile({ ...profile, availability: !profile.availability })}>
                                        <div className={"Settings_toggleKnob"} />
                                    </div>
                                </div>
                                <div className={"Settings_toggleRow"}>
                                    <div>
                                        <div className={"Settings_toggleLabel"}>Open to Remote</div>
                                        <div className={"Settings_toggleSub"}>Accept fully remote engagements</div>
                                    </div>
                                    <div className={"Settings_toggle" + (profile.openToRemote ? ' ' + "Settings_toggleOn" : '')} onClick={() => setProfile({ ...profile, openToRemote: !profile.openToRemote })}>
                                        <div className={"Settings_toggleKnob"} />
                                    </div>
                                </div>

                                <div className={"Settings_cardFooter"}>
                                    <button className={"Settings_saveBtn" + (saved ? ' ' + "Settings_saveBtnSaved" : '')} onClick={handleSave}>
                                        {saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Changes</>}
                                    </button>
                                </div>
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
