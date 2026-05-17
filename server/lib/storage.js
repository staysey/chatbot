import { randomUUID } from "crypto";

const BUCKET = "message-files";

export async function uploadMessageFiles(supabase, userId, chatId, files) {
  const items = [];

  for (const file of files) {
    const safeName = (file.originalname || "file").replace(/[^\w.\-]+/g, "_");
    const path = `${userId}/${chatId}/${randomUUID()}-${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error(error);
      throw error;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    items.push({ url: data.publicUrl, name: file.originalname || safeName });
  }

  return items;
}
