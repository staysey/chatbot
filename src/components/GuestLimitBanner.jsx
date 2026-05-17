import { InfoIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "../routes.js";

const signInLink = (
  <Link
    to={ROUTES.login}
    className="font-medium underline underline-offset-4 hover:opacity-80"
  >
    Sign in
  </Link>
);

export default function GuestLimitBanner({ guestQuestionsLeft }) {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>Guest mode</AlertTitle>
      <AlertDescription>
        {guestQuestionsLeft > 0 ? (
          <>
            {guestQuestionsLeft} free question
            {guestQuestionsLeft === 1 ? "" : "s"} left. {signInLink} to save
            chats and ask more.
          </>
        ) : (
          <>No free questions left. {signInLink} to continue.</>
        )}
      </AlertDescription>
    </Alert>
  );
}
