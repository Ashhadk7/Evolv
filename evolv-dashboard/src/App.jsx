import React, { useState, useEffect } from 'react';
import DeveloperDashboard from './pages/DeveloperDashboard/DeveloperDashboard';
import Applications from './pages/Applications/Applications';
import Discover from './pages/Discover/Discover';
import Network from './pages/Network/Network';
import Projects from './pages/Projects/Projects';
import Inbox from './pages/Inbox/Inbox';
import Settings from './pages/Settings/Settings';
import DevOnboardingModal from './components/DevOnboardingModal/DevOnboardingModal';
import './styles/globals.css';

const pages = {
    dashboard: DeveloperDashboard,
    applications: Applications,
    discover: Discover,
    network: Network,
    projects: Projects,
    inbox: Inbox,
    settings: Settings,
};

function App() {
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

    const Page = pages[currentPage] || DeveloperDashboard;

    return (
        <>
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

export default App;