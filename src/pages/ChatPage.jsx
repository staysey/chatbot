import { useNavigate } from "react-router-dom";

import ChatShell from "../components/ChatShell.jsx";
import { GUEST_CHAT, GUEST_CHAT_ID } from "../constants/guest";
import { useAuth } from "../context/AuthContext.jsx";
import { useChats } from "../hooks/useChats";
import { useGuestMode } from "../hooks/useGuestMode";
import { ROUTES } from "../routes.js";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { isGuest } = useGuestMode();
  const navigate = useNavigate();

  const signedIn = Boolean(user);
  const { chats, currentChatId, selectChat, startNewChat, deleteChat } = useChats({
    enabled: signedIn,
  });

  const handleSignOut = async () => {
    await logout();
    navigate(ROUTES.login);
  };

  const sidebarChats = isGuest ? [GUEST_CHAT] : chats;
  const activeChatId = isGuest ? GUEST_CHAT_ID : currentChatId;

  return (
    <ChatShell
      isGuest={isGuest}
      chats={sidebarChats}
      currentChatId={activeChatId}
      onSelectChat={selectChat}
      onStartChat={startNewChat}
      onDeleteChat={signedIn ? deleteChat : undefined}
      canAddChat={!isGuest}
      onSignOut={signedIn ? handleSignOut : undefined}
    />
  );
}
