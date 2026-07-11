"use client";

import { useEffect, useMemo, useState } from "react";
import type { FounderContactProfile, NetworkMessageTarget } from "@/features/network/types";
import {
  connectionApi,
  loadNetworkConnections,
  loadNetworkPeople,
} from "@/features/network/lib/network-api";
import {
  getInitialNetworkState as getInitialDevState,
  saveStoredState as saveDevState,
} from "@/features/network/lib/developer-network-storage";
import {
  getInitialNetworkState as getInitialFounderState,
  saveStoredState as saveFounderState,
} from "@/features/network/lib/founder-network-storage";
import type { StoredNetworkState } from "@/features/network/types";

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
  const [connectionIdByUser, setConnectionIdByUser] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    void loadNetworkPeople()
      .then((items) => { if (active) setPeople(items); })
      .catch(() => { if (active) setPeople([]); });
    return () => { active = false; };
  }, []);

  const storageLoad = useMemo(() => {
    return role === "developer" ? getInitialDevState : getInitialFounderState;
  }, [role]);

  const storageSave = useMemo(() => {
    return role === "developer" ? saveDevState : saveFounderState;
  }, [role]);

  const [activeTab, setActiveTab] = useState<"network" | "requests" | "connections">("network");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [networkState, setNetworkState] = useState<StoredNetworkState>(storageLoad);
  const [selectedPerson, setSelectedPerson] = useState<FounderContactProfile | null>(null);
  const [requestModalPerson, setRequestModalPerson] = useState<FounderContactProfile | null>(null);

  const { connected, pendingIds, ignoredIds, outgoingIds, requestNotes } = networkState;
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

  // Save stored state on changes
  useEffect(() => {
    storageSave(networkState);
  }, [networkState, storageSave]);

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
    void connectionApi.respond(connectionId, "accepted").then(refreshConnections);
  };

  const handleIgnoreRequest = (id: string) => {
    const connectionId = connectionIdByUser[id];
    if (!connectionId) return;
    void connectionApi.respond(connectionId, "ignored").then(refreshConnections);
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
      if (connectionId) void connectionApi.remove(connectionId).then(refreshConnections);
    } else if (isCurrentlyRequested) {
      setNetworkState((prev) => ({
        ...prev,
        outgoingIds: prev.outgoingIds.filter((oid) => oid !== person.id),
      }));
    } else {
      setRequestModalPerson(person);
    }
  };

  const markOutgoingRequest = (person: FounderContactProfile, note?: string) => {
    void connectionApi.send(person.id, note).then(refreshConnections);
  };

  const openInbox = (person: FounderContactProfile, initialNote?: string) => {
    const target = {
      id: person.id,
      name: person.name,
      role: person.role,
      personType: person.type,
      initials: person.initials,
      match: person.match,
      online: person.online,
      initialMessage: initialNote,
    };
    onMessage?.(target);
  };

  const handleMessage = (person: FounderContactProfile) => {
    if (requireProfileBeforeAction(() => handleMessage(person))) return;
    const isCurrentlyRequested = outgoingSet.has(person.id);
    if (isCurrentlyRequested) {
      markOutgoingRequest(person);
      openInbox(person, requestNotes[person.id]);
      return;
    }
    openInbox(person);
  };

  const handleSendRequestWithoutNote = () => {
    if (!requestModalPerson) return;
    markOutgoingRequest(requestModalPerson);
    setRequestModalPerson(null);
  };

  const handleSendRequestWithNote = (note: string) => {
    if (!requestModalPerson) return;
    markOutgoingRequest(requestModalPerson, note);
    openInbox(requestModalPerson, note);
    setRequestModalPerson(null);
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
    connected,
    pendingIds,
    outgoingSet,
    pendingPeople,
    connectedPeople,
    filteredSuggested,
    filteredConnections,
    handleAcceptRequest,
    handleIgnoreRequest,
    handleDismissSuggestion,
    handleConnectionButton,
    handleMessage,
    handleSendRequestWithoutNote,
    handleSendRequestWithNote,
  };
}
