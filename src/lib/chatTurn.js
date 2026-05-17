import { GUEST_CHAT_ID } from "../constants/guest.js";
import { postAiChat, saveMessage } from "./api.js";
import { getMockAiResponse } from "./mockResponse.js";
import {
  createLocalAttachments,
  revokeAttachmentPreviews,
} from "./messagePreviews.js";

export const GUEST_LIMIT_MESSAGE =
  "You used all 3 free questions. Sign in to save chats and ask more.";

export function getGuestLimitError(isGuest, questionsUsed, limit) {
  if (isGuest && questionsUsed >= limit) return GUEST_LIMIT_MESSAGE;
  return null;
}

export function buildTurnInput(text, pickedFiles) {
  const message = text.trim();
  const files = Array.isArray(pickedFiles) ? pickedFiles : [];
  const localAttachments = createLocalAttachments(files);

  return {
    message,
    files,
    localAttachments,
    userMessage: {
      text: message,
      sender: "user",
      attachments: localAttachments,
    },
  };
}

export async function runChatTurn({
  signedIn,
  headers,
  chatId,
  message,
  files,
  localAttachments,
  useMockResponse = false,
}) {
  let savedUserMessage = null;

  if (signedIn) {
    savedUserMessage = await saveMessage(headers, {
      chat_id: chatId,
      sender: "user",
      content: message,
      files,
    });
  }

  const ai = useMockResponse
    ? await getMockAiResponse()
    : await postAiChat(
        headers,
        signedIn ? chatId : GUEST_CHAT_ID,
        message,
        files,
      );

  if (ai?.isError) {
    return {
      ok: false,
      error: ai.error || "Something went wrong",
      revoke: localAttachments,
    };
  }

  let botMessage = {
    text: ai.botMessage,
    sender: "bot",
    attachments: [],
  };

  if (signedIn) {
    botMessage = await saveMessage(headers, {
      chat_id: chatId,
      sender: "bot",
      content: ai.botMessage,
    });
  }

  return {
    ok: true,
    savedUserMessage,
    botMessage,
    revoke: signedIn ? localAttachments : null,
  };
}

export function applyTurnFailure(localAttachments, setError, message) {
  revokeAttachmentPreviews(localAttachments);
  setError(message);
}

export function applyTurnSuccess(
  result,
  { signedIn, updateLastUserMessage, appendMessage },
) {
  if (result.revoke) revokeAttachmentPreviews(result.revoke);
  if (signedIn && result.savedUserMessage) {
    updateLastUserMessage(result.savedUserMessage);
  }
  appendMessage(result.botMessage);
}
