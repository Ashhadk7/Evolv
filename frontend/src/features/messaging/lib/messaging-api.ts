import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/features/auth/lib/session";

export interface Participant { id: string; role: "founder" | "developer"; first_name: string; last_name: string; avatar_url: string | null; profile_title: string | null; profile_complete: boolean; phone_verified: boolean }
export interface ApiMessage { id: string; conversation_id: string; sender_id: string; recipient_id: string; body: string; read_at: string | null; created_at: string }
export interface Conversation { id: string; status: "pending" | "accepted" | "declined"; participant: Participant; last_message: ApiMessage | null; unread_count: number; created_at: string; updated_at: string }

export const messagingApi = {
  conversations: () => apiFetch<{ items: Conversation[] }>("/messages/conversations", { auth: true }),
  requests: () => apiFetch<{ items: Conversation[] }>("/messages/requests", { auth: true }),
  pending: () => apiFetch<{ items: Conversation[] }>("/messages/pending", { auth: true }),
  messages: (id: string) => apiFetch<{ conversation: Conversation; items: ApiMessage[] }>(`/messages/conversations/${id}?limit=100&offset=0`, { auth: true }),
  read: (id: string) => apiFetch(`/messages/conversations/${id}/read`, { method: "PATCH", auth: true }),
  accept: (id: string) => apiFetch(`/messages/requests/${id}/accept`, { method: "POST", auth: true }),
  decline: (id: string) => apiFetch(`/messages/requests/${id}/decline`, { method: "POST", auth: true }),
  lookup: (email: string) => apiFetch<{ participant: Participant }>(`/messages/participants/lookup?email=${encodeURIComponent(email)}`, { auth: true }),
};

export function createMessagingSocket(): WebSocket {
  const token = getAccessToken();
  if (!token) throw new Error("You are not signed in.");
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  const base = configured ? new URL(configured, window.location.origin) : new URL(window.location.origin);
  base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  base.pathname = "/api/v1/messages/ws";
  base.search = new URLSearchParams({ token }).toString();
  return new WebSocket(base);
}
