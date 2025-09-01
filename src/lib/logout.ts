// src/lib/logout.ts
import type { Dispatch, SetStateAction } from "react";
import type { ChatSession } from "@/hooks/useChatHistory";

export async function logoutDirect(opts: {
    setSessions: Dispatch<SetStateAction<ChatSession[]>>;
    setActiveId: (id: string | null) => void;
    setUser?: (u: unknown | null) => void;
    redirect?: (path: string) => void;
  }) {
    const { setSessions, setActiveId, setUser, redirect } = opts;
    const refreshToken = localStorage.getItem("refreshToken");
  
    try {
      if (refreshToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (e) {
      console.warn("[logout] backend call failed", e);
    }
  
    // clear local storage
    ["jwt", "refreshToken", "currentSessionId"].forEach(k => localStorage.removeItem(k));
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)!;
      if (k.startsWith("backendId:")) localStorage.removeItem(k);
    }
  
    // reset React state
    setSessions([]);
    setActiveId(null);
    setUser?.(null);
  
    redirect?.("/login");
    console.log("[logout] done");
  }
