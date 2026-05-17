import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const WINDOW_MS = 15 * 60 * 1000;

export const aiChatRateLimit = rateLimit({
  windowMs: WINDOW_MS,
  limit: (req) => (req.auth?.user ? 60 : 12),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.auth?.user?.id ?? ipKeyGenerator(req.ip),
  message: { error: "Too many requests. Please try again later." },
});
