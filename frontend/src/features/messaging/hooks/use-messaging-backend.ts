"use client";

import { useEffect, useRef, useState } from "react";
import type { Contact, Message } from "@/features/messaging/types/shared-inbox-types";
import {
  acceptMessageRequest,
  connectMessagingSocket,
  declineMessageRequest,
  fetchMessagingState,
  findMessagingContactByEmail,
  markConversationRead,
  sendSocketMessage,
} from "@/features/messaging/services/messaging-client";

export function useMessagingBackend() {
  const socketRef = useRef<WebSocket | null>(null);
  const contactsRef = useRef<Contact[]>([]);
  const [contacts, setContactsState] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [error, setError] = useState("");

  const setContacts = (updater: Contact[] | ((current: Contact[]) => Contact[])) => {
    setContactsState((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      contactsRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;

    fetchMessagingState()
      .then((state) => {
        if (!mounted) return;
        setContacts(state.contacts);
        setMessages(state.messages);
      })
      .catch((loadError) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Messages could not be loaded.");
        }
      });

    socketRef.current = connectMessagingSocket({
      onMessage: (message, backendMessage) => {
        const otherUserId =
          message.from === "me" ? backendMessage.recipient_id : backendMessage.sender_id;
        const conversationId = backendMessage.conversation_id;

        setMessages((current) => {
          const tempContact = contactsRef.current.find(
            (contact) => contact.id !== conversationId && contact.recipientId === otherUserId
          );
          const tempMessages = tempContact ? current[tempContact.id] ?? [] : [];
          const next = { ...current };
          if (tempContact) delete next[tempContact.id];
          next[conversationId] = [...tempMessages, ...(next[conversationId] ?? []), message];
          return next;
        });

        setContacts((current) => {
          const existing = current.find((contact) => contact.id === conversationId);
          const temp = current.find(
            (contact) => contact.id !== conversationId && contact.recipientId === otherUserId
          );
          const base = existing ?? temp;

          if (!base) return current;

          const nextContact: Contact = {
            ...base,
            id: conversationId,
            recipientId: otherUserId,
            lastMsg: message.text,
            lastTime: "Now",
            requestStatus: base.requestStatus ?? "pending",
            requestDirection: base.requestDirection ?? (message.from === "me" ? "outgoing" : "incoming"),
            unread: message.from === "me" ? base.unread : base.unread + 1,
          };

          return [nextContact, ...current.filter((contact) => contact.id !== base.id && contact.id !== conversationId)];
        });
      },
      onError: setError,
    });

    return () => {
      mounted = false;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (contact: Contact, body: string) => {
    const recipientId = contact.recipientId ?? contact.id;
    sendSocketMessage(socketRef.current, recipientId, body);
  };

  const acceptRequest = async (conversationId: string) => {
    await acceptMessageRequest(conversationId);
    setContacts((current) =>
      current.map((contact) =>
        contact.id === conversationId
          ? { ...contact, requestStatus: "accepted", requestDirection: undefined }
          : contact
      )
    );
  };

  const declineRequest = async (conversationId: string) => {
    await declineMessageRequest(conversationId);
    setContacts((current) =>
      current.map((contact) =>
        contact.id === conversationId ? { ...contact, requestStatus: "rejected" } : contact
      )
    );
  };

  const markRead = async (conversationId: string) => {
    await markConversationRead(conversationId);
    setContacts((current) =>
      current.map((contact) => (contact.id === conversationId ? { ...contact, unread: 0 } : contact))
    );
  };

  const findContactByEmail = (email: string) => findMessagingContactByEmail(email);

  return {
    contacts,
    setContacts,
    messages,
    setMessages,
    error,
    setError,
    sendMessage,
    acceptRequest,
    declineRequest,
    markRead,
    findContactByEmail,
  };
}
