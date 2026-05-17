import { getSupabaseAdmin } from "./supabase.js";

export function supabaseAuth() {
  return getSupabaseAdmin();
}

export function bearerToken(req) {
  const h = req.headers.authorization;
  if (typeof h !== "string" || !h.startsWith("Bearer ")) return null;
  return h.slice(7);
}

export function toClientSession(session) {
  if (!session?.access_token) return null;
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user: session.user,
  };
}
