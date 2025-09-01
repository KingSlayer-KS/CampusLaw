// src/app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Login } from "@/components/login";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // If already authenticated, bounce to /chat
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) router.replace("/chat");
  }, [router]);

  return (
    <Login
      isLoading={isLoading}
      error={error}
      onSwitchToSignup={() => router.push("/signup")}
      onLogin={async (email: string, password: string) => {
        setLoading(true);
        setError(undefined);
        try {
          console.log("[login] submitting", { email });
          const r = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!r.ok) {
            const txt = await r.text();
            console.warn("[login] failed", { status: r.status, body: txt });
            throw new Error(txt || `Login failed (${r.status})`);
          }
          const data = await r.json();

          // Persist auth
          if (data.token) localStorage.setItem("jwt", data.token);
          if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
          if (data.user) localStorage.setItem("legalAssistantUser", JSON.stringify(data.user));

          console.log("[login] success", { userId: data.user?.id });
          router.replace("/chat");
        } catch (e: any) {
          console.error("[login] error", e);
          setError(e?.message || "Login failed");
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
