import { useNavigate } from "react-router-dom";

import Auth from "../components/Auth.jsx";
import { setGuestMode } from "../lib/guestSession.js";
import { ROUTES } from "../routes.js";

export default function LoginPage() {
  const navigate = useNavigate();

  const continueAsGuest = () => {
    setGuestMode(true);
    navigate(ROUTES.chat);
  };

  return <Auth onContinueAsGuest={continueAsGuest} />;
}
