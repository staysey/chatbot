import { useEffect, useState } from "react";

import { GUEST_QUESTION_LIMIT } from "../constants/guest";
import {
  applyTurnFailure,
  applyTurnSuccess,
  buildTurnInput,
  getGuestLimitError,
  runChatTurn,
} from "../lib/chatTurn.js";
import { revokeAttachmentPreviews } from "../lib/messagePreviews.js";
import {
  GUEST_SESSION_KEYS,
  getGuestQuestionsUsed,
  incrementGuestQuestionsUsed,
} from "../lib/guestSession";
import { useMessageList } from "./useMessageList";

export function useChatMessaging(chatId, isGuest = false) {
  const {
    messages,
    appendMessage,
    updateLastUserMessage,
    loadingMessages,
    headers,
    token,
    chatId: activeChatId,
  } = useMessageList(chatId, isGuest);

  const [guestQuestionsUsed, setGuestQuestionsUsed] = useState(() =>
    isGuest ? getGuestQuestionsUsed() : 0,
  );
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);

  useEffect(() => {
    if (!isGuest) return;

    const onStorage = (e) => {
      if (e.key !== GUEST_SESSION_KEYS.questionsUsed) return;
      setGuestQuestionsUsed(getGuestQuestionsUsed());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isGuest]);

  const guestQuestionsLeft = Math.max(
    0,
    GUEST_QUESTION_LIMIT - guestQuestionsUsed,
  );

  const sendMessage = async (text, pickedFiles = []) => {
    setChatError(null);
    setIsSending(true);

    const limitError = getGuestLimitError(
      isGuest,
      guestQuestionsUsed,
      GUEST_QUESTION_LIMIT,
    );
    if (limitError) {
      setChatError(limitError);
      setIsSending(false);
      return;
    }

    const { message, files, localAttachments, userMessage } =
      buildTurnInput(text, pickedFiles);
    const signedIn = Boolean(!isGuest && token && activeChatId);

    appendMessage(userMessage);

    try {
      const result = await runChatTurn({
        signedIn,
        headers,
        chatId: activeChatId,
        message,
        files,
        localAttachments,
      });

      if (!result.ok) {
        applyTurnFailure(localAttachments, setChatError, result.error);
        return;
      }

      applyTurnSuccess(result, {
        signedIn,
        updateLastUserMessage,
        appendMessage,
      });

      if (isGuest) {
        setGuestQuestionsUsed(incrementGuestQuestionsUsed());
      }
    } catch (error) {
      revokeAttachmentPreviews(localAttachments);
      console.error("Error getting response:", error);
      setChatError(error.response?.data?.error || "Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isSending,
    sendMessage,
    loadingMessages,
    chatError,
    guestQuestionsLeft: isGuest ? guestQuestionsLeft : null,
  };
}
