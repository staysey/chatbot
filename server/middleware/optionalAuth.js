import { authenticateRequest } from "../lib/supabase.js";

export async function optionalAuth(req, res, next) {
  try {
    const auth = await authenticateRequest(req.headers.authorization);
    if (auth) req.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
}
