"use client";

import React, { useState, useEffect } from 'react';
import DeveloperDashboardPage from '../components/developer/DeveloperDashboard';
import { DevOnboardingModal } from '../components/developer/shared';
import { Sidebar, type DeveloperTab } from '../components/developer/shared/Sidebar';

import Applications from '../components/developer/Applications';
import Discover     from '../components/developer/Discover';
import Network, { type DeveloperNetworkMessageTarget } from '../components/developer/Network';
import Projects     from '../components/developer/Projects';
import Inbox, { type DeveloperInboxLaunchContact } from '../components/developer/Inbox';
import Settings     from '../components/developer/Settings';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, X, ArrowRight } from '@phosphor-icons/react';
import {
    getMissingDeveloperProfileFields,
    isDeveloperProfileComplete,
    normalizeDeveloperProfileForSave,
    type DeveloperProfile
} from '../components/developer/profileUtils';

type DeveloperPageProps = {
    onNavigate: (page: DeveloperTab) => void;
    profileComplete?: boolean;
    onRequireProfile?: (afterComplete?: () => void) => void;
};

const pages: Partial<Record<DeveloperTab, React.ComponentType<DeveloperPageProps>>> = {
    dashboard: DeveloperDashboardPage,
    applications: Applications,
    discover: Discover,
    projects: Projects,
    settings: Settings,
};

const DEFAULT_PROFILE: DeveloperProfile = {
    firstName: '', lastName: '', email: '', avatarUrl: '', jobTitle: '', role: '',
    experience: '', bio: '', techStack: [], education: '', educationLevel: '',
    degreeName: '', degreeSelection: '', customDegreeName: '', educations: [],
    github: '', linkedin: '', portfolioLink: '', certifications: [], projects: [],
    profileComplete: false, firstTime: false,
};

export default function DeveloperDashboard() {
    const [currentPage, setCurrentPage] = useState<DeveloperTab>('dashboard');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [profilePromptDismissed, setProfilePromptDismissed] = useState(false);
    const [profile, setProfile] = useState<DeveloperProfile>(DEFAULT_PROFILE);
    const pendingProtectedActionRef = React.useRef<(() => void) | null>(null);

    const [userName, setUserName] = useState('');
    const [inboxActiveContactId, setInboxActiveContactId] = useState('asad');
    const [networkInboxContacts, setNetworkInboxContacts] = useState<DeveloperInboxLaunchContact[]>([]);

    useEffect(() => {
        const loadTimer = window.setTimeout(() => {
            try {
                const raw = localStorage.getItem('evolv_user');
                if (raw) {
                    const user = JSON.parse(raw);
                    setProfile(normalizeDeveloperProfileForSave({ ...DEFAULT_PROFILE, ...user }));
                    if (user.firstTime === true) {
                        const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
                        setUserName(name);
                        setShowOnboarding(true);
                    }
                } else {
                    const defaultUser = { ...DEFAULT_PROFILE, firstTime: true, profileComplete: false, firstName: "Sarah", lastName: "Mitchell" };
                    localStorage.setItem('evolv_user', JSON.stringify(defaultUser));
                    setProfile(defaultUser);
                    setUserName("Sarah Mitchell");
                    setShowOnboarding(true);
                }
            } catch {}
        }, 0);
        return () => window.clearTimeout(loadTimer);
    }, []);

    const handleOnboardingComplete = (updatedProfile?: any) => {
        const nextProfile = normalizeDeveloperProfileForSave(updatedProfile ?? profile);
        try {
            const raw = localStorage.getItem('evolv_user');
            const existing = raw ? JSON.parse(raw) : {};
            localStorage.setItem('evolv_user', JSON.stringify({ ...existing, ...nextProfile, profileComplete: true, firstTime: false }));
        } catch {}
        
        setProfile({ ...nextProfile, profileComplete: true, firstTime: false });
        setShowOnboarding(false);
        setProfilePromptDismissed(true);

        const pendingAction = pendingProtectedActionRef.current;
        pendingProtectedActionRef.current = null;
        if (pendingAction) window.setTimeout(pendingAction, 0);
    };

    const handleOnboardingSkip = () => {
        pendingProtectedActionRef.current = null;
        setShowOnboarding(false);
        setProfilePromptDismissed(true);
    };

    const profileComplete = isDeveloperProfileComplete(profile);
    const missingProfileFields = getMissingDeveloperProfileFields(profile);

    const requireDeveloperProfile = (afterComplete?: () => void) => {
        if (profileComplete) {
            afterComplete?.();
            return;
        }
        pendingProtectedActionRef.current = afterComplete ?? null;
        setProfilePromptDismissed(true);
        setShowOnboarding(true);
    };

    const protectedPages = ['applications', 'discover', 'network', 'inbox'];
    const handleNavigate = (page: DeveloperTab) => {
        pendingProtectedActionRef.current = null;
        if (!profileComplete && protectedPages.includes(page)) {
            setShowOnboarding(true);
            setCurrentPage('settings');
            return;
        }
        setCurrentPage(page);
    };

    const handleOpenProfile = () => {
        setShowOnboarding(false);
        setProfilePromptDismissed(true);
        setCurrentPage('settings');
    };

    const handleOpenNetworkMessage = (contact: DeveloperNetworkMessageTarget) => {
        setNetworkInboxContacts((prev) => [contact, ...prev.filter((item) => item.id !== contact.id)]);
        setInboxActiveContactId(contact.id);
        setCurrentPage('inbox');
    };

    const Page = pages[currentPage] || DeveloperDashboardPage;

    return (
        <div style={{ display: 'flex', background: '#f5f6f4', minHeight: '100vh' }}>
            <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
            <div style={{ flex: 1, minWidth: 0 }}>
                {currentPage === 'network' ? (
                    <Network
                        onNavigate={handleNavigate}
                        onMessage={handleOpenNetworkMessage}
                        profileComplete={profileComplete}
                        onRequireProfile={requireDeveloperProfile}
                    />
                ) : currentPage === 'inbox' ? (
                    <Inbox
                        activeContactId={inboxActiveContactId}
                        onActiveContactChange={setInboxActiveContactId}
                        extraContacts={networkInboxContacts}
                        profileComplete={profileComplete}
                        onRequireProfile={requireDeveloperProfile}
                    />
                ) : (
                    <Page 
                        onNavigate={handleNavigate} 
                        profileComplete={profileComplete}
                        onRequireProfile={requireDeveloperProfile}
                    />
                )}
            </div>

            <AnimatePresence>
                {!profileComplete && !showOnboarding && !profilePromptDismissed && (
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="fixed bottom-5 right-5 z-40 w-[320px] overflow-hidden bg-white"
                        style={{ border: '1px solid #d9e7df', borderRadius: 12, boxShadow: '0 18px 44px rgba(15,28,24,0.16)' }}
                    >
                        <div className="flex items-start gap-3 px-4 py-4">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: '#e8f5ef', color: '#428475' }}>
                                <CheckCircle size={17} weight="fill" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2 pl-3.5 pr-3.5">
                                    <p className="text-[13px] font-extrabold" style={{ color: '#1a2e26' }}>Complete profile setup</p>
                                    <button
                                        type="button"
                                        onClick={() => setProfilePromptDismissed(true)}
                                        className="rounded-md p-1 transition hover:bg-[#f0f5f2]"
                                        aria-label="Dismiss profile setup reminder"
                                        style={{ color: '#7a9e8e' }}
                                    >
                                        <X size={13} weight="bold" />
                                    </button>
                                </div>
                                <p className="mt-1 text-[12px] leading-5" style={{ color: '#6b8e7e' }}>
                                    Add {missingProfileFields.slice(0, 2).join(', ') || 'your details'} before applying, messaging, or using network actions.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleOpenProfile}
                                    className="mt-3 flex h-9 items-center gap-2 rounded-lg px-3.5 text-[12px] font-bold"
                                    style={{ background: '#1a312c', color: '#89d7b7', border: 'none', cursor: 'pointer' }}
                                >
                                    Complete profile
                                    <ArrowRight size={13} weight="bold" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showOnboarding && (
                <DevOnboardingModal
                    initialProfile={profile as any}
                    onComplete={handleOnboardingComplete}
                    onSkip={handleOnboardingSkip}
                    userName={userName}
                />
            )}
        </div>
    );
}
