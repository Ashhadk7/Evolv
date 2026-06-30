"use client";

import React, { type ElementType, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle, X } from '@phosphor-icons/react';
import DeveloperDashboardPage from '../components/developer/DeveloperDashboard';
import { DevOnboardingModal } from '../components/developer/shared';
import {
    getMissingDeveloperProfileFields,
    isDeveloperProfileComplete,
    normalizeDeveloperProfileForSave,
    type DeveloperProfile,
} from '../components/developer/profileUtils';

// Lazy-load non-default tabs to reduce initial bundle
const Applications = dynamic(() => import('../components/developer/Applications'));
const Discover     = dynamic(() => import('../components/developer/Discover'));
const Network      = dynamic(() => import('../components/developer/Network'));
const Projects     = dynamic(() => import('../components/developer/Projects'));
const Inbox        = dynamic(() => import('../components/developer/Inbox'));
const Settings     = dynamic(() => import('../components/developer/Settings'));

const pages: Record<string, ElementType> = {
    dashboard: DeveloperDashboardPage,
    applications: Applications,
    discover: Discover,
    network: Network,
    projects: Projects,
    inbox: Inbox,
    settings: Settings,
};

const DEFAULT_PROFILE: DeveloperProfile = {
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '',
    jobTitle: '',
    role: '',
    experience: '',
    bio: '',
    techStack: [],
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
    profileComplete: false,
    firstTime: false,
};

function readDeveloperProfile(): DeveloperProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
        const raw = localStorage.getItem('evolv_user');
        const stored = raw ? JSON.parse(raw) : {};
        return normalizeDeveloperProfileForSave({ ...DEFAULT_PROFILE, ...stored });
    } catch {
        return DEFAULT_PROFILE;
    }
}

function saveDeveloperProfile(profile: DeveloperProfile) {
    const next = normalizeDeveloperProfileForSave(profile);
    try {
        const raw = localStorage.getItem('evolv_user');
        const existing = raw ? JSON.parse(raw) : {};
        localStorage.setItem('evolv_user', JSON.stringify({ ...existing, ...next }));
    } catch { /* ignore */ }
    return next;
}

export default function DeveloperDashboard() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [profilePromptDismissed, setProfilePromptDismissed] = useState(false);
    const [profile, setProfile] = useState<DeveloperProfile>(() => readDeveloperProfile());
    const pendingProtectedActionRef = useRef<(() => void) | null>(null);

    const handleOnboardingComplete = (updatedProfile?: DeveloperProfile) => {
        const pendingAction = pendingProtectedActionRef.current;
        pendingProtectedActionRef.current = null;
        const nextProfile = saveDeveloperProfile(updatedProfile ?? readDeveloperProfile());
        setProfile(nextProfile);
        setShowOnboarding(false);
        setProfilePromptDismissed(true);
        if (pendingAction) window.setTimeout(pendingAction, 0);
    };

    const handleOnboardingSkip = () => {
        pendingProtectedActionRef.current = null;
        const nextProfile = saveDeveloperProfile({ ...profile, firstTime: false, profileComplete: false });
        setProfile(nextProfile);
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

    const handleNavigate = (page: string) => {
        pendingProtectedActionRef.current = null;
        setCurrentPage(page);
    };

    const handleOpenProfile = () => {
        setShowOnboarding(false);
        setProfilePromptDismissed(true);
        setCurrentPage('settings');
    };

    const Page = pages[currentPage] || DeveloperDashboardPage;

    return (
        <>
            <Page
                onNavigate={handleNavigate}
                profileComplete={profileComplete}
                onRequireProfile={requireDeveloperProfile}
            />

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
                                    style={{ background: '#1a312c', color: '#89d7b7' }}
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
                    initialProfile={profile}
                    onComplete={handleOnboardingComplete}
                    onSkip={handleOnboardingSkip}
                    userName={[profile.firstName, profile.lastName].filter(Boolean).join(' ')}
                />
            )}
        </>
    );
}
