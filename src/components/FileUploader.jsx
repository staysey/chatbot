import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { UPLOAD_ACCEPT, UPLOAD_LABEL, isImageFile } from "@/lib/allowedUploads";

const FileUploader = forwardRef(function FileUploader({ onFilesChange }, ref) {
  const onFilesChangeRef = useRef(onFilesChange);

  useEffect(() => {
    onFilesChangeRef.current = onFilesChange;
  }, [onFilesChange]);

  const [{ files }, { removeFile, openFileDialog, getInputProps, clearFiles }] =
    useFileUpload({
      accept: UPLOAD_ACCEPT,
      multiple: true,
      maxFiles: 5,
    });

  useImperativeHandle(ref, () => ({ clear: clearFiles }), [clearFiles]);

  useEffect(() => {
    const picked = files
      .map((upload) => (upload.file instanceof File ? upload.file : null))
      .filter(Boolean);
    onFilesChangeRef.current?.(picked);
  }, [files]);

  return (
    <div className="flex max-w-full flex-col items-start gap-2">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((upload) => (
            <div
              key={upload.id}
              className="relative flex max-w-[140px] items-center gap-1 rounded-xl border bg-muted px-2 py-1 text-xs shadow-sm"
            >
              {isImageFile(upload.file) ? (
                <img
                  src={upload.preview}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-md object-cover"
                />
              ) : (
                <span className="truncate py-2" title={upload.file.name}>
                  {upload.file.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeFile(upload.id)}
                className="absolute -right-1 -top-1 rounded-full bg-background px-1.5 text-xs shadow"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        className="h-7 px-2 text-xs"
        onClick={openFileDialog}
        disabled={files.length >= 5}
      >
        {files.length ? "Add file" : UPLOAD_LABEL}
      </Button>

      <input
        {...getInputProps()}
        className="sr-only"
        aria-label="Upload files"
        tabIndex={-1}
      />
    </div>
  );
});

export default FileUploader;
