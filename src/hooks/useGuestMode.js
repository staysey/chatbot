import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";
import {
  clearGuestSession,
  GUEST_SESSION_KEYS,
  isGuestMode,
  setGuestMode,
} from "../lib/guestSession";

// Guest flag from localStorage; cleared on sign-in, synced across tabs
export function useGuestMode() {
  const { user, authReady } = useAuth();
  const [guestActive, setGuestActive] = useState(() => isGuestMode());

  const isGuest = guestActive && !user;

  useEffect(() => {
    if (!authReady || !user) return;
    clearGuestSession();
    setGuestMode(false);
  }, [authReady, user]);

  // Sync guest flag when another tab changes chatbot_guest_mode in localStorage
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== GUEST_SESSION_KEYS.mode) return;
      setGuestActive(isGuestMode());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const enterGuestMode = useCallback(() => {
    setGuestMode(true);
    setGuestActive(true);
  }, []);

  return { isGuest, enterGuestMode };
}
