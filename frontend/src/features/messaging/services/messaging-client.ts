import type { Contact, Message } from "@/features/messaging/types/shared-inbox-types";

type BackendRole = "founder" | "developer";
type BackendConnectionStatus = "pending" | "accepted" | "declined";

type BackendParticipant = {
  id: string;
  role: BackendRole;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  profile_title: string | null;
  phone_verified: boolean;
};

type BackendMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type BackendConversation = {
  id: string;
  status: BackendConnectionStatus;
  participant: BackendParticipant;
  last_message: BackendMessage | null;
  unread_count: number;
};

type BackendConversationList = {
  items: BackendConversation[];
};

type BackendMessageList = {
  items: BackendMessage[];
};

type BackendUser = {
  id: string;
  email: string;
  role: BackendRole;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  phone_verified: boolean;
};

type BackendUserList = {
  items: BackendUser[];
};

type SocketPayload =
  | { event: "message.created"; message: BackendMessage }
  | { event: "message.sent"; message: BackendMessage }
  | { event: "error"; detail: unknown; status_code?: number };

export function getMessagingAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("evolv_access_token");
}

function getMessagingHttpBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  return baseUrl.replace(/\/+$/, "");
}

function getMessagingWsBaseUrl() {
  return getMessagingHttpBaseUrl().replace(/^http/i, "ws");
}

export function connectMessagingSocket({
  onMessage,
  onError,
}: {
  onMessage: (message: Message, backendMessage: BackendMessage) => void;
  onError: (message: string) => void;
}) {
  const token = getMessagingAccessToken();
  if (!token) return null;

  const socket = new WebSocket(
    `${getMessagingWsBaseUrl()}/messages/ws?token=${encodeURIComponent(token)}`
  );

  socket.onmessage = (event) => {
    const payload = JSON.parse(event.data) as SocketPayload;
    if (payload.event === "error") {
      onError(typeof payload.detail === "string" ? payload.detail : "Message could not be sent.");
      return;
    }
    const currentUserId = getCurrentUserIdFromToken();
    onMessage(
      mapBackendMessage(payload.message, payload.message.sender_id === currentUserId ? "me" : "them"),
      payload.message
    );
  };

  socket.onerror = () => onError("Messaging socket could not connect.");
  socket.onclose = (event) => {
    if (event.code !== 1000 && event.code !== 1001) {
      onError("Messaging socket is closed.");
    }
  };

  return socket;
}

export function sendSocketMessage(socket: WebSocket | null, recipientId: string, body: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("Messaging socket is not connected.");
  }
  socket.send(JSON.stringify({ recipient_id: recipientId, body }));
}

export async function fetchMessagingState() {
  const [general, requests, pending] = await Promise.all([
    messagingRequest<BackendConversationList>("/messages/conversations"),
    messagingRequest<BackendConversationList>("/messages/requests"),
    messagingRequest<BackendConversationList>("/messages/pending"),
  ]);
  const conversations = [...general.items, ...requests.items, ...pending.items];
  const currentUserId = getCurrentUserIdFromToken();
  const messageEntries = await Promise.all(
    conversations.map(async (conversation) => {
      const thread = await messagingRequest<BackendMessageList>(
        `/messages/conversations/${conversation.id}`
      );
      return [
        conversation.id,
        thread.items.map((item) =>
          mapBackendMessage(item, item.sender_id === currentUserId ? "me" : "them")
        ),
      ] as const;
    })
  );

  return {
    contacts: [
      ...general.items.map((item) => mapBackendConversation(item)),
      ...requests.items.map((item) => mapBackendConversation(item, "incoming")),
      ...pending.items.map((item) => mapBackendConversation(item, "outgoing")),
    ],
    messages: Object.fromEntries(messageEntries) as Record<string, Message[]>,
  };
}

export async function findMessagingContactByEmail(email: string) {
  const response = await messagingRequest<BackendUserList>(
    `/users?search=${encodeURIComponent(email)}&limit=5`
  );
  const normalizedEmail = email.toLowerCase();
  const user = response.items.find((item) => item.email.toLowerCase() === normalizedEmail);
  return user ? mapBackendUser(user) : null;
}

export function acceptMessageRequest(conversationId: string) {
  return messagingRequest(`/messages/requests/${conversationId}/accept`, { method: "POST" });
}

export function declineMessageRequest(conversationId: string) {
  return messagingRequest(`/messages/requests/${conversationId}/decline`, { method: "POST" });
}

export function markConversationRead(conversationId: string) {
  return messagingRequest(`/messages/conversations/${conversationId}/read`, { method: "PATCH" });
}

async function messagingRequest<T>(path: string, init: RequestInit = {}) {
  const token = getMessagingAccessToken();
  if (!token) throw new Error("Please sign in again before using messages.");

  let response: Response;
  try {
    response = await fetch(`${getMessagingHttpBaseUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  } catch {
    throw new Error("Could not reach backend for messaging.");
  }

  if (!response.ok) throw new Error(await getErrorMessage(response));
  return (await response.json()) as T;
}

async function getErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { detail?: string };
    if (payload.detail) return payload.detail;
  } catch {
    return "Messaging request failed.";
  }
  return "Messaging request failed.";
}

function mapBackendConversation(
  item: BackendConversation,
  direction?: "incoming" | "outgoing"
): Contact {
  const name = `${item.participant.first_name} ${item.participant.last_name}`.trim();
  return {
    id: item.id,
    recipientId: item.participant.id,
    name,
    role: item.participant.profile_title || roleLabel(item.participant.role),
    personType: item.participant.role === "founder" ? "Founder" : "Developer",
    match: 0,
    lastMsg: item.last_message?.body ?? "No messages yet.",
    lastTime: item.last_message ? formatBackendTime(item.last_message.created_at) : "Now",
    unread: item.unread_count,
    initials: getInitials(name),
    online: false,
    avatarUrl: item.participant.avatar_url ?? undefined,
    requestStatus: item.status === "declined" ? "rejected" : item.status,
    requestDirection: direction,
  };
}

function mapBackendUser(user: BackendUser): Contact {
  const name = `${user.first_name} ${user.last_name}`.trim() || user.email;
  return {
    id: user.id,
    recipientId: user.id,
    name,
    role: roleLabel(user.role),
    personType: user.role === "founder" ? "Founder" : "Developer",
    match: 0,
    lastMsg: "Start a new conversation.",
    lastTime: "Now",
    unread: 0,
    initials: getInitials(name),
    online: false,
    email: user.email,
    avatarUrl: user.avatar_url ?? undefined,
    requestStatus: "pending",
    requestDirection: "outgoing",
  };
}

function mapBackendMessage(item: BackendMessage, from: "me" | "them"): Message {
  const createdAt = new Date(item.created_at);
  return {
    id: item.id,
    conversationId: item.conversation_id,
    from,
    text: item.body,
    time: formatBackendTime(item.created_at),
    date: createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function roleLabel(role: BackendRole) {
  return role === "founder" ? "Founder" : "Developer";
}

function formatBackendTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

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

function getCurrentUserIdFromToken() {
  const token = getMessagingAccessToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1] ?? "")).sub as string;
  } catch {
    return null;
  }
}
