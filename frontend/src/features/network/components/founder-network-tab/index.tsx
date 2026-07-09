"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MagnifyingGlass, Funnel, Users, UserPlus, AddressBook } from "@phosphor-icons/react";
import { NetworkProfileDetailScreen } from "@/features/network/components/network-profile-detail";
import type { NetworkTabProps } from "@/features/network/types/founder-network-types";
import { ConnectionRequestModal } from "../connection-request-modal";
import { PendingRequestsPanel } from "../pending-requests-panel";
import { NetworkPersonCard } from "../network-person-card";
import { useNetwork } from "@/features/network/lib/use-network";

export function NetworkTab({
  onMessage,
  onPendingCountChange,
  profileComplete = true,
  onRequireProfile,
}: NetworkTabProps) {
  const {
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
  } = useNetwork({
    role: "founder",
    onMessage,
    onPendingCountChange,
    profileComplete,
    onRequireProfile,
  });

  if (selectedPerson) {
    const selectedRequested = outgoingSet.has(selectedPerson.id);
    return (
      <>
        <div className="h-screen overflow-hidden">
          <NetworkProfileDetailScreen
            key={selectedPerson.id}
            profile={selectedPerson}
            connected={Boolean(connected[selectedPerson.id])}
            pending={pendingIds.includes(selectedPerson.id)}
            backLabel="Back to Network"
            onBack={() => setSelectedPerson(null)}
            onAccept={handleAcceptRequest}
            onIgnore={handleIgnoreRequest}
            onToggleConnection={() => handleConnectionButton(selectedPerson)}
            onMessage={handleMessage}
            connectionLabel={selectedRequested ? "Requested" : undefined}
            connectionDisabled={selectedRequested}
          />
        </div>
        <AnimatePresence>
          {requestModalPerson && (
            <ConnectionRequestModal
              person={requestModalPerson}
              onClose={() => setRequestModalPerson(null)}
              onWithoutNote={handleSendRequestWithoutNote}
              onWithNote={handleSendRequestWithNote}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen flex-col overflow-y-auto bg-[#f5f6f4] py-6 px-[28px]">
        {/* Horizontal Navigation Tab Bar */}
        <div className="mb-6 flex border-b border-[#e0e9e3] pb-px">
          <div className="flex gap-6">
            {/* Tab 1: Discover Network */}
            <button
              onClick={() => {
                setActiveTab("network");
                setSearchQuery("");
              }}
              className={`flex items-center gap-1.5 pb-3 text-[14px] font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === "network"
                  ? "border-[#2e7d5c] text-[#1a2e26]"
                  : "border-transparent text-[#7a9e8e] hover:text-[#1a2e26]"
              }`}
            >
              <Users size={16} />
              Network
            </button>

            {/* Tab 2: Requests */}
            <button
              onClick={() => {
                setActiveTab("requests");
              }}
              className={`flex items-center gap-1.5 pb-3 text-[14px] font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === "requests"
                  ? "border-[#2e7d5c] text-[#1a2e26]"
                  : "border-transparent text-[#7a9e8e] hover:text-[#1a2e26]"
              }`}
            >
              <UserPlus size={16} />
              Requests
              {pendingPeople.length > 0 && (
                <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-[#2e7d5c] text-white">
                  {pendingPeople.length}
                </span>
              )}
            </button>

            {/* Tab 3: Connections */}
            <button
              onClick={() => {
                setActiveTab("connections");
                setSearchQuery("");
              }}
              className={`flex items-center gap-1.5 pb-3 text-[14px] font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === "connections"
                  ? "border-[#2e7d5c] text-[#1a2e26]"
                  : "border-transparent text-[#7a9e8e] hover:text-[#1a2e26]"
              }`}
            >
              <AddressBook size={16} />
              Connections
              {connectedPeople.length > 0 && (
                <span className="rounded-full bg-[#e8f5ef] px-1.5 py-0.5 text-[10px] font-bold text-[#2e7d5c] border border-[#c5ddd0]">
                  {connectedPeople.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Directory Search View */}
        {activeTab === "network" && (
          <div className="flex flex-col gap-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between border border-[#e8ede9]">
              {/* Search input */}
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={16}
                  className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#7a9e8e]"
                />
                <input
                  type="text"
                  placeholder="Search developers by name, role, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-[#f5f7f5] py-2.5 pl-10 pr-4 text-[13px] text-[#1a2e26] outline-none border border-transparent focus:border-[#c5ddd0] focus:bg-white transition-all placeholder:text-[#a0c0b0]"
                />
              </div>

              {/* Role Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#7a9e8e] uppercase tracking-wide">
                  <Funnel size={13} /> Role
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-[#dde5e0] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#1a2e26] outline-none cursor-pointer hover:bg-[#f5f7f5] transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="ai">AI Engineers</option>
                  <option value="backend">Backend Developers</option>
                  <option value="frontend">Frontend Developers</option>
                  <option value="full stack">Full Stack Developers</option>
                  <option value="blockchain">Blockchain Developers</option>
                </select>
              </div>
            </div>

            {/* Grid of suggested matches */}
            {filteredSuggested.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredSuggested.map((person) => (
                    <NetworkPersonCard
                      key={person.id}
                      person={person}
                      isConnected={false}
                      isRequested={outgoingSet.has(person.id)}
                      onSelect={() => setSelectedPerson(person)}
                      onConnect={() => handleConnectionButton(person)}
                      onMessage={() => handleMessage(person)}
                      onIgnore={() => handleDismissSuggestion(person.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 px-6 text-center border border-[#e8ede9]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f7f5] text-[#7a9e8e]">
                  <Users size={22} />
                </div>
                <h3 className="text-[14px] font-bold text-[#1a2e26]">No results found</h3>
                <p className="mt-1 max-w-sm text-[11px] text-[#6b8e7e] leading-relaxed">
                  We couldn't find any developers matching "{searchQuery}" and the active filters. Try refining your keywords.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Requests View */}
        {activeTab === "requests" && (
          <div className="w-full">
            <PendingRequestsPanel
              pendingPeople={pendingPeople}
              onSelectPerson={setSelectedPerson}
              onAccept={handleAcceptRequest}
              onIgnore={handleIgnoreRequest}
            />
          </div>
        )}

        {/* Tab 3: Connections View */}
        {activeTab === "connections" && (
          <div className="flex flex-col gap-4">
            {/* Connection Search Bar */}
            <div className="rounded-2xl bg-white p-4 border border-[#e8ede9]">
              <div className="relative w-full">
                <MagnifyingGlass
                  size={16}
                  className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#7a9e8e]"
                />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-[#f5f7f5] py-2.5 pl-10 pr-4 text-[13px] text-[#1a2e26] outline-none border border-transparent focus:border-[#c5ddd0] focus:bg-white transition-all placeholder:text-[#a0c0b0]"
                />
              </div>
            </div>

            {/* Connections Grid */}
            {filteredConnections.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredConnections.map((person) => (
                    <NetworkPersonCard
                      key={person.id}
                      person={person}
                      isConnected={true}
                      isRequested={false}
                      onSelect={() => setSelectedPerson(person)}
                      onConnect={() => handleConnectionButton(person)}
                      onMessage={() => handleMessage(person)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 px-6 text-center border border-[#e8ede9]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f7f5] text-[#7a9e8e]">
                  <AddressBook size={22} />
                </div>
                <h3 className="text-[14px] font-bold text-[#1a2e26]">
                  {searchQuery ? "No connections match your query" : "No connections yet"}
                </h3>
                <p className="mt-1 max-w-sm text-[11px] text-[#6b8e7e] leading-relaxed">
                  {searchQuery
                    ? "Verify the spelling of the name or connection keywords."
                    : "Head back to the Network tab to search and connect with developers."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        {requestModalPerson && (
          <ConnectionRequestModal
            person={requestModalPerson}
            onClose={() => setRequestModalPerson(null)}
            onWithoutNote={handleSendRequestWithoutNote}
            onWithNote={handleSendRequestWithNote}
          />
        )}
      </AnimatePresence>
    </>
  );
}
