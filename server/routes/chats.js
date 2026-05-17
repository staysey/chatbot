import { Router } from "express";

import { createAiRoutes } from "./ai.js";
import { createMessageRoutes } from "./messages.js";

export function createChatsRouter({
  requireAuth,
  ownsChat,
  upload,
  gemini,
  optionalAuth,
  aiChatRateLimit,
}) {
  const router = Router();

  router.use(
    "/:id",
    createAiRoutes({ upload, gemini, optionalAuth, aiChatRateLimit }),
  );

  router.use(requireAuth);
  router.use("/:id/messages", createMessageRoutes({ ownsChat, upload }));

  router.get("/", async (req, res) => {
    const { supabase, user } = req.auth;

    const { data, error } = await supabase
      .from("chats")
      .select("id, title, last_message, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to list chats" });
    }

    res.json(data ?? []);
  });

  router.post("/", async (req, res) => {
    const { supabase, user } = req.auth;

    const title =
      typeof req.body?.title === "string" && req.body.title.trim()
        ? req.body.title.trim()
        : null;

    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title })
      .select("id, title, last_message, created_at, updated_at")
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create chat" });
    }

    res.status(201).json(data);
  });

  router.delete("/:id", async (req, res) => {
    const { supabase, user } = req.auth;

    const chatId = req.params.id;
    if (!(await ownsChat(supabase, user.id, chatId))) {
      return res.status(404).json({ error: "Chat not found" });
    }

    await supabase
      .from("messages")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete chat" });
    }

    res.status(204).end();
  });

  return router;
}
