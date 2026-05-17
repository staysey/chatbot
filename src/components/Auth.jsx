import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth({ onContinueAsGuest }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    login,
    signUp,
    loading,
    authError,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [emailConfirmSent, setEmailConfirmSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSignUp) {
      const result = await signUp(event);
      if (result?.data?.message) setEmailConfirmSent(true);
    } else {
      login(event);
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setEmailConfirmSent(false);
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>
          {emailConfirmSent
            ? "Confirm your email"
            : isSignUp
              ? "Create an account"
              : "Login to your account"}
        </CardTitle>
        <CardDescription>
          {emailConfirmSent
            ? "Check your inbox"
            : isSignUp
              ? "Enter your email below to sign up"
              : "Enter your email below to login to your account"}
        </CardDescription>
        {!emailConfirmSent && (
          <CardAction>
            <Button type="button" variant="link" onClick={toggleMode}>
              {isSignUp ? "Log in" : "Sign up"}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {emailConfirmSent ? (
          <p className="text-sm text-muted-foreground">
            We've sent you a confirmation email. Open the link in the message,
            then log in to your account.
          </p>
        ) : (
          <>
            {authError ? (
              <p className="text-destructive mb-4 text-sm">{authError}</p>
            ) : null}
            <form id="auth2-form" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </div>
            </form>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {emailConfirmSent ? (
          <Button type="button" className="w-full" onClick={toggleMode}>
            Log in
          </Button>
        ) : (
          <Button
            type="submit"
            form="auth2-form"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Please wait…" : isSignUp ? "Sign up" : "Login"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={onContinueAsGuest}
        >
          Continue without sign in
        </Button>
      </CardFooter>
    </Card>
  );
}
