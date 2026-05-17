import { useEffect } from "react";

import { fetchChats } from "../lib/api";
import { subscribePostgresChanges } from "../lib/realtime";

export function useRealtimeChats({ authReady, userId, token, onChats }) {
  useEffect(() => {
    if (!authReady || !userId || !token) return;

    const headers = { Authorization: `Bearer ${token}` };

    return subscribePostgresChanges({
      accessToken: token,
      channelName: `chats:${userId}`,
      table: "chats",
      onChange: () => {
        fetchChats(headers)
          .then((data) => onChats(data))
          .catch((err) => console.error("Realtime chats refetch failed:", err));
      },
    });
  }, [authReady, userId, token, onChats]);
}
