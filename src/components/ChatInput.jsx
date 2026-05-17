import { ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import FileUploader from "./FileUploader.jsx";

export default function ChatInput({
  input,
  onInputChange,
  onSend,
  isSending,
  guestLimitReached,
  selectedFiles,
  onFilesChange,
  uploadRef,
  useMockResponse,
  onMockResponseChange,
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-end gap-2">
        <input
          type="text"
          className="min-h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Your message here"
          value={input}
          onChange={onInputChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSend();
          }}
        />

        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="Submit"
          onClick={onSend}
          disabled={
            isSending ||
            guestLimitReached ||
            (!input.trim() && selectedFiles.length === 0)
          }
        >
          <ArrowUpIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <FileUploader ref={uploadRef} onFilesChange={onFilesChange} />
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={useMockResponse}
            onChange={(event) => onMockResponseChange(event.target.checked)}
            className="size-3.5 rounded border border-input accent-primary"
          />
          Test with mock response
        </label>
      </div>
    </div>
  );
}
