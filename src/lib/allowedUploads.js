export const UPLOAD_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.txt,application/pdf,image/jpeg,image/png,image/webp,text/plain";

export const UPLOAD_LABEL = "Upload JPEG, PNG, WebP, PDF, or .txt";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
]);

export function fileExtension(file) {
  return `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
}

export function isImageFile(file) {
  if (file?.type?.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.has(fileExtension(file));
}
