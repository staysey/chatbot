import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";
import {
  createChat,
  deleteChat as deleteChatApi,
  fetchChats,
} from "../lib/api";
import { useRealtimeChats } from "./useRealtimeChats";

function resolveSelectedId(currentId, chats) {
  if (currentId && chats.some((c) => c.id === currentId)) return currentId;
  return chats[0]?.id ?? null;
}

// Only for signed-in users: manages chat list, selection, and realtime updates
export function useChats({ enabled }) {
  const { apiAuthHeaders, authReady, user, session } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const currentChatId = useMemo(
    () => resolveSelectedId(selectedChatId, chats),
    [selectedChatId, chats],
  );

  const headers = apiAuthHeaders;
  const token = session?.access_token;

  const handleRealtimeChats = useCallback((data) => {
    setChats(data);
  }, []);

  useRealtimeChats({
    authReady: enabled && authReady,
    userId: user?.id,
    token,
    onChats: handleRealtimeChats,
  });

  useEffect(() => {
    if (!enabled || !authReady || !user || !token) return;

    let cancelled = false;

    (async () => {
      try {
        const list = await fetchChats(headers);
        if (cancelled) return;

        if (list.length > 0) {
          setChats(list);
          return;
        }

        const created = await createChat(headers);
        if (!cancelled && created?.id) {
          setChats([created]);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, authReady, user, token, headers]);

  const selectChat = useCallback((id) => {
    setSelectedChatId(id);
  }, []);

  const startNewChat = useCallback(async () => {
    if (!enabled) return;
    const created = await createChat(headers);
    if (!created?.id) return;
    setChats((prev) => [created, ...prev]);
    setSelectedChatId(created.id);
  }, [enabled, headers]);

  const deleteChat = useCallback(
    async (chatId) => {
      if (!enabled) return;
      await deleteChatApi(headers, chatId);

      let remaining = [];
      setChats((prev) => {
        remaining = prev.filter((c) => c.id !== chatId);
        return remaining;
      });

      if (remaining.length === 0) {
        try {
          const created = await createChat(headers);
          if (created?.id) {
            setChats([created]);
            setSelectedChatId(created.id);
          } else {
            setSelectedChatId(null);
          }
        } catch (e) {
          console.error(e);
          setSelectedChatId(null);
        }
        return;
      }
    },
    [enabled, headers],
  );

  return {
    chats,
    currentChatId,
    selectChat,
    startNewChat,
    deleteChat,
  };
}
