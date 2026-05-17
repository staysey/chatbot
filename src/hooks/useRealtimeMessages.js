import { useEffect } from "react";

import { fetchMessages } from "../lib/api";
import { subscribePostgresChanges } from "../lib/realtime";

export function useRealtimeMessages({ token, userId, chatId, onMessages }) {
  useEffect(() => {
    if (!userId || !token || !chatId) return;

    const headers = { Authorization: `Bearer ${token}` };

    return subscribePostgresChanges({
      accessToken: token,
      channelName: `messages:${userId}:${chatId}`,
      table: "messages",
      filter: `chat_id=eq.${chatId}`,
      onChange: () => {
        fetchMessages(headers, chatId)
          .then((data) => onMessages(data))
          .catch((err) =>
            console.error("Realtime messages refetch failed:", err),
          );
      },
    });
  }, [userId, token, chatId, onMessages]);
}
