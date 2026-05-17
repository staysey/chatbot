import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";
import { fetchMessages } from "../lib/api";
import { revokeAllMessagePreviews } from "../lib/messagePreviews.js";
import {
  GUEST_SESSION_KEYS,
  getGuestMessages,
  setGuestMessages,
} from "../lib/guestSession.js";
import { useRealtimeMessages } from "./useRealtimeMessages";

// Messages helpers/logic for both guest and signed-in users
// Signed-in messages are loaded from API / guest messages are loaded from localStorage
function useMessages(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const replaceMessages = useCallback((next) => {
    setMessages((prev) => {
      revokeAllMessagePreviews(prev);
      return next;
    });
  }, []);

  const updateMessages = useCallback((updater) => {
    setMessages(updater);
  }, []);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastUserMessage = useCallback((patch) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next.at(-1);
      if (last?.sender === "user") {
        next[next.length - 1] = { ...last, ...patch };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    return () => revokeAllMessagePreviews(messagesRef.current);
  }, []);

  return {
    messages,
    replaceMessages,
    updateMessages,
    appendMessage,
    updateLastUserMessage,
  };
}

// Guest mode: persist appends to localStorage; sync when another tab changes storage
function useGuestMessages(enabled, api) {
  const { replaceMessages, updateMessages, updateLastUserMessage } = api;

  const appendMessage = useCallback(
    (message) => {
      if (!enabled) return;
      updateMessages((prev) => {
        const next = [...prev, message];
        setGuestMessages(next);
        return next;
      });
    },
    [enabled, updateMessages],
  );

  useEffect(() => {
    if (!enabled) return;
    replaceMessages(getGuestMessages());
  }, [enabled, replaceMessages]);

  useEffect(() => {
    if (!enabled) return;

    const onStorage = (e) => {
      if (e.key !== GUEST_SESSION_KEYS.messages) return;
      replaceMessages(getGuestMessages());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [enabled, replaceMessages]);

  return { appendMessage, updateLastUserMessage };
}

// Signed-in: load from API, keep in sync via realtime subscription
function useSignedInMessages(enabled, chatId, auth, api, setLoading) {
  const { apiAuthHeaders, token, userId } = auth;
  const { replaceMessages, appendMessage, updateLastUserMessage } = api;

  useRealtimeMessages({
    token: enabled ? token : null,
    userId: enabled ? userId : null,
    chatId: enabled ? chatId : null,
    onMessages: replaceMessages,
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    if (!chatId || !token) {
      replaceMessages([]);
      setLoading(true);
      return;
    }

    setLoading(true);

    (async () => {
      try {
        const list = await fetchMessages(apiAuthHeaders, chatId);
        if (!cancelled) {
          replaceMessages(list);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, token, chatId, apiAuthHeaders, replaceMessages, setLoading]);

  return { appendMessage, updateLastUserMessage };
}

// Pick guest (localStorage) or signed-in (API + realtime) message source for a chat
export function useMessageList(chatId, isGuest) {
  const { apiAuthHeaders, session, user } = useAuth();
  const token = session?.access_token;

  const api = useMessages(isGuest ? getGuestMessages() : []);
  const [loadingMessages, setLoading] = useState(!isGuest);

  const guest = useGuestMessages(isGuest, api);
  const signed = useSignedInMessages(
    !isGuest,
    chatId,
    { apiAuthHeaders, token, userId: user?.id },
    api,
    setLoading,
  );

  const { appendMessage, updateLastUserMessage } = isGuest ? guest : signed;

  return {
    messages: api.messages,
    appendMessage,
    updateLastUserMessage,
    loadingMessages: isGuest ? false : loadingMessages,
    headers: apiAuthHeaders,
    token,
    chatId,
  };
}
