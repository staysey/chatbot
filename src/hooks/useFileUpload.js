import { useCallback, useRef, useState } from "react";

import { fileExtension, isImageFile } from "../lib/allowedUploads.js";

function createFileId(file) {
  return `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createPreview(file) {
  return isImageFile(file) ? URL.createObjectURL(file) : null;
}

function revokePreview(upload) {
  if (upload?.preview?.startsWith("blob:")) {
    URL.revokeObjectURL(upload.preview);
  }
}

function isAcceptedFile(file, accept) {
  if (!accept || accept === "*") return true;

  const acceptedTypes = accept.split(",").map((type) => type.trim());
  const fileType = file.type || "";
  const extension = fileExtension(file);

  return acceptedTypes.some((type) => {
    if (type.startsWith(".")) {
      return extension === type.toLowerCase();
    }
    if (type.endsWith("/*")) {
      return fileType.startsWith(`${type.split("/")[0]}/`);
    }
    return fileType === type;
  });
}

// File picker state: add/remove files, previews, accept rules, hidden input props
export function useFileUpload(options = {}) {
  const {
    maxFiles = Number.POSITIVE_INFINITY,
    accept = "*",
    multiple = false,
  } = options;

  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const addFiles = useCallback(
    (fileList) => {
      if (!fileList?.length) return;

      const incoming = Array.from(fileList);

      setFiles((prev) => {
        const base = multiple ? [...prev] : (prev.forEach(revokePreview), []);
        const seen = new Set(
          base.map((upload) => `${upload.file.name}:${upload.file.size}`),
        );
        const next = [...base];

        for (const file of incoming) {
          if (next.length >= maxFiles) break;

          const key = `${file.name}:${file.size}`;
          if (multiple && seen.has(key)) continue;
          if (!isAcceptedFile(file, accept)) continue;

          seen.add(key);
          next.push({
            file,
            id: createFileId(file),
            preview: createPreview(file),
          });
        }

        return next;
      });

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [accept, maxFiles, multiple],
  );

  const removeFile = useCallback((id) => {
    setFiles((prev) => {
      const upload = prev.find((item) => item.id === id);
      revokePreview(upload);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event) => {
      if (event.target.files?.length) {
        addFiles(event.target.files);
      }
    },
    [addFiles],
  );

  const getInputProps = useCallback(
    (props = {}) => ({
      ...props,
      type: "file",
      onChange: handleFileChange,
      accept: props.accept ?? accept,
      multiple: props.multiple ?? multiple,
      ref: inputRef,
    }),
    [accept, multiple, handleFileChange],
  );

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach(revokePreview);
      return [];
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  return [{ files }, { removeFile, openFileDialog, getInputProps, clearFiles }];
}
