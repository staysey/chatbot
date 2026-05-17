import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function tokenFromAuthHeader(authHeader) {
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer "))
    return null;
  return authHeader.slice(7);
}

let serviceClient = null;

export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { transport: ws },
    });
  }
  return serviceClient;
}

export async function authenticateRequest(authHeader) {
  const token = tokenFromAuthHeader(authHeader);
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return { supabase, user };
}
