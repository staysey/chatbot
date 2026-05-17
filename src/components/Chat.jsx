import { useEffect, useRef, useState } from "react";

import { CircleAlert, InfoIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useChatMessaging } from "../hooks/useChatMessaging.js";

import ChatInput from "./ChatInput.jsx";
import GuestLimitBanner from "./GuestLimitBanner.jsx";
import MessageBubble from "./MessageBubble.jsx";

export default function Chat({ chatId, isGuest = false }) {
  const [useMockResponse, setUseMockResponse] = useState(false);

  const {
    messages,
    sendMessage,
    loadingMessages,
    chatError,
    guestQuestionsLeft,
    isSending,
  } = useChatMessaging(chatId, isGuest, useMockResponse);

  const guestLimitReached = isGuest && guestQuestionsLeft === 0;

  const chatRef = useRef(null);
  const uploadRef = useRef(null);

  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;

    try {
      await sendMessage(input.trim(), selectedFiles);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSelectedFiles([]);
      uploadRef.current?.clear();
      setInput("");
    }
  };

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-0 border-0 py-0 shadow-none">
      <CardContent
        className={`flex min-h-0 flex-1 flex-col p-0 ${
          loadingMessages && "items-center justify-center"
        }`}
      >
        {loadingMessages ? (
          <Spinner className="size-8 " />
        ) : (
          <ScrollArea ref={chatRef} className={`min-h-0 flex-1`}>
            <div className="space-y-2 p-4">
              {isGuest && guestQuestionsLeft !== null && (
                <GuestLimitBanner guestQuestionsLeft={guestQuestionsLeft} />
              )}
              {messages.map((msg, index) => (
                <MessageBubble key={msg.id ?? `local-${index}`} msg={msg} />
              ))}
              {isSending && <Skeleton className="h-10 w-full" />}
              {chatError && (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertTitle>Something went wrong</AlertTitle>
                  <AlertDescription>{chatError}</AlertDescription>
                </Alert>
              )}
              {messages.length === 0 &&
                !chatError &&
                !isGuest &&
                !loadingMessages &&
                chatId && (
                  <Alert>
                    <InfoIcon />
                    <AlertTitle>No messages yet</AlertTitle>
                    <AlertDescription>
                      Start a conversation — your messages are saved when you
                      are signed in.
                    </AlertDescription>
                  </Alert>
                )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="shrink-0 border-t p-3">
        <ChatInput
          input={input}
          onInputChange={(event) => setInput(event.target.value)}
          onSend={handleSend}
          isSending={isSending}
          guestLimitReached={guestLimitReached}
          selectedFiles={selectedFiles}
          onFilesChange={handleFilesChange}
          uploadRef={uploadRef}
          useMockResponse={useMockResponse}
          onMockResponseChange={setUseMockResponse}
        />
      </CardFooter>
    </Card>
  );
}
