// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Sidebar, Topbar, StatCard, ActionModal, FilterBar, InsightCard, InvitationCard, MatchCard, ProfileCard, ProjectCard, StartupCard, ApplicationCard, BlueprintPreview, FeaturedMatch, FeaturedMatchCard, DevOnboardingModal } from './shared';
import { discoverStats, featuredMatch, opportunities, filterOptions, trendingDomains, dashboardData } from './developerData';

export interface DeveloperInboxLaunchContact {
    id: string;
    name: string;
    role?: string;
    company?: string;
    avatar?: string;
    avatarColor?: string;
}

type InboxProps = {
    onNavigate?: (page: string) => void;
    activeContactId?: string;
    onActiveContactChange?: (contactId: string) => void;
    extraContacts?: DeveloperInboxLaunchContact[];
    profileComplete?: boolean;
    onRequireProfile?: (afterComplete?: () => void) => void;
};

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

const buildContactThread = (contact: DeveloperInboxLaunchContact) => ({
    id: `network-${contact.id}`,
    contactId: contact.id,
    from: contact.name,
    role: [contact.role, contact.company].filter(Boolean).join(' · ') || 'Network contact',
    avatar: contact.avatar || (contact.name?.[0] || '?').toUpperCase(),
    avatarColor: contact.avatarColor || '#5BC8A0',
    subject: `Conversation with ${contact.name}`,
    preview: 'Start a conversation from your network.',
    time: 'Now',
    unread: false,
    starred: false,
    messages: [],
});

const Inbox = ({
    onNavigate,
    activeContactId,
    onActiveContactChange,
    extraContacts = [],
    profileComplete = true,
    onRequireProfile
}: InboxProps) => {
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

    useEffect(() => {
        if (!extraContacts.length) return;

        const contactThreads = extraContacts.map(buildContactThread);
        setLocalThreads((prev) => {
            const existingIds = new Set(prev.map((thread) => String(thread.contactId ?? thread.id)));
            const additions = contactThreads.filter((thread) => !existingIds.has(String(thread.contactId ?? thread.id)));
            return additions.length ? [...additions, ...prev] : prev;
        });
    }, [extraContacts]);

    useEffect(() => {
        if (!activeContactId) return;

        const found = localThreads.find((thread) => (
            String(thread.contactId ?? thread.id) === String(activeContactId) ||
            String(thread.id) === `network-${activeContactId}`
        ));

        if (found && selectedThread?.id !== found.id) {
            setSelectedThread(found);
        }
    }, [activeContactId, localThreads, selectedThread?.id]);

    const handleSelectThread = (thread) => {
        setSelectedThread(thread);
        onActiveContactChange?.(String(thread.contactId ?? thread.id));
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

    const handleComposeClick = () => {
        if (!profileComplete && onRequireProfile) {
            onRequireProfile(() => setShowCompose(true));
            return;
        }
        setShowCompose(true);
    };

    const toggleStar = (id) => {
        setLocalThreads((prev) => prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)));
        if (selectedThread && selectedThread.id === id) setSelectedThread((prev) => ({ ...prev, starred: !prev.starred }));
    };

    const unreadCount = localThreads.filter((t) => t.unread).length;

    return (
        <div className={"Inbox_container"}>
            <Sidebar currentPage="inbox" onNavigate={onNavigate} />
            <main className={"Inbox_mainWrapper"}>
                <Topbar title="Inbox" subtitle={unreadCount + ' unread message' + (unreadCount !== 1 ? 's' : '') + ' — stay on top of your conversations.'} onNavigate={onNavigate} />
                <div className={"Inbox_kpiRow"}>
                    {inboxStats.map((s) => <StatCard key={s.id} {...s} />)}
                </div>
                <div className={"Inbox_actionBar"}>
                    <div className={"Inbox_filterGroup"}>
                        {['all', 'unread', 'starred'].map((f) => (
                            <button key={f} className={"Inbox_filterChip" + (filter === f ? ' ' + "Inbox_filterActive" : '')} onClick={() => setFilter(f)}>
                                {f === 'all' && <i className="fas fa-inbox" />}
                                {f === 'unread' && <i className="fas fa-envelope" />}
                                {f === 'starred' && <i className="fas fa-star" />}
                                {' '}{f.charAt(0).toUpperCase() + f.slice(1)}
                                {f === 'unread' && unreadCount > 0 && <span className={"Inbox_badge"}>{unreadCount}</span>}
                            </button>
                        ))}
                    </div>
                    <button className={"Inbox_composeBtn"} onClick={handleComposeClick}>
                        <i className="fas fa-pen" /> Compose
                    </button>
                </div>
                <div className={"Inbox_mainGrid"}>
                    <div className={"Inbox_threadList"}>
                        {filteredThreads.length === 0 ? (
                            <div className={"Inbox_emptyState"}><div className={"Inbox_emptyIcon"}>📭</div><h4>No messages here</h4><p>Try switching the filter above.</p></div>
                        ) : filteredThreads.map((thread) => (
                            <div key={thread.id} className={"Inbox_threadItem" + (selectedThread && selectedThread.id === thread.id ? ' ' + "Inbox_threadActive" : '') + (thread.unread ? ' ' + "Inbox_threadUnread" : '')} onClick={() => handleSelectThread(thread)}>
                                <div className={"Inbox_threadAvatarWrap"}>
                                    <div className={"Inbox_threadAvatar"} style={{ background: thread.avatarColor }}>{thread.avatar}</div>
                                    {thread.unread && <span className={"Inbox_unreadDot"} />}
                                </div>
                                <div className={"Inbox_threadInfo"}>
                                    <div className={"Inbox_threadTop"}>
                                        <span className={"Inbox_threadFrom"}>{thread.from}</span>
                                        <span className={"Inbox_threadTime"}>{thread.time}</span>
                                    </div>
                                    <div className={"Inbox_threadSubject"}>{thread.subject}</div>
                                    <div className={"Inbox_threadPreview"}>{thread.preview}</div>
                                </div>
                                <button className={"Inbox_starBtn" + (thread.starred ? ' ' + "Inbox_starBtnActive" : '')} onClick={(e) => { e.stopPropagation(); toggleStar(thread.id); }}><i className="fas fa-star" /></button>
                            </div>
                        ))}
                    </div>
                    <div className={"Inbox_messagePanel"}>
                        {selectedThread ? (
                            <>
                                <div className={"Inbox_msgHeader"}>
                                    <div className={"Inbox_msgHeaderLeft"}>
                                        <div className={"Inbox_msgAvatar"} style={{ background: selectedThread.avatarColor }}>{selectedThread.avatar}</div>
                                        <div>
                                            <div className={"Inbox_msgFrom"}>{selectedThread.from}</div>
                                            <div className={"Inbox_msgRole"}>{selectedThread.role}</div>
                                        </div>
                                    </div>
                                    <div className={"Inbox_msgHeaderActions"}>
                                        <button className={"Inbox_iconBtn" + (selectedThread.starred ? ' ' + "Inbox_iconBtnActive" : '')} onClick={() => toggleStar(selectedThread.id)} title="Star"><i className="fas fa-star" /></button>
                                        <button className={"Inbox_iconBtn"} title="Archive"><i className="fas fa-archive" /></button>
                                        <button className={"Inbox_iconBtn"} title="Delete"><i className="fas fa-trash-alt" /></button>
                                    </div>
                                </div>
                                <div className={"Inbox_msgSubjectLine"}>{selectedThread.subject}</div>
                                <div className={"Inbox_msgBody"}>
                                    {selectedThread.messages.map((msg) => (
                                        <div key={msg.id} className={"Inbox_msgBubbleWrap" + (msg.from === 'You' ? ' ' + "Inbox_msgBubbleYou" : '')}>
                                            <div className={"Inbox_bubbleAvatar"} style={{ background: msg.avatarColor }}>{msg.avatar}</div>
                                            <div className={"Inbox_bubbleContent"}>
                                                <div className={"Inbox_bubbleHeader"}>
                                                    <span className={"Inbox_bubbleName"}>{msg.from}</span>
                                                    <span className={"Inbox_bubbleTime"}>{msg.time}</span>
                                                </div>
                                                <div className={"Inbox_bubbleText"}>{msg.body.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={"Inbox_replyBox"}>
                                    <div className={"Inbox_replyAvatar"} style={{ background: '#0D2B22' }}>S</div>
                                    <div className={"Inbox_replyInputWrap"}>
                                        <textarea className={"Inbox_replyInput"} placeholder={'Reply to ' + selectedThread.from + '...'} value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply(); }} rows={3} />
                                        <div className={"Inbox_replyActions"}>
                                            <span className={"Inbox_replyHint"}>Ctrl + Enter to send</span>
                                            <button className={"Inbox_sendBtn" + (sentAnim ? ' ' + "Inbox_sendBtnSent" : '')} onClick={handleSendReply} disabled={!replyText.trim()}>
                                                {sentAnim ? <><i className="fas fa-check" /> Sent!</> : <><i className="fas fa-paper-plane" /> Send</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={"Inbox_emptyPanel"}><div className={"Inbox_emptyPanelIcon"}>💬</div><h4>Select a conversation</h4><p>Choose a thread from the left to read and reply.</p></div>
                        )}
                    </div>
                </div>

                {showCompose && (
                    <div className={"Inbox_modalOverlay"} onClick={() => setShowCompose(false)}>
                        <div className={"Inbox_composeModal"} onClick={(e) => e.stopPropagation()}>
                            <div className={"Inbox_composeHeader"}>
                                <span><i className="fas fa-pen" /> New Message</span>
                                <button className={"Inbox_closeModal"} onClick={() => setShowCompose(false)}><i className="fas fa-times" /></button>
                            </div>
                            <div className={"Inbox_composeField"}><label>To</label><input type="text" placeholder="Recipient name..." value={composeData.to} onChange={(e) => setComposeData({ ...composeData, to: e.target.value })} /></div>
                            <div className={"Inbox_composeField"}><label>Subject</label><input type="text" placeholder="Subject..." value={composeData.subject} onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })} /></div>
                            <div className={"Inbox_composeField"}><label>Message</label><textarea placeholder="Write your message..." rows={6} value={composeData.body} onChange={(e) => setComposeData({ ...composeData, body: e.target.value })} /></div>
                            <div className={"Inbox_composeFooter"}>
                                <button className={"Inbox_cancelBtn"} onClick={() => setShowCompose(false)}>Cancel</button>
                                <button className={"Inbox_sendComposeBtn"} onClick={handleSendCompose}><i className="fas fa-paper-plane" /> Send Message</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={"Inbox_footer"}>
                    <span>Evolv · Inbox</span>
                    <div className={"Inbox_footerRight"}><div className={"Inbox_greenDot"} /><span>© 2025 Evolv. All rights reserved.</span></div>
                </div>
            </main>
        </div>
    );
};

const AUDIO_BAR_DURATIONS = [0.52, 0.64, 0.78, 0.58, 0.86, 0.68, 0.74, 0.9, 0.62, 0.8, 0.56, 0.7];
const DEFAULT_DEVELOPER_USER: CurrentDeveloper = { firstName: "Sarah", lastName: "Mitchell" };

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function roleToPersonType(role?: string, fallbackRole?: string): PersonType {
  const value = `${role ?? ""} ${fallbackRole ?? ""}`.toLowerCase();
  return value.includes("founder") || value.includes("ceo") || value.includes("cto") ? "Founder" : "Developer";
}

function isIncomingRequest(contact: Contact) {
  return contact.requestDirection === "incoming" && contact.requestStatus !== "accepted";
}

function isOutgoingPending(contact: Contact) {
  return contact.requestDirection === "outgoing" && contact.requestStatus === "pending";
}

function hasSentIntro(thread: Message[]) {
  return thread.some((msg) => msg.from === "me");
}

function readStoredUsers() {
  try {
    const allUsers = JSON.parse(localStorage.getItem("evolv_users") ?? "[]");
    const currentUser = JSON.parse(localStorage.getItem("evolv_user") ?? "null");
    return [currentUser, ...(Array.isArray(allUsers) ? allUsers : [])].filter(Boolean) as StoredAppUser[];
  } catch {
    return [];
  }
}

function contactFromStoredUser(user: StoredAppUser): Contact | null {
  const email = user.email || user.profile?.email;
  if (!email) return null;

  const name =
    `${user.profile?.firstName ?? user.firstName ?? ""} ${user.profile?.lastName ?? user.lastName ?? ""}`.trim() ||
    email.split("@")[0];
  const personType = roleToPersonType(user.role, user.profile?.role);
  const role =
    personType === "Founder"
      ? user.profile?.headline || user.profile?.bio || "Founder"
      : user.profile?.jobTitle || user.jobTitle || user.profile?.role || "Developer";

  return {
    id: `user-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    role,
    personType,
    match: personType === "Founder" ? 82 : 76,
    lastMsg: "New conversation",
    lastTime: "Now",
    unread: 0,
    initials: getInitials(name),
    online: false,
    email,
    avatarUrl: user.profile?.avatarUrl || user.avatarUrl || user.profile?.photo || user.profile?.image,
  };
}

function getDeveloperUser(): CurrentDeveloper {
  if (typeof window === "undefined") return DEFAULT_DEVELOPER_USER;

  try {
    const user = JSON.parse(localStorage.getItem("evolv_user") ?? "null") as StoredAppUser | null;
    if (!user) return DEFAULT_DEVELOPER_USER;
    return {
      firstName: user.firstName || user.profile?.firstName || DEFAULT_DEVELOPER_USER.firstName,
      lastName: user.lastName || user.profile?.lastName || DEFAULT_DEVELOPER_USER.lastName,
      email: user.email || user.profile?.email,
      avatarUrl: user.avatarUrl || user.profile?.avatarUrl || user.profile?.photo || user.profile?.image,
    };
  } catch {
    return DEFAULT_DEVELOPER_USER;
  }
}

function getDeveloperName(currentUser?: CurrentDeveloper) {
  return `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You";
}

function Avatar({
  name,
  initials,
  avatarUrl,
  size = 40,
  dark = false,
}: {
  name: string;
  initials?: string;
  avatarUrl?: string;
  size?: number;
  dark?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarUrl ? undefined : dark ? DARK : "#e8f0eb",
        backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
        backgroundPosition: "center",
        backgroundSize: "cover",
        color: dark ? MINT : MID,
        fontSize: Math.max(10, Math.round(size * 0.28)),
        border: dark ? "1px solid rgba(137,215,183,0.25)" : "1px solid #dce9e2",
      }}
      aria-label={`${name} avatar`}
    >
      {!avatarUrl && (initials || getInitials(name))}
    </div>
  );
}

function MessageRow({
  msg,
  contact,
  currentUser,
}: {
  msg: Message;
  contact: Contact;
  currentUser?: CurrentDeveloper;
}) {
  const mine = msg.from === "me";
  const developerName = getDeveloperName(currentUser);
  const developerInitials = getInitials(developerName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${mine ? "justify-end" : "justify-start"}`}
    >
      {!mine && <Avatar name={contact.name} initials={contact.initials} avatarUrl={contact.avatarUrl} size={42} />}

      <div className={`flex max-w-[74%] flex-col ${mine ? "items-end" : "items-start"}`}>
        <div
          className={`mb-2 flex flex-wrap items-center gap-2 text-[12px] leading-5 ${mine ? "justify-end" : "justify-start"}`}
          style={{ color: DIM }}
        >
          {!mine && <span className="font-extrabold" style={{ color: INK }}>{contact.name}</span>}
          <span>{msg.date} - {msg.time}</span>
          {mine && <span className="font-extrabold" style={{ color: INK }}>You</span>}
        </div>

        <div
          className="px-4 py-3 text-[13px] leading-6"
          style={
            mine
              ? { background: DARK, color: "#e8f5ef", borderRadius: "18px 18px 4px 18px" }
              : { background: "#fff", color: TEXT, border: "1px solid #e4ebe7", borderRadius: "18px 18px 18px 4px" }
          }
        >
          {msg.subject && (
            <div
              className="mb-2 rounded-md px-2.5 py-1.5 text-[11px] font-bold"
              style={{
                background: mine ? "rgba(137,215,183,0.12)" : "#f0f6f3",
                color: mine ? MINT : MID,
              }}
            >
              Subject: {msg.subject}
            </div>
          )}
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>

      {mine && <Avatar name={developerName} initials={developerInitials} avatarUrl={currentUser?.avatarUrl} size={42} dark />}
    </motion.div>
  );
}

function ComposeModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (data: { email: string; subject: string; message: string }) => string | null;
}) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const nextError = onSend({ email, subject, message });
    if (nextError) {
      setError(nextError);
      return;
    }
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: "rgba(15,28,24,0.34)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="w-full max-w-[780px] overflow-hidden bg-white shadow-2xl"
        style={{ borderRadius: 14, border: `1px solid ${BORDER}` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5" style={{ background: DARK, color: "#e8f5ef" }}>
          <h3 className="text-[1.05rem] font-extrabold">New Message</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label="Close compose"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div>
          <div className="grid grid-cols-[92px_1fr] items-center gap-4 border-b border-[#edf1ee] px-7 py-3">
            <label className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#777" }}>
              To
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Recipient email..."
              className="h-14 rounded-2xl border px-4 text-[15px] outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>

          <div className="grid grid-cols-[92px_1fr] items-center gap-4 border-b border-[#edf1ee] px-7 py-3">
            <label className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#777" }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject optional..."
              className="h-14 rounded-2xl border px-4 text-[15px] outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>

          <div className="grid grid-cols-[92px_1fr] gap-4 border-b border-[#edf1ee] px-7 py-4">
            <label className="pt-3 text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#777" }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your message..."
              rows={7}
              className="resize-none rounded-2xl border px-4 py-3 text-[15px] leading-6 outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 px-7 py-5 sm:flex-row sm:items-center sm:justify-between" style={{ background: "#fbfcfb" }}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 text-[12px] font-semibold"
                style={{ color: "#b42318" }}
              >
                <WarningCircle size={15} weight="fill" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl border bg-white px-6 text-[14px] font-semibold transition hover:bg-[#f5f7f5]"
              style={{ borderColor: "#ded9d0", color: TEXT }}
            >
              Cancel
            </button>
            <motion.button
              type="button"
              onClick={submit}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-12 items-center gap-2 rounded-xl px-7 text-[14px] font-extrabold"
              style={{ background: DARK, color: MINT }}
            >
              <PaperPlaneTilt size={15} weight="fill" />
              Send Message
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CallOverlay({
  contact,
  mode,
  onEnd,
}: {
  contact: Contact;
  mode: "voice" | "video";
  onEnd: () => void;
}) {
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,28,24,0.88)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="overflow-hidden rounded-2xl text-center"
        style={{ width: 320, background: DARK, border: "1px solid rgba(137,215,183,0.15)" }}
      >
        <div className="px-8 py-8">
          <Avatar name={contact.name} initials={contact.initials} avatarUrl={contact.avatarUrl} size={80} dark />
          <div className="mb-0.5 mt-3 text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
            {contact.name}
          </div>
          <div className="mb-1 text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {contact.role}
          </div>
          <div className="mb-6 font-mono text-[13px]" style={{ color: MINT }}>
            {fmt(seconds)}
          </div>

          <div className="mb-6 flex items-end justify-center gap-1" style={{ height: 32 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ background: muted ? "#334d42" : MID }}
                animate={{ height: muted ? 4 : [4, 8, 16, 24, 12, 20, 8, 28, 12, 6][i % 10] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: AUDIO_BAR_DURATIONS[i % AUDIO_BAR_DURATIONS.length],
                  delay: i * 0.06,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors"
              style={{ background: muted ? "rgba(255,255,255,0.08)" : "rgba(137,215,183,0.12)" }}
            >
              {muted ? (
                <MicrophoneSlash size={20} style={{ color: "rgba(255,255,255,0.4)" }} />
              ) : (
                <Microphone size={20} style={{ color: MINT }} />
              )}
            </button>

            <button
              type="button"
              onClick={onEnd}
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "#c0392b" }}
            >
              <PhoneSlash size={22} style={{ color: "#fff" }} weight="fill" />
            </button>

            {mode === "video" && (
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "rgba(137,215,183,0.12)" }}
              >
                <VideoCamera size={20} style={{ color: MINT }} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function profileToContact(profile: DeveloperContactProfile): Contact {
  return {
    id: profile.id,
    name: profile.name,
    role: `${profile.role} - ${profile.company}`,
    personType: profile.type,
    match: profile.match,
    lastMsg: "New conversation",
    lastTime: "Now",
    unread: 0,
    initials: profile.initials,
    online: Boolean(profile.online),
  };
}

export default function Inbox({
  activeContactId,
  onActiveContactChange,
  extraContacts = [],
  profileComplete = true,
  onRequireProfile,
}: {
  activeContactId?: string;
  onActiveContactChange?: (id: string) => void;
  extraContacts?: DeveloperInboxLaunchContact[];
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
}) {
  const [localActiveId, setLocalActiveId] = useState("asad");
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MSGS);
  const [draft, setDraft] = useState("");
  const [call, setCall] = useState<{ mode: "voice" | "video" } | null>(null);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentDeveloper>(DEFAULT_DEVELOPER_USER);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>(() =>
    extraContacts.some((extra) => extra.id === activeContactId && extra.requestDirection === "outgoing")
      ? "pending"
      : "general"
  );
  const messageListRef = useRef<HTMLDivElement>(null);

  const mergedContacts = useMemo(() => {
    const toContact = (extra: DeveloperInboxLaunchContact, base?: Contact): Contact => {
      const personType = extra.personType ?? base?.personType ?? roleToPersonType(extra.role);
      const initialMessage = extra.initialMessage?.trim();
      return {
        id: base?.id ?? extra.id,
        name: extra.name || base?.name || "Evolv member",
        role: extra.role || base?.role || "Evolv Network",
        personType,
        match: extra.match ?? base?.match ?? 80,
        lastMsg: initialMessage || base?.lastMsg || (extra.requestDirection === "outgoing" ? "Connection request sent" : "New conversation"),
        lastTime: initialMessage ? "Now" : base?.lastTime ?? "Now",
        unread: extra.requestDirection === "outgoing" ? 0 : base?.unread ?? 0,
        initials: extra.initials || base?.initials || getInitials(extra.name),
        online: extra.online ?? base?.online ?? false,
        email: extra.email || base?.email,
        avatarUrl: extra.avatarUrl || base?.avatarUrl,
        subject: extra.subject || base?.subject,
        requestStatus: extra.requestStatus ?? base?.requestStatus,
        requestDirection: extra.requestDirection ?? base?.requestDirection,
      };
    };

    const contactMap = new Map(contacts.map((item) => [item.id, item] as const));
    const promotedIds: string[] = [];

    extraContacts.forEach((extra) => {
      const normalizedEmail = extra.email?.toLowerCase();
      const existing = contacts.find((item) =>
        item.id === extra.id || (normalizedEmail ? item.email?.toLowerCase() === normalizedEmail : false)
      );
      const nextContact = toContact(extra, existing);
      contactMap.set(nextContact.id, nextContact);
      promotedIds.push(nextContact.id);
    });

    const promoted = Array.from(new Set(promotedIds))
      .map((id) => contactMap.get(id))
      .filter((item): item is Contact => Boolean(item));
    const rest = contacts
      .map((item) => contactMap.get(item.id) ?? item)
      .filter((item) => !promotedIds.includes(item.id));

    return [...promoted, ...rest];
  }, [contacts, extraContacts]);

  const activeId = activeContactId ?? localActiveId;
  const contact = mergedContacts.find((c) => c.id === activeId) ?? mergedContacts[0] ?? CONTACTS[0];
  const thread = useMemo(() => {
    const rawThread = contact ? messages[contact.id] ?? [] : [];
    const launchContact = extraContacts.find((extra) =>
      extra.id === contact.id || (extra.email && contact.email?.toLowerCase() === extra.email.toLowerCase())
    );
    const initialMessage = launchContact?.initialMessage?.trim();
    if (!initialMessage || rawThread.some((msg) => msg.from === "me" && msg.text === initialMessage)) return rawThread;

    return [
      ...rawThread,
      {
        id: `launch-${contact.id}`,
        from: "me" as const,
        text: initialMessage,
        time: "Now",
        date: "Today",
        subject: launchContact?.subject || "Connection request",
      },
    ];
  }, [contact, extraContacts, messages]);
  const contactProfile = buildDeveloperProfileFromContact(contact);
  const incomingRequestActive = isIncomingRequest(contact);
  const outgoingPendingActive = isOutgoingPending(contact);
  const sentOutgoingIntro = outgoingPendingActive && hasSentIntro(thread);
  const messageLocked = incomingRequestActive || (outgoingPendingActive && sentOutgoingIntro);
  const inputPlaceholder = incomingRequestActive
    ? contact.requestStatus === "rejected"
      ? "Request rejected. Accept it to reply."
      : "Accept the request before replying."
    : sentOutgoingIntro
      ? "Requested - waiting for them to accept."
      : outgoingPendingActive
        ? "Request pending - send one intro message..."
        : "Type a message...";
  const requestContacts = useMemo(
    () => mergedContacts.filter((item) => isIncomingRequest(item) && (messages[item.id]?.length ?? 0) <= 1),
    [mergedContacts, messages]
  );
  const pendingContacts = useMemo(
    () => mergedContacts.filter((item) => isOutgoingPending(item)),
    [mergedContacts]
  );
  const generalContacts = useMemo(
    () => mergedContacts.filter((item) => !isIncomingRequest(item) && !isOutgoingPending(item)),
    [mergedContacts]
  );
  const unreadContacts = useMemo(
    () => generalContacts.filter((item) => item.unread > 0),
    [generalContacts]
  );
  const visibleContacts =
    inboxFilter === "requests"
      ? requestContacts
      : inboxFilter === "pending"
        ? pendingContacts
        : inboxFilter === "unread"
          ? unreadContacts
          : generalContacts;
  const inboxTabs = [
    { id: "general" as const, label: "General", count: generalContacts.length },
    { id: "unread" as const, label: "Unread", count: unreadContacts.length },
    { id: "requests" as const, label: "Requests", count: requestContacts.length },
    { id: "pending" as const, label: "Pending", count: pendingContacts.length },
  ];

  const selectContact = (id: string) => {
    if (onActiveContactChange) onActiveContactChange(id);
    else setLocalActiveId(id);
    setContacts((prev) => prev.map((item) => (item.id === id ? { ...item, unread: 0 } : item)));
    setViewingProfile(false);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCurrentUser(getDeveloperUser());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const requireProfileBeforeAction = (afterComplete?: () => void) => {
    if (profileComplete || !onRequireProfile) return false;
    onRequireProfile(afterComplete);
    return true;
  };

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;

    const frame = window.requestAnimationFrame(() => {
      list.scrollTop = list.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId, thread.length]);

  const sendMsg = () => {
    if (messageLocked) return;
    if (!draft.trim()) return;
    if (requireProfileBeforeAction(() => sendMsg())) return;
    const now = new Date();
    const body = draft.trim();
    const msg: Message = {
      id: Date.now().toString(),
      from: "me",
      text: body,
      time: formatTime(now),
      date: formatDate(now),
    };

    setMessages((prev) => ({ ...prev, [contact.id]: [...(prev[contact.id] ?? []), msg] }));
    setContacts((prev) => {
      const nextContact = { ...contact, lastMsg: body, lastTime: "Now", unread: 0 };
      return prev.some((item) => item.id === contact.id)
        ? prev.map((item) => (item.id === contact.id ? nextContact : item))
        : [nextContact, ...prev];
    });
    setDraft("");
  };

  const acceptRequest = (id: string) => {
    if (requireProfileBeforeAction(() => acceptRequest(id))) return;
    setContacts((prev) => {
      const acceptedContact = { ...contact, requestStatus: "accepted" as const, unread: 0, lastTime: "Now" };
      return prev.some((item) => item.id === id)
        ? prev.map((item) => (item.id === id ? { ...item, requestStatus: "accepted", unread: 0, lastTime: "Now" } : item))
        : [acceptedContact, ...prev];
    });
    setInboxFilter("general");
  };

  const rejectRequest = (id: string) => {
    if (requireProfileBeforeAction(() => rejectRequest(id))) return;
    setContacts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, requestStatus: "rejected", unread: 0, lastTime: "Now" }
          : item
      )
    );
    setInboxFilter("requests");
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMsg();
    }
  };

  const findRecipient = (email: string) => {
    const normalized = email.toLowerCase();
    const existing = mergedContacts.find((item) => item.email?.toLowerCase() === normalized);
    if (existing) return existing;

    const networkProfile = DEVELOPER_NETWORK_PROFILES.find((profile) =>
      `${profile.name.toLowerCase().replace(/\s+/g, ".")}@evolv.app` === normalized
    );
    if (networkProfile) return profileToContact(networkProfile);

    const storedUser = readStoredUsers().find((user) => (user.email || user.profile?.email)?.toLowerCase() === normalized);
    return storedUser ? contactFromStoredUser(storedUser) : null;
  };

  const sendComposedMessage = ({ email, subject, message }: { email: string; subject: string; message: string }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();
    const trimmedSubject = subject.trim();

    if (!normalizedEmail) return "Enter the recipient's email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return "Enter a valid email address.";
    if (!trimmedMessage) return "Write a message before sending.";

    const recipient = findRecipient(normalizedEmail);
    if (!recipient) return "No Evolv account was found with that email.";
    const existingRecipient = mergedContacts.some((item) =>
      item.id === recipient.id || item.email?.toLowerCase() === normalizedEmail
    );

    const now = new Date();
    const msg: Message = {
      id: Date.now().toString(),
      from: "me",
      text: trimmedMessage,
      time: formatTime(now),
      date: formatDate(now),
      subject: trimmedSubject || undefined,
    };

    const nextContact: Contact = {
      ...recipient,
      email: recipient.email || normalizedEmail,
      lastMsg: trimmedMessage,
      lastTime: "Now",
      unread: 0,
      subject: trimmedSubject || recipient.subject,
      requestStatus: existingRecipient ? recipient.requestStatus : "pending",
      requestDirection: existingRecipient ? recipient.requestDirection : "outgoing",
    };

    setContacts((prev) => [nextContact, ...prev.filter((item) => item.id !== nextContact.id)]);
    setMessages((prev) => ({
      ...prev,
      [nextContact.id]: [...(prev[nextContact.id] ?? []), msg],
    }));
    if (onActiveContactChange) onActiveContactChange(nextContact.id);
    else setLocalActiveId(nextContact.id);
    if (nextContact.requestDirection === "outgoing") setInboxFilter("pending");
    setViewingProfile(false);
    setComposeOpen(false);
    return null;
  };

  if (viewingProfile) {
    return (
      <NetworkProfileDetailScreen
        key={contactProfile.id}
        profile={contactProfile}
        connected={!incomingRequestActive && !outgoingPendingActive}
        backLabel="Back to Chat"
        onBack={() => setViewingProfile(false)}
        onMessage={() => setViewingProfile(false)}
        messageLabel="Open Chat"
        connectionLabel={outgoingPendingActive ? "Requested" : undefined}
        connectionDisabled={outgoingPendingActive}
      />
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden" style={{ background: "#f5f6f4", padding: "24px 28px" }}>
      <div className="mb-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[1.2rem] font-bold" style={{ color: TEXT }}>
            Inbox
          </h2>
          <p className="mt-0.5 text-[12px]" style={{ color: MUTED }}>
            Manage founder and developer conversations in one place.
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => {
            if (requireProfileBeforeAction(() => setComposeOpen(true))) return;
            setComposeOpen(true);
          }}
          whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(15,28,24,0.16)" }}
          whileTap={{ scale: 0.98 }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-extrabold"
          style={{ background: DARK, color: MINT }}
        >
          <PencilSimple size={15} weight="bold" />
          Compose
        </motion.button>
      </div>

      <div className="min-h-0 flex-1">
        <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
          <section
            className="flex min-h-0 flex-col overflow-hidden bg-white"
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              boxShadow: "0 16px 38px rgba(15,28,24,0.06)",
            }}
          >
            <div
              className="shrink-0 px-5 py-4"
              style={{ borderBottom: "1px solid #eaf0eb", background: "#fbfdfb" }}
            >
              <div className="flex items-center gap-2 text-[13px] font-extrabold" style={{ color: TEXT }}>
                <ChatCircleDots size={16} weight="fill" style={{ color: MID }} />
                Conversations
              </div>
              <div className="mt-3 grid grid-cols-[1fr_1fr_1.25fr_1.15fr] rounded-xl p-1" style={{ background: "#eef4f0", border: "1px solid #e2ebe5" }}>
                {inboxTabs.map((tab) => {
                  const isActive = inboxFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setInboxFilter(tab.id)}
                      className="flex min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[10px] font-extrabold transition-all"
                      style={{
                        background: isActive ? DARK : "transparent",
                        color: isActive ? MINT : MUTED,
                      }}
                    >
                      <span className="whitespace-nowrap">{tab.label}</span>
                      {(tab.id !== "general" || tab.count > 0) && (
                        <span
                          className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]"
                          style={{
                            background: isActive ? "rgba(137,215,183,0.14)" : "#fff",
                            color: isActive ? MINT : MID,
                          }}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {visibleContacts.length === 0 && (
                <div className="flex h-full min-h-[220px] items-center justify-center px-6 text-center text-[12px]" style={{ color: MUTED }}>
                  {inboxFilter === "unread"
                    ? "No unread chats right now."
                    : inboxFilter === "requests"
                      ? "No message requests waiting."
                      : inboxFilter === "pending"
                        ? "No pending requests from your side."
                        : "No conversations yet."}
                </div>
              )}
              {visibleContacts.map((item) => {
                const isActive = item.id === activeId;
                const requestLabel =
                  isIncomingRequest(item)
                    ? item.requestStatus === "rejected"
                      ? "Rejected"
                      : "Request"
                    : isOutgoingPending(item)
                      ? "Requested"
                      : item.personType;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectContact(item.id)}
                    className="w-full px-4 py-4 text-left transition-all"
                    style={{
                      background: isActive ? "#f0f5f2" : "#fff",
                      borderBottom: "1px solid #edf3ef",
                      boxShadow: isActive ? "inset 3px 0 0 #428475" : "none",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar name={item.name} initials={item.initials} avatarUrl={item.avatarUrl} size={40} dark={isActive} />
                        {item.online && (
                          <span
                            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full"
                            style={{ background: "#2e7d5c", border: "2px solid #fff" }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12px] font-extrabold" style={{ color: TEXT }}>
                            {item.name}
                          </span>
                          <span className="shrink-0 text-[10px]" style={{ color: DIM }}>
                            {item.lastTime}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase"
                            style={{
                              background:
                                item.requestDirection === "incoming"
                                  ? "#fff7ed"
                                  : item.personType === "Founder"
                                    ? "#eef2ff"
                                    : "#e8f5ef",
                              color:
                                item.requestDirection === "incoming"
                                  ? "#b45309"
                                  : item.personType === "Founder"
                                    ? "#4f46e5"
                                    : "#2e7d5c",
                            }}
                          >
                            {requestLabel}
                          </span>
                          <span className="truncate text-[10px]" style={{ color: MUTED }}>
                            {item.role}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="truncate text-[11px]" style={{ color: MUTED }}>
                            {item.lastMsg}
                          </span>
                          {item.unread > 0 && (
                            <span
                              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold"
                              style={{ background: MINT, color: INK }}
                            >
                              {item.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            className="flex min-h-0 flex-col overflow-hidden bg-white"
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              boxShadow: "0 16px 38px rgba(15,28,24,0.06)",
            }}
          >
            <div
              className="flex shrink-0 items-center px-5 py-4"
              style={{ borderBottom: "1px solid #e8ede9", background: "#fbfdfb" }}
            >
              <button
                type="button"
                onClick={() => setViewingProfile(true)}
                className="-ml-2 flex flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-all hover:bg-[#f5f7f5]"
              >
                <Avatar name={contact.name} initials={contact.initials} avatarUrl={contact.avatarUrl} size={44} dark />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-extrabold" style={{ color: TEXT }}>
                    {contact.name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]" style={{ color: MUTED }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: contact.online ? "#2e7d5c" : DIM }} />
                    {contact.online ? "Online" : "Offline"}
                    <span>- {contact.role}</span>
                    <span
                      className="ml-1 rounded-full px-1.5 py-0.5 font-bold"
                      style={{ background: "#e8f5ef", color: "#2e7d5c" }}
                    >
                      {contact.match}% Match
                    </span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCall({ mode: "voice" })}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:bg-[#e8ede9]"
                  style={{ color: INK, border: "1px solid #e8ede9" }}
                >
                  <Phone size={14} /> Voice
                </button>
                <motion.button
                  type="button"
                  onClick={() => setCall({ mode: "video" })}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold"
                  style={{ background: DARK, color: MINT }}
                >
                  <VideoCamera size={14} /> Video
                </motion.button>
                <button type="button" className="rounded-lg p-1.5 transition-all hover:bg-[#e8ede9]">
                  <DotsThree size={16} style={{ color: MUTED }} />
                </button>
              </div>
            </div>

            {contact.subject && (
              <div className="shrink-0 px-6 py-3 text-[12px] font-bold" style={{ color: MID, borderBottom: "1px solid #eef3f0" }}>
                Subject: {contact.subject}
              </div>
            )}

            {incomingRequestActive && (
              <div
                className="flex shrink-0 flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  background: contact.requestStatus === "rejected" ? "#fff7f4" : "#fffaf0",
                  borderBottom: "1px solid #f1e4d0",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: contact.requestStatus === "rejected" ? "#ffe7df" : "#fff1d6",
                      color: contact.requestStatus === "rejected" ? "#b42318" : "#b45309",
                    }}
                  >
                    {contact.requestStatus === "rejected" ? <XCircle size={18} weight="fill" /> : <UserPlus size={18} weight="fill" />}
                  </span>
                  <div>
                    <div className="text-[13px] font-extrabold" style={{ color: TEXT }}>
                      {contact.requestStatus === "rejected" ? "Rejected message request" : "Message request"}
                    </div>
                    <p className="mt-0.5 max-w-[620px] text-[12px] leading-5" style={{ color: MUTED }}>
                      {contact.requestStatus === "rejected"
                        ? "This request is still kept here. Accept it if you want to move it into General and reply."
                        : "Accept this request to move the chat into General, or reject it to keep it in Requests."}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => rejectRequest(contact.id)}
                    disabled={contact.requestStatus === "rejected"}
                    className="rounded-lg border px-3 py-2 text-[12px] font-bold transition hover:bg-white disabled:opacity-45"
                    style={{ borderColor: "#ead7c4", color: "#9a5b1e" }}
                  >
                    Reject
                  </button>
                  <motion.button
                    type="button"
                    onClick={() => acceptRequest(contact.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-extrabold"
                    style={{ background: DARK, color: MINT }}
                  >
                    <CheckCircle size={14} weight="fill" />
                    Accept
                  </motion.button>
                </div>
              </div>
            )}

            {outgoingPendingActive && (
              <div
                className="flex shrink-0 items-start gap-3 px-6 py-4"
                style={{ background: "#eef7f2", borderBottom: "1px solid #dcebe3" }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "#dff1e8", color: MID }}>
                  <UserPlus size={18} weight="fill" />
                </span>
                <div>
                  <div className="text-[13px] font-extrabold" style={{ color: TEXT }}>
                    Requested
                  </div>
                  <p className="mt-0.5 max-w-[680px] text-[12px] leading-5" style={{ color: MUTED }}>
                    {sentOutgoingIntro
                      ? "Your request and intro message are sent. You cannot message again until they accept."
                      : "Your request is pending. You can send one intro message here, then wait for them to accept."}
                  </p>
                </div>
              </div>
            )}

            <div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5" style={{ background: "#fbfcfb" }}>
              <div className="flex flex-col gap-6">
                <AnimatePresence initial={false}>
                  {thread.map((msg) => (
                    <MessageRow key={msg.id} msg={msg} contact={contact} currentUser={currentUser} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 bg-white px-4 py-3" style={{ borderTop: "1px solid #e8ede9" }}>
              <Avatar name={getDeveloperName(currentUser)} initials={getInitials(getDeveloperName(currentUser))} avatarUrl={currentUser?.avatarUrl} size={36} dark />
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKey}
                disabled={messageLocked}
                placeholder={inputPlaceholder}
                className="h-11 flex-1 rounded-xl px-4 text-[13px] outline-none"
                style={{ background: messageLocked ? "#eef3ef" : "#f5f7f5", border: "1px solid #e8ede9", color: TEXT }}
              />
              <motion.button
                type="button"
                onClick={sendMsg}
                disabled={!draft.trim() || messageLocked}
                whileHover={draft.trim() && !messageLocked ? { scale: 1.08 } : {}}
                whileTap={draft.trim() && !messageLocked ? { scale: 0.92 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: DARK, opacity: draft.trim() && !messageLocked ? 1 : 0.4 }}
                aria-label="Send message"
              >
                <PaperPlaneTilt size={16} style={{ color: MINT }} weight="fill" />
              </motion.button>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onSend={sendComposedMessage} />}
      </AnimatePresence>

      {call && <CallOverlay contact={contact} mode={call.mode} onEnd={() => setCall(null)} />}
    </div>
  );
}
