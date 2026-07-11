import { apiFetch } from "@/lib/api";
import { getSession } from "@/features/auth/lib/session";
import type { FounderContactProfile } from "@/features/network/types";

interface UserSummary { id: string; email: string; role: "founder" | "developer"; first_name: string; last_name: string; city: string | null; country: string | null; avatar_url: string | null; phone_verified: boolean; profile_title: string | null; profile_bio: string | null; profile_complete: boolean; discovery_tags: string[] }
interface ConnectionRecord { id: string; status: "pending" | "accepted" | "ignored" | "rejected"; note: string | null; user: { id: string } }

export interface NetworkConnectionState {
  connectedIds: string[];
  incomingIds: string[];
  outgoingIds: string[];
  connectionIdByUser: Record<string, string>;
  requestNotes: Record<string, string>;
}

export async function loadNetworkConnections(): Promise<NetworkConnectionState> {
  const [accepted, incoming, outgoing] = await Promise.all([
    apiFetch<ConnectionRecord[]>("/connections", { auth: true }),
    apiFetch<ConnectionRecord[]>("/connections/incoming", { auth: true }),
    apiFetch<ConnectionRecord[]>("/connections/outgoing", { auth: true }),
  ]);
  const all = [...accepted, ...incoming, ...outgoing];
  return {
    connectedIds: accepted.map((item) => item.user.id),
    incomingIds: incoming.map((item) => item.user.id),
    outgoingIds: outgoing.map((item) => item.user.id),
    connectionIdByUser: Object.fromEntries(all.map((item) => [item.user.id, item.id])),
    requestNotes: Object.fromEntries(all.map((item) => [item.user.id, item.note ?? ""])),
  };
}

export const connectionApi = {
  send: (receiverId: string, note?: string) => apiFetch<ConnectionRecord>("/connections", { method: "POST", auth: true, body: { receiver_id: receiverId, note: note?.trim() || null } }),
  respond: (connectionId: string, status: "accepted" | "ignored") => apiFetch<ConnectionRecord>(`/connections/${connectionId}`, { method: "PATCH", auth: true, body: { status } }),
  remove: (connectionId: string) => apiFetch(`/connections/${connectionId}`, { method: "DELETE", auth: true }),
};

export async function loadNetworkPeople(): Promise<FounderContactProfile[]> {
  const response = await apiFetch<{ items: UserSummary[] }>("/users?limit=100&offset=0", { auth: true });
  const currentUserId = getSession()?.user.id;
  return response.items.filter((user) => user.id !== currentUserId).map((user) => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    role: user.profile_title ?? (user.role === "founder" ? "Founder" : "Developer"),
    company: "Evolv",
    type: user.role === "founder" ? "Founder" : "Developer",
    initials: `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase(),
    avatarColor: "#2e7d5c",
    skills: user.discovery_tags,
    domains: user.discovery_tags,
    experience: user.profile_title ?? "Evolv member",
    mutual: 0,
    location: [user.city, user.country].filter(Boolean).join(", "),
    connected: false,
    match: 0,
    availability: "Available",
    focus: user.discovery_tags.join(", "),
    bio: user.profile_bio ?? "",
    highlights: user.discovery_tags,
    online: false,
  }));
}
