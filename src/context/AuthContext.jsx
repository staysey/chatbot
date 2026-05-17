import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  fetchSession,
  login as loginRequest,
  logout as logoutRequest,
  signUp as signUpRequest,
} from "../lib/api";
import {
  AUTH_SESSION_KEY,
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
} from "../lib/authSession";
import { clearAuthHash, parseAuthHash } from "../lib/authHash";

const AuthContext = createContext(null);

function useAuthState() {
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState(null);

  const user = session?.user ?? null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const fromHash = parseAuthHash(window.location.hash);
      if (fromHash) clearAuthHash();

      if (fromHash?.error) {
        if (!cancelled) {
          setAuthError(fromHash.error);
          setAuthReady(true);
        }
        return;
      }

      if (fromHash?.access_token) {
        const { session: validated, error } = await fetchSession(
          fromHash.access_token,
        );
        if (cancelled) return;

        if (validated) {
          const next = {
            ...fromHash,
            access_token: validated.access_token,
            user: validated.user,
          };
          saveStoredSession(next);
          setSession(next);
          setAuthReady(true);
          return;
        }

        if (!cancelled) {
          setAuthError(error || "Email confirmation failed. Try logging in.");
        }
      }

      const stored = loadStoredSession();
      if (!stored?.access_token) {
        if (!cancelled) setAuthReady(true);
        return;
      }

      const { session: validated } = await fetchSession(stored.access_token);
      if (cancelled) return;

      if (validated) {
        const next = {
          ...stored,
          access_token: validated.access_token,
          user: validated.user,
        };
        saveStoredSession(next);
        setSession(next);
      } else {
        clearStoredSession();
      }

      setAuthReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== AUTH_SESSION_KEY) return;
      if (!e.newValue) {
        setSession(null);
        return;
      }
      try {
        setSession(JSON.parse(e.newValue));
      } catch {
        setSession(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const apiAuthHeaders = useMemo(() => {
    const t = session?.access_token;
    if (!t) return {};
    return { Authorization: `Bearer ${t}` };
  }, [session?.access_token]);

  const applySession = (next) => {
    if (next) {
      saveStoredSession(next);
      setSession(next);
    } else {
      clearStoredSession();
      setSession(null);
    }
  };

  const signUp = async (event) => {
    event?.preventDefault();

    setLoading(true);
    setAuthError(null);

    const {
      session: next,
      error,
      message,
    } = await signUpRequest(email, password);

    setLoading(false);

    if (error) {
      setAuthError(error);
      return { error: { message: error } };
    }

    if (message) {
      return { data: { message } };
    }

    applySession(next);
    return { data: { session: next } };
  };

  const login = async (event) => {
    event?.preventDefault();

    setLoading(true);
    setAuthError(null);

    const { session: next, error } = await loginRequest(email, password);

    setLoading(false);

    if (error) {
      setAuthError(error);
      return { error: { message: error } };
    }

    applySession(next);
    return { data: { session: next } };
  };

  const logout = async () => {
    await logoutRequest(apiAuthHeaders);
    applySession(null);
  };

  return {
    loading,
    authReady,
    email,
    setEmail,
    password,
    setPassword,
    session,
    user,
    authError,
    apiAuthHeaders,
    signUp,
    login,
    logout,
  };
}

export default function AuthProvider({ children }) {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
