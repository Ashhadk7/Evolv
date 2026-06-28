// @ts-nocheck
import { useState, useEffect } from 'react';

export const Topbar = ({ title, subtitle, onNavigate, onNotifClick }) => {
    const fullText = title || 'Welcome back, Sarah';
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face');

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(fullText.slice(0, i));
            if (i >= fullText.length) { clearInterval(interval); setTimeout(() => setDone(true), 1500); }
        }, 55);
        return () => clearInterval(interval);
    }, [fullText]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('evolv_user');
            if (raw) {
                const user = JSON.parse(raw);
                if (user.avatarUrl) setProfileImage(user.avatarUrl);
            }
        } catch (_) {}
    }, []);

    return (
        <div className={"Topbar_topbar"}>
            <div className={"Topbar_greeting"}>
                <h1>{displayed}<span className={`${"Topbar_cursor"} ${done ? "Topbar_cursorHidden" : ''}`}>|</span></h1>
                <div className={"Topbar_sub"}>{subtitle || "Here's your developer dashboard overview."}</div>
            </div>
            <div className={"Topbar_right"}>
                <div className={"Topbar_notifBtn"} onClick={onNotifClick} style={{ cursor: onNotifClick ? 'pointer' : 'default' }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18 10.7C18 7.2 15.7 5 12 5S6 7.2 6 10.7c0 2.4-.6 4.1-1.5 5.2-.5.6-.1 1.6.7 1.6h13.6c.8 0 1.2-1 .7-1.6-.9-1.1-1.5-2.8-1.5-5.2Z" />
                        <path d="M9.8 18.5a2.3 2.3 0 0 0 4.4 0" />
                    </svg>
                    <span className={"Topbar_dot"}></span>
                </div>
                <div className={"Topbar_profileAv"} onClick={() => onNavigate && onNavigate('settings')} style={{ cursor: 'pointer' }}>
                    <img src={profileImage} alt="Sarah" />
                </div>
            </div>
        </div>
    );
};
