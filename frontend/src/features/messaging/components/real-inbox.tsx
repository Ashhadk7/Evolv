"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PencilSimple } from "@phosphor-icons/react";
import { getSession, SESSION_CLEARED_EVENT } from "@/features/auth/lib/session";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { NetworkProfileDetailScreen } from "@/features/network/components/network-profile-detail";
import type { FounderContactProfile } from "@/features/network/types";
import type { Contact, CurrentInboxUser, InboxFilter, InboxLaunchContact, Message } from "../types/shared-inbox-types";
import { calendarApi, messagingApi, createMessagingSocket, type ApiMessage, type Conversation } from "../lib/messaging-api";
import { getInitials } from "../lib/inbox-helpers";
import { BORDER, MUTED, TEXT } from "../lib/inbox-theme";
import { ConversationListPanel } from "./conversation-list-panel";
import { ChatHeader } from "./chat-header";
import { MessageRow } from "./message-row";
import { MessageComposer } from "./message-composer";
import { RequestBanner } from "./request-banner";
import { PendingBanner } from "./pending-banner";
import { ComposeModal } from "./compose-modal";

function contactFrom(conversation: Conversation, direction: "incoming" | "outgoing" | undefined, online: boolean): Contact {
  const p = conversation.participant;
  return { id: conversation.id, participantId: p.id, name: `${p.first_name} ${p.last_name}`.trim(), role: p.profile_title ?? (p.role === "founder" ? "Founder" : "Developer"), personType: p.role === "founder" ? "Founder" : "Developer", match: 0, lastMsg: conversation.last_message?.body ?? "No messages yet", lastTime: conversation.last_message ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "", unread: conversation.unread_count, initials: getInitials(`${p.first_name} ${p.last_name}`), online, avatarUrl: p.avatar_url ?? undefined, requestStatus: conversation.status === "declined" ? "rejected" : conversation.status, requestDirection: direction };
}

function uiMessage(message: ApiMessage, currentUserId: string): Message {
  const created = new Date(message.created_at);
  return { id: message.id, from: message.sender_id === currentUserId ? "me" : "them", text: message.body, time: created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: created.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) };
}

function profileFromContact(contact: Contact): FounderContactProfile {
  const tags = contact.role ? [contact.role] : [];
  return {
    id: contact.participantId ?? contact.id,
    name: contact.name,
    email: contact.email,
    role: contact.role,
    company: "",
    type: contact.personType,
    initials: contact.initials,
    avatarColor: "#2e7d5c",
    skills: tags,
    domains: tags,
    experience: "",
    mutual: 0,
    location: "",
    connected: contact.requestStatus === "accepted",
    match: contact.match,
    availability: "",
    focus: contact.role,
    bio: "",
    highlights: tags,
    online: contact.online,
    avatarUrl: contact.avatarUrl,
  };
}

export function RealInbox({ activeContactId, onActiveContactChange, currentUser, profileComplete = true, onRequireProfile }: { activeContactId?: string; onActiveContactChange?: (id: string) => void; extraContacts?: InboxLaunchContact[]; currentUser?: CurrentInboxUser; profileComplete?: boolean; onRequireProfile?: (afterComplete?: () => void) => void }) {
  const userId = getSession()?.user.id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [directions, setDirections] = useState<Record<string, "incoming" | "outgoing">>({});
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [localActiveId, setLocalActiveId] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("general");
  const [draft, setDraft] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [error, setError] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [creatingMeet, setCreatingMeet] = useState(false);
  const [profileContact, setProfileContact] = useState<Contact | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef("");
  const conversationsRef = useRef<Conversation[]>([]);

  const load = useCallback(async () => {
    try {
      const inbox = await messagingApi.inbox();
      const items = [...inbox.conversations, ...inbox.requests, ...inbox.pending];
      setConversations(items);
      conversationsRef.current = items;
      setDirections(Object.fromEntries([...inbox.requests.map((c) => [c.id, "incoming"] as const), ...inbox.pending.map((c) => [c.id, "outgoing"] as const)]));
      setError("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403 && err.detail.toLowerCase().includes("profile")) {
        onRequireProfile?.();
        setError("");
      } else setError(getApiErrorMessage(err));
    } finally {
      setLoadingChats(false);
    }
  }, [onRequireProfile]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => {
    let retry: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const stop = () => {
      stopped = true;
      if (retry) clearTimeout(retry);
      socketRef.current?.close();
      setSocketReady(false);
    };
    const connect = () => {
      if (stopped) return;
      try {
        const socket = createMessagingSocket();
        socketRef.current = socket;
        socket.onopen = () => { setSocketReady(true); setError(""); };
        socket.onmessage = (event) => {
          const payload = JSON.parse(event.data) as { event: string; message?: ApiMessage; detail?: unknown; online_user_ids?: string[]; user_id?: string; online?: boolean };
          if ((payload.event === "message.created" || payload.event === "message.sent") && payload.message && userId) {
            const message = uiMessage(payload.message, userId);
            setMessages((old) => ({ ...old, [payload.message!.conversation_id]: old[payload.message!.conversation_id]?.some((item) => item.id === message.id) ? old[payload.message!.conversation_id] : [...(old[payload.message!.conversation_id] ?? []), message] }));
            const isActive = payload.message.conversation_id === activeIdRef.current;
            if (isActive) {
              void messagingApi.read(payload.message.conversation_id);
            }
            const existing = conversationsRef.current.find(
              (item) => item.id === payload.message!.conversation_id
            );
            if (existing) {
              const updated = {
                ...existing,
                last_message: payload.message,
                unread_count:
                  payload.message.recipient_id === userId && !isActive
                    ? existing.unread_count + 1
                    : 0,
                updated_at: payload.message.created_at,
              };
              const next = [
                updated,
                ...conversationsRef.current.filter((item) => item.id !== updated.id),
              ];
              conversationsRef.current = next;
              setConversations(next);
            } else {
              void load();
            }
          } else if (payload.event === "presence.snapshot") {
            setOnlineUserIds(new Set(payload.online_user_ids ?? []));
          } else if (payload.event === "presence.changed" && payload.user_id) {
            setOnlineUserIds((current) => {
              const next = new Set(current);
              if (payload.online) next.add(payload.user_id!);
              else next.delete(payload.user_id!);
              return next;
            });
          } else if (payload.event === "error") {
            const detail = typeof payload.detail === "string" ? payload.detail : "Message could not be sent.";
            if (detail.toLowerCase().includes("profile must be complete")) onRequireProfile?.();
            else setError(detail);
          }
        };
        socket.onclose = () => { setSocketReady(false); if (!stopped) retry = setTimeout(connect, 2000); };
      } catch (err) { setError(getApiErrorMessage(err)); }
    };
    connect();
    window.addEventListener(SESSION_CLEARED_EVENT, stop);
    return () => { window.removeEventListener(SESSION_CLEARED_EVENT, stop); stop(); };
  }, [load, onRequireProfile, userId]);

  const contacts = useMemo(() => conversations.map((c) => contactFrom(c, directions[c.id], onlineUserIds.has(c.participant.id))), [conversations, directions, onlineUserIds]);
  const activeId = activeContactId && contacts.some((c) => c.id === activeContactId) ? activeContactId : localActiveId;
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  const contact = contacts.find((c) => c.id === activeId);
  const conversation = conversations.find((c) => c.id === activeId);
  const thread = messages[activeId] ?? [];
  const profilePreview = profileContact?.id === activeId ? profileFromContact(profileContact) : null;
  const profileOpen = Boolean(profilePreview);

  const markConversationReadLocal = useCallback((id: string) => {
    const update = (items: Conversation[]) =>
      items.map((item) => (item.id === id ? { ...item, unread_count: 0 } : item));
    conversationsRef.current = update(conversationsRef.current);
    setConversations((current) => update(current));
  }, []);

  const select = useCallback(async (id: string) => {
    if (id === activeIdRef.current && Object.hasOwn(messages, id)) return;
    setLocalActiveId(id); onActiveContactChange?.(id);
    if (Object.hasOwn(messages, id)) {
      markConversationReadLocal(id);
      void messagingApi.read(id);
      return;
    }
    setLoadingConversationId(id);
    try { const data = await messagingApi.messages(id); if (userId) setMessages((old) => ({ ...old, [id]: data.items.map((m) => uiMessage(m, userId)) })); await messagingApi.read(id); markConversationReadLocal(id); } catch (err) { setError(getApiErrorMessage(err)); } finally { setLoadingConversationId(null); }
  }, [markConversationReadLocal, messages, onActiveContactChange, userId]);
  useLayoutEffect(() => { if (loadingConversationId === activeId) return; const frame = requestAnimationFrame(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }); return () => cancelAnimationFrame(frame); }, [activeId, loadingConversationId, profileOpen, thread.length]);

  const visible = contacts.filter((c) => filter === "requests" ? c.requestDirection === "incoming" : filter === "pending" ? c.requestDirection === "outgoing" : filter === "unread" ? !c.requestDirection && c.unread > 0 : !c.requestDirection);
  const tabs: { id: InboxFilter; label: string; count: number }[] = [{ id: "general", label: "General", count: contacts.filter((c) => !c.requestDirection).length }, { id: "unread", label: "Unread", count: contacts.filter((c) => !c.requestDirection && c.unread > 0).length }, { id: "requests", label: "Requests", count: contacts.filter((c) => c.requestDirection === "incoming").length }, { id: "pending", label: "Pending", count: contacts.filter((c) => c.requestDirection === "outgoing").length }];
  const locked = conversation?.status === "pending" && (directions[activeId] === "incoming" || thread.some((m) => m.from === "me"));

  const sendTo = (recipientId: string, body: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) { setError("Reconnecting to messaging. Please wait a moment."); return false; }
    socket.send(JSON.stringify({ recipient_id: recipientId, body })); setError(""); return true;
  };
  const send = () => { if (!contact?.participantId || !draft.trim() || locked) return; if (sendTo(contact.participantId, draft.trim())) setDraft(""); };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } };
  const action = async (kind: "accept" | "decline") => { if (!activeId) return; try { await messagingApi[kind](activeId); setFilter(kind === "accept" ? "general" : "requests"); await load(); } catch (err) { setError(getApiErrorMessage(err)); } };
  const compose = async ({ email, message }: { email: string; subject: string; message: string }) => { try { const { participant } = await messagingApi.lookup(email); if (!sendTo(participant.id, message.trim())) return "Messaging is reconnecting. Please try again."; setComposeOpen(false); setFilter("pending"); return null; } catch (err) { return getApiErrorMessage(err); } };
  const sendMeetInvite = async () => {
    if (!contact?.participantId || locked || creatingMeet) return;
    const popup = window.open("", "evolv-google-calendar", "width=520,height=720");
    setCreatingMeet(true);
    setError("");
    try {
      const status = await calendarApi.status();
      if (!status.configured) {
        popup?.close();
        setError("Google Calendar is not configured yet. Add the Google OAuth credentials to the backend environment.");
        return;
      }
      if (!status.connected) {
        const { authorization_url } = await calendarApi.authorize();
        if (!popup) throw new Error("Allow pop-ups to connect Google Calendar.");
        popup.location.href = authorization_url;
        await waitForGoogleCalendarConnection();
      } else {
        popup?.close();
      }
      const meeting = await calendarApi.createMeet(contact.participantId);
      sendTo(contact.participantId, `Let’s have a meeting. Join the Google Meet here: ${meeting.meet_url}`);
    } catch (err) {
      popup?.close();
      setError(getApiErrorMessage(err));
    } finally {
      setCreatingMeet(false);
    }
  };

  return <div className="flex h-screen max-h-screen min-h-0 flex-col overflow-hidden" style={{ background: "#f5f6f4", padding: "24px 28px" }}>
    <div className="mb-4 flex shrink-0 items-center justify-between"><div><h2 className="text-[1.2rem] font-bold" style={{ color: TEXT }}>Inbox</h2><p className="mt-0.5 text-[12px]" style={{ color: MUTED }}>Your persistent Evolv conversations.</p></div><motion.button type="button" onClick={() => { if (!profileComplete && onRequireProfile) onRequireProfile(() => setComposeOpen(true)); else setComposeOpen(true); }} className="bp-gradient-btn flex h-11 items-center gap-2 rounded-xl px-5 text-[13px] font-extrabold"><PencilSimple size={15} weight="bold" />Compose</motion.button></div>
    {error && <div className="mb-3 rounded-lg border border-[#dce9e2] bg-[#f4f8f6] px-4 py-2 text-xs text-[#365f52]">{error}</div>}
    <div className="grid min-h-0 flex-1 grid-cols-[340px_minmax(0,1fr)] gap-4"><ConversationListPanel inboxTabs={tabs} inboxFilter={filter} onFilterChange={setFilter} visibleContacts={visible} activeId={activeId} onSelectContact={(id) => void select(id)} loading={loadingChats} />
      <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white" style={{ border: `1px solid ${BORDER}`, borderRadius: 14 }}>
        {loadingChats ? <ChatLoading message="Please wait while we load your chats" /> : profilePreview ? <NetworkProfileDetailScreen profile={profilePreview} connected={conversation?.status === "accepted"} pending={conversation?.status === "pending"} backLabel="Back to Inbox" onBack={() => setProfileContact(null)} surface="inbox" connectionLabel={conversation?.status === "pending" ? "Pending" : undefined} connectionDisabled /> : !contact ? <div className="flex flex-1 items-center justify-center text-sm" style={{ color: MUTED }}>Select a conversation or compose a new message.</div> : <><ChatHeader contact={contact} onViewProfile={() => setProfileContact(contact)} />{directions[activeId] === "incoming" && <RequestBanner contact={contact} onAccept={() => void action("accept")} onReject={() => void action("decline")} />}{directions[activeId] === "outgoing" && <PendingBanner sentOutgoingIntro={thread.some((m) => m.from === "me")} />}{loadingConversationId === activeId ? <ChatLoading message="Loading conversation" /> : <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5"><div className="flex flex-col gap-6"><AnimatePresence initial={false}>{thread.map((msg) => <MessageRow key={msg.id} msg={msg} contact={contact} currentUser={currentUser} />)}</AnimatePresence></div></div>}<MessageComposer senderName={[currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") || "You"} senderInitials={getInitials([currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") || "You")} senderAvatarUrl={currentUser?.avatarUrl} draft={draft} onDraftChange={setDraft} onKeyDown={keyDown} locked={Boolean(locked) || !socketReady} placeholder={!socketReady ? "Connecting to messaging..." : locked ? directions[activeId] === "incoming" ? "Accept the request before replying." : "Wait for the request to be accepted." : "Type a message..."} onSend={send} onMeetInvite={() => void sendMeetInvite()} meetLoading={creatingMeet} /></>}
      </section></div><AnimatePresence>{composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onSend={compose} />}</AnimatePresence>
  </div>;
}

function ChatLoading({ message }: { message: string }) {
  return <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center"><p className="text-[13px] font-semibold" style={{ color: MUTED }}>{message}</p><div className="h-1.5 w-52 overflow-hidden rounded-full bg-[#e4ece7]"><motion.div className="h-full w-2/5 rounded-full bg-[#428475]" animate={{ x: ["-110%", "260%"] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }} /></div></div>;
}

function waitForGoogleCalendarConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", listener);
      reject(new Error("Google Calendar connection timed out. Please try again."));
    }, 120_000);
    const listener = (event: MessageEvent) => {
      const apiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL
        ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL, window.location.origin).origin
        : window.location.origin;
      if (event.origin !== apiOrigin) return;
      if (event.data?.type !== "evolv.google-calendar.connected") return;
      window.clearTimeout(timeout);
      window.removeEventListener("message", listener);
      resolve();
    };
    window.addEventListener("message", listener);
  });
}
