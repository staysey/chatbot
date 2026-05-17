import "./App.css";

import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner";
import ChatPage from "./pages/ChatPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { isGuestMode } from "./lib/guestSession.js";
import { ROUTES } from "./routes.js";

const layoutClass =
  "flex items-center justify-center bg-gray-100 p-4 h-screen max-h-screen";

export default function App() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const signedIn = Boolean(user);
  const canUseChat = signedIn || (isGuestMode() && !signedIn);

  useEffect(() => {
    if (authReady && user) {
      navigate(ROUTES.chat, { replace: true });
    }
  }, [authReady, user?.id, navigate, user]);

  if (!authReady) {
    return (
      <div className={layoutClass}>
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className={layoutClass}>
      <Routes>
        <Route
          path={ROUTES.login}
          element={
            signedIn ? <Navigate to={ROUTES.chat} replace /> : <LoginPage />
          }
        />
        <Route
          path={ROUTES.chat}
          element={
            canUseChat ? <ChatPage /> : <Navigate to={ROUTES.login} replace />
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={canUseChat ? ROUTES.chat : ROUTES.login} replace />
          }
        />
      </Routes>
    </div>
  );
}
