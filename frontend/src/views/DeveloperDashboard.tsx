"use client";

import React, { useState, useEffect } from 'react';
// @ts-nocheck
import DeveloperDashboardPage from '../components/developer/DeveloperDashboard';
import Applications from '../components/developer/Applications';
import Discover from '../components/developer/Discover';
import Network from '../components/developer/Network';
import Projects from '../components/developer/Projects';
import Inbox from '../components/developer/Inbox';
import Settings from '../components/developer/Settings';
import { DevOnboardingModal, DeveloperGlobalStyles } from '../components/developer/DeveloperShared';


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
    const [userName, setUserName] = useState('');

    useEffect(() => {
        try {
            const raw = localStorage.getItem('evolv_user');
            if (raw) {
                const user = JSON.parse(raw);
                if (user.firstTime === true) {
                    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
                    setUserName(name);
                    setShowOnboarding(true);
                }
            }
        } catch (_) {}
    }, []);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
    };

    const Page = pages[currentPage] || DeveloperDashboardPage;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: DeveloperGlobalStyles }} />
            <Page onNavigate={setCurrentPage} />
            {showOnboarding && (
                <DevOnboardingModal
                    onComplete={handleOnboardingComplete}
                    userName={userName}
                />
            )}
        </>
    );
}
