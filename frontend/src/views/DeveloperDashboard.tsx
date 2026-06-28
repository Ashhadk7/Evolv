"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DeveloperDashboardPage from '../components/developer/DeveloperDashboard';
import { DevOnboardingModal } from '../components/developer/shared';

// Lazy-load non-default tabs to reduce initial bundle
const Applications = dynamic(() => import('../components/developer/Applications'));
const Discover     = dynamic(() => import('../components/developer/Discover'));
const Network      = dynamic(() => import('../components/developer/Network'));
const Projects     = dynamic(() => import('../components/developer/Projects'));
const Inbox        = dynamic(() => import('../components/developer/Inbox'));
const Settings     = dynamic(() => import('../components/developer/Settings'));

const pages: Record<string, any> = {
    dashboard: DeveloperDashboardPage,
    applications: Applications,
    discover: Discover,
    network: Network,
    projects: Projects,
    inbox: Inbox,
    settings: Settings,
};

export default function DeveloperDashboard() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [profileComplete, setProfileComplete] = useState(true);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        try {
            const raw = localStorage.getItem('evolv_user');
            if (raw) {
                const user = JSON.parse(raw);
                setProfileComplete(Boolean(user.profileComplete));
                if (user.firstTime === true) {
                    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
                    setUserName(name);
                    setShowOnboarding(true);
                }
            }
        } catch (_) {}
    }, []);

    const handleOnboardingComplete = () => {
        try {
            const raw = localStorage.getItem('evolv_user');
            const user = raw ? JSON.parse(raw) : {};
            setProfileComplete(Boolean(user.profileComplete));
        } catch (_) {}
        setShowOnboarding(false);
    };

    const protectedPages = ['applications', 'discover', 'network', 'inbox'];
    const handleNavigate = (page: string) => {
        if (!profileComplete && protectedPages.includes(page)) {
            setShowOnboarding(true);
            setCurrentPage('settings');
            return;
        }
        setCurrentPage(page);
    };

    const Page = pages[currentPage] || DeveloperDashboardPage;

    return (
        <>
            <Page onNavigate={handleNavigate} />
            {!profileComplete && !showOnboarding && (
                <div
                    style={{
                        position: 'fixed', right: 24, bottom: 24, width: 340,
                        background: '#ffffff', border: '1px solid #DDE5E0',
                        borderRadius: 12, boxShadow: '0 18px 42px rgba(13,43,34,0.14)',
                        padding: 16, zIndex: 20,
                    }}
                >
                    <div style={{ color: '#1A2E26', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Complete your developer profile</div>
                    <div style={{ color: '#6B8E7E', fontSize: 12, lineHeight: 1.55, marginBottom: 12 }}>
                        Applications, discovery visibility, messages, and network actions unlock after your skills and profile summary are complete.
                    </div>
                    <button
                        onClick={() => setShowOnboarding(true)}
                        style={{ width: '100%', background: '#0F1C18', color: '#89D7B7', border: 0, borderRadius: 8, padding: '0.65rem 0.85rem', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                    >
                        Finish profile
                    </button>
                </div>
            )}
            {showOnboarding && <DevOnboardingModal onComplete={handleOnboardingComplete} userName={userName} />}
        </>
    );
}
