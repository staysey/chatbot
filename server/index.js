import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";

import { createGeminiClient } from "./ai/gemini.js";
import { ownsChat } from "./lib/chatAccess.js";
import { aiChatRateLimit } from "./middleware/aiRateLimit.js";
import { optionalAuth } from "./middleware/optionalAuth.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { createChatsRouter } from "./routes/chats.js";
import { createAuthRouter } from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer();
const gemini = createGeminiClient();

app.use("/api/auth", createAuthRouter());

app.use(
  "/api/chats",
  createChatsRouter({
    requireAuth,
    ownsChat,
    upload,
    gemini,
    optionalAuth,
    aiChatRateLimit,
  }),
);

app.listen(3000, () => {
  console.log("Server started");
});
