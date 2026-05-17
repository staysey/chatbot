import { authenticateRequest } from "../lib/supabase.js";

export async function requireAuth(req, res, next) {
  const auth = await authenticateRequest(req.headers.authorization);
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.auth = auth;
  next();
}
