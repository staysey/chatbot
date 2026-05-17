import { Router } from "express";
import {
  bearerToken,
  supabaseAuth,
  toClientSession,
} from "../lib/supabaseAuth.js";

export function createAuthRouter() {
  const router = Router();

  router.post("/login", async (req, res) => {
    const supabase = supabaseAuth();
    if (!supabase) {
      return res.status(500).json({ error: "Auth is not configured" });
    }

    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const session = toClientSession(data.session);
    if (!session) {
      return res.status(401).json({ error: "No session returned" });
    }

    res.json(session);
  });

  router.post("/signup", async (req, res) => {
    const supabase = supabaseAuth();
    if (!supabase) {
      return res.status(500).json({ error: "Auth is not configured" });
    }

    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const emailRedirectTo =
      process.env.AUTH_REDIRECT_URL || "http://localhost:8100/login";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (error) {
      const msg = error.message || "Sign up failed";
      const friendly =
        /already registered|already exists/i.test(msg)
          ? "This email is already registered. Log in instead."
          : msg;
      return res.status(400).json({ error: friendly });
    }

    const session = toClientSession(data.session);
    if (!session) {
      return res.status(201).json({
        message: "Check your email to confirm your account, then log in.",
      });
    }

    res.status(201).json(session);
  });

  router.get("/session", async (req, res) => {
    const supabase = supabaseAuth();
    const token = bearerToken(req);
    if (!supabase || !token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.json({ access_token: token, user });
  });

  router.post("/logout", async (req, res) => {
    const token = bearerToken(req);
    const supabase = supabaseAuth();
    if (supabase && token) {
      await supabase.auth.admin.signOut(token);
    }
    res.status(204).end();
  });

  return router;
}
