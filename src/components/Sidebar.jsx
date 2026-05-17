import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

function ChatList({
  chats,
  currentChatId,
  onSelectChat,
  onStartChat,
  onPick,
  canAddChat,
  onDeleteChat,
  onSignOut,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
        <span className="text-lg font-medium">Chats</span>
        <Button
          type="button"
          size="sm"
          onClick={onStartChat}
          disabled={!canAddChat}
        >
          New Chat
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1 px-2 py-2">
        <div className="flex flex-col gap-2">
          {chats.map((item) => (
            <div key={item.id} className="relative">
              <button
                type="button"
                onClick={() => {
                  onSelectChat(item.id);
                  onPick?.();
                }}
                className={`h-12 w-full rounded-lg px-3 pr-8 text-left text-sm transition ${
                  currentChatId === item.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <span className="line-clamp-2">
                  {item.last_message || "New chat"}
                </span>
              </button>
              {onDeleteChat ? (
                <button
                  type="button"
                  aria-label="Delete chat"
                  className={`absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-md text-xs leading-none transition ${
                    currentChatId === item.id
                      ? "text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                      : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteChat(item.id);
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </ScrollArea>
      {onSignOut ? (
        <div className="shrink-0 border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-full text-xs text-muted-foreground"
            onClick={onSignOut}
          >
            Sign out
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onStartChat,
  canAddChat = true,
  onDeleteChat,
  onSignOut,
}) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  const list = (
    <ChatList
      chats={chats}
      currentChatId={currentChatId}
      onSelectChat={onSelectChat}
      onStartChat={onStartChat}
      onPick={() => setOpenMobile(false)}
      canAddChat={canAddChat}
      onDeleteChat={onDeleteChat}
      onSignOut={onSignOut}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Chats</SheetTitle>
          {list}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-background">
      {list}
    </aside>
  );
}
