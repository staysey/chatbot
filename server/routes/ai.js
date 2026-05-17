import { Router } from "express";

import {
  findInvalidUpload,
  UPLOAD_REJECTED_MESSAGE,
} from "../lib/allowedUploads.js";

export function createAiRoutes({ upload, gemini, optionalAuth, aiChatRateLimit }) {
  const router = Router({ mergeParams: true });

  router.post(
    "/",
    optionalAuth,
    aiChatRateLimit,
    upload.array("files", 5),
    async (req, res) => {
      const message =
        typeof req.body?.message === "string" ? req.body.message.trim() : "";
      const files = req.files ?? [];

      if (!message && files.length === 0) {
        return res.status(400).json({ error: "message or files are required" });
      }

      const invalidFile = findInvalidUpload(files);
      if (invalidFile) {
        return res.status(400).json({
          isError: true,
          error: `${UPLOAD_REJECTED_MESSAGE} (${invalidFile.originalname})`,
        });
      }

      try {
        const contents = [];

        if (message) {
          contents.push({ text: message });
        }

        for (const file of files) {
          contents.push({
            inlineData: {
              mimeType: file.mimetype,
              data: file.buffer.toString("base64"),
            },
          });
        }

        const response = await gemini.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
        });

        res.json({
          botMessage: response.text,
        });
      } catch (error) {
        console.error(error);
        res.status(502).json({
          isError: true,
          error: "Something went wrong",
        });
      }
    },
  );

  return router;
}
