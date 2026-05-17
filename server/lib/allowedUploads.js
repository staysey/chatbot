const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".txt",
]);

export const UPLOAD_REJECTED_MESSAGE =
  "Only JPEG, PNG, WebP, PDF, and plain text (.txt) files are supported.";

function extensionOf(filename) {
  if (!filename || typeof filename !== "string") return "";
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return "";
  return filename.slice(dot).toLowerCase();
}

export function isAllowedUpload(file) {
  const mime = (file.mimetype || "").toLowerCase().split(";")[0].trim();

  if (mime && mime !== "application/octet-stream") {
    return ALLOWED_MIME_TYPES.has(mime);
  }

  return ALLOWED_EXTENSIONS.has(extensionOf(file.originalname));
}

export function findInvalidUpload(files) {
  if (!files?.length) return null;
  return files.find((file) => !isAllowedUpload(file)) ?? null;
}
