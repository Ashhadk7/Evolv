"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PencilSimple } from "@phosphor-icons/react";
import { NetworkProfileDetailScreen } from "@/features/network/components/network-profile-detail";
import { buildProfileFromContact } from "@/features/network/data";
import type {
  Contact,
  CurrentFounder,
  InboxFilter,
  InboxLaunchContact,
  Message,
} from "@/features/messaging/types/inbox-types";
import { BORDER, MUTED, TEXT } from "@/features/messaging/lib/inbox-theme";
import { CONTACTS, MOCK_MSGS } from "@/features/messaging/data/inbox-mock-data";
import {
  getInitials,
  getFounderName,
  formatDate,
  formatTime,
  readStoredUsers,
  roleToPersonType,
  isIncomingRequest,
  isOutgoingPending,
  hasSentIntro,
  contactFromStoredUser,
} from "@/features/messaging/lib/inbox-helpers";
import { MessageRow } from "../message-row";
import { ComposeModal } from "../compose-modal";
import { CallOverlay } from "../call-overlay";
import { ConversationListPanel } from "../conversation-list-panel";
import { ChatHeader } from "../chat-header";
import { RequestBanner } from "../request-banner";
import { PendingBanner } from "../pending-banner";
import { MessageComposer } from "../message-composer";

export function InboxTab({
  activeContactId,
  onActiveContactChange,
  extraContacts = [],
  currentUser,
  profileComplete = true,
  onRequireProfile,
}: {
  activeContactId?: string;
  onActiveContactChange?: (id: string) => void;
  extraContacts?: InboxLaunchContact[];
  currentUser?: CurrentFounder;
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
}) {
  const [localActiveId, setLocalActiveId] = useState("sarah");
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MSGS);
  const [draft, setDraft] = useState("");
  const [call, setCall] = useState<{ mode: "voice" | "video" } | null>(null);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>(() =>
    extraContacts.some(
      (extra) => extra.id === activeContactId && extra.requestDirection === "outgoing"
    )
      ? "pending"
      : "general"
  );
  const messageListRef = useRef<HTMLDivElement>(null);

  const mergedContacts = useMemo(() => {
    const toContact = (extra: InboxLaunchContact, base?: Contact): Contact => {
      const personType = extra.personType ?? base?.personType ?? roleToPersonType(extra.role);
      const initialMessage = extra.initialMessage?.trim();
      return {
        id: base?.id ?? extra.id,
        name: extra.name || base?.name || "Evolv member",
        role: extra.role || base?.role || "Evolv Network",
        personType,
        match: extra.match ?? base?.match ?? 80,
        lastMsg:
          initialMessage ||
          base?.lastMsg ||
          (extra.requestDirection === "outgoing" ? "Connection request sent" : "New conversation"),
        lastTime: initialMessage ? "Now" : (base?.lastTime ?? "Now"),
        unread: extra.requestDirection === "outgoing" ? 0 : (base?.unread ?? 0),
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
      const existing = contacts.find(
        (item) =>
          item.id === extra.id ||
          (normalizedEmail ? item.email?.toLowerCase() === normalizedEmail : false)
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
    const rawThread = contact ? (messages[contact.id] ?? []) : [];
    const launchContact = extraContacts.find(
      (extra) =>
        extra.id === contact.id ||
        (extra.email && contact.email?.toLowerCase() === extra.email.toLowerCase())
    );
    const initialMessage = launchContact?.initialMessage?.trim();
    if (
      !initialMessage ||
      rawThread.some((msg) => msg.from === "me" && msg.text === initialMessage)
    )
      return rawThread;

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
  const contactProfile = buildProfileFromContact(contact);
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
    () =>
      mergedContacts.filter(
        (item) => isIncomingRequest(item) && (messages[item.id]?.length ?? 0) <= 1
      ),
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
  const unreadChatCount = unreadContacts.length;
  const inboxTabs: { id: InboxFilter; label: string; count: number }[] = [
    { id: "general", label: "General", count: generalContacts.length },
    { id: "unread", label: "Unread", count: unreadChatCount },
    { id: "requests", label: "Requests", count: requestContacts.length },
    { id: "pending", label: "Pending", count: pendingContacts.length },
  ];

  const selectContact = (id: string) => {
    if (onActiveContactChange) onActiveContactChange(id);
    else setLocalActiveId(id);
    setContacts((prev) => prev.map((item) => (item.id === id ? { ...item, unread: 0 } : item)));
    setViewingProfile(false);
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

  const sendMeetInvite = () => {
    if (messageLocked) return;
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const segment = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const meetCode = `${segment(3)}-${segment(4)}-${segment(3)}`;
    const meetLink = `https://meet.google.com/${meetCode}`;
    const body = `Let's connect over video call. Join here: ${meetLink}`;

    const now = new Date();
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
  };

  const acceptRequest = (id: string) => {
    setContacts((prev) => {
      const acceptedContact = {
        ...contact,
        requestStatus: "accepted" as const,
        unread: 0,
        lastTime: "Now",
      };
      return prev.some((item) => item.id === id)
        ? prev.map((item) =>
            item.id === id
              ? { ...item, requestStatus: "accepted" as const, unread: 0, lastTime: "Now" }
              : item
          )
        : [acceptedContact, ...prev];
    });
    setInboxFilter("general");
  };

  const rejectRequest = (id: string) => {
    setContacts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, requestStatus: "rejected" as const, unread: 0, lastTime: "Now" }
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

    const storedUser = readStoredUsers().find(
      (user) => (user.email || user.profile?.email)?.toLowerCase() === normalized
    );
    return storedUser ? contactFromStoredUser(storedUser) : null;
  };

  const sendComposedMessage = ({
    email,
    subject,
    message,
  }: {
    email: string;
    subject: string;
    message: string;
  }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();
    const trimmedSubject = subject.trim();

    if (!normalizedEmail) return "Enter the recipient's email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return "Enter a valid email address.";
    if (!trimmedMessage) return "Write a message before sending.";

    const recipient = findRecipient(normalizedEmail);
    if (!recipient) return "No Evolv account was found with that email.";
    const existingRecipient = mergedContacts.some(
      (item) => item.id === recipient.id || item.email?.toLowerCase() === normalizedEmail
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

  const handleComposeClick = () => {
    if (!profileComplete && onRequireProfile) {
      onRequireProfile(() => setComposeOpen(true));
      return;
    }
    setComposeOpen(true);
  };

  if (viewingProfile) {
    return (
      <NetworkProfileDetailScreen
        key={contactProfile.id}
        profile={contactProfile}
        connected
        backLabel="Back to Chat"
        onBack={() => setViewingProfile(false)}
        onMessage={() => setViewingProfile(false)}
        profileComplete={profileComplete}
        onRequireProfile={onRequireProfile}
        messageLabel="Open Chat"
      />
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden"
      style={{ background: "#f5f6f4", padding: "24px 28px" }}
    >
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
          onClick={handleComposeClick}
          whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(15,28,24,0.16)" }}
          whileTap={{ scale: 0.98 }}
          className="bp-gradient-btn flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-extrabold"
        >
          <PencilSimple size={15} weight="bold" />
          Compose
        </motion.button>
      </div>

      <div className="min-h-0 flex-1">
        <div className="grid h-full min-h-0 grid-cols-[340px_minmax(0,1fr)] gap-4">
          <ConversationListPanel
            inboxTabs={inboxTabs}
            inboxFilter={inboxFilter}
            onFilterChange={setInboxFilter}
            visibleContacts={visibleContacts}
            activeId={activeId}
            onSelectContact={selectContact}
          />

          <section
            className="flex min-h-0 flex-col overflow-hidden bg-white"
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              boxShadow: "0 16px 38px rgba(15,28,24,0.06)",
            }}
          >
            <ChatHeader contact={contact} onViewProfile={() => setViewingProfile(true)} />

            {incomingRequestActive && (
              <RequestBanner
                contact={contact}
                onAccept={() => acceptRequest(contact.id)}
                onReject={() => rejectRequest(contact.id)}
              />
            )}

            {outgoingPendingActive && <PendingBanner sentOutgoingIntro={sentOutgoingIntro} />}

            <div
              ref={messageListRef}
              className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
              style={{ background: "#fbfcfb" }}
            >
              <div className="flex flex-col gap-6">
                <AnimatePresence initial={false}>
                  {thread.map((msg) => (
                    <MessageRow
                      key={msg.id}
                      msg={msg}
                      contact={contact}
                      currentUser={currentUser}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <MessageComposer
              senderName={getFounderName(currentUser)}
              senderInitials={getInitials(getFounderName(currentUser))}
              senderAvatarUrl={currentUser?.avatarUrl}
              draft={draft}
              onDraftChange={setDraft}
              onKeyDown={handleKey}
              locked={messageLocked}
              placeholder={inputPlaceholder}
              onSend={sendMsg}
              onMeetInvite={sendMeetInvite}
            />
          </section>
        </div>
      </div>

      <AnimatePresence>
        {composeOpen && (
          <ComposeModal onClose={() => setComposeOpen(false)} onSend={sendComposedMessage} />
        )}
      </AnimatePresence>

      {call && <CallOverlay contact={contact} mode={call.mode} onEnd={() => setCall(null)} />}
    </div>
  );
}
