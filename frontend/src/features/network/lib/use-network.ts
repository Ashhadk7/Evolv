"use client";

import { useEffect, useMemo, useState } from "react";
import type { FounderContactProfile } from "@/features/network/types";
import { NETWORK_PEOPLE as DEV_PEOPLE } from "@/features/network/lib/developer-network-constants";
import { NETWORK_PEOPLE as FOUNDER_PEOPLE } from "@/features/network/lib/founder-network-constants";
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
  onMessage?: (contact: any, initialNote?: string) => void;
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
  const people = useMemo(() => {
    return role === "developer" ? DEV_PEOPLE : FOUNDER_PEOPLE;
  }, [role]);

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
    setNetworkState((prev) => ({
      ...prev,
      connected: { ...prev.connected, [id]: true },
      pendingIds: prev.pendingIds.filter((pendingId) => pendingId !== id),
      ignoredIds: prev.ignoredIds.filter((ignoredId) => ignoredId !== id),
      outgoingIds: prev.outgoingIds.filter((outgoingId) => outgoingId !== id),
    }));
  };

  const handleIgnoreRequest = (id: string) => {
    setNetworkState((prev) => ({
      ...prev,
      pendingIds: prev.pendingIds.filter((pendingId) => pendingId !== id),
      ignoredIds: [...prev.ignoredIds, id],
    }));
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
      setNetworkState((prev) => ({
        ...prev,
        connected: { ...prev.connected, [person.id]: false },
      }));
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
    setNetworkState((prev) => ({
      ...prev,
      outgoingIds: [...prev.outgoingIds, person.id],
      requestNotes: { ...prev.requestNotes, [person.id]: note ?? "" },
    }));
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
