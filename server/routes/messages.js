import { Router } from "express";

import {
  stringifyAttachments,
  toMessageAttachments,
} from "../lib/attachments.js";
import {
  findInvalidUpload,
  UPLOAD_REJECTED_MESSAGE,
} from "../lib/allowedUploads.js";
import { uploadMessageFiles } from "../lib/storage.js";

function toMessageResponse(row) {
  return {
    id: row.id,
    text: row.content,
    sender: row.sender,
    attachments: toMessageAttachments(row.attachments),
    created_at: row.created_at,
  };
}

export function createMessageRoutes({ ownsChat, upload }) {
  const router = Router({ mergeParams: true });
  const withFiles = upload.array("files", 5);

  router.get("/", async (req, res) => {
    const { supabase, user } = req.auth;
    const chatId = req.params.id;

    if (!(await ownsChat(supabase, user.id, chatId))) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, content, sender, attachments, created_at, chat_id")
      .eq("user_id", user.id)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to load messages" });
    }

    res.json((data ?? []).map(toMessageResponse));
  });

  router.post("/", (req, res, next) => {
    if (req.is("multipart/form-data")) {
      return withFiles(req, res, next);
    }
    next();
  }, async (req, res) => {
    const { supabase, user } = req.auth;
    const chatId = req.params.id;

    if (!(await ownsChat(supabase, user.id, chatId))) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const { sender, content } = req.body ?? {};
    if (!sender || typeof content !== "string") {
      return res.status(400).json({ error: "sender and content are required" });
    }

    const invalidFile = findInvalidUpload(req.files);
    if (invalidFile) {
      return res.status(400).json({
        error: `${UPLOAD_REJECTED_MESSAGE} (${invalidFile.originalname})`,
      });
    }

    let attachmentItems = [];

    try {
      if (req.files?.length) {
        attachmentItems = await uploadMessageFiles(
          supabase,
          user.id,
          chatId,
          req.files,
        );
      } else if (Array.isArray(req.body?.attachments)) {
        attachmentItems = req.body.attachments
          .filter((attachment) => attachment && typeof attachment.url === "string")
          .map((attachment) => ({
            url: attachment.url,
            name: attachment.name || "",
          }));
      }
    } catch (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: "Failed to upload files" });
    }

    const { data: row, error } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        chat_id: chatId,
        sender,
        content,
        attachments: stringifyAttachments(attachmentItems),
      })
      .select("id, content, sender, attachments, created_at")
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to save message" });
    }

    const preview =
      content.length > 500 ? `${content.slice(0, 500)}…` : content;

    const { error: chatUpdateError } = await supabase
      .from("chats")
      .update({
        last_message: preview,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId)
      .eq("user_id", user.id);

    if (chatUpdateError) {
      console.error(chatUpdateError);
    }

    res.status(201).json(toMessageResponse(row));
  });

  return router;
}
