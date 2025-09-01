"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { Login } from "@/components/login";
import { SignUp } from "@/components/signup";

type AuthState = "login" | "signup" | "authenticated";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export default function Page() {
  const [authState, setAuthState] = useState<AuthState>("login");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string>("");

  // boot: restore session (if token + user were saved)
  useEffect(() => {
    const savedUser = localStorage.getItem("legalAssistantUser");
    const token = localStorage.getItem("jwt");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        setAuthState("authenticated");
      } catch {
        localStorage.removeItem("legalAssistantUser");
      }
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      // persist tokens + user for later
      if (data.token) localStorage.setItem("jwt", data.token);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      if (data.user) localStorage.setItem("legalAssistantUser", JSON.stringify(data.user));
      setUser(data.user ?? { id: "me", email });
      setAuthState("authenticated");
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (info: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const name = [info.firstName, info.lastName].filter(Boolean).join(" ").trim() || undefined;
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: info.email, password: info.password, name }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      if (data.token) localStorage.setItem("jwt", data.token);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      if (data.user) localStorage.setItem("legalAssistantUser", JSON.stringify(data.user));
      setUser(data.user ?? { id: "me", email: info.email, name });
      setAuthState("authenticated");
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };


  if (authState === "authenticated" && user) {
    return (
      <div className="min-h-screen">
        <ChatInterface />
      </div>
    );
  }

  if (authState === "signup") {
    return (
      <SignUp
        onSignUp={handleSignUp}
        onSwitchToLogin={() => setAuthState("login")}
        isLoading={isLoading}
        error={authError}
      />
    );
  }

  // default: login
  return (
    <Login
      onLogin={handleLogin}
      onSwitchToSignup={() => setAuthState("signup")}
      isLoading={isLoading}
      error={authError}
    />
  );
}
