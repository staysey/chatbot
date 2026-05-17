export function parseAttachments(stored) {
  if (!stored) return [];
  if (typeof stored === "object" && Array.isArray(stored)) {
    return stored
      .map((item) => {
        if (typeof item === "string") return { url: item, name: "" };
        return { url: item.url, name: item.name || "" };
      })
      .filter((attachment) => attachment.url);
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [{ url: stored, name: "" }];
    }
    return parsed
      .map((item) => {
        if (typeof item === "string") return { url: item, name: "" };
        return { url: item.url, name: item.name || "" };
      })
      .filter((attachment) => attachment.url);
  } catch {
    return [{ url: stored, name: "" }];
  }
}

export function stringifyAttachments(items) {
  if (!items?.length) return null;
  return JSON.stringify(
    items.map(({ url, name }) => ({ url, name: name || "" })),
  );
}

function isImageUrl(url) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);
}

export function toMessageAttachments(stored) {
  return parseAttachments(stored).map(({ url, name }) => ({
    name: name || "file",
    preview: isImageUrl(url) ? url : null,
  }));
}
