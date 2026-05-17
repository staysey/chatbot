import Chat from "./Chat.jsx";
import ChatSidebar from "./Sidebar.jsx";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function ChatShell({
  isGuest,
  chats,
  currentChatId,
  onSelectChat,
  onStartChat,
  canAddChat,
  onDeleteChat,
  onSignOut,
}) {
  return (
    <div className="flex h-[80vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-lg">
      <SidebarProvider className="flex min-h-0 h-full w-full">
        <ChatSidebar
          chats={chats}
          onStartChat={onStartChat}
          currentChatId={currentChatId}
          onSelectChat={onSelectChat}
          canAddChat={canAddChat}
          onDeleteChat={onDeleteChat}
          onSignOut={onSignOut}
        />
        <SidebarInset className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-2 border-b p-2 md:hidden">
            <SidebarTrigger />
            <span className="text-sm font-medium">Chats</span>
          </div>
          <Chat
            key={currentChatId ?? "none"}
            chatId={isGuest ? null : currentChatId}
            isGuest={isGuest}
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
