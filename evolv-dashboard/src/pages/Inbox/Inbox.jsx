import React, { useState } from 'react';
import styles from './Inbox.module.css';
import { Sidebar, Topbar, StatCard } from '../../components';

const inboxStats = [
    { id: 1, label: 'Total Messages', value: '24', trend: '+5', trendUp: true },
    { id: 2, label: 'Unread', value: '3', trend: '+3', trendUp: true },
    { id: 3, label: 'Founders', value: '8', trend: '+1', trendUp: true },
    { id: 4, label: 'Replied', value: '16', trend: '+4', trendUp: true },
];

const threads = [
    {
        id: 1,
        from: 'Asad Ahmed',
        role: 'CEO & Founder · Nexus Health',
        avatar: 'A',
        avatarColor: '#5BC8A0',
        subject: 'Technical Interview — June 28',
        preview: 'Hi Sarah, we are excited to move forward with your application. Your AI/ML background is exactly what we need...',
        time: '10 min ago',
        unread: true,
        starred: true,
        messages: [
            { id: 1, from: 'Asad Ahmed', avatar: 'A', avatarColor: '#5BC8A0', time: 'Jun 24, 2025 · 9:42 AM', body: 'Hi Sarah,\n\nWe are excited to move forward with your application for the AI Engineer role at Nexus Health.\n\nYour background in Python, FastAPI, and AI/ML is exactly what we need for this phase of our platform.\n\nWe would love to schedule a technical interview for June 28th at 2:00 PM. Please confirm if that works for you.\n\nLooking forward to connecting!\n\nBest,\nAsad' },
            { id: 2, from: 'You', avatar: 'S', avatarColor: '#0D2B22', time: 'Jun 24, 2025 · 11:15 AM', body: 'Hi Asad,\n\nThank you so much for the update! I am really excited about this opportunity.\n\nJune 28th at 2:00 PM works perfectly for me. I will prepare a walkthrough of my recent AI/ML projects.\n\nLooking forward to it!\n\nBest,\nSarah' },
        ],
    },
    {
        id: 2,
        from: 'Priya Sharma',
        role: 'CTO · Aura Logistics',
        avatar: 'P',
        avatarColor: '#C4973A',
        subject: 'Your Application — Full Stack Developer',
        preview: 'Hey Sarah! Your profile caught our eye. We are reviewing your application and should have an update by end of week...',
        time: '2h ago',
        unread: true,
        starred: false,
        messages: [
            { id: 1, from: 'Priya Sharma', avatar: 'P', avatarColor: '#C4973A', time: 'Jun 24, 2025 · 8:00 AM', body: 'Hey Sarah!\n\nYour profile caught our eye. We are reviewing your application for the Full Stack Developer role at Aura Logistics.\n\nYour experience with Node.js and AWS really aligns with our tech stack. We should have an update by end of week.\n\nStay tuned!\n\nPriya' },
        ],
    },
    {
        id: 3,
        from: 'Evolv AI',
        role: 'Platform · Match Alert',
        avatar: 'E',
        avatarColor: '#5BC8A0',
        subject: 'New Top Match Found — 91% Compatibility',
        preview: 'We found a new startup that matches your profile at 91%. MediConnect is hiring an AI Engineer and their mission...',
        time: '5h ago',
        unread: true,
        starred: false,
        messages: [
            { id: 1, from: 'Evolv AI', avatar: 'E', avatarColor: '#5BC8A0', time: 'Jun 24, 2025 · 5:30 AM', body: 'Hi Sarah,\n\nOur AI matching engine found a new opportunity with a 91% compatibility score for you!\n\nMediConnect — HealthTech · Series A\nRole: AI Engineer\nBudget: $220K · Team of 12\nFounder: Rania Hassan (10 yrs experience)\n\nYour Python, FastAPI, and healthcare domain interest are a near-perfect fit.\n\nAct fast — this role has 6 applicants already.\n\nThe Evolv Team' },
        ],
    },
    {
        id: 4,
        from: 'Jake Rivers',
        role: 'Full Stack Developer · Freelance',
        avatar: 'J',
        avatarColor: '#7C5CBF',
        subject: 'Want to collaborate on a side project?',
        preview: 'Sarah! I saw your portfolio and I am working on an open-source dev tool. Would love your input on the AI layer...',
        time: '1d ago',
        unread: false,
        starred: false,
        messages: [
            { id: 1, from: 'Jake Rivers', avatar: 'J', avatarColor: '#7C5CBF', time: 'Jun 23, 2025 · 4:00 PM', body: 'Sarah!\n\nI saw your portfolio through Evolv and I am really impressed with your AI work.\n\nI am building an open-source developer productivity tool and would love your input on the AI inference layer. It is a weekend project but could turn into something bigger.\n\nInterested in hopping on a 30-min call this weekend?\n\nJake' },
        ],
    },
    {
        id: 5,
        from: 'Usman Khan',
        role: 'CEO · FinFlow AI',
        avatar: 'U',
        avatarColor: '#4A90D9',
        subject: 'Offer Letter — Backend Engineer Role',
        preview: 'Congratulations Sarah! We would like to officially offer you the Backend Engineer position at FinFlow AI...',
        time: '3d ago',
        unread: false,
        starred: true,
        messages: [
            { id: 1, from: 'Usman Khan', avatar: 'U', avatarColor: '#4A90D9', time: 'Jun 22, 2025 · 2:00 PM', body: 'Congratulations Sarah!\n\nWe would like to officially offer you the Backend Engineer position at FinFlow AI.\n\nSalary: $180K/year\nEquity: 0.5%\nStart Date: July 15, 2025\nRemote-first with quarterly meetups\n\nPlease review the attached offer letter and sign by June 28th.\n\nWelcome to the team,\nUsman' },
        ],
    },
];

const Inbox = ({ onNavigate }) => {
    const [selectedThread, setSelectedThread] = useState(threads[0]);
    const [filter, setFilter] = useState('all');
    const [replyText, setReplyText] = useState('');
    const [showCompose, setShowCompose] = useState(false);
    const [localThreads, setLocalThreads] = useState(threads);
    const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
    const [sentAnim, setSentAnim] = useState(false);

    const filteredThreads = localThreads.filter((t) => {
        if (filter === 'unread') return t.unread;
        if (filter === 'starred') return t.starred;
        return true;
    });

    const handleSelectThread = (thread) => {
        setSelectedThread(thread);
        setLocalThreads((prev) => prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t)));
        setReplyText('');
    };

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        const newMsg = { id: Date.now(), from: 'You', avatar: 'S', avatarColor: '#0D2B22', time: 'Just now', body: replyText };
        setLocalThreads((prev) => prev.map((t) => t.id === selectedThread.id ? { ...t, messages: [...t.messages, newMsg] } : t));
        setSelectedThread((prev) => ({ ...prev, messages: [...prev.messages, newMsg] }));
        setReplyText('');
        setSentAnim(true);
        setTimeout(() => setSentAnim(false), 1500);
    };

    const handleSendCompose = () => {
        if (!composeData.to.trim()) return;
        const newThread = { id: Date.now(), from: composeData.to, role: 'New conversation', avatar: (composeData.to[0] || '?').toUpperCase(), avatarColor: '#888', subject: composeData.subject || '(No subject)', preview: composeData.body, time: 'Just now', unread: false, starred: false, messages: [{ id: 1, from: 'You', avatar: 'S', avatarColor: '#0D2B22', time: 'Just now', body: composeData.body }] };
        setLocalThreads((prev) => [newThread, ...prev]);
        setSelectedThread(newThread);
        setShowCompose(false);
        setComposeData({ to: '', subject: '', body: '' });
    };

    const toggleStar = (id) => {
        setLocalThreads((prev) => prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)));
        if (selectedThread && selectedThread.id === id) setSelectedThread((prev) => ({ ...prev, starred: !prev.starred }));
    };

    const unreadCount = localThreads.filter((t) => t.unread).length;

    return (
        <div className={styles.container}>
            <Sidebar currentPage="inbox" onNavigate={onNavigate} />
            <main className={styles.mainWrapper}>
                <Topbar title="Inbox" subtitle={unreadCount + ' unread message' + (unreadCount !== 1 ? 's' : '') + ' — stay on top of your conversations.'} onNavigate={onNavigate} />
                <div className={styles.kpiRow}>
                    {inboxStats.map((s) => <StatCard key={s.id} {...s} />)}
                </div>
                <div className={styles.actionBar}>
                    <div className={styles.filterGroup}>
                        {['all', 'unread', 'starred'].map((f) => (
                            <button key={f} className={styles.filterChip + (filter === f ? ' ' + styles.filterActive : '')} onClick={() => setFilter(f)}>
                                {f === 'all' && <i className="fas fa-inbox" />}
                                {f === 'unread' && <i className="fas fa-envelope" />}
                                {f === 'starred' && <i className="fas fa-star" />}
                                {' '}{f.charAt(0).toUpperCase() + f.slice(1)}
                                {f === 'unread' && unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                            </button>
                        ))}
                    </div>
                    <button className={styles.composeBtn} onClick={() => setShowCompose(true)}>
                        <i className="fas fa-pen" /> Compose
                    </button>
                </div>
                <div className={styles.mainGrid}>
                    <div className={styles.threadList}>
                        {filteredThreads.length === 0 ? (
                            <div className={styles.emptyState}><div className={styles.emptyIcon}>📭</div><h4>No messages here</h4><p>Try switching the filter above.</p></div>
                        ) : filteredThreads.map((thread) => (
                            <div key={thread.id} className={styles.threadItem + (selectedThread && selectedThread.id === thread.id ? ' ' + styles.threadActive : '') + (thread.unread ? ' ' + styles.threadUnread : '')} onClick={() => handleSelectThread(thread)}>
                                <div className={styles.threadAvatarWrap}>
                                    <div className={styles.threadAvatar} style={{ background: thread.avatarColor }}>{thread.avatar}</div>
                                    {thread.unread && <span className={styles.unreadDot} />}
                                </div>
                                <div className={styles.threadInfo}>
                                    <div className={styles.threadTop}>
                                        <span className={styles.threadFrom}>{thread.from}</span>
                                        <span className={styles.threadTime}>{thread.time}</span>
                                    </div>
                                    <div className={styles.threadSubject}>{thread.subject}</div>
                                    <div className={styles.threadPreview}>{thread.preview}</div>
                                </div>
                                <button className={styles.starBtn + (thread.starred ? ' ' + styles.starBtnActive : '')} onClick={(e) => { e.stopPropagation(); toggleStar(thread.id); }}><i className="fas fa-star" /></button>
                            </div>
                        ))}
                    </div>
                    <div className={styles.messagePanel}>
                        {selectedThread ? (
                            <>
                                <div className={styles.msgHeader}>
                                    <div className={styles.msgHeaderLeft}>
                                        <div className={styles.msgAvatar} style={{ background: selectedThread.avatarColor }}>{selectedThread.avatar}</div>
                                        <div>
                                            <div className={styles.msgFrom}>{selectedThread.from}</div>
                                            <div className={styles.msgRole}>{selectedThread.role}</div>
                                        </div>
                                    </div>
                                    <div className={styles.msgHeaderActions}>
                                        <button className={styles.iconBtn + (selectedThread.starred ? ' ' + styles.iconBtnActive : '')} onClick={() => toggleStar(selectedThread.id)} title="Star"><i className="fas fa-star" /></button>
                                        <button className={styles.iconBtn} title="Archive"><i className="fas fa-archive" /></button>
                                        <button className={styles.iconBtn} title="Delete"><i className="fas fa-trash-alt" /></button>
                                    </div>
                                </div>
                                <div className={styles.msgSubjectLine}>{selectedThread.subject}</div>
                                <div className={styles.msgBody}>
                                    {selectedThread.messages.map((msg) => (
                                        <div key={msg.id} className={styles.msgBubbleWrap + (msg.from === 'You' ? ' ' + styles.msgBubbleYou : '')}>
                                            <div className={styles.bubbleAvatar} style={{ background: msg.avatarColor }}>{msg.avatar}</div>
                                            <div className={styles.bubbleContent}>
                                                <div className={styles.bubbleHeader}>
                                                    <span className={styles.bubbleName}>{msg.from}</span>
                                                    <span className={styles.bubbleTime}>{msg.time}</span>
                                                </div>
                                                <div className={styles.bubbleText}>{msg.body.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.replyBox}>
                                    <div className={styles.replyAvatar} style={{ background: '#0D2B22' }}>S</div>
                                    <div className={styles.replyInputWrap}>
                                        <textarea className={styles.replyInput} placeholder={'Reply to ' + selectedThread.from + '...'} value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply(); }} rows={3} />
                                        <div className={styles.replyActions}>
                                            <span className={styles.replyHint}>Ctrl + Enter to send</span>
                                            <button className={styles.sendBtn + (sentAnim ? ' ' + styles.sendBtnSent : '')} onClick={handleSendReply} disabled={!replyText.trim()}>
                                                {sentAnim ? <><i className="fas fa-check" /> Sent!</> : <><i className="fas fa-paper-plane" /> Send</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyPanel}><div className={styles.emptyPanelIcon}>💬</div><h4>Select a conversation</h4><p>Choose a thread from the left to read and reply.</p></div>
                        )}
                    </div>
                </div>

                {showCompose && (
                    <div className={styles.modalOverlay} onClick={() => setShowCompose(false)}>
                        <div className={styles.composeModal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.composeHeader}>
                                <span><i className="fas fa-pen" /> New Message</span>
                                <button className={styles.closeModal} onClick={() => setShowCompose(false)}><i className="fas fa-times" /></button>
                            </div>
                            <div className={styles.composeField}><label>To</label><input type="text" placeholder="Recipient name..." value={composeData.to} onChange={(e) => setComposeData({ ...composeData, to: e.target.value })} /></div>
                            <div className={styles.composeField}><label>Subject</label><input type="text" placeholder="Subject..." value={composeData.subject} onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })} /></div>
                            <div className={styles.composeField}><label>Message</label><textarea placeholder="Write your message..." rows={6} value={composeData.body} onChange={(e) => setComposeData({ ...composeData, body: e.target.value })} /></div>
                            <div className={styles.composeFooter}>
                                <button className={styles.cancelBtn} onClick={() => setShowCompose(false)}>Cancel</button>
                                <button className={styles.sendComposeBtn} onClick={handleSendCompose}><i className="fas fa-paper-plane" /> Send Message</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.footer}>
                    <span>Evolv · Inbox</span>
                    <div className={styles.footerRight}><div className={styles.greenDot} /><span>© 2025 Evolv. All rights reserved.</span></div>
                </div>
            </main>
        </div>
    );
};

export default Inbox;
