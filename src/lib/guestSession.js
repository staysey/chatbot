import { GUEST_QUESTION_LIMIT } from "../constants/guest";

export const GUEST_SESSION_KEYS = {
  mode: "chatbot_guest_mode",
  questionsUsed: "chatbot_guest_questions_used",
  messages: "chatbot_guest_messages",
};

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  localStorage.setItem(key, value);
}

function remove(key) {
  localStorage.removeItem(key);
}

export function isGuestMode() {
  // 1 === true
  return read(GUEST_SESSION_KEYS.mode) === "1";
}

export function setGuestMode(active) {
  if (active) {
    write(GUEST_SESSION_KEYS.mode, "1");
  } else {
    remove(GUEST_SESSION_KEYS.mode);
  }
}

export function getGuestQuestionsUsed() {
  const raw = read(GUEST_SESSION_KEYS.questionsUsed);
  const n = Number.parseInt(raw ?? "0", 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function setGuestQuestionsUsed(count) {
  write(GUEST_SESSION_KEYS.questionsUsed, String(Math.max(0, count)));
}

export function incrementGuestQuestionsUsed() {
  const next = Math.min(getGuestQuestionsUsed() + 1, GUEST_QUESTION_LIMIT);
  setGuestQuestionsUsed(next);
  return next;
}

export function serializeGuestMessages(messages) {
  return (messages ?? []).map((message) => ({
    text: message.text ?? "",
    sender: message.sender,
    attachments: (message.attachments ?? []).map((attachment) => ({
      name: attachment.name ?? "",
    })),
  }));
}

export function getGuestMessages() {
  const raw = read(GUEST_SESSION_KEYS.messages);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setGuestMessages(messages) {
  write(
    GUEST_SESSION_KEYS.messages,
    JSON.stringify(serializeGuestMessages(messages)),
  );
}

export function clearGuestSession() {
  for (const key of Object.values(GUEST_SESSION_KEYS)) {
    remove(key);
  }
}
