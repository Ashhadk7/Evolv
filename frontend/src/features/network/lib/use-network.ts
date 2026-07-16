"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FounderContactProfile, NetworkMessageTarget } from "@/features/network/types";
import {
  connectionApi,
  loadNetworkConnections,
  loadNetworkPeople,
} from "@/features/network/lib/network-api";
import type { StoredNetworkState } from "@/features/network/types";
import { messagingApi, type Conversation } from "@/features/messaging/lib/messaging-api";
import { getApiErrorMessage } from "@/lib/api";

interface UseNetworkProps {
  role: "developer" | "founder";
  onMessage?: (contact: NetworkMessageTarget, initialNote?: string) => void;
  onPendingCountChange?: (count: number) => void;
  profileComplete: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
}

export function useNetwork({
  role,
  onMessage,
  onPendingCountChange,
  profileComplete,
  onRequireProfile,
}: UseNetworkProps) {
  // Select constants and storage loaders based on the role
  const [people, setPeople] = useState<FounderContactProfile[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [connectionIdByUser, setConnectionIdByUser] = useState<Record<string, string>>({});

  // Distinguish "loaded, genuinely empty" from "failed to load" so the UI can
  // show a real error + retry instead of a misleading "No results found".
  const loadPeople = useCallback(() => {
    loadNetworkPeople()
      .then((items) => { setPeople(items); setLoadError(false); })
      .catch(() => { setPeople([]); setLoadError(true); });
  }, []);

  useEffect(() => { loadPeople(); }, [loadPeople]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"network" | "requests" | "connections">("network");
  const [searchQuery, setSearchQuery] = useState("");
  const [networkState, setNetworkState] = useState<StoredNetworkState>({
    connected: {},
    pendingIds: [],
    ignoredIds: [],
    outgoingIds: [],
    requestNotes: {},
  });
  const [selectedPerson, setSelectedPerson] = useState<FounderContactProfile | null>(null);
  const [requestModalPerson, setRequestModalPerson] = useState<FounderContactProfile | null>(null);
  const [actionError, setActionError] = useState("");

  const { connected, pendingIds, ignoredIds, outgoingIds } = networkState;
  const outgoingSet = useMemo(() => new Set(outgoingIds), [outgoingIds]);

  const refreshConnections = async () => {
    const state = await loadNetworkConnections();
    setConnectionIdByUser(state.connectionIdByUser);
    setNetworkState((previous) => ({
      ...previous,
      connected: Object.fromEntries(state.connectedIds.map((id) => [id, true])),
      pendingIds: state.incomingIds,
      outgoingIds: state.outgoingIds,
      requestNotes: state.requestNotes,
    }));
  };

  useEffect(() => {
    let active = true;
    void loadNetworkConnections().then((state) => {
      if (!active) return;
      setConnectionIdByUser(state.connectionIdByUser);
      setNetworkState((previous) => ({
        ...previous,
        connected: Object.fromEntries(state.connectedIds.map((id) => [id, true])),
        pendingIds: state.incomingIds,
        outgoingIds: state.outgoingIds,
        requestNotes: state.requestNotes,
      }));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  // Notify of pending counts
  useEffect(() => {
    onPendingCountChange?.(pendingIds.length);
  }, [onPendingCountChange, pendingIds.length]);

  const pendingPeople = useMemo(
    () => people.filter((person) => pendingIds.includes(person.id)),
    [people, pendingIds]
  );

  const connectedPeople = useMemo(
    () => people.filter((person) => connected[person.id]),
    [people, connected]
  );

  const suggestedPeople = useMemo(
    () =>
      people.filter(
        (person) =>
          !connected[person.id] &&
          !pendingIds.includes(person.id) &&
          !ignoredIds.includes(person.id)
      ),
    [people, connected, pendingIds, ignoredIds]
  );

  // Filter suggested list for Tab 1 (Network)
  const filteredSuggested = useMemo(() => {
    return suggestedPeople.filter((p) => {
      // 1. Search Match
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Role Filter Match
      let matchesRole = true;
      if (roleFilter !== "all") {
        if (role === "developer") {
          // Developer portal: filter by "developers" or "founders"
          matchesRole =
            (roleFilter === "developers" && p.type === "Developer") ||
            (roleFilter === "founders" && p.type === "Founder");
        } else {
          // Founder portal: filter by developer roles/skills (ai, backend, frontend, etc.)
          matchesRole =
            p.role.toLowerCase().includes(roleFilter.toLowerCase()) ||
            p.skills.some((s) => s.toLowerCase().includes(roleFilter.toLowerCase()));
        }
      }

      return matchesSearch && matchesRole;
    });
  }, [suggestedPeople, searchQuery, roleFilter, role]);

  // Filter connected list for Tab 3 (Connections)
  const filteredConnections = useMemo(() => {
    return connectedPeople.filter((p) => {
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [connectedPeople, searchQuery]);

  const requireProfileBeforeAction = (afterComplete?: () => void) => {
    if (profileComplete || !onRequireProfile) return false;
    onRequireProfile(afterComplete);
    return true;
  };

  const handleAcceptRequest = (id: string) => {
    if (requireProfileBeforeAction(() => handleAcceptRequest(id))) return;
    const connectionId = connectionIdByUser[id];
    if (!connectionId) return;
    setActionError("");
    void connectionApi.respond(connectionId, "accepted").then(refreshConnections).catch((error) => setActionError(getApiErrorMessage(error)));
  };

  const handleIgnoreRequest = (id: string) => {
    const connectionId = connectionIdByUser[id];
    if (!connectionId) return;
    setActionError("");
    void connectionApi.respond(connectionId, "ignored").then(refreshConnections).catch((error) => setActionError(getApiErrorMessage(error)));
  };

  const handleDismissSuggestion = (id: string) => {
    setNetworkState((prev) => ({
      ...prev,
      ignoredIds: [...prev.ignoredIds, id],
    }));
  };

  const handleConnectionButton = (person: FounderContactProfile) => {
    if (requireProfileBeforeAction(() => handleConnectionButton(person))) return;
    const isCurrentlyConnected = connected[person.id];
    const isCurrentlyRequested = outgoingSet.has(person.id);

    if (isCurrentlyConnected) {
      const connectionId = connectionIdByUser[person.id];
      if (connectionId) void connectionApi.remove(connectionId).then(refreshConnections).catch((error) => setActionError(getApiErrorMessage(error)));
    } else if (isCurrentlyRequested) {
      const connectionId = connectionIdByUser[person.id];
      if (connectionId) void connectionApi.remove(connectionId).then(refreshConnections).catch((error) => setActionError(getApiErrorMessage(error)));
    } else {
      setRequestModalPerson(person);
    }
  };

  const openInbox = (
    person: FounderContactProfile,
    conversation: Conversation,
    initialNote?: string
  ) => {
    const target = {
      id: conversation.id,
      conversationId: conversation.id,
      participantId: person.id,
      name: person.name,
      role: person.role,
      personType: person.type,
      initials: person.initials,
      match: person.match,
      online: person.online,
      email: person.email,
      avatarUrl: person.avatarUrl,
      requestStatus: conversation.status === "declined" ? "rejected" : conversation.status,
      requestDirection: conversation.status === "pending" ? (pendingIds.includes(person.id) ? "incoming" : "outgoing") : undefined,
      initialMessage: initialNote,
    } satisfies NetworkMessageTarget;
    onMessage?.(target);
  };

  const openOrStartConversation = async (
    person: FounderContactProfile,
    initialNote?: string,
    redirectToInbox = true
  ) => {
    try {
      setActionError("");
      const result = await messagingApi.start(person.id, initialNote);
      await refreshConnections();
      if (redirectToInbox) openInbox(person, result.conversation, initialNote);
      return result.conversation;
    } catch (error) {
      setActionError(getApiErrorMessage(error));
      return null;
    }
  };

  const handleMessage = (person: FounderContactProfile) => {
    if (requireProfileBeforeAction(() => handleMessage(person))) return;
    void openOrStartConversation(person);
  };

  const handleSendRequestWithoutNote = () => {
    if (!requestModalPerson) return;
    const person = requestModalPerson;
    if (requireProfileBeforeAction()) {
      setRequestModalPerson(null);
      return;
    }
    void openOrStartConversation(person, undefined, false).then((conversation) => {
      if (conversation) setRequestModalPerson(null);
    });
  };

  const handleSendRequestWithNote = (note: string) => {
    if (!requestModalPerson) return;
    const person = requestModalPerson;
    if (requireProfileBeforeAction()) {
      setRequestModalPerson(null);
      return;
    }
    void openOrStartConversation(person, note, true).then((conversation) => {
      if (conversation) setRequestModalPerson(null);
    });
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    selectedPerson,
    setSelectedPerson,
    requestModalPerson,
    setRequestModalPerson,
    actionError,
    clearActionError: () => setActionError(""),
    connected,
    pendingIds,
    outgoingSet,
    pendingPeople,
    connectedPeople,
    filteredSuggested,
    filteredConnections,
    loadError,
    retryLoadPeople: loadPeople,
    handleAcceptRequest,
    handleIgnoreRequest,
    handleDismissSuggestion,
    handleConnectionButton,
    handleMessage,
    handleSendRequestWithoutNote,
    handleSendRequestWithNote,
  };
}
