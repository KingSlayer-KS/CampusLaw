// src/app/signup/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignUp } from "@/components/signup";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // If already authenticated, bounce to /chat
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) router.replace("/chat");
  }, [router]);

  return (
    <SignUp
      isLoading={isLoading}
      error={error}
      onSwitchToLogin={() => router.push("/login")}
      onSignUp={async ({ firstName, lastName, email, password }) => {
        setLoading(true);
        setError(undefined);
        try {
          // Backend expects { email, password, name? }
          const name =
            [firstName, lastName].filter(Boolean).join(" ").trim() || undefined;

          console.log("[signup] submitting", { email });
          const r = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          });
          if (!r.ok) {
            const txt = await r.text();
            console.warn("[signup] failed", { status: r.status, body: txt });
            throw new Error(txt || `Sign up failed (${r.status})`);
          }
          const data = await r.json();

          // Persist auth
          if (data.token) localStorage.setItem("jwt", data.token);
          if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
          if (data.user) localStorage.setItem("legalAssistantUser", JSON.stringify(data.user));

          console.log("[signup] success", { userId: data.user?.id });
          router.replace("/chat");
        } catch (e: any) {
          console.error("[signup] error", e);
          setError(e?.message || "Sign up failed");
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
