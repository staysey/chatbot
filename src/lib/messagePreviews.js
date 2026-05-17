import { isImageFile } from "./allowedUploads.js";

export function isBlobPreview(url) {
  return typeof url === "string" && url.startsWith("blob:");
}

export function revokeAttachmentPreviews(attachments) {
  for (const attachment of attachments ?? []) {
    if (isBlobPreview(attachment?.preview)) {
      URL.revokeObjectURL(attachment.preview);
    }
  }
}

export function revokeAllMessagePreviews(messages) {
  for (const message of messages ?? []) {
    revokeAttachmentPreviews(message.attachments);
  }
}

export function createLocalAttachments(files) {
  return files.map((file) => ({
    name: file.name,
    preview: isImageFile(file) ? URL.createObjectURL(file) : null,
  }));
}
